/**
 * Type definitions for the Structural Relationship Visualizer (Design Patterns & SOLID).
 * Defines UML node cards, link types, and scenario payloads.
 */

export interface Point {
  x: number;
  y: number;
}

export interface UMLNode {
  id: string;
  name: string;
  type: 'class' | 'interface' | 'abstract';
  x: number;
  y: number;
  width: number;
  height: number;
  attributes?: string[];
  methods?: string[];
}

export type UMLLinkType = 'inheritance' | 'realization' | 'dependency' | 'association';

export interface UMLLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: UMLLinkType;
}

export interface UMLScenarioPayload {
  patternId: string;
  title: string;
  description: string;
  nodes: UMLNode[];
  links: UMLLink[];
}

export type PatternScenarioId =
  | 'strategy-pattern'
  | 'observer-pattern'
  | 'solid-dip';
