<template>
  <div
    class="uml-class-card"
    :class="{
      'encapsulation-breach-wiggle': isWiggling,
      'card-active': isActive,
      'abstract-card-style': classDef.isAbstract
    }"
  >
    <!-- Class Header -->
    <div class="card-header" :style="{ borderColor: headerColor }">
      <div class="flex flex-col">
        <span v-if="classDef.isInterface" class="abstract-label" style="color: var(--accent-purple)">
          &lt;&lt;interface&gt;&gt;
        </span>
        <span v-else-if="classDef.isAbstract" class="abstract-label">
          &lt;&lt;abstract&gt;&gt;
        </span>
        <div class="header-row">
          <span class="class-name" :style="{ color: headerColor }" :class="{ 'italic': classDef.isAbstract || classDef.isInterface }">
            {{ classDef.className }}
          </span>
          <span v-if="classDef.parentClass && !classDef.isInterface" class="extends-label">
            : {{ classDef.parentClass }}
          </span>
          <span v-else-if="classDef.isInterface" class="extends-label">Interface</span>
          <span v-else-if="classDef.isAbstract" class="extends-label">Abstract Class</span>
          <span v-else class="extends-label">Concrete Class</span>
        </div>
      </div>
    </div>

    <!-- Fields Section -->
    <div class="card-body">
      <div class="section-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        </svg>
        Thuộc tính (Fields)
      </div>
      <div v-if="allFields.length === 0" class="empty-section">Không có thuộc tính</div>
      <div v-for="field in allFields" :key="field.name" class="member-row" :class="{ 'inherited-member': field.isInherited }">
        <div
          :id="`class-${classDef.className}-field-${field.name}`"
          class="member-item member-interactive"
          :class="[getFieldClass(field.name), { 'opacity-60': field.isInherited }]"
          @mouseenter="onMemberHover(field.name, true)"
          @mouseleave="onMemberHover(field.name, false)"
        >
          <span class="access-icon" :class="getAccessClass(field.accessModifier)">
            <SvgIcon :name="getAccessIcon(field.accessModifier)" :size="12" />
          </span>
          <span class="member-name" :class="{ 'opacity-60': field.isInherited }">
            {{ field.name }}: {{ field.returnType || 'any' }}
          </span>
          <span v-if="field.isInherited" class="member-badge inherited-badge">kế thừa</span>
          <span v-else class="member-badge" :class="getAccessBadgeClass(field.accessModifier)">
            {{ field.accessModifier.toLowerCase() }}
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div class="section-divider"></div>

      <!-- Methods Section -->
      <div class="section-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
        Phương thức (Methods)
      </div>
      <div v-if="allMethods.length === 0" class="empty-section">Không có phương thức</div>
      <div v-for="method in allMethods" :key="method.name" class="member-row" :class="{ 'inherited-member': method.isInherited }">
        <div
          :id="`class-${classDef.className}-method-${method.name}`"
          class="member-item member-interactive method-clickable"
          :class="[getMethodClass(method.name), { 'opacity-60': method.isInherited }]"
          @mouseenter="onMemberHover(method.name, true)"
          @mouseleave="onMemberHover(method.name, false)"
          @click="onMethodClick(method.name)"
          title="Nhấp vào để chuyển nhanh đến bước thực thi phương thức này"
        >
          <span class="access-icon" :class="getAccessClass(method.accessModifier)">
            <SvgIcon :name="getAccessIcon(method.accessModifier)" :size="12" />
          </span>
          <span class="member-name" :class="{ 'italic text-text-muted': method.isAbstract }">
            {{ method.name }}(): {{ method.returnType || 'void' }}
          </span>
          <span v-if="method.isInherited" class="member-badge inherited-badge">kế thừa</span>
          <span v-else-if="method.isAbstract" class="member-badge abstract-badge">abstract</span>
          <span v-else-if="method.isOverridden" class="member-badge override-badge">@Override</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ClassDefinition, ClassMember, AccessModifier } from '../types/oop-visualization.types';
import { useOOPVisualizerStore } from '../store/useOOPVisualizerStore';
import SvgIcon from '../../../components/icons/SvgIcon.vue';

interface RichMember extends ClassMember {
  isInherited?: boolean;
  inheritedFrom?: string;
}

