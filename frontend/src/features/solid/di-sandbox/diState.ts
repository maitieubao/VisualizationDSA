import type { ServiceRegistration, ServiceInstance } from './diTypes';

export const registrations = new Map<string, ServiceRegistration>();
export const singletonInstances = new Map<string, ServiceInstance>();
export const state = {
  transientCounter: 0,
};
