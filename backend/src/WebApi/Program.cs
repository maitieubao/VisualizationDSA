using Asp.Versioning;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Extensions;
using VisualizationDSA.Infrastructure.Interceptors;
using VisualizationDSA.Infrastructure.Repositories;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.WebApi.Middlewares;

// ── Bootstrap logger (vọ ngay khi start, trước khi DI sẵn sàng) ──────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("System",    LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);

// ── Serilog full logger (thay thế ILogger mặc định của .NET) ────────────────
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)   // đọc từ appsettings.json
        .ReadFrom.Services(services)                     // hỗ trợ enrichers DI
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .MinimumLevel.Override("System",    LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "VisualizationDSA")
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
        .WriteTo.File(
            path:              "logs/app-.log",
            rollingInterval:   RollingInterval.Day,
            retainedFileCountLimit: 7,           // giữ tối đa 7 ngày
            outputTemplate:    "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}");
});

// Add services to the container
builder.Services.AddControllers(options =>
    {
        // Ghi mọi tương tác API vào Event Sourcing Ledger (append-only) một cách reactively.
        options.Filters.Add<VisualizationDSA.WebApi.Filters.AuditEventActionFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});
builder.Services.AddEndpointsApiExplorer();
// ✅ B4: Swagger JWT config — show Authorize button trong Swagger UI
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title       = "VisualizationDSA API",
        Version     = "v1",
        Description = "Backend API cho ứng dụng trực quan hóa DSA & OOP",
    });

    // Định nghĩa scheme Bearer
    var jwtScheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description  = "Nhập JWT token (không cần prefix 'Bearer ')",
    };
    options.AddSecurityDefinition("Bearer", jwtScheme);

    // Yêu cầu Bearer cho mọi endpoint có [Authorize]
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Id   = "Bearer",
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure Response Compression (Brotli + Gzip)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/json" });
});
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

// ✅ C1: CORS đọc từ appsettings.json Cors:AllowedOrigins — không hardcode nữa
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Database (SQLite)
builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
    options
        .UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
        // Bảo vệ tính bất biến của Event Sourcing Ledger (chặn UPDATE/DELETE).
        .AddInterceptors(new ImmutableAuditInterceptor()));

// Register Repository & Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IGamificationService, GamificationService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ISemanticGraphService, SemanticGraphService>();
builder.Services.AddScoped<IAuditEventService, AuditEventService>();

// Register Algorithm Strategies (Reflection-based auto-scan)
builder.Services.AddAlgorithmStrategies();

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),

            // ✅ FIX: Map "sub" JWT claim → ClaimTypes.NameIdentifier
            // AuthService.cs tạo JWT với JwtRegisteredClaimNames.Sub ("sub").
            // Nếu không set NameClaimType, FindFirstValue(ClaimTypes.NameIdentifier) trả null
            // → GetCurrentUserId() throw UnauthorizedAccessException → 401 trên mọi endpoint /me/*
            NameClaimType = "sub",
            RoleClaimType = "role",
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                // If the request is for our hub...
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/hubs/notifications") || path.StartsWithSegments("/hubs/quiz-room")))
                {
                    // Read the token out of the query string
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Health checks — self and DbContext
builder.Services.AddHealthChecks()
    .AddCheck<VisualizationDSA.WebApi.Filters.DatabaseHealthCheck>("Database");

// ── Rate Limiting (built-in .NET 7+) — bảo vệ auth endpoints & chống spam ──
builder.Services.AddRateLimiter(options =>
{
    // "auth" policy: max 10 requests/60 giây mỗi IP — ngăn brute-force login
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "global",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 10,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 0,  // reject immediately khi quá limit
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    // "api" policy: max 60 requests/60 giây mỗi IP — bảo vệ API thông thường
    options.AddPolicy("api", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "global",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 60,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 10,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    // "heavy" policy: max 15 requests/60 giây mỗi IP — bảo vệ các endpoint tính toán nặng
    options.AddPolicy("heavy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "global",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 15,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 0,  // reject immediately để tránh nghẽn thread pool
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    // Response khi bị rate-limit
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            JsonSerializer.Serialize(new { message = "Quá nhiều yêu cầu. Vui lòng thử lại sau." }),
            token);
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware phải đứng đầu tiên để bắt mọi exception từ các middleware phía sau
app.UseGlobalErrorHandling();

// ✅ TASK 4.4: Serilog HTTP request logging — log method, path, status, duration
app.UseSerilogRequestLogging(options =>
{
    // Bỏ qua /health để tránh log spam từ uptime monitoring
    options.GetLevel = (ctx, elapsed, ex) =>
        ctx.Request.Path.StartsWithSegments("/health")
            ? LogEventLevel.Verbose
            : LogEventLevel.Information;
});

// Security headers gắn vào mọi response
app.UseSecurityHeaders();

app.UseResponseCompression();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseUserLogging();
app.UseRateLimiter();
app.MapControllers();

// Map SignalR Hubs
app.MapHub<VisualizationDSA.WebApi.Hubs.LeaderboardHub>("/hubs/leaderboard");
app.MapHub<VisualizationDSA.WebApi.Hubs.NotificationHub>("/hubs/notifications");
app.MapHub<VisualizationDSA.WebApi.Hubs.QuizRoomHub>("/hubs/quiz-room");

// Health check endpoint — GET /health
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = JsonSerializer.Serialize(new
        {
            status      = report.Status.ToString(),
            checks      = report.Entries.Select(e => new
            {
                name    = e.Key,
                status  = e.Value.Status.ToString(),
                latency = e.Value.Duration.TotalMilliseconds,
            }),
            totalDuration = report.TotalDuration.TotalMilliseconds,
            timestamp     = DateTime.UtcNow,
        });
        await context.Response.WriteAsync(result);
    }
});

// Ensure database is created and seed data
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        // Chạy Migrations để tạo bảng đầy đủ trong SQLite
        context.Database.Migrate();
        
        var seeder = new DbSeeder(context);
        await seeder.SeedAsync();
        Console.WriteLine("[DB SEEDER SUCCESS]: Đã nạp thành công 11 khóa học và 12 bài Quiz!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[DB SEED ERROR]: {ex}");
    Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu local để chạy migrations. Hệ thống vẫn khởi động bình thường.");
}

app.Run();
