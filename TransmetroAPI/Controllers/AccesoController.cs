using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccesoController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public AccesoController(SupabaseClient sb) => _sb = sb;

    static AccesoDto ToDto(Acceso a) => new(
        a.Id, a.EstacionId, a.Nombre, a.Descripcion, a.Activo, a.CreatedAt);

    // GET /api/acceso?estacionId=xxx
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? estacionId)
    {
        if (!string.IsNullOrEmpty(estacionId))
        {
            var filtered = await _sb.From<Acceso>()
                .Where(a => a.EstacionId == estacionId)
                .Get();
            return Ok(filtered.Models.Select(ToDto));
        }
        var result = await _sb.From<Acceso>().Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var a = await _sb.From<Acceso>().Where(x => x.Id == id).Single();
        if (a is null) return NotFound();
        return Ok(ToDto(a));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] AccesoCreateDto dto)
    {
        var acceso = new Acceso
        {
            EstacionId  = dto.EstacionId,
            Nombre      = dto.Nombre,
            Descripcion = dto.Descripcion,
            Activo      = dto.Activo
        };
        var result = await _sb.From<Acceso>().Insert(acceso);
        var a = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = a.Id }, ToDto(a));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] AccesoCreateDto dto)
    {
        var existing = await _sb.From<Acceso>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.EstacionId  = dto.EstacionId;
        existing.Nombre      = dto.Nombre;
        existing.Descripcion = dto.Descripcion;
        existing.Activo      = dto.Activo;

        var result = await _sb.From<Acceso>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await _sb.From<Acceso>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}