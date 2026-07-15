export type AccessModifier = 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

export interface ClassMember {
  name: string;
  type: 'FIELD' | 'METHOD';
  accessModifier: AccessModifier;
  isOverridden?: boolean;
  value?: unknown;
}

export interface ClassDefinition {
  className: string;
  parentClass?: string;
  members: ClassMember[];
}

export interface HeapObjectInstance {
  address: string; // Fake hex memory address
  className: string;
  fieldsData: Map<string, unknown>;
  vTable: Map<string, string>; // Method name -> class name
}

export interface MethodDispatchResult {
  methodName: string;
  resolvedClass: string;
  actualImplementation: string;
  dispatchPath: string[]; // Path showing class hierarchy traversal
}

export interface AccessCheckResult {
  allowed: boolean;
  violation: boolean;
  message: string;
  modifier: AccessModifier;
  memberName?: string;
}

export interface LockConfig {
  x: number;
  y: number;
  size: number;
  modifier: AccessModifier;
  isViolated: boolean;
}

export interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
}
