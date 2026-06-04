using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GuardiaController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public GuardiaController(SupabaseClient sb) => _sb = sb;

    static GuardiaDto ToDto(Guardia g) => new(
        g.Id, g.EstacionId, g.AccesoId,          // ← AccesoId agregado
        g.Nombre, g.Apellido,
        g.Dpi, g.Telefono, g.Turno, g.CreatedAt);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? estacionId)
    {
        if (!string.IsNullOrEmpty(estacionId))
        {
            var filtered = await _sb.From<Guardia>()
                .Where(g => g.EstacionId == estacionId)
                .Get();
            return Ok(filtered.Models.Select(ToDto));
        }
        var result = await _sb.From<Guardia>().Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var g = await _sb.From<Guardia>().Where(x => x.Id == id).Single();
        if (g is null) return NotFound();
        return Ok(ToDto(g));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] GuardiaCreateDto dto)
    {
        var guardia = new Guardia
        {
            EstacionId = dto.EstacionId,
            AccesoId   = dto.AccesoId,            // ← AccesoId agregado
            Nombre     = dto.Nombre,
            Apellido   = dto.Apellido,
            Dpi        = dto.Dpi,
            Telefono   = dto.Telefono,
            Turno      = dto.Turno
        };
        var result = await _sb.From<Guardia>().Insert(guardia);
        var g = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = g.Id }, ToDto(g));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] GuardiaCreateDto dto)
    {
        var existing = await _sb.From<Guardia>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.EstacionId = dto.EstacionId;
        existing.AccesoId   = dto.AccesoId;       // ← AccesoId agregado
        existing.Nombre     = dto.Nombre;
        existing.Apellido   = dto.Apellido;
        existing.Dpi        = dto.Dpi;
        existing.Telefono   = dto.Telefono;
        existing.Turno      = dto.Turno;

        var result = await _sb.From<Guardia>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await _sb.From<Guardia>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}