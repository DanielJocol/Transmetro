using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlertaController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public AlertaController(SupabaseClient sb) => _sb = sb;

    static AlertaDto ToDto(Alerta a) => new(
        a.Id, a.EstacionId, a.BusId, a.Tipo,
        a.Descripcion, a.Resuelta, a.CreadaEn);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool soloActivas = false)
    {
        if (soloActivas)
        {
            var filtered = await _sb.From<Alerta>()
                .Where(a => a.Resuelta == false)
                .Order(a => a.CreadaEn, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();
            return Ok(filtered.Models.Select(ToDto));
        }
        var result = await _sb.From<Alerta>()
            .Order(a => a.CreadaEn, Supabase.Postgrest.Constants.Ordering.Descending)
            .Get();
        return Ok(result.Models.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = "administrador,supervisor")]
    public async Task<IActionResult> Crear([FromBody] AlertaCreateDto dto)
    {
        var alerta = new Alerta
        {
            EstacionId  = dto.EstacionId,
            BusId       = dto.BusId,
            Tipo        = dto.Tipo,
            Descripcion = dto.Descripcion,
            CreadaEn    = DateTime.UtcNow
        };
        var result = await _sb.From<Alerta>().Insert(alerta);
        return Ok(ToDto(result.Models[0]));
    }

    [HttpPatch("{id}/resolver")]
    [Authorize(Roles = "administrador,supervisor")]
    public async Task<IActionResult> Resolver(string id, [FromBody] ResolverAlertaDto dto)
    {
        var alerta = await _sb.From<Alerta>().Where(a => a.Id == id).Single();
        if (alerta is null) return NotFound();

        alerta.Resuelta = dto.Resuelta;
        var result = await _sb.From<Alerta>().Update(alerta);
        return Ok(ToDto(result.Models[0]));
    }
}