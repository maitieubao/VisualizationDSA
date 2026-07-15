<template>
  <div class="flex flex-col gap-4">
    <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-accent-purple"></span>
      Sơ đồ lớp kế thừa (Class Hierarchy)
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UMLClassCard 
        className="Shape"
        subtitle="Base Class"
        variant="shape"
        :fields="shapeFields"
        :methods="shapeMethods"
      />
      <UMLClassCard 
        className="Circle"
        subtitle="extends Shape"
        variant="circle"
        :isInteractive="true"
        :fields="circleFields"
        :methods="circleMethods"
      />
      <UMLClassCard 
        className="Rectangle"
        subtitle="extends Shape"
        variant="rectangle"
        :fields="rectangleFields"
        :methods="rectangleMethods"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import UMLClassCard from './UMLClassCard.vue';

const shapeFields = [
  { name: 'x', typeSig: 'number', accessModifier: 'PUBLIC' as const },
  { name: 'y', typeSig: 'number', accessModifier: 'PUBLIC' as const },
  { name: 'color', typeSig: 'string', accessModifier: 'PROTECTED' as const },
];
const shapeMethods = [
  { name: 'area', returnType: 'number', badge: '' },
  { name: 'draw', returnType: 'void', badge: 'virtual' },
];

const circleFields = [
  { name: 'radius', typeSig: 'number', accessModifier: 'PRIVATE' as const },
  { name: 'pi', typeSig: 'number = 3.14', accessModifier: 'PRIVATE' as const },
];
const circleMethods = [
  { name: 'area', returnType: 'number', badge: '@Override' },
  { name: 'draw', returnType: 'void', badge: '@Override' },
];

const rectangleFields = [
  { name: 'width', typeSig: 'number', accessModifier: 'PRIVATE' as const },
  { name: 'height', typeSig: 'number', accessModifier: 'PRIVATE' as const },
];
const rectangleMethods = [
  { name: 'area', returnType: 'number', badge: '@Override' },
  { name: 'draw', returnType: 'void', badge: '@Override' },
];
</script>
