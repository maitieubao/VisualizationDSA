<template>
  <div class="api-hints-panel rounded-xl border border-border-default p-2.5 flex flex-col gap-2 bg-bg-primary/60 font-sans">
    <div class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
      Các hàm tương tác trực quan:
    </div>
    <div class="grid grid-cols-1 gap-1.5 text-xs">
      <div class="flex items-center justify-between hint-box p-1.5 px-2 rounded-lg border border-border-default bg-bg-secondary/80">
        <span class="text-accent-warm font-mono font-bold text-[11px]">compare(i, j)</span>
        <span class="text-text-secondary text-[10px]">So sánh 2 phần tử</span>
      </div>
      <div class="flex items-center justify-between hint-box p-1.5 px-2 rounded-lg border border-border-default bg-bg-secondary/80">
        <span class="text-accent-red font-mono font-bold text-[11px]">swap(i, j)</span>
        <span class="text-text-secondary text-[10px]">Hoán vị 2 phần tử</span>
      </div>
      <div class="flex items-center justify-between hint-box p-1.5 px-2 rounded-lg border border-border-default bg-bg-secondary/80">
        <span class="text-accent-green font-mono font-bold text-[11px]">highlight(i)</span>
        <span class="text-text-secondary text-[10px]">Đánh dấu đã xong</span>
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
