using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LineaController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public LineaController(SupabaseClient sb) => _sb = sb;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _sb.From<Linea>().Get();
        return Ok(result.Models.Select(l => new LineaDto(
            l.Id, l.Nombre, l.Descripcion, l.Activa, l.CreatedAt)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var l = await _sb.From<Linea>().Where(x => x.Id == id).Single();
        if (l is null) return NotFound();
        return Ok(new LineaDto(l.Id, l.Nombre, l.Descripcion, l.Activa, l.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] LineaCreateDto dto)
    {
        var linea = new Linea
        {
            Nombre      = dto.Nombre,
            Descripcion = dto.Descripcion,
            Activa      = dto.Activa
        };
        var result = await _sb.From<Linea>().Insert(linea);
        var l = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = l.Id },
            new LineaDto(l.Id, l.Nombre, l.Descripcion, l.Activa, l.CreatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] LineaCreateDto dto)
    {
        var existing = await _sb.From<Linea>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.Nombre      = dto.Nombre;
        existing.Descripcion = dto.Descripcion;
        existing.Activa      = dto.Activa;

        var result = await _sb.From<Linea>().Update(existing);
        var l = result.Models[0];
        return Ok(new LineaDto(l.Id, l.Nombre, l.Descripcion, l.Activa, l.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await _sb.From<Linea>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}