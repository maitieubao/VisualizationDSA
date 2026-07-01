import type { ClassDefinition, HeapObjectInstance, MethodDispatchResult, AccessCheckResult } from '../types/oop-sandbox.types';
import { checkAccess as verifyAccess, isSubclass as verifySubclass } from './OOPAccessChecker';

export class OOPReflectionEngine {
  public static classesRegistry: Map<string, ClassDefinition> = new Map();
  private static addressOffset = 0;

  public static registerClass(config: ClassDefinition): void {
    this.classesRegistry.set(config.className, config);
  }

  public static getClass(className: string): ClassDefinition | undefined {
    return this.classesRegistry.get(className);
  }

  public static instantiateObject(className: string): HeapObjectInstance {
    const classDef = this.classesRegistry.get(className);
    if (!classDef) throw new Error(`Lớp ${className} chưa được đăng ký.`);

    const memAddress = `0x${(3211264 + this.addressOffset).toString(16).toUpperCase().padStart(6, '0')}`;
    this.addressOffset += 16;

    const fields = new Map<string, unknown>();
    const vTable = new Map<string, string>();
    const chain = this.getInheritanceChain(className).map(c => this.getClass(c)!);

    for (const def of chain) {
      for (const member of def.members) {
        if (member.type === 'FIELD') {
          if (!fields.has(member.name)) fields.set(member.name, member.value ?? null);
        } else if (member.type === 'METHOD') {
          vTable.set(member.name, def.className);
        }
      }
    }
    return { address: memAddress, className, fieldsData: fields, vTable };
  }

  public static dispatchMethod(instance: HeapObjectInstance, methodName: string): MethodDispatchResult | null {
    const resolvedClass = instance.vTable.get(methodName);
    if (!resolvedClass) return null;

    const dispatchPath: string[] = [];
    let current: ClassDefinition | undefined = this.getClass(instance.className);
    while (current) {
      dispatchPath.unshift(current.className);
      if (current.className === resolvedClass) break;
      current = current.parentClass ? this.getClass(current.parentClass) : undefined;
    }

    return {
      methodName,
      resolvedClass,
      actualImplementation: `${resolvedClass}.${methodName}()`,
      dispatchPath,
    };
  }

  public static checkAccess(targetClass: string, memberName: string, accessingClass?: string): AccessCheckResult {
    return verifyAccess(targetClass, memberName, accessingClass, (name) => this.getClass(name));
  }

  public static isSubclass(classA: string, classB: string): boolean {
    return verifySubclass(classA, classB, (name) => this.getClass(name));
  }

  public static getInheritanceChain(className: string): string[] {
    const chain: string[] = [];
    let current: ClassDefinition | undefined = this.getClass(className);
    while (current) {
      chain.unshift(current.className);
      current = current.parentClass ? this.getClass(current.parentClass) : undefined;
    }
    return chain;
  }

  public static reset(): void {
    this.classesRegistry.clear();
    this.addressOffset = 0;
  }
}

export default OOPReflectionEngine;
