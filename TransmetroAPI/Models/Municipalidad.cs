using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TransmetroAPI.Models;

[Table("municipalidad")]
public class Municipalidad : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}