using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using srtk.Services;
using System.Security.Claims;
using PdfSharp.Fonts;
using srtk.Resources;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Baza danych:
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS - dostêp do danych z API:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Konfiguracja serwera Kestrel – ustawienie portów HTTP (5048) i HTTPS (7207):
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5048);
    serverOptions.ListenAnyIP(7207, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

// Rejestracja serwisu o haszowania hase³ u¿ytkowników:
builder.Services.AddSingleton<PasswordService>();

// Tokeny JWT do uwierzytelniania u¿ytkownika:
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var config = builder.Configuration;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = config["Jwt:Issuer"],
        ValidAudience = config["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"])),
        RoleClaimType = ClaimTypes.Role
    };
});

// Rejestracja serwisu do generowania tokenów JWT:
builder.Services.AddScoped<JwtService>();

// Rejestracja pozosta³ych serwisów:
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EquipmentService>();
builder.Services.AddScoped<FacilityService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<StatusService>();
builder.Services.AddScoped<TrackService>();

// Serwisy do wysy³ania maila:
builder.Services.Configure<Email>(builder.Configuration.GetSection("Email"));
builder.Services.AddTransient<EmailService>();

// Logi:
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

// Rejestracja fontów do generowania pdf:
GlobalFontSettings.FontResolver = new CustomFontResolver();

// T³umaczenie (do maili):
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Dodatkowe nag³ówki bezpieczeñstwa:
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "no-referrer");
    context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=()");
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
    await next();
});

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
