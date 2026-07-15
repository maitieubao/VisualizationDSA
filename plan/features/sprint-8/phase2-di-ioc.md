# ⚙️ Technical Specification - Dependency Injection & IoC Container (Sprint 8)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của thùng chứa dịch vụ **DIContainer** hỗ trợ vòng đời Transient/Singleton và giải thuật đồ thị DFS phát hiện phụ thuộc vòng tròn **detectCyclicDependency** trong Sprint 8.

---

## 1. Thùng Chứa Đăng Ký & Phân Giải Dịch Vụ (DIContainer TypeScript)

Lớp hạt nhân chịu trách nhiệm đăng ký, phân giải vòng đời dịch vụ Transient/Singleton và phát hiện phụ thuộc vòng Client-side dưới 2ms:

```typescript
export type ServiceLifetime = 'SINGLETON' | 'TRANSIENT';

export interface ServiceDescriptor {
  token: string;
  implementationClass: any; // Class constructor
  lifetime: ServiceLifetime;
  dependencies: string[]; // Các token phụ thuộc bắt buộc
}

export class DIContainer {
  private descriptors: Map<string, ServiceDescriptor> = new Map();
  private singletonInstances: Map<string, any> = new Map();

  public register(descriptor: ServiceDescriptor): void {
    this.descriptors.set(descriptor.token, descriptor);
  }

  /**
   * Phân giải dịch vụ và tự động tiêm các phụ thuộc (Dependency Resolver)
   */
  public resolve<T>(token: string): T {
    // 1. Kiểm tra phát hiện phụ thuộc vòng tròn trước khi tạo thực thể
    this.detectCyclicDependency(token, new Set(), new Set());

    const descriptor = this.descriptors.get(token);
    if (!descriptor) {
      throw new Error(`Không tìm thấy token dịch vụ '${token}' đăng ký trong IoC Container!`);
    }

    // 2. Nếu là SINGLETON và đã tồn tại thực thể -> Trả về ngay lập tức (Dùng chung RAM)
    if (descriptor.lifetime === 'SINGLETON' && this.singletonInstances.has(token)) {
      return this.singletonInstances.get(token);
    }

    // 3. Phân giải đệ quy tất cả các dependency dependencies
    const resolvedDeps = descriptor.dependencies.map(depToken => this.resolve<any>(depToken));

    // 4. Khởi tạo thực thể mới bằng con constructor tiêm các tham số
    const instance = new descriptor.implementationClass(...resolvedDeps);

    // 5. Lưu trữ nếu là SINGLETON
    if (descriptor.lifetime === 'SINGLETON') {
      this.singletonInstances.set(token, instance);
    }

    return instance;
  }

  /**
   * Phát hiện phụ thuộc vòng tròn (Cyclic Dependency Detection Graph DFS)
   */
  private detectCyclicDependency(
    token: string,
    visiting: Set<string>,
    visited: Set<string>
  ): void {
    if (visiting.has(token)) {
      throw new Error(`Lỗi Phụ Thuộc Vòng Tròn (Cyclic Dependency Detected): Phát hiện chu trình khép kín tại Token '${token}'! Thùng chứa sập nguồn!`);
    }

    if (visited.has(token)) return;

    const descriptor = this.descriptors.get(token);
    if (!descriptor) return;

    visiting.add(token);

    // Duyệt qua các nút con phụ thuộc kề bằng đồ thị DFS
    for (const dep of descriptor.dependencies) {
      this.detectCyclicDependency(dep, visiting, visited);
    }

    visiting.delete(token);
    visited.add(token);
  }
}
```

---

## 2. Ca Kiểm Thử Tự Động Thùng Chứa IoC (Unit Test Specs)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DIContainer, ServiceLifetime } from './DIContainer';

// Dựng các lớp giả lập phục vụ kiểm thử
class DatabaseService {
  public connect() { return 'connected'; }
}

class UserRepository {
  constructor(public db: DatabaseService) {}
}

class UserService {
  constructor(public repo: UserRepository) {}
}

class CircularA {
  constructor(public b: any) {}
}

class CircularB {
  constructor(public a: any) {}
}

describe('Sprint 8 DI & IoC Container Unit Tests', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  it('Should successfully resolve transient and singleton service lifetimes with correct dependency injection', () => {
    // Đăng ký DatabaseService làm SINGLETON dùng chung RAM
    container.register({
      token: 'DatabaseService',
      implementationClass: DatabaseService,
      lifetime: 'SINGLETON',
      dependencies: []
    });

    // Đăng ký UserRepository làm TRANSIENT
    container.register({
      token: 'UserRepository',
      implementationClass: UserRepository,
      lifetime: 'TRANSIENT',
      dependencies: ['DatabaseService']
    });

    const repo1 = container.resolve<UserRepository>('UserRepository');
    const repo2 = container.resolve<UserRepository>('UserRepository');

    // UserRepository là Transient -> 2 lần gọi resolve ra 2 instance khác nhau
    expect(repo1).not.toBe(repo2);

    // DatabaseService là Singleton -> Cả 2 instance Repo đều dùng chung duy nhất 1 Db instance
    expect(repo1.db).toBe(repo2.db);
    expect(repo1.db.connect()).toBe('connected');
  });

  it('Should catch circular dependency loops instantly and throw an explicit crash error', () => {
    // Đăng ký A phụ thuộc B
    container.register({
      token: 'CircularA',
      implementationClass: CircularA,
      lifetime: 'TRANSIENT',
      dependencies: ['CircularB']
    });

    // Đăng ký B lại phụ thuộc ngược A -> Chu trình khép kín gây sập nguồn
    container.register({
      token: 'CircularB',
      implementationClass: CircularB,
      lifetime: 'TRANSIENT',
      dependencies: ['CircularA']
    });

    expect(() => {
      container.resolve('CircularA');
    }).toThrowError('Lỗi Phụ Thuộc Vòng Tròn');
  });
});
```
 Thiết kế thùng chứa IoC Container hỗ trợ vòng đời Transient/Singleton nhạy bén kết hợp giải thuật đồ thị DFS phát hiện phụ thuộc vòng tròn cyclic loop 100% Client-side đảm bảo sinh viên thấu hiểu hoàn hảo bản chất của Inversion of Control cao cấp nhất.
