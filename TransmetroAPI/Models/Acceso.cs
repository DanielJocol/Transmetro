using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TransmetroAPI.Models;

[Table("acceso")]
public class Acceso : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("estacion_id")]
    public string EstacionId { get; set; } = string.Empty;

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("activo")]
    public bool Activo { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}