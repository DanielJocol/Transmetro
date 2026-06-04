using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PilotoController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public PilotoController(SupabaseClient sb) => _sb = sb;

    static PilotoDto ToDto(Piloto p) => new(
        p.Id, p.BusId, p.Nombre, p.Apellido, p.Dpi,
        p.Telefono, p.Direccion, p.Formacion, p.CreatedAt);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? busId)
    {
        if (!string.IsNullOrEmpty(busId))
        {
            var filtered = await _sb.From<Piloto>()
                .Where(p => p.BusId == busId).Get();
            return Ok(filtered.Models.Select(ToDto));
        }
        var result = await _sb.From<Piloto>().Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var p = await _sb.From<Piloto>().Where(x => x.Id == id).Single();
        if (p is null) return NotFound();
        return Ok(ToDto(p));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] PilotoCreateDto dto)
    {
        var piloto = new Piloto
        {
            BusId     = dto.BusId,
            Nombre    = dto.Nombre,
            Apellido  = dto.Apellido,
            Dpi       = dto.Dpi,
            Telefono  = dto.Telefono,
            Direccion = dto.Direccion,
            Formacion = dto.Formacion
        };
        var result = await _sb.From<Piloto>().Insert(piloto);
        var p = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = p.Id }, ToDto(p));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] PilotoCreateDto dto)
    {
        var existing = await _sb.From<Piloto>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.BusId     = dto.BusId;
        existing.Nombre    = dto.Nombre;
        existing.Apellido  = dto.Apellido;
        existing.Dpi       = dto.Dpi;
        existing.Telefono  = dto.Telefono;
        existing.Direccion = dto.Direccion;
        existing.Formacion = dto.Formacion;

        var result = await _sb.From<Piloto>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await _sb.From<Piloto>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}