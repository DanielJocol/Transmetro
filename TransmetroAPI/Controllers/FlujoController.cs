using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FlujoController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public FlujoController(SupabaseClient sb) => _sb = sb;

    static FlujoPasajerosDto ToDto(FlujoPasajeros f) => new(
        f.Id, f.EstacionId, f.CantidadActual, f.RegistradoEn);

    [HttpGet]
    public async Task<IActionResult> GetHistorial(
        [FromQuery] string estacionId,
        [FromQuery] int limite = 50)
    {
        var result = await _sb.From<FlujoPasajeros>()
            .Where(f => f.EstacionId == estacionId)
            .Order(f => f.RegistradoEn, Supabase.Postgrest.Constants.Ordering.Descending)
            .Limit(limite)
            .Get();
        return Ok(result.Models.Select(ToDto));
    }

    // POST /api/flujo — registra flujo de estación y dispara alerta de saturación (RF07, RF08)
    [HttpPost]
    [Authorize(Roles = "administrador,operador")]
    public async Task<IActionResult> Registrar([FromBody] RegistrarFlujoDto dto)
    {
        var flujo = new FlujoPasajeros
        {
            EstacionId     = dto.EstacionId,
            CantidadActual = dto.CantidadActual,
            RegistradoEn   = DateTime.UtcNow
        };
        await _sb.From<FlujoPasajeros>().Insert(flujo);

        // Verificar saturación de estación (RF08)
        await _sb.Rpc("verificar_saturacion", new Dictionary<string, object>
        {
            { "p_estacion_id", dto.EstacionId  },
            { "p_cantidad",    dto.CantidadActual }
        });

        return Ok(new { mensaje = "Flujo registrado correctamente" });
    }
}