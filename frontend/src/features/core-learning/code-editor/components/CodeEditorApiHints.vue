<template>
  <div class="api-hints-panel rounded-xl border border-border-subtle/60 p-3.5 flex flex-col gap-2.5">
    <div class="text-[11px] font-bold uppercase tracking-widest text-text-muted">
      Các hàm tương tác trực quan:
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
      <div class="flex flex-col gap-0.5 hint-box p-2 rounded-lg border border-border-subtle/30">
        <span class="text-accent-yellow font-bold">compare(i, j)</span>
        <span class="text-text-secondary font-sans text-[11px]">So sánh & nhấp nháy 2 phần tử</span>
      </div>
      <div class="flex flex-col gap-0.5 hint-box p-2 rounded-lg border border-border-subtle/30">
        <span class="text-accent-red font-bold">swap(i, j)</span>
        <span class="text-text-secondary font-sans text-[11px]">Hoán vị trí hai phần tử</span>
      </div>
      <div class="flex flex-col gap-0.5 hint-box p-2 rounded-lg border border-border-subtle/30">
        <span class="text-accent-green font-bold">highlight(i)</span>
        <span class="text-text-secondary font-sans text-[11px]">Đánh dấu đã xếp xong</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-hints-panel {
  background-color: var(--color-bg-primary);
}
.hint-box {
  background-color: var(--color-bg-surface);
}
</style>

