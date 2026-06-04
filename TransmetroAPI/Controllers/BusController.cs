using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

// DTO para registrar ocupación de bus
public record RegistrarOcupacionDto(string BusId, int Pasajeros);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BusController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public BusController(SupabaseClient sb) => _sb = sb;

    static BusDto ToDto(Bus b) => new(
        b.Id, b.LineaId, b.Placa, b.CapacidadMaxima, b.Estado, b.CreatedAt);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? lineaId,
        [FromQuery] string? estado)
    {
        if (!string.IsNullOrEmpty(lineaId) && !string.IsNullOrEmpty(estado))
        {
            var r = await _sb.From<Bus>()
                .Where(b => b.LineaId == lineaId && b.Estado == estado).Get();
            return Ok(r.Models.Select(ToDto));
        }
        if (!string.IsNullOrEmpty(lineaId))
        {
            var r = await _sb.From<Bus>().Where(b => b.LineaId == lineaId).Get();
            return Ok(r.Models.Select(ToDto));
        }
        if (!string.IsNullOrEmpty(estado))
        {
            var r = await _sb.From<Bus>().Where(b => b.Estado == estado).Get();
            return Ok(r.Models.Select(ToDto));
        }
        var result = await _sb.From<Bus>().Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var b = await _sb.From<Bus>().Where(x => x.Id == id).Single();
        if (b is null) return NotFound();
        return Ok(ToDto(b));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] BusCreateDto dto)
    {
        // Validar límite máximo de buses por línea (máximo = doble de estaciones)
        if (!string.IsNullOrEmpty(dto.LineaId))
        {
            var validacion = await ValidarLimiteBuses(dto.LineaId, null);
            if (validacion != null) return validacion;
        }

        var bus = new Bus
        {
            LineaId         = dto.LineaId,
            Placa           = dto.Placa,
            CapacidadMaxima = dto.CapacidadMaxima,
            Estado          = dto.Estado
        };
        var result = await _sb.From<Bus>().Insert(bus);
        var b = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = b.Id }, ToDto(b));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] BusCreateDto dto)
    {
        var existing = await _sb.From<Bus>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        // Si cambia de línea, validar límite en la nueva línea
        if (!string.IsNullOrEmpty(dto.LineaId) && dto.LineaId != existing.LineaId)
        {
            var validacion = await ValidarLimiteBuses(dto.LineaId, id);
            if (validacion != null) return validacion;
        }

        existing.LineaId         = dto.LineaId;
        existing.Placa           = dto.Placa;
        existing.CapacidadMaxima = dto.CapacidadMaxima;
        existing.Estado          = dto.Estado;

        var result = await _sb.From<Bus>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        var bus = await _sb.From<Bus>().Where(x => x.Id == id).Single();
        if (bus is null) return NotFound();

        // Validar mínimo de buses por línea (mínimo = número de estaciones)
        if (!string.IsNullOrEmpty(bus.LineaId))
        {
            var busesEnLinea = await _sb.From<Bus>()
                .Where(b => b.LineaId == bus.LineaId).Get();

            var estacionesEnLinea = await _sb.From<LineaEstacion>()
                .Where(le => le.LineaId == bus.LineaId).Get();

            int totalBuses     = busesEnLinea.Models.Count;
            int totalEstaciones = estacionesEnLinea.Models.Count;

            if (totalBuses - 1 < totalEstaciones)
                return BadRequest(new
                {
                    mensaje = $"La línea debe tener al menos {totalEstaciones} buses (uno por estación). Actualmente tiene {totalBuses}."
                });
        }

        await _sb.From<Bus>().Where(x => x.Id == id).Delete();
        return NoContent();
    }

    // POST /api/bus/ocupacion — registra ocupación y dispara alerta si < 25%
    [HttpPost("ocupacion")]
    [Authorize(Roles = "administrador,operador,supervisor")]
    public async Task<IActionResult> RegistrarOcupacion([FromBody] RegistrarOcupacionDto dto)
    {
        var bus = await _sb.From<Bus>().Where(b => b.Id == dto.BusId).Single();
        if (bus is null) return NotFound(new { mensaje = "Bus no encontrado" });

        // Llamar función de verificación de baja ocupación (RF09)
        await _sb.Rpc("verificar_ocupacion_bus", new Dictionary<string, object>
        {
            { "p_bus_id",    dto.BusId    },
            { "p_pasajeros", dto.Pasajeros }
        });

        double porcentaje = (double)dto.Pasajeros / bus.CapacidadMaxima * 100;

        return Ok(new
        {
            mensaje      = "Ocupación registrada",
            porcentaje   = Math.Round(porcentaje, 1),
            esperaAdicional = dto.Pasajeros < bus.CapacidadMaxima * 0.25
                ? "El bus debe esperar 5 minutos adicionales en cada estación"
                : null
        });
    }

    // ── Helper: valida que la línea no supere el máximo de buses ──
    private async Task<IActionResult?> ValidarLimiteBuses(string lineaId, string? busIdExcluir)
    {
        var busesEnLinea = await _sb.From<Bus>()
            .Where(b => b.LineaId == lineaId).Get();

        var estacionesEnLinea = await _sb.From<LineaEstacion>()
            .Where(le => le.LineaId == lineaId).Get();

        int totalBuses = busIdExcluir != null
            ? busesEnLinea.Models.Count(b => b.Id != busIdExcluir)
            : busesEnLinea.Models.Count;

        int totalEstaciones = estacionesEnLinea.Models.Count;
        int maximo          = totalEstaciones * 2;

        if (totalBuses >= maximo)
            return BadRequest(new
            {
                mensaje = $"La línea ya tiene el máximo permitido de buses ({maximo} = doble de sus {totalEstaciones} estaciones)."
            });

        return null;
    }
}