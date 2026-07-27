<template>
  <div class="api-hints-panel rounded-xl border border-white/10 p-2.5 flex flex-col gap-2 bg-slate-950/60 font-sans">
    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      Các hàm tương tác trực quan:
    </div>
    <div class="grid grid-cols-1 gap-1.5 text-xs">
      <div class="flex items-center justify-between hint-box p-1.5 px-2 rounded-lg border border-white/5 bg-slate-900/80">
        <span class="text-amber-400 font-mono font-bold text-[11px]">compare(i, j)</span>
        <span class="text-slate-400 text-[10px]">So sánh 2 phần tử</span>
      </div>
      <div class="flex items-center justify-between hint-box p-1.5 px-2 rounded-lg border border-white/5 bg-slate-900/80">
        <span class="text-rose-400 font-mono font-bold text-[11px]">swap(i, j)</span>
        <span class="text-slate-400 text-[10px]">Hoán vị 2 phần tử</span>
      </div>
      <div class="flex items-center justify-between hint-box p-1.5 px-2 rounded-lg border border-white/5 bg-slate-900/80">
        <span class="text-emerald-400 font-mono font-bold text-[11px]">highlight(i)</span>
        <span class="text-slate-400 text-[10px]">Đánh dấu đã xong</span>
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
