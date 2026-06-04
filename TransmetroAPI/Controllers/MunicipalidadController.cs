using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MunicipalidadController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public MunicipalidadController(SupabaseClient sb) => _sb = sb;

    static MunicipalidadDto ToDto(Municipalidad m) => new(
        m.Id, m.Nombre, m.Descripcion, m.CreatedAt);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _sb.From<Municipalidad>().Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var m = await _sb.From<Municipalidad>().Where(x => x.Id == id).Single();
        if (m is null) return NotFound();
        return Ok(ToDto(m));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] MunicipalidadCreateDto dto)
    {
        var municipalidad = new Municipalidad
        {
            Nombre      = dto.Nombre,
            Descripcion = dto.Descripcion
        };
        var result = await _sb.From<Municipalidad>().Insert(municipalidad);
        var m = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = m.Id }, ToDto(m));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] MunicipalidadCreateDto dto)
    {
        var existing = await _sb.From<Municipalidad>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.Nombre      = dto.Nombre;
        existing.Descripcion = dto.Descripcion;

        var result = await _sb.From<Municipalidad>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await _sb.From<Municipalidad>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}