namespace TransmetroAPI.DTOs;

public record AccesoDto(
    string Id,
    string EstacionId,
    string Nombre,
    string? Descripcion,
    bool Activo,
    DateTime CreatedAt
);

public record AccesoCreateDto(
    string EstacionId,
    string Nombre,
    string? Descripcion,
    bool Activo
);