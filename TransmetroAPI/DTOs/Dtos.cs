namespace TransmetroAPI.DTOs;

// ── Linea ─────────────────────────────────────────────────────
public record LineaDto(
    string Id,
    string Nombre,
    string? Descripcion,
    bool Activa,
    DateTime CreatedAt
);

public record LineaCreateDto(
    string Nombre,
    string? Descripcion,
    bool Activa
);

// ── Estacion ──────────────────────────────────────────────────
public record EstacionDto(
    string Id,
    string LineaId,
    string Nombre,
    double Latitud,
    double Longitud,
    int CapacidadMaxima,
    int OrdenEnLinea,
    DateTime CreatedAt
);

public record EstacionCreateDto(
    string LineaId,
    string Nombre,
    double Latitud,
    double Longitud,
    int CapacidadMaxima,
    int OrdenEnLinea
);

// ── Bus ───────────────────────────────────────────────────────
public record BusDto(
    string Id,
    string? LineaId,
    string Placa,
    int CapacidadMaxima,
    string Estado,
    DateTime CreatedAt
);

public record BusCreateDto(
    string? LineaId,
    string Placa,
    int CapacidadMaxima,
    string Estado
);

// ── Parqueo ───────────────────────────────────────────────────
public record ParqueoDto(
    string Id,
    string? BusId,
    string Ubicacion,
    string? Descripcion
);

public record ParqueoCreateDto(
    string? BusId,
    string Ubicacion,
    string? Descripcion
);

// ── Piloto ────────────────────────────────────────────────────
public record PilotoDto(
    string Id,
    string? BusId,
    string Nombre,
    string Apellido,
    string Dpi,
    string? Telefono,
    string? Direccion,
    string? Formacion,
    DateTime CreatedAt
);

public record PilotoCreateDto(
    string? BusId,
    string Nombre,
    string Apellido,
    string Dpi,
    string? Telefono,
    string? Direccion,
    string? Formacion
);

// ── FlujoPasajeros ────────────────────────────────────────────
public record FlujoPasajerosDto(
    string Id,
    string EstacionId,
    int CantidadActual,
    DateTime RegistradoEn
);

public record RegistrarFlujoDto(
    string EstacionId,
    int CantidadActual
);

// ── Alerta ────────────────────────────────────────────────────
public record AlertaDto(
    string Id,
    string? EstacionId,
    string? BusId,
    string Tipo,
    string Descripcion,
    bool Resuelta,
    DateTime CreadaEn
);

public record AlertaCreateDto(
    string? EstacionId,
    string? BusId,
    string Tipo,
    string Descripcion
);

public record ResolverAlertaDto(bool Resuelta);

// ── PerfilUsuario ─────────────────────────────────────────────
public record PerfilUsuarioDto(
    string Id,
    string Rol,
    string? Nombre,
    string? EstacionId
);

// ── AccesoEstacion ────────────────────────────────────────────
public record AccesoEstacionDto(
    string Id,
    string EstacionId,
    string UsuarioId,
    string Accion,
    DateTime Timestamp
);

// ── Reporte ───────────────────────────────────────────────────
public record ReporteLineaDto(
    string Id,
    string Nombre,
    string? Descripcion,
    bool Activa,
    int TotalEstaciones,
    int TotalBuses,
    int BusesActivos
);