const props = withDefaults(
  defineProps<{
    classDef: ClassDefinition;
    headerColor: string;
    isActive?: boolean;
    isWiggling?: boolean;
    violatedField?: string | null;
    selectedMethod?: string | null;
    animationPhase?: number;
    hoveredMember?: { className: string; memberName: string } | null;
  }>(),
  {
    animationPhase: 3,
    hoveredMember: null
  }
);

const emit = defineEmits<{
  (e: 'hoverMember', payload: { className: string; memberName: string; isHovered: boolean }): void;
  (e: 'clickMethod', payload: { className: string; methodName: string }): void;
}>();

const store = useOOPVisualizerStore();

function onMemberHover(memberName: string, isHovered: boolean) {
  emit('hoverMember', { className: props.classDef.className, memberName, isHovered });
}

function onMethodClick(methodName: string) {
  emit('clickMethod', { className: props.classDef.className, methodName });
}

// Dynamically scan for inherited members from base class
const allFields = computed<RichMember[]>(() => {
  const list: RichMember[] = [...props.classDef.members.filter((m) => m.type === 'FIELD')];
  
  let parentName = props.classDef.parentClass;
  while (parentName) {
    const parentDef = store.registeredClasses.find((c) => c.className === parentName);
    if (parentDef) {
      const parentFields = parentDef.members
        .filter((m) => m.type === 'FIELD' && !list.some((l) => l.name === m.name))
        .map((m) => ({ ...m, isInherited: true, inheritedFrom: parentName }));
      list.unshift(...parentFields);
    }
    parentName = parentDef?.parentClass;
  }
  return list;
});

const allMethods = computed<RichMember[]>(() => {
  const list: RichMember[] = [...props.classDef.members.filter((m) => m.type === 'METHOD')];
  
  let parentName = props.classDef.parentClass;
  while (parentName) {
    const parentDef = store.registeredClasses.find((c) => c.className === parentName);
    if (parentDef) {
      const parentMethods = parentDef.members
        .filter((m) => m.type === 'METHOD' && !list.some((l) => l.name === m.name))
        .map((m) => ({ ...m, isInherited: true, inheritedFrom: parentName }));
      list.unshift(...parentMethods);
    }
    parentName = parentDef?.parentClass;
  }
  return list;
});

function getAccessIcon(mod: AccessModifier): string {
  switch (mod) {
    case 'PRIVATE': return 'lock';
    case 'PROTECTED': return 'shield';
    case 'PUBLIC': return 'globe';
  }
}

// Access modifier UI styles
function getAccessClass(mod: AccessModifier): string {
  switch (mod) {
    case 'PRIVATE': return 'access-private';
    case 'PROTECTED': return 'access-protected';
    case 'PUBLIC': return 'access-public';
  }
}

function getAccessBadgeClass(mod: AccessModifier): string {
  switch (mod) {
    case 'PRIVATE': return 'private-badge';
    case 'PROTECTED': return 'protected-badge';
    case 'PUBLIC': return 'public-badge';
  }
}

function isFieldViolated(fieldName: string): boolean {
  return props.violatedField === fieldName;
}

function isMethodSelected(methodName: string): boolean {
  return props.selectedMethod === `${props.classDef.className}.${methodName}`;
}

function getFieldClass(fieldName: string) {
  if (props.animationPhase !== undefined && props.animationPhase < 1) {
    return {};
  }
  const target = store.currentAnimationTarget;
  const anim = store.currentAnimation;
  const isTarget = target.className === props.classDef.className && target.memberName === fieldName;
  const isHovered = props.hoveredMember?.className === props.classDef.className && props.hoveredMember?.memberName === fieldName;

  return {
    'member-violated': isFieldViolated(fieldName) || (isTarget && (anim === 'access-denied' || anim === 'compile-error')),
    'member-granted': isTarget && anim === 'access-granted',
    'member-highlighted': isTarget && anim === 'highlight-member',
    'member-hover-highlighted': isHovered
  };
}

