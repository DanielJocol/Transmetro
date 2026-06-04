using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TransmetroAPI.Models;

[Table("acceso_estacion")]
public class AccesoEstacion : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("estacion_id")]
    public string EstacionId { get; set; } = string.Empty;

    [Column("usuario_id")]
    public string UsuarioId { get; set; } = string.Empty;

    [Column("accion")]
    public string Accion { get; set; } = string.Empty;

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }
}