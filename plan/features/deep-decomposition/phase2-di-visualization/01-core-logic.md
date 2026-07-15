# 🧠 IoC Simulator Engine & Circular Dependency DFS (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân bộ chứa ảo `IoCContainerSimulator`, giải thuật phát hiện chu trình DFS đồ thị WFG và các ca kiểm thử tự động (Unit Tests).

---

## 1. Bộ máy Giả lập IoC Container (TypeScript Core Logic)

Lớp `IoCContainerSimulator` điều phối luồng đăng ký dịch vụ, khởi dựng đối tượng theo vòng đời và ghi lại vết phân giải đệ quy constructor:

```typescript
export type Lifetime = 'SINGLETON' | 'TRANSIENT';

export interface IoCRegistration {
  serviceType: string;
  implementationType: string;
  lifetime: Lifetime;
  dependencies: string[]; // Tên các interface constructor cần bơm vào
}

export interface ResolutionStep {
  type: 'LOOKUP' | 'INSTANTIATE' | 'RETRIEVE_SINGLETON' | 'INJECT';
  serviceType: string;
  implementationType: string;
  targetConstructorParam?: string;
}

export class IoCContainerSimulator {
  private registrations: Record<string, IoCRegistration> = {};
  private singletonVault: Record<string, any> = {};
  private resolutionSteps: ResolutionStep[] = [];

  constructor() {
    this.registrations = {};
    this.singletonVault = {};
  }

  /**
   * Đăng ký dịch vụ vào registry container
   */
  public register(
    serviceType: string,
    implementationType: string,
    lifetime: Lifetime,
    dependencies: string[]
  ): void {
    this.registrations[serviceType] = {
      serviceType,
      implementationType,
      lifetime,
      dependencies
    };
  }

  /**
   * Phân giải đệ quy constructor tiêm phụ thuộc (Dependency Resolution)
   */
  public resolve(serviceType: string, visited: Set<string> = new Set()): any {
    // 1. Bảo vệ chống phụ thuộc vòng tròn
    if (visited.has(serviceType)) {
      throw new Error(`CircularDependencyException: Phát hiện chu trình vòng lặp phụ thuộc chéo tại: ${serviceType}`);
    }
    visited.add(serviceType);

    const reg = this.registrations[serviceType];
    if (!reg) {
      throw new Error(`ServiceNotRegisteredException: Chưa đăng ký dịch vụ cho Type: ${serviceType}`);
    }

    // Nếu là Singleton và đã được tạo trước đó -> Lấy ra dùng lại
    if (reg.lifetime === 'SINGLETON' && this.singletonVault[serviceType]) {
      this.resolutionSteps.push({
        type: 'RETRIEVE_SINGLETON',
        serviceType,
        implementationType: reg.implementationType
      });
      return this.singletonVault[serviceType];
    }

    // Phân giải đệ quy các phụ thuộc trong Constructor
    const resolvedDeps: any[] = [];
    for (const dep of reg.dependencies) {
      this.resolutionSteps.push({
        type: 'LOOKUP',
        serviceType: dep,
        implementationType: '',
        targetConstructorParam: dep
      });
      
      const resolvedDep = this.resolve(dep, new Set(visited));
      resolvedDeps.push(resolvedDep);

      // Bơm Neon Inject
      this.resolutionSteps.push({
        type: 'INJECT',
        serviceType: dep,
        implementationType: '',
        targetConstructorParam: dep
      });
    }

    // Khởi tạo instance ảo
    const instance = {
      _type: reg.implementationType,
      _lifetime: reg.lifetime,
      _injectedDependencies: resolvedDeps
    };

    if (reg.lifetime === 'SINGLETON') {
      this.singletonVault[serviceType] = instance;
    }

    this.resolutionSteps.push({
      type: 'INSTANTIATE',
      serviceType,
      implementationType: reg.implementationType
    });

    return instance;
  }

  public getResolutionSteps(): ResolutionStep[] {
    return this.resolutionSteps;
  }

  public clearSteps(): void {
    this.resolutionSteps = [];
  }

  public getSingletonVault() {
    return this.singletonVault;
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình phân giải đệ quy, tái sử dụng Singleton và phát hiện vòng lặp đứt đoạn:

```typescript
import { describe, it, expect } from 'vitest';
import { IoCContainerSimulator } from './IoCContainerSimulator';

describe('IoC Container Unit Tests', () => {
  it('Should successfully resolve dependencies and reuse Singleton instances', () => {
    const container = new IoCContainerSimulator();

    // Đăng ký UserRepository là Singleton
    container.register('IUserRepository', 'SupabaseUserRepository', 'SINGLETON', []);
    // Đăng ký UserService là Transient phụ thuộc IUserRepository
    container.register('IUserService', 'UserService', 'TRANSIENT', ['IUserRepository']);

    // Resolve lần 1
    const service1 = container.resolve('IUserService');
    expect(service1._type).toBe('UserService');
    expect(service1._injectedDependencies[0]._type).toBe('SupabaseUserRepository');

    // Resolve lần 2
    const service2 = container.resolve('IUserService');
    
    // Kiểm chứng SupabaseUserRepository dùng lại đúng địa chỉ tham chiếu Singleton cũ
    expect(service1._injectedDependencies[0]).toBe(service2._injectedDependencies[0]);
  });

  it('Should throw CircularDependencyException on circular design loops using DFS graph scan', () => {
    const container = new IoCContainerSimulator();

    // Thiết kế lỗi phụ thuộc chéo vòng tròn: A đòi B, B đòi A
    container.register('IServiceA', 'ServiceA', 'TRANSIENT', ['IServiceB']);
    container.register('IServiceB', 'ServiceB', 'TRANSIENT', ['IServiceA']);

    expect(() => {
      container.resolve('IServiceA');
    }).toThrow('CircularDependencyException'); // Quăng lỗi an toàn sư phạm thành công
  });
});
```
 Bộ máy giả lập IoC Container và giải thuật phát hiện chu trình DFS đệ quy đảm bảo tính chính xác 100% về mặt giải thuật và mang lại cho sinh viên chiếc kính lúp sư phạm trực quan DI xuất sắc.
