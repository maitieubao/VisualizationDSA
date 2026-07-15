<template>
  <div class="space-y-4">
    <div class="flex gap-2 mb-2">
      <button v-for="(script, name) in sampleScripts" :key="name" @click="store.loadScript(script)" class="px-3 py-1.5 bg-accent-blue/40 border border-accent-blue/40 text-accent-blue text-[10px] font-bold rounded-lg hover:bg-accent-blue/40 transition-all">{{ name }}</button>
    </div>
    <textarea v-model="dslScript" rows="6" class="w-full px-3 py-2 bg-bg-secondary border border-border-default rounded-lg text-xs font-mono text-text-secondary resize-none" placeholder="# DSL Commands:
# CALL functionName
# ALLOC nodeId size type
# PUSH frameId varName value
# LINK frameId.varName -> heapId
# FREE heapId
# RETURN value
# POP frameId" />
    <div class="flex gap-2">
      <button @click="store.compileDSL" class="px-4 py-2 bg-accent-green/40 border border-accent-green/40 text-accent-green text-xs font-bold rounded-lg hover:bg-accent-green/40 transition-all">Compile DSL</button>
      <button @click="store.stepDSL" :disabled="!store.dslResult?.success || store.currentStep >= (store.dslResult.frames?.length || 0)" class="px-4 py-2 bg-accent-blue/40 border border-accent-blue/40 text-accent-blue text-xs font-bold rounded-lg hover:bg-accent-blue/40 transition-all disabled:opacity-50">Step {{ store.currentStep + 1 }}/{{ store.dslResult?.frames?.length || 0 }}</button>
      <button @click="store.resetDSL" class="px-4 py-2 bg-bg-surface border border-border-default text-text-secondary text-xs font-bold rounded-lg hover:bg-bg-active transition-all">Reset</button>
    </div>
    <div v-if="store.dslResult" class="space-y-3">
      <div class="p-3 rounded-lg border" :class="store.dslResult.success ? 'bg-accent-green/30 border-accent-green/40' : 'bg-accent-red/30 border-accent-red/40'">
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ store.dslResult.success ? '✅' : '❌' }}</span>
          <span class="text-sm font-bold" :class="store.dslResult.success ? 'text-accent-green' : 'text-accent-red'">{{ store.dslResult.success ? 'Compiled Successfully' : 'Compilation Failed' }}</span>
          <span v-if="store.dslResult.success" class="text-[10px] text-text-secondary ml-auto">{{ store.dslResult.commandCount }} commands • {{ store.dslResult.executionTimeMs.toFixed(2) }}ms</span>
        </div>
        <div v-if="store.dslResult.error" class="text-xs text-accent-red mt-2">{{ store.dslResult.error }}</div>
      </div>
      <div v-if="store.currentFrame" class="p-3 bg-accent-blue/30 border border-accent-blue/40 rounded-lg">
        <div class="text-[10px] font-bold uppercase text-accent-blue mb-1">Current Step</div>
        <div class="text-xs text-text-secondary">{{ store.currentFrame.description }}</div>
        <div class="text-[9px] text-text-muted mt-1 font-mono">{{ store.currentFrame.command.raw }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { DSLEngine } from '../engine/DSLEngine';
import { useStateSandboxStore } from '../store/useStateSandboxStore';

const store = useStateSandboxStore();
const { dslScript } = storeToRefs(store);
const sampleScripts = DSLEngine.getSampleScripts();
</script>

