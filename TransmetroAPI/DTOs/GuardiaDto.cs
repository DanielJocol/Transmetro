namespace TransmetroAPI.DTOs;

public record GuardiaDto(
    string Id,
    string EstacionId,
    string? AccesoId,
    string Nombre,
    string Apellido,
    string Dpi,
    string? Telefono,
    string Turno,
    DateTime CreatedAt
);

public record GuardiaCreateDto(
    string EstacionId,
    string? AccesoId,
    string Nombre,
    string Apellido,
    string Dpi,
    string? Telefono,
    string Turno
);