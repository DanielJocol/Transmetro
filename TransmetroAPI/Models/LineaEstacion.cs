using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TransmetroAPI.Models;

[Table("linea_estacion")]
public class LineaEstacion : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("linea_id")]
    public string LineaId { get; set; } = string.Empty;

    [Column("estacion_id")]
    public string EstacionId { get; set; } = string.Empty;

    [Column("orden_en_linea")]
    public int OrdenEnLinea { get; set; }
}