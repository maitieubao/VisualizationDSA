import type { DIScenarioPayload } from '../types/ioc.types';

export const WEB_API_SCENARIO: DIScenarioPayload = {
  scenarioId: 'web-api-standard',
  title: 'Standard Web API (ASP.NET Core)',
  description:
    'Mô phỏng cấu hình DI chuẩn ASP.NET Core: SupabaseClient (Singleton) → UserRepository (Singleton) → UserService (Transient) → UserController (Transient)',
  registrations: [
    {
      serviceType: 'ISupabaseClient',
      implementationType: 'SupabaseClient',
      lifetime: 'SINGLETON',
      dependencies: [],
    },
    {
      serviceType: 'IUserRepository',
      implementationType: 'SupabaseUserRepository',
      lifetime: 'SINGLETON',
      dependencies: ['ISupabaseClient'],
    },
    {
      serviceType: 'IUserService',
      implementationType: 'UserService',
      lifetime: 'TRANSIENT',
      dependencies: ['IUserRepository'],
    },
    {
      serviceType: 'IUserController',
      implementationType: 'UserController',
      lifetime: 'TRANSIENT',
      dependencies: ['IUserService'],
    },
  ],
};

export const CIRCULAR_DEPENDENCY_SCENARIO: DIScenarioPayload = {
  scenarioId: 'circular-dependency',
  title: 'Circular Dependency Demo',
  description:
    'Cố ý tạo lỗi phụ thuộc vòng tròn: IServiceA → IServiceB → IServiceA. DFS Cycle Detector sẽ phát hiện và cảnh báo.',
  registrations: [
    {
      serviceType: 'IServiceA',
      implementationType: 'ServiceA',
      lifetime: 'TRANSIENT',
      dependencies: ['IServiceB'],
    },
    {
      serviceType: 'IServiceB',
      implementationType: 'ServiceB',
      lifetime: 'TRANSIENT',
      dependencies: ['IServiceA'],
    },
  ],
};

export const CAPTIVE_DEPENDENCY_SCENARIO: DIScenarioPayload = {
  scenarioId: 'captive-dependency',
  title: 'Captive Dependency Warning',
  description:
    'Singleton chứa Transient — lỗi phụ thuộc giam cầm: AppService (Singleton) nắm giữ vĩnh viễn RequestContext (Transient), làm mất tác dụng giải phóng bộ nhớ.',
  registrations: [
    {
      serviceType: 'ILogger',
      implementationType: 'ConsoleLogger',
      lifetime: 'SINGLETON',
      dependencies: [],
    },
    {
      serviceType: 'IRequestContext',
      implementationType: 'HttpRequestContext',
      lifetime: 'TRANSIENT',
      dependencies: [],
    },
    {
      serviceType: 'IAppService',
      implementationType: 'AppService',
      lifetime: 'SINGLETON',
      dependencies: ['IRequestContext', 'ILogger'],
    },
  ],
};

export const CLEAN_ARCHITECTURE_SCENARIO: DIScenarioPayload = {
  scenarioId: 'clean-architecture',
  title: 'Clean Architecture (CQRS)',
  description:
    'Kiến trúc sạch với tách lớp Command/Query: MediatR Handler → Repository → DbContext (Singleton).',
  registrations: [
    {
      serviceType: 'IDbContext',
      implementationType: 'AppDbContext',
      lifetime: 'SINGLETON',
      dependencies: [],
    },
    {
      serviceType: 'ICacheService',
      implementationType: 'RedisCacheService',
      lifetime: 'SINGLETON',
      dependencies: [],
    },
    {
      serviceType: 'IProductRepository',
      implementationType: 'ProductRepository',
      lifetime: 'TRANSIENT',
      dependencies: ['IDbContext'],
    },
    {
      serviceType: 'IQueryHandler',
      implementationType: 'GetProductsHandler',
      lifetime: 'TRANSIENT',
      dependencies: ['IProductRepository', 'ICacheService'],
    },
    {
      serviceType: 'ICommandHandler',
      implementationType: 'CreateProductHandler',
      lifetime: 'TRANSIENT',
      dependencies: ['IProductRepository'],
    },
  ],
};

export const ALL_SCENARIOS: DIScenarioPayload[] = [
  WEB_API_SCENARIO,
  CIRCULAR_DEPENDENCY_SCENARIO,
  CAPTIVE_DEPENDENCY_SCENARIO,
  CLEAN_ARCHITECTURE_SCENARIO,
];
