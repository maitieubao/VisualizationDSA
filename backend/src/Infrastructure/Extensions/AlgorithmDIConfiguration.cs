using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.Infrastructure.Extensions;






public static class AlgorithmDIConfiguration
{
    public static IServiceCollection AddAlgorithmStrategies(this IServiceCollection services)
    {
        var domainAssembly = Assembly.GetAssembly(typeof(IAlgorithmStrategy))!;

        
        
        RegisterByInterface<IAlgorithmStrategy>(services, domainAssembly, ServiceLifetime.Transient);

        
        
        RegisterByInterface<IConceptStrategy>(services, domainAssembly, ServiceLifetime.Singleton);

        
        
        services.AddSingleton<QuizBankStrategy>();
        services.AddSingleton<GamificationStrategy>();
        services.AddSingleton<StatelessAuthStrategy>();
        services.AddSingleton<StatelessPaymentStrategy>();

        return services;
    }

    
    
    
    
    
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
            
            services.Add(new ServiceDescriptor(type, type, lifetime));
            
            services.Add(new ServiceDescriptor(typeof(TInterface), sp => sp.GetRequiredService(type), lifetime));
        }
    }
}
