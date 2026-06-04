using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TransmetroAPI.Models;

// ── Linea ────────────────────────────────────────────────────
[Table("linea")]
public class Linea : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("activa")]
    public bool Activa { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

// ── Estacion ─────────────────────────────────────────────────
[Table("estacion")]
public class Estacion : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("linea_id")]
    public string LineaId { get; set; } = string.Empty;

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("latitud")]
    public double Latitud { get; set; }

    [Column("longitud")]
    public double Longitud { get; set; }

    [Column("capacidad_maxima")]
    public int CapacidadMaxima { get; set; }

    [Column("orden_en_linea")]
    public int OrdenEnLinea { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

// ── Bus ───────────────────────────────────────────────────────
[Table("bus")]
public class Bus : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("linea_id")]
    public string? LineaId { get; set; }

    [Column("placa")]
    public string Placa { get; set; } = string.Empty;

    [Column("capacidad_maxima")]
    public int CapacidadMaxima { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "activo";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

// ── Parqueo ───────────────────────────────────────────────────
[Table("parqueo")]
public class Parqueo : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("bus_id")]
    public string? BusId { get; set; }

    [Column("ubicacion")]
    public string Ubicacion { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }
}

// ── Piloto ────────────────────────────────────────────────────
[Table("piloto")]
public class Piloto : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("bus_id")]
    public string? BusId { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("apellido")]
    public string Apellido { get; set; } = string.Empty;

    [Column("dpi")]
    public string Dpi { get; set; } = string.Empty;

    [Column("telefono")]
    public string? Telefono { get; set; }

    [Column("direccion")]
    public string? Direccion { get; set; }

    [Column("formacion")]
    public string? Formacion { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

// ── FlujoPasajeros ────────────────────────────────────────────
[Table("flujo_pasajeros")]
public class FlujoPasajeros : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("estacion_id")]
    public string EstacionId { get; set; } = string.Empty;

    [Column("cantidad_actual")]
    public int CantidadActual { get; set; }

    [Column("registrado_en")]
    public DateTime RegistradoEn { get; set; }
}

// ── Alerta ────────────────────────────────────────────────────
[Table("alerta")]
public class Alerta : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("estacion_id")]
    public string? EstacionId { get; set; }

    [Column("bus_id")]
    public string? BusId { get; set; }

    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [Column("descripcion")]
    public string Descripcion { get; set; } = string.Empty;

    [Column("resuelta")]
    public bool Resuelta { get; set; } = false;

    [Column("creada_en")]
    public DateTime CreadaEn { get; set; }
}

// ── PerfilUsuario ─────────────────────────────────────────────
[Table("perfil_usuario")]
public class PerfilUsuario : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;

    [Column("rol")]
    public string Rol { get; set; } = "operador";

    [Column("nombre")]
    public string? Nombre { get; set; }

    [Column("estacion_id")]
    public string? EstacionId { get; set; }
}