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
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Extensions;
using VisualizationDSA.Infrastructure.Interceptors;
using VisualizationDSA.Infrastructure.Repositories;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.WebApi.Middlewares;
using Microsoft.AspNetCore.HttpOverrides;


Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Information)
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
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Information)
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


builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
    options
        .UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
        
        .AddInterceptors(new ImmutableAuditInterceptor()));

// AD-008: DbContext RIÊNG cho audit (IDbContextFactory) — AuditEventService tự tạo context
// con mỗi lần ghi, KHÔNG dùng chung ChangeTracker với action đang thực thi (chống commit nhầm).
builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
    options
        .UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
        .AddInterceptors(new ImmutableAuditInterceptor()));

builder.Services.AddScoped<VisualizationDSA.Application.Interfaces.IApplicationDbContext>(provider => provider.GetRequiredService<VisualizationDSA.Infrastructure.Data.ApplicationDbContext>());


builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddSingleton<VisualizationDSA.Domain.Lectures.LectureRepository>();


// Dùng chung khóa ký JWT từ cấu hình cho hệ stateless (JwtHelper/StatelessAuthStrategy/AdminController).
// AU-009: KHÔNG fallback key hardcode — ép đọc từ env/config ở MỌI môi trường.
var jwtKey = builder.Configuration["Jwt:Key"];
var isJwtKeyPlaceholder = string.IsNullOrWhiteSpace(jwtKey) ||
    jwtKey.Contains("REPLACE_WITH_SECURE", StringComparison.OrdinalIgnoreCase) ||
    jwtKey.Contains("your-super-secret", StringComparison.OrdinalIgnoreCase);

if (isJwtKeyPlaceholder)
{
    if (builder.Environment.IsDevelopment())
    {
        // Development: sinh key ngẫu nhiên + log warning rõ ràng (không ai ký được token giả).
        jwtKey = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(48));
        builder.Configuration["Jwt:Key"] = jwtKey;
        Log.Warning("Jwt:Key chưa được cấu hình trong Development — đã sinh key ngẫu nhiên. Mọi token cũ sẽ vô hiệu sau restart; đặt biến môi trường Jwt:Key để giữ phiên ổn định.");
    }
    else
    {
        // Fail-fast ở mọi môi trường không phải Development: key placeholder/thiếu = chặn khởi động.
        throw new InvalidOperationException(
            "Jwt:Key phải được cấu hình bằng chuỗi bí mật thực (không dùng placeholder) — đặt biến môi trường Jwt:Key trước khi chạy.");
    }
}
VisualizationDSA.Domain.JwtSigningConfig.Configure(
    jwtKey,
    builder.Configuration["Jwt:Issuer"],
    builder.Configuration["Jwt:Audience"]);

// Tài khoản demo/admin mặc định CHỈ ở Development (tránh backdoor credential công khai ở production).
VisualizationDSA.Domain.Strategies.StatelessAuthStrategy.EnableDemoAccounts = builder.Environment.IsDevelopment();


builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IGamificationService, GamificationService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ISemanticGraphService, SemanticGraphService>();
builder.Services.AddScoped<IAuditEventService, AuditEventService>();

// NT-002: NotificationService chưa từng được đăng ký DI → controller/service không dùng được,
// real-time chết 2 đầu. Đăng ký scoped (dùng chung ApplicationDbContext scoped).
builder.Services.AddScoped<INotificationService, NotificationService>();

// C2: background service nhắc deadline lớp học (quét mỗi giờ — item DueAt trong 24h tới).
builder.Services.AddHostedService<DeadlineReminderService>();


builder.Services.Configure<JudgeOptions>(builder.Configuration.GetSection(JudgeOptions.SectionName));
builder.Services.AddHttpClient<PistonCodeJudgeService>((sp, client) =>
{
    var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<JudgeOptions>>().Value;
    client.Timeout = TimeSpan.FromSeconds(Math.Max(5, options.HttpTimeoutSeconds));
});
builder.Services.AddScoped<ICodeJudgeService>(sp => sp.GetRequiredService<PistonCodeJudgeService>());
builder.Services.AddScoped<VisualizationDSA.Application.Services.IProgressRuleEngine, VisualizationDSA.Infrastructure.Services.ProgressRuleEngine>();


builder.Services.AddScoped<VisualizationDSA.Application.Services.IClassroomProgressService, VisualizationDSA.Infrastructure.Services.ClassroomProgressService>();
builder.Services.AddScoped<VisualizationDSA.Application.Services.IClassroomUnlockRuleEngine, VisualizationDSA.Infrastructure.Services.ClassroomUnlockRuleEngine>();
// ClassroomController phụ thuộc 2 service này — thiếu đăng ký → mọi endpoint classroom lỗi 409.
builder.Services.AddScoped<VisualizationDSA.Application.Services.IClassroomGradingService, VisualizationDSA.Infrastructure.Services.ClassroomGradingService>();
builder.Services.AddScoped<VisualizationDSA.Application.Services.IClassroomExcelExportService, VisualizationDSA.Infrastructure.Services.ClassroomExcelExportService>();


builder.Services.AddAlgorithmStrategies();


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),



            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
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
            partitionKey: RateLimitKey(context),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                // AU-036: nới limit cho các endpoint unauthenticated (register/login/refresh/logout)
                // dùng chung IP sau NAT trường học — 10/min/IP cũ gây 429 hàng loạt.
                PermitLimit          = 20,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 0,  
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    
    options.AddPolicy("api", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: RateLimitKey(context),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 60,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 10,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    
    options.AddPolicy("heavy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: RateLimitKey(context),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 15,
                Window               = TimeSpan.FromMinutes(1),
                QueueLimit           = 0,  
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    // PM-012: webhook SePay là endpoint AllowAnonymous — giới hạn riêng theo IP để
    // chống spam payload giả (SePay gửi ít webhook hơn nhiều so với traffic người dùng).
    options.AddPolicy("webhook", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit          = 20,
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

// Partition rate limit theo USER đã đăng nhập (sub) thay vì IP — trường học/office dùng
// chung IP (NAT) trước đây gộp toàn lớp vào 1 bucket -> 429 hàng loạt khi cùng login.
// AU-036: unauthenticated partition theo IP + CỔNG NGUỒN (RemotePort) — mỗi client sau NAT
// có source port riêng → không gộp cả lớp vào 1 bucket. Lưu ý: kẻ tấn công đổi cổng có thể
// lách limit — chấp nhận vì mục tiêu ưu tiên là không khóa nhầm user thật sau NAT.
static string RateLimitKey(HttpContext ctx)
{
    var userId = ctx.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                 ?? ctx.User?.FindFirst("sub")?.Value;
    if (!string.IsNullOrEmpty(userId))
        return $"u:{userId}";

    var forwardedFor = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    var ip = !string.IsNullOrWhiteSpace(forwardedFor)
        ? forwardedFor.Split(',')[0].Trim()
        : ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    return $"ip:{ip}:{ctx.Connection.RemotePort}";
}

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

// Bắt buộc khi deploy sau reverse proxy (nginx/Caddy): nếu thiếu, rate limit theo IP
// gộp toàn bộ user vào 1 bucket và UseHttpsRedirection nhìn scheme sai.
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
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
        
        context.Database.Migrate();
        
        var seeder = new DbSeeder(context, includeDemoAdmin: app.Environment.IsDevelopment());
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
