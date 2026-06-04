using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ParqueoController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public ParqueoController(SupabaseClient sb) => _sb = sb;

    static ParqueoDto ToDto(Parqueo p) => new(p.Id, p.BusId, p.Ubicacion, p.Descripcion);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? busId)
    {
        if (!string.IsNullOrEmpty(busId))
        {
            var filtered = await _sb.From<Parqueo>()
                .Where(p => p.BusId == busId).Get();
            return Ok(filtered.Models.Select(ToDto));
        }
        var result = await _sb.From<Parqueo>().Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var p = await _sb.From<Parqueo>().Where(x => x.Id == id).Single();
        if (p is null) return NotFound();
        return Ok(ToDto(p));
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Create([FromBody] ParqueoCreateDto dto)
    {
        var parqueo = new Parqueo
        {
            BusId       = dto.BusId,
            Ubicacion   = dto.Ubicacion,
            Descripcion = dto.Descripcion
        };
        var result = await _sb.From<Parqueo>().Insert(parqueo);
        var p = result.Models[0];
        return CreatedAtAction(nameof(GetById), new { id = p.Id }, ToDto(p));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] ParqueoCreateDto dto)
    {
        var existing = await _sb.From<Parqueo>().Where(x => x.Id == id).Single();
        if (existing is null) return NotFound();

        existing.BusId       = dto.BusId;
        existing.Ubicacion   = dto.Ubicacion;
        existing.Descripcion = dto.Descripcion;

        var result = await _sb.From<Parqueo>().Update(existing);
        return Ok(ToDto(result.Models[0]));
    }

    // DELETE — valida que el bus no quede sin parqueo
    [HttpDelete("{id}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        var parqueo = await _sb.From<Parqueo>().Where(x => x.Id == id).Single();
        if (parqueo is null) return NotFound();

        // Si el bus tiene asignado este parqueo, verificar que tenga otro
        if (!string.IsNullOrEmpty(parqueo.BusId))
        {
            var otrosParqueos = await _sb.From<Parqueo>()
                .Where(p => p.BusId == parqueo.BusId)
                .Get();

            // Si solo tiene este parqueo no se puede eliminar
            if (otrosParqueos.Models.Count <= 1)
                return BadRequest(new
                {
                    mensaje = "Un bus no puede quedar sin parqueo. Asigne otro parqueo antes de eliminar este."
                });
        }

        await _sb.From<Parqueo>().Where(x => x.Id == id).Delete();
        return NoContent();
    }
}