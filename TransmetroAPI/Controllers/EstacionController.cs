using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EstacionController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public EstacionController(SupabaseClient sb) => _sb = sb;

    static EstacionDto ToDto(Estacion e) => new(
        e.Id, e.LineaId, e.Nombre, e.Latitud, e.Longitud,
        e.CapacidadMaxima, e.OrdenEnLinea, e.CreatedAt);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? lineaId)
    {
        if (!string.IsNullOrEmpty(lineaId))
        {
            var filtered = await _sb.From<Estacion>()
                .Where(e => e.LineaId == lineaId)
                .Order(e => e.OrdenEnLinea, Supabase.Postgrest.Constants.Ordering.Ascending)
                .Get();
            return Ok(filtered.Models.Select(ToDto));
        }
        var result = await _sb.From<Estacion>()
            .Order(e => e.OrdenEnLinea, Supabase.Postgrest.Constants.Ordering.Ascending)
            .Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var e = await _sb.From<Estacion>().Where(x => x.Id == id).Single();
        if (e is null) return NotFound();
        return Ok(ToDto(e));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] EstacionCreateDto dto)
    {
        var estacion = new Estacion
        {
            LineaId         = dto.LineaId,
            Nombre          = dto.Nombre,
            Latitud         = dto.Latitud,
            Longitud        = dto.Longitud,
            CapacidadMaxima = dto.CapacidadMaxima,
            OrdenEnLinea    = dto.OrdenEnLinea
        };
        var result = await _sb.From<Estacion>().Insert(estacion);
        var e = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = e.Id }, ToDto(e));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] EstacionCreateDto dto)
    {
        var existing = await _sb.From<Estacion>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.LineaId         = dto.LineaId;
        existing.Nombre          = dto.Nombre;
        existing.Latitud         = dto.Latitud;
        existing.Longitud        = dto.Longitud;
        existing.CapacidadMaxima = dto.CapacidadMaxima;
        existing.OrdenEnLinea    = dto.OrdenEnLinea;

        var result = await _sb.From<Estacion>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await _sb.From<Estacion>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}