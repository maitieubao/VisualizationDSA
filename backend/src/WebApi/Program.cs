using Asp.Versioning;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using VisualizationDSA.Application;
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
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Extensions;
using VisualizationDSA.Infrastructure.Interceptors;
using VisualizationDSA.Infrastructure.Repositories;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.WebApi.Middlewares;
using VisualizationDSA.Application.Common.Interfaces;


Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("System",    LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);


builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)   
        .ReadFrom.Services(services)                     
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .MinimumLevel.Override("System",    LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "VisualizationDSA")
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
        .WriteTo.File(
            path:              "logs/app-.log",
            rollingInterval:   RollingInterval.Day,
            retainedFileCountLimit: 7,           
            outputTemplate:    "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}");
});


builder.Services.AddApplicationServices();
builder.Services.AddControllers(options =>
    {
        
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

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title       = "VisualizationDSA API",
        Version     = "v1",
        Description = "Backend API cho ứng dụng trực quan hóa DSA & OOP",
    });

    
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

// Configure Database (PostgreSQL)
builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
    options
        .UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
        // Bảo vệ tính bất biến của Event Sourcing Ledger (chặn UPDATE/DELETE).
        .AddInterceptors(new ImmutableAuditInterceptor()));

builder.Services.AddScoped<VisualizationDSA.Application.Interfaces.IApplicationDbContext>(provider => provider.GetRequiredService<VisualizationDSA.Infrastructure.Data.ApplicationDbContext>());


builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();


builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IGemsShopService, GemsShopService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IUploadService, CloudinaryUploadService>();
builder.Services.AddScoped<IGamificationService, GamificationService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<IDailyQuestService, DailyQuestService>();

// Register Background Service
builder.Services.AddHostedService<CoreBackgroundJobsService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ISemanticGraphService, SemanticGraphService>();
builder.Services.AddScoped<IAuditEventService, AuditEventService>();
builder.Services.AddScoped<ITeacherStudioService, TeacherStudioService>();
builder.Services.AddScoped<VisualizationDSA.Application.Services.INotificationService, NotificationService>();
builder.Services.AddScoped<IAiQuotaService, AiQuotaService>();
builder.Services.AddHttpClient<IAiAssistantService, AiAssistantService>();
builder.Services.AddScoped<IRoadmapAuditService, RoadmapAuditService>();
builder.Services.AddScoped<IContentModerationService, ContentModerationService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IRoadmapLanguageService, RoadmapLanguageService>();
builder.Services.AddScoped<ICheatSheetService, CheatSheetService>();
builder.Services.AddScoped<IUploadService, CloudinaryUploadService>();
builder.Services.AddScoped<IHeartService, HeartService>();
builder.Services.AddHttpClient<IJudge0Service, Judge0Service>();
builder.Services.AddScoped<IPracticeLadderService, PracticeLadderService>();
builder.Services.AddHttpClient<ISandboxService, SandboxService>();
builder.Services.AddScoped<ITeacherApplicationService, TeacherApplicationService>();
// Register Background Jobs
builder.Services.AddHostedService<VisualizationDSA.Infrastructure.Jobs.PremiumExpiryJob>();
builder.Services.AddHostedService<VisualizationDSA.Infrastructure.Jobs.StreakReminderJob>();
builder.Services.AddHostedService<VisualizationDSA.Infrastructure.Jobs.PremiumExpiryWarningJob>();
builder.Services.AddHostedService<VisualizationDSA.Infrastructure.Jobs.TeacherAppReminderJob>();
builder.Services.AddHostedService<VisualizationDSA.Infrastructure.Jobs.StreakCheckJob>();
builder.Services.AddScoped<ICodeJudgeService, MockCodeJudgeService>();
builder.Services.AddScoped<VisualizationDSA.Application.Services.IProgressRuleEngine, VisualizationDSA.Infrastructure.Services.ProgressRuleEngine>();


builder.Services.AddScoped<VisualizationDSA.Application.Services.IClassroomProgressService, VisualizationDSA.Infrastructure.Services.ClassroomProgressService>();
builder.Services.AddScoped<VisualizationDSA.Application.Services.IClassroomUnlockRuleEngine, VisualizationDSA.Infrastructure.Services.ClassroomUnlockRuleEngine>();


builder.Services.AddAlgorithmStrategies();


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

            
            
            
            
            NameClaimType = "sub",
            RoleClaimType = "role",
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/hubs/notifications") || path.StartsWithSegments("/hubs/quiz-room")))
                {
                    
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddHealthChecks()
    .AddCheck<VisualizationDSA.WebApi.Filters.DatabaseHealthCheck>("Database");


builder.Services.AddRateLimiter(options =>
{
    
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "global",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 10,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 0,  
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    
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

    
    options.AddPolicy("heavy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "global",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 15,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 0,  
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    
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


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseGlobalErrorHandling();


app.UseSerilogRequestLogging(options =>
{
    
    options.GetLevel = (ctx, elapsed, ex) =>
        ctx.Request.Path.StartsWithSegments("/health")
            ? LogEventLevel.Verbose
            : LogEventLevel.Information;
});


app.UseSecurityHeaders();

app.UseResponseCompression();
app.UseStaticFiles(); 
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


app.MapHub<VisualizationDSA.WebApi.Hubs.LeaderboardHub>("/hubs/leaderboard");
app.MapHub<VisualizationDSA.WebApi.Hubs.NotificationHub>("/hubs/notifications");
app.MapHub<VisualizationDSA.WebApi.Hubs.QuizRoomHub>("/hubs/quiz-room");


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


try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        // Dùng EnsureCreatedAsync() để auto-tạo schema cho PostgreSQL mà không cần qua Migrations (tránh lỗi xung đột SQLite)
        await context.Database.EnsureCreatedAsync();
        
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
