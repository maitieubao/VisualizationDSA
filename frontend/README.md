# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

---

## Setup (dự án VisualizationDSA)

> Luôn dùng **`npm ci`** (không `npm install`) để bảo toàn lockfile chuẩn jsdom 29.1.1 + vitest 4.1.8. Dùng `npm install` hoặc `npx vitest` (npx cache thiếu jsdom) sẽ gây crash `Cannot find package 'jsdom'` hoặc 129 test fail không tái hiện được.

```bash
cd frontend
npm ci          # hoặc: nvm use 24 && npm ci
npm test        # = vitest run — chạy toàn bộ test suite (local binary)
npm run build   # vue-tsc -b + vite build
```

Node: dùng 24.x (xem `.nvmrc` ở root repo). CI cấm `npm install` — dùng `npm ci`.
