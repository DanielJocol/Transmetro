using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.DTOs;
using TransmetroAPI.Models;

namespace TransmetroAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReporteController : ControllerBase
{
    private readonly SupabaseClient _sb;
    public ReporteController(SupabaseClient sb) => _sb = sb;

    [HttpGet("lineas")]
    public async Task<IActionResult> ResumenLineas()
    {
        var lineas     = (await _sb.From<Linea>().Get()).Models;
        var estaciones = (await _sb.From<Estacion>().Get()).Models;
        var buses      = (await _sb.From<Bus>().Get()).Models;

        var reporte = lineas.Select(l => new ReporteLineaDto(
            l.Id,
            l.Nombre,
            l.Descripcion,
            l.Activa,
            estaciones.Count(e => e.LineaId == l.Id),
            buses.Count(b => b.LineaId == l.Id),
            buses.Count(b => b.LineaId == l.Id && b.Estado == "activo")
        ));

        return Ok(reporte);
    }

    [HttpGet("accesos")]
    [Authorize(Roles = "administrador,supervisor")]
    public async Task<IActionResult> AccesosPorEstacion([FromQuery] string estacionId)
    {
        var result = await _sb.From<AccesoEstacion>()
            .Where(a => a.EstacionId == estacionId)
            .Order(a => a.Timestamp, Supabase.Postgrest.Constants.Ordering.Descending)
            .Limit(100)
            .Get();

        return Ok(result.Models.Select(a => new AccesoEstacionDto(
            a.Id, a.EstacionId, a.UsuarioId, a.Accion, a.Timestamp)));
    }
}