function getMethodClass(methodName: string) {
  if (props.animationPhase !== undefined && props.animationPhase < 1) {
    return {
      'member-selected': isMethodSelected(methodName),
    };
  }
  const target = store.currentAnimationTarget;
  const anim = store.currentAnimation;
  const isTarget = target.className === props.classDef.className && target.memberName === methodName;
  const isHovered = props.hoveredMember?.className === props.classDef.className && props.hoveredMember?.memberName === methodName;

  return {
    'member-selected': isMethodSelected(methodName),
    'member-highlighted': isTarget && (anim === 'highlight-member' || anim === 'polymorphic-dispatch' || anim === 'arrow-flow'),
    'member-granted': isTarget && anim === 'access-granted',
    'member-denied': isTarget && (anim === 'access-denied' || anim === 'compile-error'),
    'member-override': isTarget && anim === 'override-flash',
    'member-hover-highlighted': isHovered
  };
}
</script>

<style scoped>
.uml-class-card {
  width: 100%;
  background: color-mix(in srgb, var(--vis-panel-bg) 55%, transparent);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: 14px;
  backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-lg);
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  overflow: hidden;
}

.uml-class-card:hover {
  border-color: var(--color-border-default);
}

.card-active {
  border-color: color-mix(in srgb, var(--color-accent-primary) 50%, transparent);
  box-shadow: 0 0 20px var(--color-accent-primary-glow);
}

.abstract-card-style {
  background: color-mix(in srgb, var(--vis-panel-bg) 35%, transparent);
  border-style: dashed;
}

.encapsulation-breach-wiggle {
  animation: wiggle-vibrate 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  animation-iteration-count: 5;
  border-color: var(--color-accent-red) !important;
  box-shadow: 0 0 25px var(--color-accent-red-glow) !important;
}

@keyframes wiggle-vibrate {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Header */
.card-header {
  border-bottom: 1.5px solid;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--vis-panel-header-bg) 60%, transparent);
}

.abstract-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  font-weight: 700;
  font-style: italic;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.class-name {
  font-size: 14px;
  font-weight: 700;
}

.extends-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Body */
.card-body {
  padding: 10px 14px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.empty-section {
  font-size: 10px;
  color: var(--color-text-disabled);
  font-style: italic;
  padding: 4px 0;
}

.section-divider {
  height: 1px;
  background: var(--color-border-subtle);
  margin: 8px 0;
}

/* Members */
.member-row {
  margin-bottom: 2px;
}

.inherited-member {
  border-left: 2px dotted var(--color-border-subtle);
  padding-left: 4px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border-radius: 6px;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.member-interactive {
  cursor: pointer;
}

.member-interactive:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-subtle);
}

.method-clickable:hover {
  box-shadow: 0 0 8px var(--color-accent-primary-glow);
}

.member-name {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  flex: 1;
}

/* Access Modifier Icons */
.access-icon {
  font-size: 12px;
  flex-shrink: 0;
}

/* Member Badges */
.member-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.private-badge {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.protected-badge {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.public-badge {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.inherited-badge {
  background: var(--color-bg-hover);
  color: var(--color-text-disabled);
  border: 1px solid var(--color-border-subtle);
}

.abstract-badge {
  background: var(--color-accent-yellow-dim);
  color: var(--color-accent-yellow);
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 25%, transparent);
}

.override-badge {
  background: var(--color-accent-primary-dim);
  color: var(--color-accent-primary-text);
  border: 1px solid color-mix(in srgb, var(--color-accent-primary) 25%, transparent);
}

/* Animated states */
.member-selected {
  background: rgba(234, 179, 8, 0.15) !important; /* Yellow */
  border-color: rgba(234, 179, 8, 0.4) !important;
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.25);
}

.member-highlighted {
  background: rgba(234, 179, 8, 0.15) !important; /* Yellow */
  border-color: rgba(234, 179, 8, 0.4) !important;
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.25);
}

.member-violated, .member-denied {
  background: rgba(239, 68, 68, 0.15) !important; /* Red */
  border-color: rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.25);
}

.member-granted {
  background: rgba(16, 185, 129, 0.15) !important; /* Green */
  border-color: rgba(16, 185, 129, 0.4) !important;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

.member-override {
  background: rgba(139, 92, 246, 0.15) !important; /* Purple */
  border-color: rgba(139, 92, 246, 0.4) !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
}

.member-hover-highlighted {
  background: rgba(6, 182, 212, 0.15) !important; /* Flat light cyan */
  border-color: var(--color-accent-cyan) !important;
}

@keyframes memberPulseRed {
  0%, 100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }
}

@keyframes highlightGlowYellow {
  0%, 100% { box-shadow: 0 0 0 rgba(234, 179, 8, 0); }
  50% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.4); }
}
</style>
