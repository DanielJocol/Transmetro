using System.Security.Claims;
using SupabaseClient = Supabase.Client;

namespace TransmetroAPI.Middleware;

public class RolClaimMiddleware
{
    private readonly RequestDelegate _next;

    public RolClaimMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, SupabaseClient supabase)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var identity = context.User.Identity as ClaimsIdentity;
            var userId   = context.User.FindFirst("sub")?.Value
                        ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                var result = await supabase.From<TransmetroAPI.Models.PerfilUsuario>()
                    .Where(p => p.Id == userId)
                    .Single();

                if (result is not null)
                {
                    identity?.AddClaim(new Claim(ClaimTypes.Role, result.Rol));
                }
            }
        }

        await _next(context);
    }
}

public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseRolClaim(this IApplicationBuilder app)
        => app.UseMiddleware<RolClaimMiddleware>();
}