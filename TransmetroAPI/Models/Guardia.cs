using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TransmetroAPI.Models;

[Table("guardia")]
public class Guardia : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("estacion_id")]
    public string EstacionId { get; set; } = string.Empty;

    [Column("acceso_id")]                          // ← agregar
    public string? AccesoId { get; set; }          // ← agregar

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("apellido")]
    public string Apellido { get; set; } = string.Empty;

    [Column("dpi")]
    public string Dpi { get; set; } = string.Empty;

    [Column("telefono")]
    public string? Telefono { get; set; }

    [Column("turno")]
    public string Turno { get; set; } = "diurno";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}