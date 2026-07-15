<template>
  <div class="col-span-12 md:col-span-5 bg-gradient-to-br from-secondary/80 to-primary/80 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)]">
    <div>
      <div class="flex items-center gap-2 mb-6">
        <BaseIcon name="diamond" class="w-8 h-8 text-accent animate-pulse" />
        <span class="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">VDSA PREMIUM</span>
      </div>
      
      <h2 class="text-2xl font-bold mb-4 leading-tight">Mở Khóa Toàn Bộ Sức Mạnh DSA</h2>
      
      <ul class="space-y-3 text-sm text-[var(--text-secondary)] mb-8">
        <li class="flex items-start gap-2">
          <BaseIcon name="check" class="w-4 h-4 text-accent-green mt-0.5" />
          <span>Không giới hạn số lần biên dịch & chạy giải thuật tùy chọn.</span>
        </li>
        <li class="flex items-start gap-2">
          <BaseIcon name="check" class="w-4 h-4 text-accent-green mt-0.5" />
          <span>Truy cập toàn bộ bài giảng cao cấp (SOLID, Design Patterns, Phân tách hệ thống).</span>
        </li>
        <li class="flex items-start gap-2">
          <BaseIcon name="check" class="w-4 h-4 text-accent-green mt-0.5" />
          <span>Mở khóa các sân chơi (Sandbox) đặc biệt dành riêng cho tài khoản VIP.</span>
        </li>
        <li class="flex items-start gap-2">
          <BaseIcon name="check" class="w-4 h-4 text-accent-green mt-0.5" />
          <span>Bảng vàng xếp hạng ưu tiên & Huy hiệu Premium phát sáng.</span>
        </li>
      </ul>
    </div>

    <div class="mt-auto border-t border-[var(--border-color)] pt-6">
      <div class="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Gói trọn đời (Lifetime)</div>
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-[var(--color-gold)] font-mono">199.000đ</span>
        <span class="text-xs text-[var(--text-muted)] line-through">499.000đ</span>
      </div>
      <p class="text-[10px] text-accent-green/80 mt-2 font-medium">★ Thanh toán một lần duy nhất, sở hữu mãi mãi.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component thuần hiển thị UI (Presentation component)
</script>
