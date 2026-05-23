import type {
  Lifetime,
  IoCRegistration,
  ResolutionStep,
  ResolvedInstance,
  ResolutionTreeNode,
} from '../types/ioc.types';

export class IoCContainerSimulator {
  private registrations: Record<string, IoCRegistration> = {};
  private singletonVault: Record<string, ResolvedInstance> = {};
  private resolutionSteps: ResolutionStep[] = [];
  private treeRoot: ResolutionTreeNode | null = null;
  private nodeCounter = 0;

  public register(
    serviceType: string,
    implementationType: string,
    lifetime: Lifetime,
    dependencies: string[],
  ): void {
    this.registrations[serviceType] = {
      serviceType,
      implementationType,
      lifetime,
      dependencies,
    };
  }

  public resolve(
    serviceType: string,
    visited: Set<string> = new Set(),
  ): ResolvedInstance {
    if (visited.has(serviceType)) {
      throw new Error(
        `CircularDependencyException: ${serviceType}`,
      );
    }
    visited.add(serviceType);

    const reg = this.registrations[serviceType];
    if (!reg) {
      throw new Error(
        `ServiceNotRegisteredException: ${serviceType}`,
      );
    }

    if (reg.lifetime === 'SINGLETON' && this.singletonVault[serviceType]) {
      this.resolutionSteps.push({
        type: 'RETRIEVE_SINGLETON',
        serviceType,
        implementationType: reg.implementationType,
      });
      return this.singletonVault[serviceType];
    }

    const resolvedDeps: ResolvedInstance[] = [];
    for (const dep of reg.dependencies) {
      this.resolutionSteps.push({
        type: 'LOOKUP',
        serviceType: dep,
        implementationType: '',
        targetConstructorParam: dep,
      });

      const resolvedDep = this.resolve(dep, new Set(visited));
      resolvedDeps.push(resolvedDep);

      this.resolutionSteps.push({
        type: 'INJECT',
        serviceType: dep,
        implementationType: '',
        targetConstructorParam: dep,
      });
    }

    const instance: ResolvedInstance = {
      _type: reg.implementationType,
      _lifetime: reg.lifetime,
      _injectedDependencies: resolvedDeps,
    };

    if (reg.lifetime === 'SINGLETON') {
      this.singletonVault[serviceType] = instance;
    }

    this.resolutionSteps.push({
      type: 'INSTANTIATE',
      serviceType,
      implementationType: reg.implementationType,
    });

    return instance;
  }

  public buildResolutionTree(serviceType: string): ResolutionTreeNode | null {
    this.nodeCounter = 0;
    try {
      this.treeRoot = this.buildTreeNode(serviceType, new Set(), 0, 0);
      this.layoutTree(this.treeRoot, 400, 40, 320);
      return this.treeRoot;
    } catch {
      return null;
    }
  }

  private buildTreeNode(
    serviceType: string,
    visited: Set<string>,
    depth: number,
    index: number,
  ): ResolutionTreeNode {
    if (visited.has(serviceType)) {
      throw new Error(`Circular: ${serviceType}`);
    }
    visited.add(serviceType);

    const reg = this.registrations[serviceType];
    if (!reg) {
      throw new Error(`Not registered: ${serviceType}`);
    }

    const isRetrievedSingleton =
      reg.lifetime === 'SINGLETON' && !!this.singletonVault[serviceType];

    const children: ResolutionTreeNode[] = [];
    if (!isRetrievedSingleton) {
      for (let i = 0; i < reg.dependencies.length; i++) {
        const child = this.buildTreeNode(
          reg.dependencies[i],
          new Set(visited),
          depth + 1,
          i,
        );
        children.push(child);
      }
    }

    this.nodeCounter++;
    return {
      id: `node-${this.nodeCounter}`,
      serviceType,
      implementationType: reg.implementationType,
      lifetime: reg.lifetime,
      children,
      x: 0,
      y: 0,
      isRetrievedSingleton,
    };
  }

  private layoutTree(
    node: ResolutionTreeNode,
    x: number,
    y: number,
    spread: number,
  ): void {
    node.x = x;
    node.y = y;

    const childCount = node.children.length;
    if (childCount === 0) return;

    const totalWidth = spread;
    const step = childCount > 1 ? totalWidth / (childCount - 1) : 0;
    const startX = childCount > 1 ? x - totalWidth / 2 : x;

    for (let i = 0; i < childCount; i++) {
      const childX = startX + step * i;
      this.layoutTree(node.children[i], childX, y + 120, spread * 0.55);
    }
  }

  public getResolutionSteps(): ResolutionStep[] {
    return [...this.resolutionSteps];
  }

  public clearSteps(): void {
    this.resolutionSteps = [];
  }

  public getSingletonVault(): Record<string, ResolvedInstance> {
    return { ...this.singletonVault };
  }

  public getRegistrations(): Record<string, IoCRegistration> {
    return { ...this.registrations };
  }

  public getResolutionTree(): ResolutionTreeNode | null {
    return this.treeRoot;
  }

  public reset(): void {
    this.registrations = {};
    this.singletonVault = {};
    this.resolutionSteps = [];
    this.treeRoot = null;
    this.nodeCounter = 0;
  }

  public static detectCircularDependency(
    serviceType: string,
    registrations: Record<string, IoCRegistration>,
    visited: Set<string> = new Set(),
    stack: Set<string> = new Set(),
  ): { hasCycle: boolean; cyclePath: string[] } {
    visited.add(serviceType);
    stack.add(serviceType);

    const reg = registrations[serviceType];
    if (reg) {
      for (const dep of reg.dependencies) {
        if (!visited.has(dep)) {
          const result = this.detectCircularDependency(
            dep,
            registrations,
            visited,
            stack,
          );
          if (result.hasCycle) return result;
        } else if (stack.has(dep)) {
          const stackArr = Array.from(stack);
          const cycleStart = stackArr.indexOf(dep);
          const cyclePath = [...stackArr.slice(cycleStart), dep];
          return { hasCycle: true, cyclePath };
        }
      }
    }

    stack.delete(serviceType);
    return { hasCycle: false, cyclePath: [] };
  }

  public static checkCaptiveDependency(
    registrations: Record<string, IoCRegistration>,
  ): { hasCaptive: boolean; singletonType: string; transientType: string } {
    for (const [serviceType, reg] of Object.entries(registrations)) {
      if (reg.lifetime === 'SINGLETON') {
        for (const dep of reg.dependencies) {
          const depReg = registrations[dep];
          if (depReg && depReg.lifetime === 'TRANSIENT') {
            return {
              hasCaptive: true,
              singletonType: serviceType,
              transientType: dep,
            };
          }
        }
      }
    }
    return { hasCaptive: false, singletonType: '', transientType: '' };
  }
}
