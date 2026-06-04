namespace TransmetroAPI.DTOs;

public record LineaEstacionDto(
    string Id,
    string LineaId,
    string EstacionId,
    int OrdenEnLinea
);

public record LineaEstacionCreateDto(
    string LineaId,
    string EstacionId,
    int OrdenEnLinea
);