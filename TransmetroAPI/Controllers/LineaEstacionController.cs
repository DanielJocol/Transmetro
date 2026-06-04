using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LineaEstacionController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public LineaEstacionController(SupabaseClient sb) => _sb = sb;

    static LineaEstacionDto ToDto(LineaEstacion le) => new(
        le.Id, le.LineaId, le.EstacionId, le.OrdenEnLinea);

    // GET /api/lineaestacion?lineaId=xxx  — estaciones de una línea
    // GET /api/lineaestacion?estacionId=xxx — líneas de una estación
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? lineaId,
        [FromQuery] string? estacionId)
    {
        if (!string.IsNullOrEmpty(lineaId))
        {
            var r = await _sb.From<LineaEstacion>()
                .Where(le => le.LineaId == lineaId)
                .Order(le => le.OrdenEnLinea, Supabase.Postgrest.Constants.Ordering.Ascending)
                .Get();
            return Ok(r.Models.Select(ToDto));
        }
        if (!string.IsNullOrEmpty(estacionId))
        {
            var r = await _sb.From<LineaEstacion>()
                .Where(le => le.EstacionId == estacionId)
                .Get();
            return Ok(r.Models.Select(ToDto));
        }
        var result = await _sb.From<LineaEstacion>().Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var le = await _sb.From<LineaEstacion>().Where(x => x.Id == id).Single();
        if (le is null) return NotFound();
        return Ok(ToDto(le));
    }

    // POST — asignar una estación a una línea
    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] LineaEstacionCreateDto dto)
    {
        var lineaEstacion = new LineaEstacion
        {
            LineaId      = dto.LineaId,
            EstacionId   = dto.EstacionId,
            OrdenEnLinea = dto.OrdenEnLinea
        };
        var result = await _sb.From<LineaEstacion>().Insert(lineaEstacion);
        var le = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = le.Id }, ToDto(le));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] LineaEstacionCreateDto dto)
    {
        var existing = await _sb.From<LineaEstacion>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.LineaId      = dto.LineaId;
        existing.EstacionId   = dto.EstacionId;
        existing.OrdenEnLinea = dto.OrdenEnLinea;

        var result = await _sb.From<LineaEstacion>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    // DELETE — desasignar estación de una línea
    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await _sb.From<LineaEstacion>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}