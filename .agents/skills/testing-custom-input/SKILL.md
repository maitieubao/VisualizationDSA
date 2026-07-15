---
name: testing-visualization-dsa
description: Test the VisualizationDSA app end-to-end — OOP, System Design, Algorithm Dashboard, SOLID, Design Patterns, and DI/IoC modules. Use when verifying animation, heap memory, packet routing, scenario playback, sorting/searching algorithms, or architecture concept changes.
---

# Testing VisualizationDSA Modules

## Prerequisites

- Node.js installed
- .NET 9.0 SDK installed
- `npm install` completed in `frontend/`

## Devin Secrets Needed

None — no authentication required for any module.

## Dev Server Setup

### Frontend
```bash
cd frontend && VITE_API_BASE_URL=http://localhost:5055 npx vite --host 0.0.0.0 --port 5173
```
Note: If port 5173 is in use, Vite will auto-increment. Check terminal output.
CRITICAL: `VITE_API_BASE_URL` must be set BEFORE starting vite (it's baked at build time). If frontend is already running without the env var, kill it and restart.

### Backend (.NET 9.0)
```bash
cd backend/src/WebApi && dotnet run --urls "http://0.0.0.0:5050"
```
Note: PostgreSQL connection errors are expected and non-fatal — algorithm/concept endpoints are stateless frame generators that work without a database.

If port 5050 is busy: `fuser -k 5050/tcp` then restart.

## Navigation Paths

| Module | Route | Sidebar Label |
|--------|-------|---------------|
| Sorting Sandbox | `/sorting` (default tab) | "Sorting" under ALGORITHMS |
| Algorithm Dashboard | `/sorting` (2nd tab) | Click "Searching & Linear DSA" tab |
| Graph | `/graph` | "Graph" under ALGORITHMS |
| OOP Visualization | `/oop` | "OOP Viz" under CONCEPTS |
| System Design | `/system` | "System Design" under CONCEPTS |
| SOLID Principles | `/solid` | "SOLID" under CONCEPTS |
| Design Patterns | `/patterns` | "Patterns" under CONCEPTS |
| DI/IoC Container | `/di` | "DI Container" under CONCEPTS |
| Code Debugger | `/code-ide` | "Code IDE" under TOOLS |

The app uses hash routing: `localhost:5173/#/sorting`, `localhost:5173/#/oop`, etc.

## Algorithm Dashboard Testing (Searching & Linear DSA Tab)

### Navigation
1. Go to `http://localhost:5173/#/sorting`
2. Click the **"Searching & Linear DSA"** tab (2nd tab, green icon)
3. Dashboard shows terminal-style algorithm cards grouped by category

### Key UI Elements
- **Category groups**: `ls searching/` (3 skills), `ls stack-queue/` (3 skills), etc.
- **"Mo phong" button** (orange) — launches VCR playback for that algorithm
- **"Ly thuyet" button** — shows theory/explanation view
- **Difficulty filter**: `all/`, `easy/`, `medium/`, `hard/` buttons
- **Search bar**: placeholder shows total skill count (e.g., "Search 10 skills")

### Full-Stack Integration Test (Binary Search)
1. Click "Mo phong" on binary-search card
2. VCR loads with frames from backend API (`POST /api/v1/algorithms/execute`)
3. **Key verification**: Explanation text is in Vietnamese (e.g., "Bắt đầu Tìm kiếm nhị phân...") — this text exists ONLY in backend C# strategy code. If you see English or no text, the API connection failed and it fell back to local generators.
4. Frame navigation: Step Forward (→) and Step Back (←) buttons
5. Step counter shows `X / N` format

### Catalog Verification (via Browser Console)
To verify the full algorithm catalog (including sorting algorithms not visible on this tab):
```javascript
const app = document.querySelector('#app').__vue_app__;
const pinia = app.config.globalProperties.$pinia;
const stores = pinia._s;
for (const [key, store] of stores) {
  if (key.includes('algorithm')) {
    console.log('Total:', store.algorithms?.length);
    console.log('Sorting:', store.algorithms?.filter(a => a.category === 'Sorting').map(a => a.id));
  }
}
```
Expected: 17 total algorithms (7 sorting + 3 searching + 3 stack-queue + 4 graph/tree).

## Backend API Testing (curl)

### List All Algorithms
```bash
curl -s http://localhost:5055/api/v1/algorithms | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d),'algorithms'); [print(f'  {a[\"id\"]}') for a in d]"
```

### Execute a Sorting Strategy
```bash
curl -s -X POST http://localhost:5055/api/v1/algorithms/execute \
  -H "Content-Type: application/json" \
  -d '{"algorithmId":"bubble-sort","inputData":[45,12,85,32,9]}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); frames=d.get('frames',[]); print(f'Frames: {len(frames)}'); print(f'Last: {frames[-1][\"dataState\"]}')"
```
Expected last frame: `[9, 12, 32, 45, 85]`

### All 7 Sorting Algorithm IDs
`bubble-sort`, `quick-sort`, `merge-sort`, `heap-sort`, `radix-sort`, `counting-sort`, `bucket-sort`

### OOP Concepts API
```bash
curl -s http://localhost:5055/api/v1/concepts/oop/scenarios
curl -s -X POST http://localhost:5055/api/v1/concepts/oop/execute -H "Content-Type: application/json" -d '{"scenarioId":"encapsulation"}'
```

### System Design API
```bash
curl -s http://localhost:5055/api/v1/concepts/system-design/topology
curl -s -X POST http://localhost:5055/api/v1/concepts/system-design/execute -H "Content-Type: application/json" -d '{"scenarioId":"server-failover"}'
```

### SOLID Principles API
```bash
# List scenarios
curl -s http://localhost:5055/api/v1/concepts/solid/scenarios
# Execute SRP scenario (4 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/solid/execute -H "Content-Type: application/json" -d '{"scenarioId":"srp"}'
# Execute OCP scenario (4 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/solid/execute -H "Content-Type: application/json" -d '{"scenarioId":"ocp"}'
# Execute LSP scenario (4 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/solid/execute -H "Content-Type: application/json" -d '{"scenarioId":"lsp"}'
```
Supported scenario IDs: `srp`, `ocp`, `lsp`

### Design Patterns API
```bash
# List scenarios
curl -s http://localhost:5055/api/v1/concepts/design-patterns/scenarios
# Execute Strategy Pattern (4 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/design-patterns/execute -H "Content-Type: application/json" -d '{"scenarioId":"strategy-pattern"}'
# Execute Observer Pattern (4 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/design-patterns/execute -H "Content-Type: application/json" -d '{"scenarioId":"observer-pattern"}'
# Execute Singleton Pattern (4 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/design-patterns/execute -H "Content-Type: application/json" -d '{"scenarioId":"singleton-pattern"}'
```
Supported scenario IDs: `strategy-pattern`, `observer-pattern`, `singleton-pattern`

### DI Container API
```bash
# List scenarios
curl -s http://localhost:5055/api/v1/concepts/di-container/scenarios
# Execute Lifetime Demo (5 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/di-container/execute -H "Content-Type: application/json" -d '{"scenarioId":"lifetime-demo"}'
# Execute Cycle Detection (4 frames)
curl -s -X POST http://localhost:5055/api/v1/concepts/di-container/execute -H "Content-Type: application/json" -d '{"scenarioId":"cycle-detection"}'
```
Supported scenario IDs: `lifetime-demo`, `cycle-detection`

## Architecture Module DTO Key Names

When parsing JSON responses, use these actual property names (not what the C# class names suggest):

### Design Pattern Nodes
- `id` (not `nodeId`), `name`, `nodeType`, `attributes`, `methods`, `x`, `y`
- Links: `id` (not `linkId`), `sourceId`, `targetId`, `linkType`, `isActive`

### DI Container Registrations
- `interfaceName`, `implementationName`, `lifetime`, `dependencies`, `isRegistered`
- Instances: `serviceName`, `instanceId`, `lifetime`, `resolveCount`, `isNew`
- Graph: `dependencyGraph.nodes[]`, `dependencyGraph.edges[].from`, `dependencyGraph.edges[].to`

### Key Verification Points
- **Vietnamese text**: All concept endpoints generate Vietnamese explanation text in the `explanation` field. This text exists ONLY in backend C# — if API fails, frontend fallback won't have it.
- **SOLID**: `isViolation` flag toggles (true in violation frames, false in fix frames). `classNodes[].isViolating` marks individual nodes.
- **Strategy Pattern**: `couplingIndex` should decrease frame-by-frame (85→40→20→15).
- **Observer**: All `links[].isActive = true` during NOTIFY_ALL frame.
- **DI Lifetime**: Singleton instance has `isNew=false` on second resolve. Transient always has `isNew=true`.
- **Cycle Detection**: `hasCycle` toggles false→true→false across frames.

## System Design Module Testing

### Key UI Elements
- **"HTTP Request" button** — injects a single packet
- **"Xa lu 10 hat" button** — injects 10 packets (burst mode)
- **"Sap nguon" buttons** — toggles server failure
- **"Ghi du lieu (DB Write)" button** — triggers DB replication
- **Scenario Picker** (4 buttons) — launches VCR mode with backend frames
- **VCR Playback Panel** — prev/play/next/reset + speed controls
- **Explanation Banner** — shows actionType + Vietnamese explanation

### Packet Animation Speed
With `PACKET_SPEED=0.05` and deltaTime in seconds, packets take ~20s per hop. If they flash instantly, deltaTime normalization is broken.

### VCR Scenario Mode
Click a scenario button (e.g., "Server Failover") → enters VCR mode with backend-generated frames. Verify explanation banner shows Vietnamese text and actionType changes per frame.

## OOP Visualization Module Testing

### Key UI Elements
- **Pillar tabs**: Dong Goi, Ke Thua, Da Hinh, Truu Tuong
- **"+ new Shape()" / "+ new Circle()" buttons** — manual instantiation
- **Heap Memory Allocator** (right side) — shows objects with hex addresses
- **Scenario cards** (left panel) — 4 predefined OOP scenarios
- **VCR controls**: ⏮ ▶Play 🔄 ⏭ and step counter
- **"Backend Frame" badge** — confirms API-driven mode
- **ActionName badge** — shows INSTANTIATE, VIOLATE_ACCESS, CALL_METHOD, etc.

### Full-Stack Integration Test
1. Click a scenario (e.g., "Dong Goi" / Encapsulation)
2. VCR loads backend frames — look for "Backend Frame" badge
3. Vietnamese explanation text confirms API connection
4. Step through frames and verify actionName changes

## SOLID/Patterns/DI Module Testing

Note: These modules have VCR integration in the Pinia stores but the workspace components may not yet render VCR scenario-selection buttons in the UI. Test primarily via backend curl commands (see Backend API Testing section above).

If VCR buttons are added to the workspace components, the testing pattern is the same as OOP/System Design:
1. Click scenario button → VCR mode activates
2. Look for Vietnamese explanation text (proves API connection)
3. Step through frames, verify actionType progression
4. Exit VCR mode restores sandbox controls

## Running Unit Tests

```bash
cd frontend && npx vitest run
```
Expected: All tests pass (1528+ tests).

## Common Issues

- The Algorithm Dashboard tab is the **2nd tab** ("Searching & Linear DSA"), not the default "Sorting Sandbox" tab.
- The dashboard only shows algorithms matching `allowedCategories` filter — sorting algorithms won't appear on the Searching tab (by design). Use console to verify full catalog.
- Backend might show PostgreSQL connection errors on startup — this is normal. Algorithm endpoints work without a database.
- Port conflicts: Kill existing processes with `fuser -k <port>/tcp` before restarting.
- CountingSortStrategy: Watch for sorting-by-ones-digit bugs. The correct implementation uses `(value - minVal)` offset indexing, not `% 10`.
- The ⏭ (next step) button in scenario mode can be hard to click precisely — it's a small button in the VCR control bar.
- Error handling: Invalid scenarioId returns HTTP 404 with `{"errorType":"SCENARIO_NOT_FOUND", "supportedScenarios":[...]}` body.
- Design Pattern nodes use `id`/`name` (not `nodeId`/`className`) and links use `id`/`sourceId`/`targetId` (not `linkId`/`source`/`target`).
