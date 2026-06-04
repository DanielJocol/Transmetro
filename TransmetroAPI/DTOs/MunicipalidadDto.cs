namespace TransmetroAPI.DTOs;

public record MunicipalidadDto(
    string Id,
    string Nombre,
    string? Descripcion,
    DateTime CreatedAt
);

public record MunicipalidadCreateDto(
    string Nombre,
    string? Descripcion
);