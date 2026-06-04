using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Supabase;
using SupabaseClient = Supabase.Client;
using TransmetroAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ── Supabase client ──────────────────────────────────────────
var supabaseUrl = builder.Configuration["Supabase:Url"]!;
var supabaseKey = builder.Configuration["Supabase:ServiceKey"]!;

builder.Services.AddSingleton(_ =>
    new SupabaseClient(supabaseUrl, supabaseKey, new SupabaseOptions
    {
        AutoRefreshToken = false,
        AutoConnectRealtime = false
    }));

// ── JWT ──────────────────────────────────────────────────────
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = false,
            ValidateAudience         = false,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = false,
            SignatureValidator       = (token, _) =>
            {
                var handler = new Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler();
                return handler.ReadJsonWebToken(token);
            }
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine("JWT ERROR: " + ctx.Exception.Message);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ── CORS ─────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── Controllers + Swagger ────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Transmetro API v1");
    });
}

app.UseCors("DevPolicy");
app.UseAuthentication();
app.UseRolClaim();
app.UseAuthorization();
app.MapControllers();

// Inicializar cliente Supabase
var supabase = app.Services.GetRequiredService<SupabaseClient>();
await supabase.InitializeAsync();

app.Run();