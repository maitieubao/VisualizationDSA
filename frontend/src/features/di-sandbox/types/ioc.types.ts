export type Lifetime = 'SINGLETON' | 'TRANSIENT';

export interface IoCRegistration {
  serviceType: string;
  implementationType: string;
  lifetime: Lifetime;
  dependencies: string[];
}

export interface ResolutionStep {
  type: 'LOOKUP' | 'INSTANTIATE' | 'RETRIEVE_SINGLETON' | 'INJECT';
  serviceType: string;
  implementationType: string;
  targetConstructorParam?: string;
}

export interface ResolvedInstance {
  _type: string;
  _lifetime: Lifetime;
  _injectedDependencies: ResolvedInstance[];
}

export interface ResolutionTreeNode {
  id: string;
  serviceType: string;
  implementationType: string;
  lifetime: Lifetime;
  children: ResolutionTreeNode[];
  x: number;
  y: number;
  isRetrievedSingleton: boolean;
}

export interface DIScenarioPayload {
  scenarioId: string;
  title: string;
  description: string;
  registrations: IoCRegistration[];
}
