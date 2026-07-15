using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.Infrastructure.Extensions;

/// <summary>
/// Tự động quét và đăng ký tất cả Strategy classes vào DI Container bằng Reflection.
/// Thêm IAlgorithmStrategy/IConceptStrategy mới chỉ cần tạo class — KHÔNG cần sửa file này.
/// 100% OCP compliant: Open for extension, Closed for modification.
/// </summary>
public static class AlgorithmDIConfiguration
{
    public static IServiceCollection AddAlgorithmStrategies(this IServiceCollection services)
    {
        var domainAssembly = Assembly.GetAssembly(typeof(IAlgorithmStrategy))!;

        // ── Đăng ký Algorithm Strategies (Sorting, Graph, Search, ...) ──
        // Quét tất cả class implement IAlgorithmStrategy → Transient
        RegisterByInterface<IAlgorithmStrategy>(services, domainAssembly, ServiceLifetime.Transient);

        // ── Đăng ký Concept Strategies (OOP, System Design, SOLID, Patterns, DI) ──
        // Quét tất cả class implement IConceptStrategy → Singleton (shared + both interface & concrete)
        RegisterByInterface<IConceptStrategy>(services, domainAssembly, ServiceLifetime.Singleton);

        // ── Đăng ký Domain Services (Auth, Payment, Quiz, Gamification) ──
        // Standalone strategies không thuộc IConceptStrategy
        services.AddSingleton<QuizBankStrategy>();
        services.AddSingleton<GamificationStrategy>();
        services.AddSingleton<StatelessAuthStrategy>();
        services.AddSingleton<StatelessPaymentStrategy>();

        return services;
    }

    /// <summary>
    /// Quét Domain assembly, tìm tất cả concrete class implement <typeparamref name="TInterface"/>
    /// và đăng ký vào DI Container với lifetime cho trước.
    /// Đăng ký cả interface mapping (IEnumerable inject) lẫn concrete type (direct inject).
    /// </summary>
    private static void RegisterByInterface<TInterface>(
        IServiceCollection services,
        Assembly assembly,
        ServiceLifetime lifetime) where TInterface : class
    {
        var implementationTypes = assembly.GetTypes()
            .Where(t => typeof(TInterface).IsAssignableFrom(t)
                     && !t.IsInterface
                     && !t.IsAbstract);

        foreach (var type in implementationTypes)
        {
            // Đăng ký concrete type (cho direct constructor injection)
            services.Add(new ServiceDescriptor(type, type, lifetime));
            // Đăng ký interface mapping (cho IEnumerable<TInterface> injection)
            services.Add(new ServiceDescriptor(typeof(TInterface), sp => sp.GetRequiredService(type), lifetime));
        }
    }
}
