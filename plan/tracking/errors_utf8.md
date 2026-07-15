# âš ï¸ Nháº­t KÃ½ Lá»—i VÃ  Sá»± Cá»‘ ThÆ°á»ng Gáº·p - Error Codes & Failover Scenarios

TÃ i liá»‡u nÃ y tá»•ng há»£p cÃ¡c mÃ£ lá»—i, ká»‹ch báº£n sá»± cá»‘ vÃ  cÃ¡ch thá»©c há»‡ thá»‘ng tá»± Ä‘á»™ng phá»¥c há»“i (Failover) cá»§a **VisualizationDSA** nháº±m báº£o toÃ n tráº£i nghiá»‡m mÆ°á»£t mÃ  cho sinh viÃªn.

---

## 1. Danh Má»¥c MÃ£ Lá»—i & CÃ¡ch Xá»­ LÃ½ (Error Directory)

### ðŸš¨ Lá»—i 101: Phá»¥ Thuá»™c VÃ²ng TrÃ²n Trong ThÃ¹ng Chá»©a (Cyclic Dependency Loop)
*   **MÃ´ táº£:** ÄÄƒng kÃ½ cÃ¡c token dá»‹ch vá»¥ trong IoC Container bá»‹ vÃ²ng láº·p chu trÃ¬nh chÃ©o (A -> B -> A).
*   **MÃ£ Lá»—i:** `ERR_IOC_CYCLIC_DEPENDENCY`
*   **Pháº£n á»©ng há»‡ thá»‘ng:** DFS cycle detector cháº·n Ä‘á»©ng láº­p tá»©c Ä‘á»‡ quy trÆ°á»›c khi sáº­p RAM, nÃ©m ra ngoáº¡i lá»‡ bÃ¡o lá»—i sáº­p Ä‘á» rá»±c mÃ n hÃ¬nh.
*   **CÃ¡ch kháº¯c phá»¥c:** Há»c viÃªn cáº§n tÃ¡ch nhá» interface hoáº·c sá»­ dá»¥ng nguyÃªn lÃ½ Ä‘áº£o ngÆ°á»£c phá»¥ thuá»™c (DIP) thÃ´ng qua lá»›p trá»«u tÆ°á»£ng trung gian.

### ðŸš¨ Lá»—i 102: Va Cháº¡m ÄÃ¨ NÃºt Äá»“ Thá»‹ Canvas (Vertex Overlapping)
*   **MÃ´ táº£:** Há»c viÃªn click táº¡o cÃ¡c nÃºt Ä‘á»“ thá»‹ á»Ÿ khoáº£ng cÃ¡ch quÃ¡ sÃ¡t nhau lÃ m Ä‘Ã¨ nÃºt máº¥t tháº©m má»¹ Ä‘á»“ há»a.
*   **MÃ£ Lá»—i:** `ERR_PLAYGROUND_NODE_OVERLAP`
*   **Pháº£n á»©ng há»‡ thá»‘ng:** Thuáº­t toÃ¡n Ä‘o khoáº£ng cÃ¡ch Euclidean cháº·n Ä‘á»©ng sá»± kiá»‡n sinh node má»›i náº¿u khoáº£ng cÃ¡ch nhá» hÆ¡n 50px.
*   **CÃ¡ch kháº¯c phá»¥c:** Click táº¡o nÃºt á»Ÿ vá»‹ trÃ­ thoÃ¡ng Ä‘Ã£ng hÆ¡n trÃªn mÃ n hÃ¬nh.

### ðŸš¨ Lá»—i 103: Sai Äá»‹nh Dáº¡ng Máº£ng TÃ¹y Biáº¿n (Custom Input Parse Error)
*   **MÃ´ táº£:** Nháº­p kÃ½ tá»± láº¡ hoáº·c máº£ng trá»‘ng/quÃ¡ dÃ i vÃ o há»™p náº¡p Custom Input.
*   **MÃ£ Lá»—i:** `ERR_PARSER_INVALID_FORMAT`
*   **Pháº£n á»©ng há»‡ thá»‘ng:** TrÃ¬nh phÃ¢n dá»‹ch `CustomInputParser` tá»« chá»‘i náº¡p, nÃ©m thÃ´ng bÃ¡o Ä‘á» chá»‰ rÃµ pháº§n tá»­ lá»—i dÆ°á»›i **5ms**.
*   **CÃ¡ch kháº¯c phá»¥c:** Nháº­p Ä‘Ãºng Ä‘á»‹nh dáº¡ng máº£ng sá»‘ cÃ¡ch nhau bá»Ÿi dáº¥u pháº©y (VÃ­ dá»¥: `5, 8, 12, 20`).

---

## 2. Ká»‹ch Báº£n Tá»± Phá»¥c Há»“i Khi Gáº·p Sá»± Cá»‘ (Failover Scenarios)

### ðŸ›¡ï¸ Ká»‹ch báº£n 1: Sáº­p nguá»“n Web Server trong System Design Visualizer
*   **Ngá»¯ cáº£nh:** Há»c sinh click Ä‘Ã¡nh sáº­p Server Web Ä‘ang gÃ¡nh táº£i HTTP.
*   **HÃ nh Ä‘á»™ng tá»± phá»¥c há»“i:** 
    1.  KÃ­ch hoáº¡t mÃ¡y phun khÃ³i Canvas 2D bá»‘c khÃ³i xÃ¡m cuá»“n cuá»™n 60 FPS tá»©c kháº¯c dÆ°á»›i **5ms** táº¡i tá»a Ä‘á»™ Server bá»‹ sáº­p.
    2.  Bá»™ cÃ¢n báº±ng táº£i Load Balancer loáº¡i bá» ngay Server sáº­p khá»i danh sÃ¡ch Ä‘á»‹nh tuyáº¿n healthy.
    3.  Táº£i HTTP request Ä‘Æ°á»£c chuyá»ƒn dá»‹ch mÆ°á»£t mÃ  sang Server cÃ²n sá»‘ng bÃªn cáº¡nh dÆ°á»›i **5ms** mÃ  khÃ´ng lÃ m giÃ¡n Ä‘oáº¡n há»‡ thá»‘ng.
    4.  Thu há»“i sáº¡ch háº¡t khÃ³i khá»i RAM khi tan biáº¿n.

### ðŸ›¡ï¸ Ká»‹ch báº£n 2: TrÃ´i dÃ²ng code khi áº©n Tab trÃ¬nh duyá»‡t (rAF Spike Clamping)
*   **Ngá»¯ cáº£nh:** Há»c viÃªn Ä‘ang xem hoáº¡t áº£nh vÃ  chuyá»ƒn tab trÃ¬nh duyá»‡t khÃ¡c, rAF bá»‹ ngáº¯t táº¡m thá»i, khi quay láº¡i `deltaTime` tÄƒng Ä‘á»™t biáº¿n gÃ¢y giáº­t láº¯c xÃ© hÃ¬nh.
*   **HÃ nh Ä‘á»™ng tá»± phá»¥c há»“i:** Bá»™ scheduler giá»›i háº¡n Ä‘Ã¨ `clampedDelta = Math.min(deltaTime, 32)` cháº·n Ä‘á»©ng má»i hiá»‡n tÆ°á»£ng nháº£y giáº­t áº£nh.

### ðŸš¨ Lá»—i 104: Vue Reactive Proxy KhÃ´ng Thá»ƒ Structured-Clone Qua postMessage (Phase 2)
*   **MÃ´ táº£:** Khi gá»­i `inputArray.value` (má»™t Vue reactive Proxy) qua `worker.postMessage()`, trÃ¬nh duyá»‡t nÃ©m lá»—i `Failed to execute 'postMessage' on 'Worker': [object Array] could not be cloned.` vÃ¬ structured clone algorithm khÃ´ng há»— trá»£ Proxy objects.
*   **MÃ£ Lá»—i:** `ERR_WORKER_POSTMESSAGE_PROXY`
*   **NguyÃªn nhÃ¢n gá»‘c:** `inputArray` lÃ  `ref<number[]>` trong Pinia store. DÃ¹ truy cáº­p `.value`, káº¿t quáº£ váº«n lÃ  reactive Proxy â€” khÃ´ng pháº£i plain Array.
*   **CÃ¡ch kháº¯c phá»¥c:** Spread operator `[...inputArray.value]` Ä‘á»ƒ táº¡o báº£n sao plain Array trÆ°á»›c khi truyá»n vÃ o `postMessage`. File sá»­a: `useLiveCompilerStore.ts` dÃ²ng 103.

### ðŸš¨ Lá»—i 105: __loopCounter Khai BÃ¡o TrÃ¹ng Láº·p Trong Web Worker (Phase 2)
*   **MÃ´ táº£:** Khi thá»±c thi code Ä‘Ã£ tiÃªm váº¿t bÃªn trong Web Worker, lá»—i runtime `Identifier '__loopCounter' has already been declared` xáº£y ra vÃ¬ biáº¿n `__loopCounter` Ä‘Æ°á»£c khai bÃ¡o hai láº§n: má»™t láº§n bá»Ÿi `ASTInstrumentationEngine` (prepend `let __loopCounter = 0;`) vÃ  má»™t láº§n bá»Ÿi `new Function('...', '__loopCounter', code)` (parameter binding).
*   **MÃ£ Lá»—i:** `ERR_WORKER_DUPLICATE_DECLARATION`
*   **NguyÃªn nhÃ¢n gá»‘c:** `buildWorkerScript()` truyá»n `__loopCounter` lÃ m tham sá»‘ thá»© 4 cá»§a `new Function()`, Ä‘á»“ng thá»i `compileAndInstrument()` Ä‘Ã£ prepend `let __loopCounter = 0;` vÃ o Ä‘áº§u mÃ£ nguá»“n Ä‘Ã£ sinh. Khi cáº£ hai tá»“n táº¡i trong cÃ¹ng scope, JavaScript nÃ©m lá»—i khai bÃ¡o trÃ¹ng.
*   **CÃ¡ch kháº¯c phá»¥c:** Loáº¡i bá» `__loopCounter` khá»i danh sÃ¡ch tham sá»‘ `new Function()` trong `WorkerLifecycleCoordinator.ts`, vÃ¬ biáº¿n Ä‘Ã£ Ä‘Æ°á»£c khai bÃ¡o ná»™i bá»™ bá»Ÿi mÃ£ nguá»“n Ä‘Ã£ tiÃªm váº¿t.

### ðŸš¨ Lá»—i 106: HÃ m FunctionDeclaration KhÃ´ng ÄÆ°á»£c Gá»i Trong Web Worker (Phase 2)
*   **MÃ´ táº£:** MÃ£ nguá»“n Ä‘Ã£ tiÃªm váº¿t chá»‰ khai bÃ¡o hÃ m `function bubbleSort(arr) { ... }` mÃ  khÃ´ng bao giá» gá»i nÃ³. Khi `new Function('arr', 'traceCompare', 'traceAssign', code)` thá»±c thi, thÃ¢n hÃ m chá»‰ khai bÃ¡o `bubbleSort` rá»“i káº¿t thÃºc â€” khÃ´ng cÃ³ lá»i gá»i `bubbleSort(arr)`. Káº¿t quáº£: chá»‰ 1 frame ACCESS (tráº¡ng thÃ¡i cuá»‘i) mÃ  khÃ´ng cÃ³ COMPARE/SWAP trace nÃ o.
*   **MÃ£ Lá»—i:** `ERR_AST_FUNCTION_NOT_INVOKED`
*   **NguyÃªn nhÃ¢n gá»‘c:** `compileAndInstrument()` chá»‰ tiÃªm tracing vÃ o bÃªn trong hÃ m mÃ  khÃ´ng thÃªm lá»i gá»i hÃ m cuá»‘i chÆ°Æ¡ng trÃ¬nh. Worker wraps code trong `new Function(...)` nÃªn cáº§n lá»i gá»i tÆ°á»ng minh.
*   **CÃ¡ch kháº¯c phá»¥c:** ThÃªm hÃ m `appendAutoInvoke()` vÃ o `ASTInstrumentationEngine.ts`. HÃ m nÃ y tÃ¬m `FunctionDeclaration` Ä‘áº§u tiÃªn á»Ÿ top-level AST body vÃ  append `functionName(arr);` vÃ o cuá»‘i chÆ°Æ¡ng trÃ¬nh. File sá»­a: `ASTInstrumentationEngine.ts` dÃ²ng 60-78.

### ðŸš¨ Lá»—i 107: Lá»±c HÃºt LÃ² Xo Hooke TÃ­nh Sai HÆ°á»›ng Cho Trá»ng Sá»‘ KhÃ¡c Nhau (Edge Weight Physics)
*   **MÃ´ táº£:** Lá»±c hÃºt cá»§a cÃ¡c cáº¡nh cÃ³ trá»ng sá»‘ náº·ng láº¡i yáº¿u hÆ¡n cÃ¡c cáº¡nh cÃ³ trá»ng sá»‘ nháº¹, dáº«n Ä‘áº¿n viá»‡c dÃ n xáº¿p layout Ä‘á»“ thá»‹ bá»‹ sai logic váº­t lÃ½ (Ä‘Ã¡ng láº½ cáº¡nh náº·ng pháº£i kÃ©o 2 node sÃ¡t nhau hÆ¡n).
*   **MÃ£ Lá»—i:** `ERR_FD_LAYOUT_WEIGHTED_ATTRACTION`
*   **NguyÃªn nhÃ¢n gá»‘c:** `ForceDirectedLayout.ts` nhÃ¢n há»‡ sá»‘ ideal length (chiá»u dÃ i lÃ½ tÆ°á»Ÿng) cá»§a lÃ² xo vá»›i `weightFactor`, lÃ m tÄƒng `idealLength` cho cáº¡nh náº·ng. Äiá»u nÃ y lÃ m giáº£m `displacement = distance - idealLength`, tá»« Ä‘Ã³ lÃ m giáº£m lá»±c hÃºt Hooke `force = kAttraction * displacement * weightFactor;`. File sá»­a: `ForceDirectedLayout.ts` dÃ²ng 88-94.

### ðŸš¨ Lá»—i 115: Lá»—i Import Mismatch CÃ¡c Kiá»ƒu Dá»¯ Liá»‡u Gamification (TS2614 Member Export Mismatch)
*   **MÃ´ táº£:** BiÃªn dá»‹ch lá»—i `error TS2614: Module '"./XPEngine"' has no exported member 'UserProgress'` trong `src/features/gamification/index.ts`.
*   **MÃ£ Lá»—i:** `ERR_TS2614_XPENDING_EXPORT_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** `index.ts` xuáº¥t kháº©u cÃ¡c types `UserProgress`, `Badge`, `LevelConfig`, `XPEvent`, `EmbedConfig` trá»±c tiáº¿p tá»« `./XPEngine` sau khi cÃ¡c types nÃ y Ä‘Ã£ Ä‘Æ°á»£c chuyá»ƒn dá»‹ch hoÃ n toÃ n sang `./xpConfig` nháº±m phá»¥c vá»¥ viá»‡c phÃ¢n rÃ£/tá»‘i giáº£n dÃ²ng mÃ£ nguá»“n cho `XPEngine.ts` Ä‘á»ƒ Ä‘áº¡t giá»›i háº¡n dÆ°á»›i 100 dÃ²ng.
*   **CÃ¡ch kháº¯c phá»¥c:** Cáº­p nháº­t `index.ts` Ä‘á»ƒ xuáº¥t kháº©u cÃ¡c interfaces Ä‘Ã³ trá»±c tiáº¿p tá»« `./xpConfig` thay vÃ¬ `./XPEngine`.

### ðŸš¨ Lá»—i 108: ThÆ° Viá»‡n Asp.Versioning.Mvc PhiÃªn Báº£n 10.0.0 KhÃ´ng TÆ°Æ¡ng ThÃ­ch Vá»›i .NET 9
*   **MÃ´ táº£:** Lá»—i restore project vÃ  lá»—i biÃªn dá»‹ch do mismatch target framework khi cÃ i Ä‘áº·t gÃ³i NuGet `Asp.Versioning.Mvc` vÃ  `Asp.Versioning.Mvc.ApiExplorer`.
*   **MÃ£ Lá»—i:** `ERR_NET_VERSION_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** NuGet tá»± Ä‘á»™ng táº£i phiÃªn báº£n v10.0.0 má»›i nháº¥t yÃªu cáº§u .NET 10, trong khi dá»± Ã¡n hiá»‡n táº¡i target .NET 9.0.
*   **CÃ¡ch kháº¯c phá»¥c:** Háº¡ cáº¥p vÃ  Ä‘á»‹nh nghÄ©a rÃµ rÃ ng phiÃªn báº£n `8.1.0` (tÆ°Æ¡ng thÃ­ch hoÃ n háº£o vá»›i .NET 9) trong [WebApi.csproj](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/WebApi.csproj).

### ðŸš¨ Lá»—i 109: Cáº£nh BÃ¡o Obsolete Cá»§a UseXminAsConcurrencyToken() Trong EF Core
*   **MÃ´ táº£:** Cáº£nh bÃ¡o biÃªn dá»‹ch CS0618 khi sá»­ dá»¥ng phÆ°Æ¡ng thá»©c cÅ© `UseXminAsConcurrencyToken()` cho Optimistic Concurrency Control.
*   **MÃ£ Lá»—i:** `ERR_EF_OBSOLETE_CONCURRENCY_TOKEN`
*   **NguyÃªn nhÃ¢n gá»‘c:** EF Core vÃ  Npgsql Ä‘Ã£ thay Ä‘á»•i cÃ¡ch Ä‘Äƒng kÃ½ concurrency token há»‡ thá»‘ng (xmin) vÃ  Ä‘Ã¡nh dáº¥u phÆ°Æ¡ng thá»©c cÅ© lÃ  lá»—i thá»i.
*   **CÃ¡ch kháº¯c phá»¥c:** Chuyá»ƒn Ä‘á»•i cáº¥u hÃ¬nh thá»§ cÃ´ng qua shadow property `xmin` dáº¡ng `.IsConcurrencyToken()` trong [ApplicationDbContext.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Data/ApplicationDbContext.cs).

### ðŸš¨ Lá»—i 110: Lá»—i PhÃ¢n Giáº£i Host=localhost TrÃªn Windows (Npgsql Connection Fail)
*   **MÃ´ táº£:** Khi khá»Ÿi Ä‘á»™ng WebApi backend, EF Core nÃ©m ngoáº¡i lá»‡ `SocketException: No such host is known` táº¡i hÃ m `databaseFacade.Migrate()`.
*   **MÃ£ Lá»—i:** `ERR_DB_LOCALHOST_RESOLVE_FAIL`
*   **NguyÃªn nhÃ¢n gá»‘c:** TrÃ¬nh Ä‘iá»u khiá»ƒn cÆ¡ sá»Ÿ dá»¯ liá»‡u Npgsql khÃ´ng phÃ¢n giáº£i Ä‘Æ°á»£c hostname `localhost` sang Ä‘á»‹a chá»‰ IP loopback trÃªn má»™t sá»‘ cáº¥u hÃ¬nh Windows (Ä‘áº·c biá»‡t khi IPv6 Ä‘Æ°á»£c Æ°u tiÃªn hoáº·c DNS local bá»‹ ngáº¯t).
*   **CÃ¡ch kháº¯c phá»¥c:** Thay tháº¿ `Host=localhost` thÃ nh Ä‘á»‹a chá»‰ IP tÄ©nh rÃµ rÃ ng `Host=127.0.0.1` trong [appsettings.json](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/appsettings.json) vÃ  [appsettings.Development.json](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/appsettings.Development.json). Lá»±c chá»n nÃ y bá» qua viá»‡c phÃ¢n giáº£i DNS vÃ  káº¿t ná»‘i trá»±c tiáº¿p Ä‘áº¿n IPv4 loopback cá»§a PostgreSQL local.

### ðŸš¨ Lá»—i 111: Lá»—i Thiáº¿u HÃ m getStoredToken Khi Cháº¡y Kiá»ƒm Thá»­ CÃ¢y Lá»™ TrÃ¬nh (TypeError: getStoredToken is not a function)
*   **MÃ´ táº£:** Khi cháº¡y unit test cho store `learning-path` (`useLearningPathStore.spec.ts`), Vitest nÃ©m lá»—i runtime `TypeError: getStoredToken is not a function` táº¡i computed property `isOnlineMode = computed(() => !!getStoredToken())`.
*   **MÃ£ Lá»—i:** `ERR_API_CLIENT_COMPATIBILITY_MISSING_EXPORTS`
*   **NguyÃªn nhÃ¢n gá»‘c:** `apiClient.ts` á»Ÿ nhÃ¡nh fork export cÃ¡c helper functions nhÆ° `getStoredToken` vÃ  `getStoredRefreshToken` dÃ¹ng Ä‘á»ƒ kiá»ƒm tra trá»±c tiáº¿p tráº¡ng thÃ¡i token ngoáº¡i tuyáº¿n. Khi trá»™n thá»§ cÃ´ng vÃ  tÃ¡i cáº¥u trÃºc báº£o máº­t API Client káº¿t há»£p vá»›i Pinia store secure token memory-only, chÃºng ta bá» sÃ³t khÃ´ng khai bÃ¡o (export) cÃ¡c helper nÃ y khiáº¿n store import lá»—i.
*   **CÃ¡ch kháº¯c phá»¥c:** Cáº­p nháº­t [apiClient.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/services/apiClient.ts) Ä‘á»ƒ khai bÃ¡o Ä‘áº§y Ä‘á»§ cÃ¡c helper functions. Äá»“ng thá»i tá»‘i Æ°u hÃ³a `getStoredToken` báº±ng cÃ¡ch kiá»ƒm tra ngá»¯ cáº£nh Pinia hoáº¡t Ä‘á»™ng `getActivePinia()`, cho phÃ©p Ä‘á»c Access Token tá»« `useAuthStore` Ä‘á»™ng an toÃ n mÃ  khÃ´ng gÃ¢y ra lá»—i khá»Ÿi táº¡o Pinia ngoÃ i ngá»¯ cáº£nh trong mÃ´i trÆ°á»ng kiá»ƒm thá»­ unit tests.

### ðŸš¨ Lá»—i 112: Lá»—i Import Sai ÄÆ°á»ng Dáº«n CustomInputParser VÃ  ForceDirectedLayout (Phase 2 Import Mismatch)
*   **MÃ´ táº£:** Khi truy cáº­p vÃ o tab Sorting, há»‡ thá»‘ng gáº·p lá»—i runtime vÃ  khÃ´ng thá»ƒ load route: `TypeError: Failed to fetch dynamically imported module: http://localhost:5173/src/views/SortingView.vue`.
*   **MÃ£ Lá»—i:** `ERR_IMPORT_RELATIVE_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** Sau khi trá»™n code thá»§ cÃ´ng tá»« nhÃ¡nh fork, cÃ¡c file composables `useInputValidation.ts` vÃ  `useGraphPlayground.ts` váº«n tham chiáº¿u tá»›i `../CustomInputParser` vÃ  `../ForceDirectedLayout` thay vÃ¬ Ä‘i vÃ o thÆ° má»¥c con `../engine/CustomInputParser` vÃ  `../engine/ForceDirectedLayout` do sá»± thay Ä‘á»•i vá» cáº¥u trÃºc thÆ° má»¥c FSD (Feature-Sliced Design) trong dá»± Ã¡n chÃ­nh.
*   **CÃ¡ch kháº¯c phá»¥c:** Sá»­a Ä‘á»•i Ä‘Æ°á»ng dáº«n import trong `useInputValidation.ts` thÃ nh `../engine/CustomInputParser`, vÃ  trong `useGraphPlayground.ts` thÃ nh `../engine/CustomInputParser` vÃ  `../engine/ForceDirectedLayout`.

### ðŸš¨ Lá»—i 113: TrÃ¹ng Khá»›p Kiá»ƒu showToast TrÃ¬nh BÃ¡o Lá»—i Cho Component Vue (TS2322 Toast Type Mismatch)
*   **MÃ´ táº£:** BiÃªn dá»‹ch lá»—i `error TS2322: Type 'string' is not assignable to type '"error" | "success" | "info"'` trong `InteractivePlayground.vue`.
*   **MÃ£ Lá»—i:** `ERR_TS2322_TOAST_TYPE_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** Biáº¿n `type` trong `showToast` gÃ¡n giÃ¡ trá»‹ máº·c Ä‘á»‹nh lÃ  `'info'` khÃ´ng Ã©p kiá»ƒu cá»¥ thá»ƒ nÃªn TypeScript tá»± nháº­n diá»‡n kiá»ƒu dá»¯ liá»‡u rá»™ng hÆ¡n lÃ  `string`, gÃ¢y xung Ä‘á»™t vá»›i Union type nghiÃªm ngáº·t cá»§a component.
*   **CÃ¡ch kháº¯c phá»¥c:** Äá»‹nh nghÄ©a rÃµ rÃ ng kiá»ƒu dá»¯ liá»‡u cho tham sá»‘ Ä‘áº§u vÃ o trong chá»¯ kÃ½ hÃ m: `type: 'info' | 'error' | 'success' = 'info'`.

### ðŸš¨ Lá»—i 114: Thuá»™c TÃ­nh Tham Sá»‘ Constructor Bá»‹ Cáº¥m (TS1294 Parameter Property Restriction)
*   **MÃ´ táº£:** BiÃªn dá»‹ch lá»—i `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled` trong `UnifiedPlaybackCoordinator.ts`.
*   **MÃ£ Lá»—i:** `ERR_TS1294_ERASABLE_SYNTAX_ONLY`
*   **NguyÃªn nhÃ¢n gá»‘c:** TrÃ¬nh cáº¥u dá»‹ch dá»± Ã¡n báº­t tÃ¹y chá»n `erasableSyntaxOnly` (chá»‰ cho phÃ©p cÃ¡c cÃº phÃ¡p TS dá»… dÃ ng xÃ³a bá» khi chuyá»ƒn sang JS sáº¡ch). Constructor parameter properties (`constructor(private leftStore...)`) phÃ¡t sinh mÃ£ runtime bá»• sung á»Ÿ JS nÃªn bá»‹ cháº·n.
*   **CÃ¡ch kháº¯c phá»¥c:** Äá»•i sang khai bÃ¡o cÃ¡c trÆ°á»ng dá»¯ liá»‡u riÃªng biá»‡t vÃ  gÃ¡n giÃ¡ trá»‹ tÆ°á»ng minh trong thÃ¢n hÃ m constructor.

### ðŸš¨ Lá»—i 116: Lá»—i Test Timeout Do Fetch KhÃ´ng ÄÆ°á»£c Mock Trong useInputStore Test
*   **MÃ´ táº£:** Cháº¡y kiá»ƒm thá»­ cho `useInputStore.spec.ts` bá»‹ timeout sau 5000ms á»Ÿ test case "uses dummy fallback when API is unreachable".
*   **MÃ£ Lá»—i:** `ERR_TEST_FETCH_TIMEOUT`
*   **NguyÃªn nhÃ¢n gá»‘c:** HÃ m `submitCustomInput` trong store `useInputStore.ts` gá»i fetch thá»±c táº¿ Ä‘áº¿n URL `API_BASE` when khÃ´ng Ä‘Æ°á»£c mock trong mÃ´i trÆ°á»ng kiá»ƒm thá»­. KhÃ´ng cÃ³ mÃ¡y chá»§ local pháº£n há»“i trong test runner khiáº¿n fetch bá»‹ treo vÃ  test case bá»‹ timeout quÃ¡ giá»›i háº¡n 5000ms cá»§a Vitest.
*   **CÃ¡ch kháº¯c phá»¥c:** Import `vi` tá»« `vitest` vÃ  gá»i `vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))` trong test case tÆ°Æ¡ng á»©ng Ä‘á»ƒ giáº£ láº­p lá»—i káº¿t ná»‘i máº¡ng ngay láº­p tá»©c, Ä‘á»“ng thá»i thÃªm `vi.restoreAllMocks()` trong `beforeEach` Ä‘á»ƒ trÃ¡nh áº£nh hÆ°á»Ÿng Ä‘áº¿n cÃ¡c test case khÃ¡c.

### ðŸš¨ Lá»—i 117: Thiáº¿u VCR Control Panel TrÃªn Giao Diá»‡n Sorting (Sorting Animation Stuck)
*   **MÃ´ táº£:** Giao diá»‡n Sorting khi má»Ÿ lÃªn chá»‰ hiá»ƒn thá»‹ cá»™t máº£ng tÄ©nh, khÃ´ng thá»ƒ phÃ¡t animation, khÃ´ng cháº¡y phÃ­m táº¯t Space/Arrow, cÅ©ng khÃ´ng pháº£n há»“i khi báº¥m nÃºt Ä‘á»•i thuáº­t toÃ¡n (Ä‘á»“ thá»‹ khÃ´ng cháº¡y).
*   **MÃ£ Lá»—i:** `ERR_SORTING_ANIMATION_STUCK`
*   **NguyÃªn nhÃ¢n gá»‘c:** Giao diá»‡n `SortingView.vue` chá»‰ mount component hiá»ƒn thá»‹ `ArrayBarVisualizer.vue` mÃ  bá» sÃ³t component Ä‘iá»u khiá»ƒn `VcrControlPanel.vue` cá»§a module `vcr-player`. Do Ä‘Ã³, tráº¡ng thÃ¡i hoáº¡t cáº£nh trong `useVcrStore.ts` luÃ´n á»Ÿ frame 0 (`isPlaying = false`) vÃ  khÃ´ng cÃ³ nÃºt báº¥m nÃ o Ä‘á»ƒ kÃ­ch hoáº¡t luá»“ng phÃ¡t hoáº·c Ä‘Äƒng kÃ½ trÃ¬nh láº¯ng nghe bÃ n phÃ­m.
*   **CÃ¡ch kháº¯c phá»¥c:** Import vÃ  mount `VcrControlPanel` tá»« `@/features/vcr-player` trá»±c tiáº¿p vÃ o bÃªn dÆ°á»›i `ArrayBarVisualizer` trong `SortingView.vue` vá»›i layout `flex-col` vÃ  cÄƒn chá»‰nh lá» há»£p lÃ½.

### ðŸš¨ Lá»—i 118: Cá»™t Giao Diá»‡n Sorting CÅ© QuÃ¡ Háº¹p VÃ  Trá»‘ng Tráº£i (Sorting Widescreen Layout Waste)
*   **MÃ´ táº£:** Giao diá»‡n Sorting bá»‹ giá»›i háº¡n bá»Ÿi `max-w-3xl`, Ä‘á»ƒ láº¡i khoáº£ng trá»‘ng lá»›n á»Ÿ hai bÃªn trÃªn mÃ n hÃ¬nh rá»™ng cá»§a PC/Tablet, Ä‘á»“ng thá»i cÃ¡ch bá»‘ trÃ­ xáº¿p tháº³ng Ä‘á»©ng khÃ´ng tá»‘i Æ°u khÃ´ng gian chiá»u ngang.
*   **MÃ£ Lá»—i:** `ERR_SORTING_LAYOUT_COMPACT_WASTE`
*   **NguyÃªn nhÃ¢n gá»‘c:** Class `max-w-3xl mx-auto flex-col` trong `SortingView.vue` lÃ  tÃ n dÆ° cá»§a thiáº¿t káº¿ di Ä‘á»™ng ban Ä‘áº§u, chÆ°a Ä‘Æ°á»£c nÃ¢ng cáº¥p thÃ nh layout Ä‘a cá»™t responsive.
*   **CÃ¡ch kháº¯c phá»¥c:** Chuyá»ƒn Ä‘á»•i `SortingView.vue` sang layout hai cá»™t responsive sá»­ dá»¥ng `flex-col lg:flex-row gap-4 p-4 max-w-[1600px] mx-auto w-full h-full`, phÃ¢n bá»• tá»‰ lá»‡ 65% Ä‘á»™ rá»™ng cho Canvas hiá»ƒn thá»‹ (`ArrayBarVisualizer`) vÃ  35% Ä‘á»™ rá»™ng cho báº£ng Ä‘iá»u khiá»ƒn (`VcrControlPanel`), giÃºp Ä‘á»“ng bá»™ thiáº¿t káº¿ trá»±c quan giá»‘ng cÃ¡c mÃ n hÃ¬nh IDE khÃ¡c.

### ðŸš¨ Lá»—i 119: Cá»™t Biá»ƒu Diá»…n Bubble Sort QuÃ¡ Nhá» Do Sáº­p Chiá»u Cao (Bubble Sort Bar Height Collapse)
*   **MÃ´ táº£:** CÃ¡c cá»™t biá»ƒu diá»…n trong Bubble Sort Visualizer bá»‹ co láº¡i thÃ nh cÃ¡c viÃªn thuá»‘c dáº¹t sÃ¡t Ä‘Ã¡y thay vÃ¬ chiáº¿m toÃ n bá»™ chiá»u cao cá»§a container.
*   **MÃ£ Lá»—i:** `ERR_BUBBLE_SORT_BAR_COLLAPSE`
*   **NguyÃªn nhÃ¢n gá»‘c:** Container `div` cá»§a tá»«ng pháº§n tá»­ máº£ng (Ä‘Æ°á»£c táº¡o bá»Ÿi `v-for` trong `<transition-group>`) khÃ´ng khai bÃ¡o thuá»™c tÃ­nh chiá»u cao (`h-full`). Do Ä‘Ã³, chiá»u cao cá»§a container nÃ y lÃ  `auto` (chá»‰ bao gá»“m chiá»u cao chá»¯), dáº«n Ä‘áº¿n viá»‡c chiá»u cao pháº§n trÄƒm cá»§a thanh cá»™t con (`height: X%`) khÃ´ng thá»ƒ phÃ¢n giáº£i Ä‘Æ°á»£c vÃ  bá»‹ sáº­p vá» `minHeight: 32px`.
*   **CÃ¡ch kháº¯c phá»¥c:** ThÃªm class `h-full` vÃ o container `div` cá»§a `v-for` trong `BubbleSortVisualizer.vue` Ä‘á»ƒ thiáº¿t láº­p chiá»u cao 100% theo `<transition-group>`, giÃºp pháº§n trÄƒm chiá»u cao cá»§a thanh cá»™t con Ä‘Æ°á»£c hiá»ƒn thá»‹ chÃ­nh xÃ¡c dá»±a trÃªn giÃ¡ trá»‹ cá»§a pháº§n tá»­.

### ðŸš¨ Lá»—i 120: VcrControlPanel Bá»‹ KÃ©o GiÃ£n DÃ i Táº¡o Khoáº£ng Tráº¯ng Lá»›n BÃªn Pháº£i (VcrControlPanel Empty Space Stretch)
*   **MÃ´ táº£:** Trong giao diá»‡n Sorting View, VcrControlPanel bá»‹ kÃ©o giÃ£n dÃ i xuá»‘ng sÃ¡t Ä‘Ã¡y mÃ n hÃ¬nh táº¡o ra má»™t vÃ¹ng Ä‘en trá»‘ng tráº£i lá»›n bÃªn dÆ°á»›i cÃ¡c nÃºt Ä‘iá»u khiá»ƒn.
*   **MÃ£ Lá»—i:** `ERR_VCR_CONTROL_PANEL_STRETCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** ThÃ¹ng chá»©a cha `<section>` sá»­ dá»¥ng bá»‘ cá»¥c flex-row nhÆ°ng khÃ´ng Ä‘á»‹nh nghÄ©a thuá»™c tÃ­nh `align-items`, dáº«n Ä‘áº¿n máº·c Ä‘á»‹nh lÃ  `items-stretch`. Khi Ä‘Ã³, `VcrControlPanel` (máº·c dÃ¹ cÃ³ class `h-fit`) bá»‹ Ã©p buá»™c kÃ©o giÃ£n chiá»u cao theo `ArrayBarVisualizer` vá»‘n chiáº¿m toÃ n bá»™ chiá»u cao mÃ n hÃ¬nh.
*   **CÃ¡ch kháº¯c phá»¥c:** ThÃªm class `lg:self-start` vÃ o `VcrControlPanel` trong `SortingView.vue`. Äiá»u nÃ y cáº¥u hÃ¬nh cho panel tá»± cÄƒn chá»‰nh theo vá»‹ trÃ­ báº¯t Ä‘áº§u (top) trÃªn mÃ n hÃ¬nh lá»›n thay vÃ¬ co giÃ£n, giá»¯ nguyÃªn chiá»u cao tá»± nhiÃªn cá»§a panel vÃ  loáº¡i bá» hoÃ n toÃ n khoáº£ng tráº¯ng dÆ° thá»«a.

### ðŸš¨ Lá»—i 121: PhÃ´ng Chá»¯ Trá»±c Quan HÃ³a Máº£ng KhÃ´ng Äá»“ng Bá»™ Vá»›i Há»‡ Thá»‘ng (Outfit Font Mismatch)
*   **MÃ´ táº£:** Chá»¯ sá»‘ trÃªn cÃ¡c cá»™t máº£ng trá»±c quan vÃ  tÃªn cÃ¡c con trá» vÃ²ng láº·p hiá»ƒn thá»‹ sai phÃ´ng chá»¯ (sá»­ dá»¥ng phÃ´ng 'Outfit') so vá»›i phÃ´ng chá»¯ 'Inter' chuáº©n há»‡ thá»‘ng.
*   **MÃ£ Lá»—i:** `ERR_SORTING_FONT_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** HÃ m váº½ canvas `renderArrayBar` vÃ  `renderLoopPointer` thiáº¿t láº­p font váº½ cá»©ng cÃ³ chá»©a phÃ´ng chá»¯ '"Outfit"', trong khi há»‡ thá»‘ng khÃ´ng náº¡p phÃ´ng chá»¯ nÃ y lÃ m phÃ´ng chá»¯ chÃ­nh.
*   **CÃ¡ch kháº¯c phá»¥c:** Thay tháº¿ chuá»—i Ä‘á»‹nh nghÄ©a font `'bold 18px "Outfit", "Inter", sans-serif'` vÃ  `'bold 11px "Outfit", "Inter", sans-serif'` thÃ nh phÃ´ng chá»¯ chuáº©n há»‡ thá»‘ng `'Inter', sans-serif` trong `renderArrayBar.ts` vÃ  `renderLoopPointer.ts`.

### ðŸš¨ Lá»—i 122: Thanh Cá»™t Trá»±c Quan HÃ³a Máº£ng QuÃ¡ Háº¹p TrÃªn MÃ n HÃ¬nh Rá»™ng (Array Bar Width Narrow Waste)
*   **MÃ´ táº£:** CÃ¡c thanh cá»™t biá»ƒu diá»…n giÃ¡ trá»‹ pháº§n tá»­ máº£ng vÃ  cÃ¡c nÃºt trong cÃ¡c giáº£i thuáº­t Heap/Radix/Merge/Quick Sort cÃ³ kÃ­ch thÆ°á»›c quÃ¡ nhá», táº¡o khoáº£ng trá»‘ng lá»›n vÃ´ Ã­ch trÃªn mÃ n hÃ¬nh rá»™ng cá»§a mÃ¡y tÃ­nh.
*   **MÃ£ Lá»—i:** `ERR_SORTING_BAR_NARROW_WASTE`
*   **NguyÃªn nhÃ¢n gá»‘c:** CÃ¡c biáº¿n chiá»u rá»™ng `barWidth`, `itemSize` vÃ  khoáº£ng cÃ¡ch `itemGap` Ä‘Æ°á»£c tÃ­nh toÃ¡n vá»›i giÃ¡ trá»‹ cá»©ng quÃ¡ nhá» (vÃ­ dá»¥ `48px`, `52px`) vá»‘n tá»‘i Æ°u cho mÃ n hÃ¬nh di Ä‘á»™ng nhÆ°ng quÃ¡ háº¹p trÃªn mÃ n hÃ¬nh mÃ¡y tÃ­nh lá»›n.
*   **CÃ¡ch kháº¯c phá»¥c:** TÄƒng kÃ­ch thÆ°á»›c rá»™ng vÃ  chiá»u cao Ä‘á»™ng cá»§a cÃ¡c cá»™t biá»ƒu diá»…n trong 5 visualizers (`BubbleSortVisualizer`, `QuickSortVisualizer`, `MergeSortVisualizer`, `HeapSortVisualizer`, `RadixSortVisualizer`) (vÃ­ dá»¥ tá»« `52px` lÃªn `88px`, tá»« `48px` lÃªn `80px` cho máº£ng nhá») Ä‘á»ƒ láº¥p Ä‘áº§y khÃ´ng gian hiá»ƒn thá»‹ vÃ  tÄƒng tÃ­nh tháº©m má»¹ trá»±c quan.

### ðŸš¨ Lá»—i 123: Khoáº£ng Trá»‘ng Lá»›n Trong Tab Quick Sort (Quick Sort Tab Empty Space Waste)
*   **MÃ´ táº£:** Tab Quick Sort chá»©a quÃ¡ nhiá»u khoáº£ng trá»‘ng mÃ u Ä‘en khÃ´ng sá»­ dá»¥ng á»Ÿ pháº§n dÆ°á»›i cá»§a Canvas Viewport trÃªn cÃ¡c mÃ n hÃ¬nh mÃ¡y tÃ­nh lá»›n.
*   **MÃ£ Lá»—i:** `ERR_QUICK_SORT_EMPTY_WASTE`
*   **NguyÃªn nhÃ¢n gá»‘c:** Bá»‘ cá»¥c ban Ä‘áº§u cá»§a Quick Sort chá»‰ hiá»ƒn thá»‹ hÃ ng máº£ng chÃ­nh vÃ  hÃ ng cÃ¡c phÃ¢n Ä‘oáº¡n con xáº¿p theo chiá»u ngang, cÃ³ tá»•ng chiá»u cao tháº¥p (~200px) trong khi khung chá»©a Viewport cÃ³ chiá»u cao co giÃ£n lá»›n (~500px+), táº¡o ra khoáº£ng trá»‘ng thá»«a thÃ£i lá»›n.
*   **CÃ¡ch kháº¯c phá»¥c:**
    1. Thiáº¿t káº¿ láº¡i pháº§n dÆ°á»›i cá»§a `QuickSortVisualizer.vue` thÃ nh má»™t Dashboard chia lÃ m 2 cá»™t: **Lomuto Partition Inspector** vÃ  **Partition Stack**.
    2. Ãp dá»¥ng cÆ¡ cháº¿ Flexbox `flex-1 min-h-0` cho thÃ¹ng chá»©a Dashboard vÃ  cÃ¡c danh sÃ¡ch bÃªn trong (`LomutoInspector` vÃ  `PartitionStack`) Ä‘á»ƒ chÃºng tá»± Ä‘á»™ng co giÃ£n kÃ©o dÃ i láº¥p Ä‘áº§y 100% chiá»u cao thá»«a cÃ²n láº¡i cá»§a viewport.
    3. TÃ¡ch nhá» `QuickSortVisualizer.vue` thÃ nh 2 sub-components con `LomutoInspector.vue` vÃ  `PartitionStack.vue` Ä‘á»ƒ tá»‘i Æ°u hÃ³a cáº¥u trÃºc code, tÄƒng kháº£ nÄƒng báº£o trÃ¬.

### ðŸš¨ Lá»—i 124: Thiáº¿u Minh Há»a Chia Äá»ƒ Trá»‹ Trá»±c Quan Trong Merge Sort (Merge Sort UX Recursion Deficiency)
*   **MÃ´ táº£:** Trá»±c quan hÃ³a Merge Sort trÆ°á»›c Ä‘Ã¢y chá»‰ hiá»ƒn thá»‹ máº£ng chÃ­nh vÃ  má»™t danh sÃ¡ch stack pháº³ng má» nháº¡t, khiáº¿n ngÆ°á»i dÃ¹ng khÃ´ng thá»ƒ tháº¥y cáº¥u trÃºc cÃ¢y Ä‘á»‡ quy chia Ä‘Ã´i máº£ng hoáº·c sá»± khÃ¡c biá»‡t rÃµ rá»‡t giá»¯a hai pha chia (Split) vÃ  gá»™p (Merge).
*   **MÃ£ Lá»—i:** `ERR_MERGE_SORT_UX_DEFICIENCY`
*   **NguyÃªn nhÃ¢n gá»‘c:** Thuáº­t toÃ¡n Ä‘á»‡ quy Merge Sort cÃ³ báº£n cháº¥t lÃ  phÃ¢n rÃ£ máº£ng thÃ nh cÃ¢y nhá»‹ phÃ¢n (Recursion Tree), nhÆ°ng thiáº¿t káº¿ cÅ© chá»‰ hiá»ƒn thá»‹ cÃ¡c phÃ¢n Ä‘oáº¡n theo dáº¡ng stack dá»c pháº³ng, khÃ´ng cÄƒn chá»‰nh vá»‹ trÃ­ ngang (`left`, `width`) tÆ°Æ¡ng á»©ng vá»›i vá»‹ trÃ­ thá»±c táº¿ cá»§a máº£ng cha, gÃ¢y máº¥t phÆ°Æ¡ng hÆ°á»›ng dÃ²ng cháº£y thuáº­t toÃ¡n.
*   **CÃ¡ch kháº¯c phá»¥c:**
    1. Thiáº¿t káº¿ láº¡i `MergeSortVisualizer.vue` Ä‘á»ƒ hiá»ƒn thá»‹ cÃ¢y Ä‘á»‡ quy hoÃ n chá»‰nh (Recursion Tree). CÃ¡c node con á»Ÿ cáº¥p Ä‘á»™ sÃ¢u hÆ¡n Ä‘Æ°á»£c cÄƒn chá»‰nh vá»‹ trÃ­ ngang chÃ­nh xÃ¡c theo tá»· lá»‡ pháº§n trÄƒm (`left`, `width`) cá»§a phÃ¢n Ä‘oáº¡n cha mÃ  chÃºng Ä‘Æ°á»£c chia ra.
    2. Táº¡o sub-component má»›i `MergeInspector.vue` gáº¯n á»Ÿ gÃ³c pháº£i/dÆ°á»›i Ä‘á»ƒ theo dÃµi chi tiáº¿t pha so sÃ¡nh tá»«ng pháº§n tá»­ `L[i]` vÃ  `R[j]` vÃ  quÃ¡ trÃ¬nh ghi Ä‘Ã¨ máº£ng chÃ­nh táº¡i con trá» `k`.
    3. ThÃªm banner ká»ƒ chuyá»‡n (storytelling subtitle) chá»‰ rÃµ tráº¡ng thÃ¡i Ä‘á»‡ quy (Split hay Merge), Ä‘á»“ng thá»i Ä‘Ã¡nh dáº¥u nhÃ£n má»©c Ä‘á»™ Ä‘á»‡ quy (Level 0, 1, 2...) á»Ÿ cáº¡nh trÃ¡i Ä‘á»ƒ tÄƒng tÃ­nh trá»±c quan.

### ðŸš¨ Lá»—i 125: Hoáº¡t áº¢nh Trá»™n Merge Sort Bá»‹ Khá»±ng VÃ  Bá» SÃ³t Táº§ng CÆ¡ Sá»Ÿ (Merge Sort Stuttering & Leaf Base Case Skip)
*   **MÃ´ táº£:** 
    1. Hoáº¡t áº£nh chuyá»ƒn Ä‘á»•i giÃ¡ trá»‹ (swap/overwrite) trong cÃ¢y Ä‘á»‡ quy cá»§a Merge Sort bá»‹ khá»±ng, xÃ© hÃ¬nh vÃ  nháº£y loáº¡n xáº¡ khi ghi Ä‘Ã¨ pháº§n tá»­.
    2. Tiáº¿n trÃ¬nh Ä‘á»‡ quy khÃ´ng thá»ƒ hiá»‡n viá»‡c Ä‘i xuá»‘ng táº§ng cÆ¡ sá»Ÿ (táº§ng chá»©a cÃ¡c máº£ng con 1 pháº§n tá»­ - Táº§ng 3), mÃ  nháº£y trá»±c tiáº¿p tá»« viá»‡c chia Ä‘oáº¡n á»Ÿ táº§ng 2 sang trá»™n cÃ¡c pháº§n tá»­.
*   **MÃ£ Lá»—i:** `ERR_MERGE_SORT_STUTTER_AND_SKIP`
*   **NguyÃªn nhÃ¢n gá»‘c:**
    1. Trong component `MergeSortVisualizer.vue`, tháº» `<transition-group>` sá»­ dá»¥ng khÃ³a Ä‘á»™ng `:key="getItemAt(sub.start + idx - 1)?.id"`. Khi giÃ¡ trá»‹ máº£ng bá»‹ ghi Ä‘Ã¨, `enrichFramesWithIds` thay Ä‘á»•i ID cá»§a pháº§n tá»­ theo giÃ¡ trá»‹ má»›i, khiáº¿n Vue hiá»ƒu sai thá»© tá»± pháº§n tá»­ bá»‹ há»§y/táº¡o má»›i vÃ  sinh hoáº¡t áº£nh dá»‹ch chuyá»ƒn lá»—i.
    2. Trong `mergeSort.ts`, Ä‘iá»u kiá»‡n dá»«ng Ä‘á»‡ quy `if (left >= right) return` láº­p tá»©c tráº£ vá» mÃ  khÃ´ng phÃ¡t (`emit`) báº¥t ká»³ frame tráº¡ng thÃ¡i nÃ o cho cÃ¡c máº£ng con kÃ­ch thÆ°á»›c 1, lÃ m biáº¿n máº¥t bÆ°á»›c trá»±c quan táº¡i táº§ng cÆ¡ sá»Ÿ.
*   **CÃ¡ch kháº¯c phá»¥c:**
    1. Thay tháº¿ khÃ³a `:key` cá»§a cÃ¡c pháº§n tá»­ trong cÃ¢y thÃ nh chá»‰ sá»‘ máº£ng á»•n Ä‘á»‹nh `sub.start + idx - 1`. Äiá»u nÃ y giÃºp Vue tÃ¡i sá»­ dá»¥ng DOM node cÅ© khi giÃ¡ trá»‹ thay Ä‘á»•i, Ä‘á»“ng thá»i Ã¡p dá»¥ng hiá»‡u á»©ng chuyá»ƒn Ä‘á»•i mÆ°á»£t mÃ .
    2. ThÃªm lá»›p hoáº¡t áº£nh tÃ¹y biáº¿n `@keyframes pop-flash` vÃ  lá»›p CSS `.animate-pop-flash` Ä‘á»ƒ táº¡o hiá»‡u á»©ng phÃ¬nh to (`scale(1.12)`) vÃ  phÃ¡t sÃ¡ng khi ghi Ä‘Ã¨.
    3. Cáº­p nháº­t hÃ m `mergeSort` trong `mergeSort.ts` phÃ¡t má»™t frame tráº¡ng thÃ¡i khi Ä‘áº¡t `left >= right` Ä‘á»ƒ lÃ m ná»•i báº­t (active) máº£ng con Ä‘Æ¡n tá»­ á»Ÿ táº§ng dÆ°á»›i cÃ¹ng.
    4. Cáº£i thiá»‡n lá»›p phá»§ subarray (`getSubarrayClass` vÃ  `getItemClass`) Ä‘á»ƒ highlight ná»•i báº­t mÃ u há»• phÃ¡ch (Amber) cho cÃ¡c pháº§n tá»­ so sÃ¡nh thuá»™c máº£ng con Ä‘ang trá»™n (`isChildOfActive`).

### ðŸš¨ Lá»—i 126: CÃ¡c Táº§ng Cá»§a CÃ¢y Äá»‡ Quy Merge Sort Bá»‹ Co RÃºt VÃ  ÄÃ¨ LÃªn Nhau (Merge Sort Recursion Tree Height Collapse)
*   **MÃ´ táº£:** CÃ¡c táº§ng cá»§a cÃ¢y Ä‘á»‡ quy trong `MergeSortVisualizer.vue` (Táº§ng 0, Táº§ng 1, Táº§ng 2, Táº§ng 3) bá»‹ co rÃºt chiá»u cao Ä‘á»™t ngá»™t vÃ  Ä‘Ã¨ lÃªn nhau, lÃ m cÃ¡c há»™p pháº§n tá»­ máº£ng vÃ  Ä‘Æ°á»ng káº» phÃ¢n chia cáº¯t chÃ©o lung tung.
*   **MÃ£ Lá»—i:** `ERR_MERGE_SORT_TREE_COLLAPSE`
*   **NguyÃªn nhÃ¢n gá»‘c:** Má»—i táº§ng máº£ng Ä‘Æ°á»£c bá»c trong má»™t container `div` cÃ³ chiá»u cao cá»‘ Ä‘á»‹nh `h-[96px]`. Tuy nhiÃªn, vÃ¬ container cha cÃ³ thuá»™c tÃ­nh `flex flex-col` vÃ  khÃ´ng gian dá»c háº¡n cháº¿, cÃ¡c pháº§n tá»­ con máº·c Ä‘á»‹nh cÃ³ `flex-shrink: 1` sáº½ tá»± Ä‘á»™ng bá»‹ co rÃºt kÃ­ch thÆ°á»›c xuá»‘ng dÆ°á»›i 96px Ä‘á»ƒ Ã©p vá»«a khung hiá»ƒn thá»‹, gÃ¢y ra trÃ n ná»™i dung vÃ  Ä‘Ã¨ chá»“ng lÃªn nhau.
*   **CÃ¡ch kháº¯c phá»¥c:** ThÃªm class `shrink-0` (thiáº¿t láº­p `flex-shrink: 0`) vÃ o container cá»§a tá»«ng táº§ng Ä‘á»‡ quy trong `MergeSortVisualizer.vue` Ä‘á»ƒ Ä‘áº£m báº£o chÃºng luÃ´n duy trÃ¬ chiá»u cao thiáº¿t káº¿ `96px` vÃ  kÃ­ch hoáº¡t thanh cuá»™n dá»c `overflow-y-auto` cá»§a container cha khi cáº§n thiáº¿t.

### ðŸš¨ Lá»—i 127: CÃ¡c Táº§ng Cá»§a CÃ¢y Äá»‡ Quy Merge Sort Váº«n Bá»‹ ÄÃ¨ LÃªn Nhau Do Container Tree View Bá»‹ Flex Co RÃºt (Merge Sort Recursion Tree Parent Flex Collapse)
*   **MÃ´ táº£:** Máº·c dÃ¹ Ä‘Ã£ thÃªm `shrink-0` vÃ o tá»«ng táº§ng, cÃ¡c táº§ng cá»§a cÃ¢y Ä‘á»‡ quy trong `MergeSortVisualizer.vue` váº«n tiáº¿p tá»¥c bá»‹ Ä‘Ã¨ lÃªn nhau theo chiá»u dá»c trÃªn trÃ¬nh duyá»‡t, khÃ´ng hiá»ƒn thá»‹ thanh cuá»™n dá»c riÃªng biá»‡t.
*   **MÃ£ Lá»—i:** `ERR_MERGE_SORT_TREE_FLEX_COLLAPSE`
*   **NguyÃªn nhÃ¢n gá»‘c:** Container cha bá»c cÃ¢y Ä‘á»‡ quy (`Tree View`) sá»­ dá»¥ng class `flex-[60] min-h-0` vÃ  khÃ´ng cÃ³ `shrink-0`. Khi chiá»u cao toÃ n cá»¥c cá»§a `MergeSortVisualizer` bá»‹ giá»›i háº¡n (do Canvas container bÃªn ngoÃ i), vÃ  component `MergeInspector` á»Ÿ dÆ°á»›i cÃ³ `shrink-0` chiáº¿m háº¿t khÃ´ng gian dá»c (khoáº£ng 350px+), flex engine buá»™c pháº£i co rÃºt chiá»u cao cá»§a `Tree View` vá» `0px`. VÃ¬ cÃ¡c táº§ng con cÃ³ chiá»u cao cá»‘ Ä‘á»‹nh `96px` vÃ  khÃ´ng cÃ³ `overflow-hidden` á»Ÿ táº§ng, chÃºng trÃ n ra ngoÃ i container 0px Ä‘Ã³ vÃ  hiá»ƒn thá»‹ chá»“ng chÃ©o lÃªn nhau táº¡i cÃ¹ng má»™t tá»a Ä‘á»™ hiá»ƒn thá»‹.
*   **CÃ¡ch kháº¯c phá»¥c:** Loáº¡i bá» phÃ¢n phá»‘i tá»· lá»‡ `flex-[60] min-h-0` cá»§a `Tree View` vÃ  `flex-[40] min-h-0` cá»§a `Merge Inspector`, Ä‘á»“ng thá»i gá»¡ bá» `overflow-y-auto` trÃªn `Tree View`. Thiáº¿t láº­p class `shrink-0` cho cáº£ hai container nÃ y Ä‘á»ƒ chÃºng hiá»ƒn thá»‹ theo chiá»u cao tá»± nhiÃªn. Nhá» váº­y, container gá»‘c cá»§a `MergeSortVisualizer` (Ä‘Ã£ cÃ³ class `overflow-y-auto`) sáº½ tá»± Ä‘á»™ng quáº£n lÃ½ thanh cuá»™n dá»c duy nháº¥t mÆ°á»£t mÃ  cho toÃ n bá»™ giao diá»‡n, trÃ¡nh hiá»‡n tÆ°á»£ng co rÃºt vÃ  chá»“ng láº¥n.










### ðŸš¨ Lá»—i 128: Lá»‡ch MÅ©i TÃªn Chá»‰ Há»™p VÃ  Giáº­t Hoáº¡t áº¢nh Thu Hoáº¡ch Radix Sort (Radix Sort Arrow Misalignment & Collect Animation Stutter)
*   **MÃ´ táº£:** MÅ©i tÃªn SVG bá»‹ lá»‡ch nháº¹ so vá»›i tÃ¢m Ã´/bucket do chÃªnh lá»‡ch CSS grid gap/flexbox padding. Hoáº¡t áº£nh thu hoáº¡ch tá»« bucket vá» máº£ng bá»‹ giáº­t ngang vÃ  xÃ© hÃ¬nh.
*   **MÃ£ Lá»—i:** `ERR_RADIX_ARROW_MISALIGN_STUTTER`
*   **NguyÃªn nhÃ¢n gá»‘c:**
    1. Viá»‡c tÃ­nh tá»a Ä‘á»™ theo cÃ´ng thá»©c tá»· lá»‡ `(idx + 0.5) / n` bá» qua kÃ­ch thÆ°á»›c cá»§a cÃ¡c khoáº£ng trá»‘ng gap khÃ¡c nhau trong Grid vÃ  Flexbox.
    2. Viá»‡c trÆ°á»£t cÃ¡c pháº§n tá»­ máº£ng chÆ°a thu hoáº¡ch á»Ÿ cuá»‘i máº£ng táº¡o ra hiá»‡u á»©ng chuyá»ƒn Ä‘á»™ng ngang khÃ´ng mong muá»‘n cá»§a `transition-group`.
*   **CÃ¡ch kháº¯c phá»¥c:**
    1. Äo tá»a Ä‘á»™ pixel thá»±c táº¿ cá»§a cÃ¡c Ã´ Ä‘ang active báº±ng `getBoundingClientRect()` rá»“i map ngÆ°á»£c láº¡i scale `0..1000`.
    2. Che máº·t náº¡ cÃ¡c pháº§n tá»­ chÆ°a thu hoáº¡ch dÆ°á»›i dáº¡ng cÃ¡c Ã´ trá»‘ng nÃ©t Ä‘á»©t (placeholder) Ä‘á»ƒ cá»‘ Ä‘á»‹nh cá»™t vÃ  chá»‰ tiáº¿t lá»™ giÃ¡ trá»‹ dáº§n dáº§n khi thu há»“i tá»« bucket.

### ðŸš¨ Lá»—i 129: Lá»—i Hardcode Bubble Sort Cho Counting/Bucket Sort (Sorting detail HUD title bug)
*   **MÃ´ táº£:** Khi chá»n giáº£i thuáº­t Counting Sort hoáº·c Bucket Sort trong tab Sandbox, giao diá»‡n HUD Info bÃªn pháº£i luÃ´n hiá»ƒn thá»‹ cá»©ng tÃªn "Sáº¯p xáº¿p ná»•i bá»t (Bubble Sort)" thay vÃ¬ hiá»ƒn thá»‹ tÃªn vÃ  mÃ´ táº£ Ä‘Ãºng giáº£i thuáº­t.
*   **MÃ£ Lá»—i:** `ERR_HUD_HARDCODED_ALGORITHM_METADATA`
*   **NguyÃªn nhÃ¢n gá»‘c:** `SortingDetailPanel.vue` chá»‰ Ä‘á»‹nh nghÄ©a metadata Ä‘á»™ phá»©c táº¡p cho 5 thuáº­t toÃ¡n cÆ¡ báº£n (`bubble`, `quick`, `merge`, `heap`, `radix`). Khi gáº·p giÃ¡ trá»‹ `counting` hoáº·c `bucket`, hÃ m fallback `algoMetadata[algo] || algoMetadata.bubble` tá»± Ä‘á»™ng tráº£ vá» metadata cá»§a Bubble Sort.
*   **CÃ¡ch kháº¯c phá»¥c:** Cáº­p nháº­t `algoMetadata` trong `SortingDetailPanel.vue` bá»• sung Ä‘áº§y Ä‘á»§ metadata há»c thuáº­t chi tiáº¿t cho cáº£ `counting` vÃ  `bucket`, Ä‘á»“ng thá»i xÃ¢y dá»±ng cÃ¡c live variable template hiá»ƒn thá»‹ riÃªng biá»‡t thÃ´ng tin chi tiáº¿t tá»«ng pha cho 2 thuáº­t toÃ¡n nÃ y.


### ðŸš¨ Lá»—i 130: Lá»—i Mismatch Catalog Khi Cháº¡y So SÃ¡nh Thuáº­t ToÃ¡n (Compare Algorithms Store Test Failure)
*   **MÃ´ táº£:** Bá»™ kiá»ƒm thá»­ `useCompareAlgorithmsStore.spec.ts` bá»‹ lá»—i fail 6 test cases do khÃ´ng thá»ƒ phÃ¢n giáº£i tÃªn thuáº­t toÃ¡n `bubble-sort` / `selection-sort` vÃ  khÃ´ng sinh Ä‘Æ°á»£c frame nÃ o (chá»‰ cÃ³ 1 frame fallback).
*   **MÃ£ Lá»—i:** `ERR_COMPARE_STORE_CATALOG_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** `useCompareAlgorithmsStore.ts` sá»­ dá»¥ng `ALGORITHM_CATALOG` cá»§a `dsa-modules` vá»‘n chá»‰ giá»›i háº¡n 10 thuáº­t toÃ¡n searching/tree/stack-queue Ä‘á»ƒ tuÃ¢n thá»§ kiá»ƒm thá»­ nghiÃªm ngáº·t. Khi cháº¡y so sÃ¡nh thuáº­t toÃ¡n sáº¯p xáº¿p (sorting), há»‡ thá»‘ng khÃ´ng phÃ¢n giáº£i Ä‘Æ°á»£c tÃªn vÃ  Ä‘á»™ phá»©c táº¡p, Ä‘á»“ng thá»i `dummyGenerators.ts` khÃ´ng Ä‘Äƒng kÃ½ cÃ¡c mÃ¡y phÃ¡t hoáº¡t áº£nh sorting.
*   **CÃ¡ch kháº¯c phá»¥c:** 
    1. Tráº£ láº¡i `ALGORITHM_CATALOG` vá» Ä‘Ãºng 10 pháº§n tá»­ gá»‘c Ä‘á»ƒ báº£o toÃ n 100% káº¿t quáº£ cho `dsa-modules` test suite.
    2. ÄÄƒng kÃ½ Ä‘áº§y Ä‘á»§ 5 thuáº­t toÃ¡n sáº¯p xáº¿p (`bubble-sort`, `selection-sort`, `insertion-sort`, `quick-sort`, `merge-sort`) vÃ o `GENERATORS` cá»§a [dummyGenerators.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/dummyGenerators.ts).
    3. Äá»‹nh nghÄ©a má»™t báº£ng tra cá»©u cá»¥c bá»™ `SORTING_ALGS` ngay trong [useCompareAlgorithmsStore.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/compare-algorithms/store/useCompareAlgorithmsStore.ts) Ä‘á»ƒ phÃ¢n giáº£i thÃ´ng tin sorting má»™t cÃ¡ch Ä‘á»™c láº­p vÃ  an sau.

### ðŸš¨ Lá»—i 131: Lá»‡ch Bá»‘ Cá»¥c VÃ  Render Máº£ng Sai TrÃªn Giao Diá»‡n Graph Sandbox (Graph Sandbox Array Render Bug)
*   **MÃ´ táº£:** Trong giao diá»‡n Graph Sandbox, khung Viewport bÃªn trÃ¡i hiá»ƒn thá»‹ thanh biá»ƒu Ä‘á»“ máº£ng (Array Bar) cá»§a thuáº­t toÃ¡n sáº¯p xáº¿p thay vÃ¬ hiá»ƒn thá»‹ Ä‘á»“ thá»‹ tÆ°Æ¡ng tÃ¡c, Ä‘á»“ng thá»i báº£ng nháº­p dá»¯ liá»‡u tÃ¹y biáº¿n á»Ÿ bÃªn pháº£i hiá»ƒn thá»‹ dÆ° thá»«a tab váº½ Ä‘á»“ thá»‹ nhá».
*   **MÃ£ Lá»—i:** `ERR_GRAPH_SANDBOX_ARRAY_RENDER_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** `GraphView.vue` trÆ°á»›c Ä‘Ã³ sá»­ dá»¥ng component `AlgorithmCanvas` (vá»‘n Ä‘Æ°á»£c thiáº¿t káº¿ cá»©ng Ä‘á»ƒ váº½ cÃ¡c cá»™t máº£ng sáº¯p xáº¿p dá»±a trÃªn `vcrStore`) vÃ  `CustomInputPanel` (cÃ³ chá»©a tab váº½ Ä‘á»“ thá»‹ mini `GraphPlayground`). Äiá»u nÃ y táº¡o ra sá»± lá»‡ch pha nghiÃªm trá»ng giá»¯a viewport chÃ­nh vÃ  báº£ng Ä‘iá»u khiá»ƒn dá»¯ liá»‡u.
*   **CÃ¡ch kháº¯c phá»¥c:**
    1. Thay tháº¿ `AlgorithmCanvas` trÃªn viewport trÃ¡i báº±ng component Ä‘á»“ thá»‹ tÆ°Æ¡ng tÃ¡c cao cáº¥p `InteractivePlayground` láº¥y tá»« `features/interactive-playground`.
    2. Loáº¡i bá» hoÃ n toÃ n tab switcher vÃ  canvas váº½ mini trong `CustomInputPanel.vue` Ä‘á»ƒ chá»‰ giá»¯ láº¡i giao diá»‡n náº¡p vÄƒn báº£n `TextDataInput` tinh gá»n á»Ÿ cá»™t bÃªn pháº£i.
    3. XÃ¢y dá»±ng cÆ¡ cháº¿ Ä‘á»“ng bá»™ hÃ³a 2 chiá»u (Bidirectional Watchers) trong `CustomInputPanel.vue` giá»¯a chuá»—i adjacency list (`graphInputText`) vÃ  Pinia store `usePlaygroundStore` (quáº£n lÃ½ tá»a Ä‘á»™ Ä‘á»‰nh vÃ  liÃªn káº¿t lÃ² xo váº­t lÃ½), giÃºp viá»‡c váº½ trÃªn canvas trÃ¡i láº­p tá»©c cáº­p nháº­t vÄƒn báº£n á»Ÿ cá»™t pháº£i vÃ  ngÆ°á»£c láº¡i.
    4. Gá»¡ bá» Sandbox Ä‘á»™c láº­p khá»i sidebar trong [appTabs.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/appTabs.ts) vÃ  [routes.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/router/routes.ts) Ä‘á»ƒ há»£p nháº¥t hoÃ n toÃ n vÃ o trang Graph.

### ðŸš¨ Lá»—i 132: GÃ³i Tin Máº¡ng LÆ°á»›t Qua MÃ n HÃ¬nh Trong 2 Frame (~32ms) â€” System Design Viz (BUG-SD-4)
*   **MÃ´ táº£:** Trong `SystemDesignWorkspace.vue`, vÃ²ng láº·p mÃ´ phá»ng rAF tÃ­nh `delta = time - lastTime` tráº£ vá» giÃ¡ trá»‹ tÃ­nh báº±ng mili-giÃ¢y (~16ms/frame). GiÃ¡ trá»‹ nÃ y Ä‘Æ°á»£c truyá»n tháº³ng vÃ o `store.tickEngine(delta)` rá»“i nhÃ¢n vá»›i `PACKET_SPEED = 0.05`, khiáº¿n `progress += 16 * 0.05 = 0.8` má»—i frame. Káº¿t quáº£: gÃ³i tin Ä‘áº¡t `progress >= 1.0` sau chá»‰ 2 frame (~32ms), di chuyá»ƒn quÃ¡ nhanh Ä‘á»ƒ máº¯t ngÆ°á»i quan sÃ¡t ká»‹p nhÃ¬n tháº¥y.
*   **MÃ£ Lá»—i:** `ERR_SYSDESIGN_DELTA_UNIT_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** `performance.now()` tráº£ vá» mili-giÃ¢y nhÆ°ng cÃ´ng thá»©c `p.progress += deltaTime * PACKET_SPEED` giáº£ Ä‘á»‹nh `deltaTime` tÃ­nh báº±ng giÃ¢y.
*   **CÃ¡ch kháº¯c phá»¥c:** Chuáº©n hÃ³a `deltaTime` sang giÃ¢y báº±ng cÃ¡ch chia cho 1000 trÆ°á»›c khi truyá»n vÃ o engine: `const delta = (time - lastTime) / 1000;`. File sá»­a: `SystemDesignWorkspace.vue` dÃ²ng 25.

### ðŸš¨ Lá»—i 133: BÆ°á»›c INSTANTIATE Trong Ká»‹ch Báº£n OOP XÃ³a Sáº¡ch Heap Má»—i Láº§n Táº¡o Äá»‘i TÆ°á»£ng (BUG-OOP-3)
*   **MÃ´ táº£:** Trong `useOOPVisualizerStore.ts`, handler cho `step.actionName === 'INSTANTIATE'` chá»©a lá»‡nh `heapObjects.value = []` xÃ³a toÃ n bá»™ Heap trÆ°á»›c khi táº¡o Ä‘á»‘i tÆ°á»£ng má»›i. Äiá»u nÃ y khiáº¿n má»i ká»‹ch báº£n Ä‘a Ä‘á»‘i tÆ°á»£ng bá»‹ há»ng â€” khi bÆ°á»›c INSTANTIATE thá»© hai Ä‘Æ°á»£c thá»±c thi, Ä‘á»‘i tÆ°á»£ng Ä‘áº§u tiÃªn bá»‹ xÃ³a máº¥t.
*   **MÃ£ Lá»—i:** `ERR_OOP_INSTANTIATE_HEAP_WIPE`
*   **NguyÃªn nhÃ¢n gá»‘c:** Logic scenario step handler gá»™p chung viá»‡c reset heap vÃ o má»—i bÆ°á»›c INSTANTIATE thay vÃ¬ chá»‰ thá»±c hiá»‡n á»Ÿ bÆ°á»›c RESET/CLONE_MEMBERS.
*   **CÃ¡ch kháº¯c phá»¥c:** XÃ³a dÃ²ng `heapObjects.value = [];` khá»i nhÃ¡nh `INSTANTIATE`, chá»‰ giá»¯ láº¡i viá»‡c táº¡o Ä‘á»‘i tÆ°á»£ng má»›i qua `instantiateNewObject()`. Heap chá»‰ Ä‘Æ°á»£c xÃ³a á»Ÿ cÃ¡c bÆ°á»›c RESET vÃ  CLONE_MEMBERS. File sá»­a: `useOOPVisualizerStore.ts` dÃ²ng 374.

### ðŸš¨ Lá»—i 134: Äá»™ng CÆ¡ KhÃ³i Sá»± Cá»‘ Server KhÃ´ng ÄÆ°á»£c Render â€” System Design Viz (BUG-SD-1)
*   **MÃ´ táº£:** `FailureSmokeEmitterEngine.ts` Ä‘Æ°á»£c triá»ƒn khai Ä‘áº§y Ä‘á»§ nhÆ°ng khÃ´ng cÃ³ Vue component nÃ o render canvas cho nÃ³. Store dispatch `CustomEvent('SERVER_FAILED_SMOKE_BURST')` Ä‘áº¿n `window` khi server fail, nhÆ°ng khÃ´ng cÃ³ listener xá»­ lÃ½ â€” hiá»‡u á»©ng khÃ³i hoÃ n toÃ n cháº¿t.
*   **MÃ£ Lá»—i:** `ERR_SYSDESIGN_SMOKE_NOT_WIRED`
*   **NguyÃªn nhÃ¢n gá»‘c:** Thiáº¿u component Vue overlay káº¿t ná»‘i engine particle vá»›i canvas rendering. NgoÃ i ra, engine khÃ´ng cÃ³ giá»›i háº¡n sá»‘ lÆ°á»£ng particle â†’ nguy cÆ¡ trÃ n bá»™ nhá»› (MEM-SD-1).
*   **CÃ¡ch kháº¯c phá»¥c:** Táº¡o component `FailureSmokeOverlay.vue` vá»›i canvas overlay `pointer-events: none` trÃªn `.architecture-canvas`. Component láº¯ng nghe `SERVER_FAILED_SMOKE_BURST`, táº¡o instance `FailureSmokeEmitterEngine` cho má»—i node bá»‹ lá»—i, render particle lÃªn canvas chung. Ãp dá»¥ng `MAX_PARTICLES = 200` cap Ä‘á»ƒ trÃ¡nh trÃ n bá»™ nhá»›. Mount vÃ o `SystemDesignWorkspace.vue`. File táº¡o má»›i: `FailureSmokeOverlay.vue`. File sá»­a: `SystemDesignWorkspace.vue`.

### ðŸš¨ Lá»—i 135: Kiá»ƒu `any` Trong actionPayload Scenario OOP â€” OOP Viz (BUG-OOP-1)
*   **MÃ´ táº£:** `ScenarioStep.actionPayload` Ä‘Æ°á»£c khai bÃ¡o lÃ  `any`, vi pháº¡m quy táº¯c sáº¯t "nÃ³i khÃ´ng vá»›i `any`". TrÃ¬nh biÃªn dá»‹ch TypeScript khÃ´ng thá»ƒ kiá»ƒm tra tÃ­nh Ä‘Ãºng Ä‘áº¯n cá»§a cÃ¡c thuá»™c tÃ­nh payload (`className`, `memberName`, `methodName`, v.v.) táº¡i thá»i Ä‘iá»ƒm biÃªn dá»‹ch.
*   **MÃ£ Lá»—i:** `ERR_OOP_SCENARIO_ANY_TYPE`
*   **NguyÃªn nhÃ¢n gá»‘c:** `ScenarioStep` lÃ  interface Ä‘Æ¡n vá»›i `actionPayload?: any` thay vÃ¬ discriminated union dá»±a trÃªn `actionName`.
*   **CÃ¡ch kháº¯c phá»¥c:** Thay tháº¿ hoÃ n toÃ n báº±ng discriminated union type `ScenarioStep` vá»›i 7 variant (`ResetStep`, `InstantiateStep`, `CallMethodStep`, `ViolateAccessStep`, `ValidateSetterStep`, `CloneMembersStep`, `ShowAbstractErrorStep`). Má»—i variant cÃ³ `actionPayload` Ä‘Æ°á»£c Ä‘á»‹nh kiá»ƒu cháº·t cháº½. Export thÃªm `ScenarioActionPayload` union type. File sá»­a: `oopScenarios.ts`.

### ðŸš¨ Lá»—i 136: requestCount Chá»‰ TÄƒng KhÃ´ng Giáº£m â€” System Design Viz (BUG-SD-3)
*   **MÃ´ táº£:** `requestCount` trÃªn node Ä‘Ã­ch Ä‘Æ°á»£c tÄƒng (`++`) khi packet Ä‘Æ°á»£c gá»­i tá»« Load Balancer, nhÆ°ng khÃ´ng bao giá» giáº£m khi packet Ä‘áº¿n Ä‘Ã­ch (`ARRIVED`) hoáº·c bá»‹ drop (`DROPPED`). Káº¿t quáº£: counter tÄƒng vÃ´ háº¡n, khÃ´ng pháº£n Ã¡nh sá»‘ request Ä‘ang hoáº¡t Ä‘á»™ng thá»±c táº¿.
*   **MÃ£ Lá»—i:** `ERR_SYSDESIGN_REQUESTCOUNT_NO_DECREMENT`
*   **NguyÃªn nhÃ¢n gá»‘c:** Thiáº¿u logic decrement trong `updatePacketsProgress()` táº¡i cáº£ hai nhÃ¡nh xá»­ lÃ½ ARRIVED vÃ  DROPPED.
*   **CÃ¡ch kháº¯c phá»¥c:** ThÃªm `target.requestCount = Math.max(0, target.requestCount - 1)` táº¡i cáº£ hai nhÃ¡nh: khi packet status chuyá»ƒn sang `DROPPED` (server FAILED) vÃ  khi `progress >= 1.0` (ARRIVED). DÃ¹ng `Math.max(0, ...)` Ä‘á»ƒ trÃ¡nh giÃ¡ trá»‹ Ã¢m. File sá»­a: `SystemDesignEngine.ts`.

### ðŸš¨ Lá»—i 137: SVG stroke-dasharray Sai CÃº PhÃ¡p â€” OOP Viz (BUG-SVG-1)
*   **MÃ´ táº£:** Thuá»™c tÃ­nh `stroke-dasharray="4_4"` trong SVG connector giá»¯a Shape vÃ  Circle sá»­ dá»¥ng dáº¥u gáº¡ch dÆ°á»›i (`_`) thay vÃ¬ dáº¥u cÃ¡ch (` `) â€” cÃº phÃ¡p khÃ´ng há»£p lá»‡ theo SVG spec. TrÃ¬nh duyá»‡t bá» qua giÃ¡ trá»‹ nÃ y, Ä‘Æ°á»ng káº» hiá»ƒn thá»‹ liá»n thay vÃ¬ Ä‘á»©t Ä‘oáº¡n.
*   **MÃ£ Lá»—i:** `ERR_OOP_SVG_DASHARRAY_SYNTAX`
*   **NguyÃªn nhÃ¢n gá»‘c:** Lá»—i Ä‘Ã¡nh mÃ¡y trong template Vue.
*   **CÃ¡ch kháº¯c phá»¥c:** Äá»•i `stroke-dasharray="4_4"` thÃ nh `stroke-dasharray="4 4"`. File sá»­a: `OOPConceptsVisualizerWorkspace.vue` dÃ²ng 63.

### ðŸš¨ Lá»—i 138: requestCount KhÃ´ng Cáº­p Nháº­t UI â€” System Design Viz (BUG-SD-REACTIVITY)
*   **MÃ´ táº£:** TrÆ°á»ng `requestCount` trÃªn tháº» `SystemNodeCard` (`"X req"`) khÃ´ng cáº­p nháº­t trong giao diá»‡n Vue khi engine thay Ä‘á»•i giÃ¡ trá»‹. Engine mutate trá»±c tiáº¿p cÃ¡c raw JavaScript objects, bypass hoÃ n toÃ n há»‡ thá»‘ng Proxy reactivity cá»§a Vue 3. HÃ m `syncPackets()` chá»‰ Ä‘á»“ng bá»™ máº£ng packets, khÃ´ng Ä‘á»“ng bá»™ tráº¡ng thÃ¡i nodes.
*   **MÃ£ Lá»—i:** `ERR_SYSDESIGN_NODE_REACTIVITY_GAP`
*   **NguyÃªn nhÃ¢n gá»‘c:** Engine lÆ°u trá»¯ raw object references qua `registerNode()`. Khi engine gá»i `targetServer.requestCount++` hoáº·c `requestCount--`, nÃ³ mutate object gá»‘c trá»±c tiáº¿p â€” Vue 3 Proxy chá»‰ phÃ¡t hiá»‡n thay Ä‘á»•i khi setter Ä‘Æ°á»£c gá»i qua Proxy, khÃ´ng pháº£i qua raw object.
*   **CÃ¡ch kháº¯c phá»¥c:** ThÃªm hÃ m `syncNodes()` sá»­ dá»¥ng `triggerRef(nodes)` tá»« Vue 3 Ä‘á»ƒ Ã©p Vue re-render khi node data thay Ä‘á»•i. Gá»i `syncNodes()` song song vá»›i `syncPackets()` táº¡i táº¥t cáº£ cÃ¡c Ä‘iá»ƒm mutation: `injectHttpRequest()`, `injectTrafficBurst()`, vÃ  `tickEngine()`. File sá»­a: `useSystemDesignStore.ts`.

### ðŸš€ Má»¥c 139: Phase 3 â€” Full-Stack Integration (System Design Frontend â†” Backend API)
*   **MÃ´ táº£:** Refactor `useSystemDesignStore.ts` Ä‘á»ƒ káº¿t ná»‘i frontend vá»›i backend API thay vÃ¬ dÃ¹ng topology hardcode vÃ  simulation thuáº§n client-side. ThÃªm cháº¿ Ä‘á»™ VCR playback cho ká»‹ch báº£n backend.
*   **MÃ£ Má»¥c:** `FEAT_SYSDESIGN_FULLSTACK_INTEGRATION`
*   **Thay Ä‘á»•i:**
    - Táº¡o `systemDesignApi.ts`: service layer gá»i `GET /topology`, `GET /scenarios`, `POST /execute`
    - ThÃªm `SystemDesignFrame` type map 1:1 vá»›i `SystemDesignFrameDto` (C#)
    - `initializeDemoTopology()` â†’ async, fetch topology tá»« `GET /api/v1/concepts/system-design/topology` vá»›i fallback hardcoded
    - ThÃªm `loadScenario(scenarioId)` â†’ `POST /execute` láº¥y máº£ng frames, Ã¡p dá»¥ng VCR playback
    - ThÃªm VCR controls: `nextFrame()`, `prevFrame()`, `resetFrames()`, `toggleAutoplay()`, `setPlaybackSpeed()`
    - `tickEngine()` bá» qua engine ticks trong VCR mode â€” state driven hoÃ n toÃ n bá»Ÿi frame data backend
    - `SystemDesignWorkspace.vue`: thÃªm Scenario Picker, VCR Playback Panel, Explanation Banner
    - Interactive sandbox mode váº«n hoáº¡t Ä‘á»™ng khi khÃ´ng á»Ÿ VCR mode
*   **Files sá»­a:** `useSystemDesignStore.ts`, `SystemDesignWorkspace.vue`, `system-design-viz.types.ts`, `systemDesignApi.ts` (má»›i), `useSystemDesignStore.spec.ts`

### 140. Phase 3 OOP Full-Stack Integration â€” Backend API Frames with VCR Playback
*   **ID:** FEAT-OOP-PHASE3
*   **MÃ´ táº£:** Káº¿t ná»‘i OOP Visualization frontend vá»›i backend API. Store `useOOPVisualizerStore.ts` giá» fetch frames tá»« `POST /api/v1/concepts/oop/execute` thay vÃ¬ dÃ¹ng ká»‹ch báº£n hardcoded.
*   **Kiáº¿n trÃºc:**
    - Dual-mode: API mode (backend frames) vá»›i fallback sang local scenarios khi backend khÃ´ng kháº£ dá»¥ng
    - `oopApi.ts`: service layer má»›i cho OOP backend calls
    - `OOPFrame` + `HeapObjectSnapshot` types tÆ°Æ¡ng á»©ng C# `OOPFrameDto`
    - `loadScenario()` async â€” try API first, fallback local
    - `applyApiFrame()` Ã¡p dá»¥ng state snapshot backend â†’ reactive refs (convert JSON objects â†’ Maps)
    - `snapshotToInstance()` chuyá»ƒn Ä‘á»•i `Record<string, unknown>` â†’ `Map<string, unknown>` cho fieldsData/vTable
    - `totalSteps`, `currentExplanation`, `currentActionName` computed properties phá»¥c vá»¥ cáº£ 2 mode
    - `OOPConceptsVisualizerWorkspace.vue`: thÃªm action name badge, API loading/error indicators
    - Tests: mock oopApi, async loadScenario/setPillar
*   **Files sá»­a:** `useOOPVisualizerStore.ts`, `OOPConceptsVisualizerWorkspace.vue`, `oop-visualization.types.ts`, `oopApi.ts` (má»›i), `useOOPVisualizerStore.spec.ts`

### 141. P1 â€” 7 Backend Sorting Strategies (IAlgorithmStrategy)
*   **ID:** FEAT-SORTING-STRATEGIES
*   **MÃ´ táº£:** Táº¡o 7 backend sorting strategy classes káº¿ thá»«a `AlgorithmStrategyBase` vÃ  implement `IAlgorithmStrategy`. Refactor legacy `BubbleSortExecutor` thÃ nh `BubbleSortStrategy`. Táº¥t cáº£ tá»± Ä‘á»™ng Ä‘Äƒng kÃ½ qua DI reflection.
*   **Strategies:** BubbleSortStrategy, QuickSortStrategy, MergeSortStrategy, HeapSortStrategy, RadixSortStrategy, CountingSortStrategy, BucketSortStrategy
*   **Files táº¡o:** `BubbleSortStrategy.cs`, `QuickSortStrategy.cs`, `MergeSortStrategy.cs`, `HeapSortStrategy.cs`, `RadixSortStrategy.cs`, `CountingSortStrategy.cs`, `BucketSortStrategy.cs`

### 142. P2 â€” Frontend Type Safety: Eliminate 13+ non-test `any` usages
*   **ID:** FIX-TYPE-SAFETY
*   **MÃ´ táº£:** Loáº¡i bá» táº¥t cáº£ `any` type trong non-test frontend code. Thay tháº¿ báº±ng strict TypeScript interfaces, type guards, discriminated unions.
*   **Thay Ä‘á»•i:**
    - `MonacoGutterClickInterceptor.ts`: `any` â†’ `MonacoMouseEvent` + `MonacoEditorInstance`
    - `PseudocodeSyncer.ts`: `any` â†’ `MonacoEditorForHighlight` interface
    - `MonacoLineSyncerCoordinator.ts`: `any` â†’ `VcrBaseFrame` + `VcrStoreForSync`
    - `useGraphInteraction.ts`: `any` â†’ `InteractivePlaygroundEngine | null`
    - `useInputValidation.ts`: `catch (err: any)` â†’ `catch (err: unknown)` + type guard
    - `useSortingAnimation.ts`: `as any` cast removed â€” `VcrBaseFrame` base type
    - `SortingDetailPanel.vue`: `as any` â†’ `isSortFrame()` type guard
    - `useVcrStore.ts`: `err: any` â†’ `err: unknown`, `PlaybackFrame[]` â†’ `VcrBaseFrame[]`
    - `CompilerStepExecutor.ts`: `err: any` â†’ `err: unknown`
*   **Files sá»­a:** 9 files across features/vcr-player, features/algorithm-sandbox, core/

### 143. P3 â€” Standardize VITE_API_BASE_URL + Algorithm Dashboard Integration
*   **ID:** FIX-API-URL
*   **MÃ´ táº£:** Chuáº©n hÃ³a `VITE_API_BASE_URL` across all DSA module files. Default port 5050 (matching backend).
*   **Thay Ä‘á»•i:**
    - `useAlgorithmStore.ts`: ThÃªm `API_BASE` constant, sá»­a `fetchAlgorithms()` vÃ  `loadAlgorithmDetails()` dÃ¹ng absolute URL
    - `dsaApi.ts`: Sá»­a default port tá»« 5000 â†’ 5050
    - `algorithmCatalog.ts`: ThÃªm 7 sorting algorithms vÃ o catalog (17 total)
    - `algorithmLocalMetadata.ts`: ThÃªm metadata cho 7 sorting algorithms
    - `sortingGenerators.ts`: ThÃªm 4 dummy generators (HeapSort, RadixSort, CountingSort, BucketSort)
    - `dummyGenerators.ts`: ÄÄƒng kÃ½ 4 generators má»›i
    - Tests: Cáº­p nháº­t catalog (10â†’17) vÃ  store specs
*   **Files sá»­a:** `useAlgorithmStore.ts`, `dsaApi.ts`, `algorithmCatalog.ts`, `algorithmLocalMetadata.ts`, `sortingGenerators.ts`, `dummyGenerators.ts`, `algorithmCatalog.spec.ts`, `useAlgorithmStore.spec.ts`

### 144. Phase 4 â€” Backend Architecture Modules (SOLID, Design Patterns, DI/IoC)
*   **ID:** FEAT-PHASE4-ARCH
*   **MÃ´ táº£:** Implemented full-stack integration for 3 architecture modules: SOLID Principles, Design Patterns, DI/IoC Container.
*   **Backend thay Ä‘á»•i:**
    - `SOLIDPrinciplesStrategy.cs`: 3 scenarios (SRP, OCP, LSP) with 4 frames each
    - `DesignPatternsStrategy.cs`: 3 scenarios (Strategy, Observer, Singleton) with 4 frames each
    - `DIContainerStrategy.cs`: 2 scenarios (lifetime-demo: 5 frames, cycle-detection: 4 frames)
    - DTOs: `SOLIDFrameDto.cs`, `DesignPatternFrameDto.cs`, `DIContainerFrameDto.cs`
    - Controllers: `SOLIDController.cs`, `DesignPatternsController.cs`, `DIContainerController.cs`
    - DI: Registered 3 new strategies in `AlgorithmDIConfiguration.cs`
*   **Frontend thay Ä‘á»•i:**
    - `solidApi.ts`: Service layer for SOLID API
    - `designPatternsApi.ts`: Service layer for Design Patterns API
    - `diContainerApi.ts`: Service layer for DI Container API
    - `useSOLIDVisualizerStore.ts`: Added VCR state + actions (loadVcrScenario, vcrNext, vcrPrev, vcrReset, exitVcrMode)
    - `useDesignPatternsStore.ts`: Added VCR state + actions
    - `useDIContainerStore.ts`: New Pinia store with VCR integration
*   **Build:** `dotnet build` 0 errors, `vue-tsc --noEmit` 0 errors
*   **Files:** 16 new/modified files across backend/src/ and frontend/src/features/

### 145. Production Build â€” vue-tsc -b Strict Type Errors (Preexisting)
*   **ID:** FIX-FE-BUILD-TSC
*   **MÃ´ táº£:** `npm run build` (`vue-tsc -b && vite build`) tháº¥t báº¡i vá»›i 9 lá»—i TypeScript. NguyÃªn nhÃ¢n gá»‘c: `tsconfig.json` dÃ¹ng `files: []` + project references, nÃªn `vue-tsc --noEmit` (khÃ´ng cÃ³ `-b`) kiá»ƒm tra 0 file â†’ luÃ´n bÃ¡o "0 errors" sai lá»‡ch. Chá»‰ `vue-tsc -b` (cháº¿ Ä‘á»™ build theo references) má»›i thá»±c sá»± type-check toÃ n bá»™ `src/`.
*   **CÃ¡c lá»—i Ä‘Ã£ sá»­a:**
    - `canvasStateSnapshot` khÃ´ng tá»“n táº¡i trÃªn `VcrBaseFrame` (buffer `playbackFrames` chá»©a cáº£ `PlaybackFrame` láº«n `SortFrame`). ThÃªm type guard `isPlaybackFrame()` trong `CompilerStepExecutor.ts`, dÃ¹ng Ä‘á»ƒ narrow an toÃ n táº¡i `useAlgorithmCanvasController.ts`, `PseudocodePanel.vue`, `PseudocodeViewer.vue`.
    - `MonacoLineSyncerCoordinator.ts`: `this.vcrStore` possibly null trong closure watch â†’ dÃ¹ng `this.vcrStore!` (Ä‘Ã£ guard trong constructor/setup).
    - `WasmComputeWorker.ts`: `inputData.buffer.slice()` tráº£ `ArrayBuffer | SharedArrayBuffer` khÃ´ng gÃ¡n Ä‘Æ°á»£c vÃ o `payload: ArrayBuffer` â†’ Ã©p kiá»ƒu `as ArrayBuffer`.
    - `DashboardView.vue`: callback `.map((b: Record<string, unknown>))` rá»™ng hÆ¡n `unknown` cá»§a pháº§n tá»­ badge â†’ Ä‘á»•i sang nháº­n `badge` rá»“i Ã©p `as Record<string, unknown>` trong thÃ¢n hÃ m (loáº¡i bá» luÃ´n 1 chá»— `any`).
*   **Káº¿t quáº£:** `vue-tsc -b` 0 errors, `vite build` thÃ nh cÃ´ng (dist sinh ra), 1528/1528 frontend tests váº«n pass, `dotnet build` 0 errors, 8/8 backend tests pass.
*   **Files:** `frontend/src/core/CompilerStepExecutor.ts`, `frontend/src/features/algorithm-sandbox/composables/useAlgorithmCanvasController.ts`, `frontend/src/features/algorithm-sandbox/engine/MonacoLineSyncerCoordinator.ts`, `frontend/src/features/code-editor/components/PseudocodePanel.vue`, `frontend/src/features/code-editor/components/PseudocodeViewer.vue`, `frontend/src/features/code-to-visualization/engine/WasmComputeWorker.ts`, `frontend/src/views/DashboardView.vue`

### ðŸš¨ Lá»—i 153: Máº¥t Tráº¡ng ThÃ¡i ÄÄƒng Nháº­p Khi Reload Trang (Auth Session Persistence Failure)
*   **MÃ´ táº£:** Há»c viÃªn Ä‘Äƒng nháº­p qua tÃ i khoáº£n khÃ´ng tráº¡ng thÃ¡i (stateless auth) thÃ nh cÃ´ng, nhÆ°ng khi reload trÃ¬nh duyá»‡t (F5) thÃ¬ bá»‹ tá»± Ä‘á»™ng Ä‘Äƒng xuáº¥t vÃ  chuyá»ƒn hÆ°á»›ng vá» trang chá»§.
*   **MÃ£ Lá»—i:** `ERR_AUTH_SESSION_PERSISTENCE`
*   **NguyÃªn nhÃ¢n gá»‘c:**
    - `main.ts` thá»±c hiá»‡n gá»i `authStore.init()` khi khá»Ÿi Ä‘á»™ng á»©ng dá»¥ng Ä‘á»ƒ kiá»ƒm tra phiÃªn Ä‘Äƒng nháº­p. Tuy nhiÃªn, hÃ m `init()` nÃ y chá»‰ há»— trá»£ phá»¥c há»“i phiÃªn cÃ³ tráº¡ng thÃ¡i (`dsa_refresh_token`) mÃ  bá» qua stateless session lÆ°u trá»¯ á»Ÿ `dsa_stateless_user_id`.
    - TrÃ¬nh Ä‘á»‹nh tuyáº¿n router guard kiá»ƒm tra `authStore.isAuthenticated` trÆ°á»›c khi táº£i trang dashboard. Do session chÆ°a Ä‘Æ°á»£c phá»¥c há»“i ká»‹p thá»i á»Ÿ thá»i Ä‘iá»ƒm khá»Ÿi cháº¡y, há»‡ thá»‘ng nháº­n Ä‘á»‹nh há»c viÃªn chÆ°a Ä‘Äƒng nháº­p vÃ  Ã©p buá»™c redirect vá» `/`. Sau Ä‘Ã³, `App.vue` má»›i gá»i `authStore.statelessInit()` nhÆ°ng lÃºc nÃ y há»c viÃªn Ä‘Ã£ bá»‹ Ä‘áº©y ra ngoÃ i.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Cáº­p nháº­t `authStore.init()` Ä‘á»ƒ kiá»ƒm tra `dsa_stateless_user_id`.
    - NÃ¢ng cáº¥p `refresh` endpoint trong backend `StatelessAuthController.cs` vÃ  `statelessAuthApi.ts` cá»§a frontend Ä‘á»ƒ nháº­n thÃªm `userId`.
    - Khi server backend restart hoáº·c browser refresh, frontend truyá»n `savedUserId` trong hÃ m `statelessInit()` Ä‘á»ƒ backend re-hydrate (náº¡p láº¡i thÃ´ng tin ngÆ°á»i dÃ¹ng tá»« PostgreSQL vÃ o in-memory cache) qua hÃ m `EnsureUserInMemory` vÃ  `ForceAddRefreshToken`, khÃ´i phá»¥c session hoÃ n toÃ n tá»± Ä‘á»™ng mÃ  khÃ´ng cáº§n Ä‘Äƒng nháº­p láº¡i.

### ðŸš¨ Lá»—i 154: Bá» Qua RÃ o Cáº£n ÄÄƒng Nháº­p á»ž Trang NÃ¢ng Cáº¥p Premium (Guest Checkout Bypass Gate)
*   **MÃ´ táº£:** NgÆ°á»i dÃ¹ng chÆ°a Ä‘Äƒng kÃ½ hoáº·c Ä‘Äƒng nháº­p váº«n cÃ³ thá»ƒ truy cáº­p trang `/checkout`, báº¥m nÃºt nÃ¢ng cáº¥p Premium vÃ  thá»±c hiá»‡n thanh toÃ¡n áº£o thÃ nh cÃ´ng. Khi quay láº¡i, há»‡ thá»‘ng bÃ¡o "Ä‘Ã£ sá»Ÿ há»¯u premium" cho táº¥t cáº£ ngÆ°á»i dÃ¹ng vÃ£ng lai do trÃ¹ng ID dÃ¹ng chung.
*   **MÃ£ Lá»—i:** `ERR_PAYMENT_GUEST_BYPASS`
*   **NguyÃªn nhÃ¢n gá»‘c:**
    - Trang checkout `/checkout` khÃ´ng cÃ³ rÃ o cáº£n kiá»ƒm tra tráº¡ng thÃ¡i Ä‘Äƒng nháº­p.
    - Trong `usePaymentStore.ts`, khi ngÆ°á»i dÃ¹ng chÆ°a Ä‘Äƒng nháº­p (khÃ´ng cÃ³ thÃ´ng tin trong `authStore`), biáº¿n `userId` tá»± Ä‘á»™ng fallback vá» má»™t háº±ng sá»‘ dÃ¹ng chung `'demo-user-001'`. Do Ä‘Ã³, báº¥t ká»³ tÃ i khoáº£n vÃ£ng lai nÃ o nÃ¢ng cáº¥p premium thá»±c cháº¥t Ä‘á»u nÃ¢ng cáº¥p cho ID dÃ¹ng chung nÃ y, khiáº¿n dá»¯ liá»‡u tráº¡ng thÃ¡i premium bá»‹ xung Ä‘á»™t vÃ  bÃ¡o "Ä‘Ã£ sá»Ÿ há»¯u" cho táº¥t cáº£ khÃ¡ch vÃ£ng lai.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - ÄÃ£ tÃ­ch há»£p táº¥m cháº¯n má» kÃ­nh (Glassmorphic Auth Required Gate) cháº·n truy cáº­p thanh toÃ¡n khi chÆ°a Ä‘Äƒng nháº­p.
    - RÃ ng buá»™c checkout trÃªn cáº£ frontend (`usePaymentStore.ts`) láº«n backend (`StatelessPaymentController.cs` vÃ  `StatelessPaymentStrategy.cs`).
    - Cáº­p nháº­t backend `StatelessPaymentController` sá»­ dá»¥ng trá»±c tiáº¿p `order.UserId` thá»±c táº¿ tá»« hÃ³a Ä‘Æ¡n thay vÃ¬ `request.UserId` Ä‘á»ƒ cáº­p nháº­t tráº¡ng thÃ¡i premium cho Ä‘Ãºng tÃ i khoáº£n trong cÆ¡ sá»Ÿ dá»¯ liá»‡u PostgreSQL vÃ  in-memory cache.
    - Äá»“ng bá»™ hÃ³a sá»± thay Ä‘á»•i tráº¡ng thÃ¡i premium cá»§a tÃ i khoáº£n in-memory ngay khi hoÃ n táº¥t giao dá»‹ch báº±ng cÃ¡ch gá»i `_authStrategy.SetUserPremium(order.UserId, true)`.

### ðŸš¨ Lá»—i 155: Lá»—i Type-Checking Mismatch Vai TrÃ² NgÆ°á»i DÃ¹ng Há»‡ Thá»‘ng (TypeScript User Role Overlap Error)
*   **MÃ´ táº£:** TrÃ¬nh biÃªn dá»‹ch TypeScript bÃ¡o lá»—i nghiÃªm trá»ng khi so sÃ¡nh kiá»ƒu dá»¯ liá»‡u giá»¯a role hiá»‡n táº¡i cá»§a ngÆ°á»i dÃ¹ng vá»›i vai trÃ² quáº£n trá»‹ viÃªn: `This comparison appears to be unintentional because the types '"Student" | "Teacher"' and '"Admin"' have no overlap.`
*   **MÃ£ Lá»—i:** `ERR_TS_USER_ROLE_OVERLAP_MISMATCH`
*   **NguyÃªn nhÃ¢n gá»‘c:** 
    - Kiá»ƒu dá»¯ liá»‡u `role` cá»§a ngÆ°á»i dÃ¹ng Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a tÄ©nh trong `AuthUserDto` (á»Ÿ `authApi.ts`) vÃ  `StatelessUserDto` (á»Ÿ `statelessAuthApi.ts`) chá»‰ bao gá»“m hai lá»±a chá»n: `'Student' | 'Teacher'`.
    - Khi cÃ¡c cáº¥u trÃºc nhÆ° `App.vue` hay `router/index.ts` thá»±c hiá»‡n kiá»ƒm thá»­ quyá»n háº¡n truy cáº­p cá»§a Admin báº±ng phÃ©p so sÃ¡nh `role === 'Admin'`, TypeScript phÃ¡t hiá»‡n ra ráº±ng giÃ¡ trá»‹ `'Admin'` náº±m ngoÃ i táº­p há»£p vai trÃ² Ä‘Æ°á»£c Ä‘á»‹nh nghÄ©a nÃªn nÃ©m lá»—i ngÄƒn cáº£n quÃ¡ trÃ¬nh build production.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Cáº­p nháº­t cáº£ `AuthUserDto` trong [authApi.ts](file:///d:/FPT/Hihi/frontend/src/features/auth/services/authApi.ts) láº«n `StatelessUserDto` trong [statelessAuthApi.ts](file:///d:/FPT/Hihi/frontend/src/features/auth/services/statelessAuthApi.ts) Ä‘á»ƒ má»Ÿ rá»™ng kiá»ƒu dá»¯ liá»‡u trÆ°á»ng `role` bao gá»“m cáº£ vai trÃ² `'Admin'`.
    - Viá»‡c má»Ÿ rá»™ng nÃ y giÃºp Pinia Store tá»± Ä‘á»™ng phÃ¢n giáº£i kiá»ƒu dá»¯ liá»‡u `userRole` thÃ nh `'Student' | 'Teacher' | 'Admin'`, Ä‘áº£m báº£o phÃ©p so sÃ¡nh vai trÃ² quáº£n trá»‹ viÃªn táº¡i `App.vue` vÃ  bá»™ Ä‘iá»u hÆ°á»›ng `router/index.ts` há»£p lá»‡ tuyá»‡t Ä‘á»‘i.

### ðŸš¨ Lá»—i 156: Lá»—i Type-Checking Khi Truy Cáº­p dataState VÃ  highlights TrÃªn FrameDTO (FrameDTO Optional Properties Type Mismatch)
*   **MÃ´ táº£:** Sau khi khai bÃ¡o `dataState` vÃ  `highlights` lÃ  optional trÃªn `FrameDTO` Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch vá»›i `GraphAnimationStep` (sá»­ dá»¥ng trong Graph Algorithm Simulation vá»‘n khÃ´ng váº½ bar charts), trÃ¬nh biÃªn dá»‹ch TypeScript nÃ©m lá»—i `error TS18048: 'frame.dataState' is possibly 'undefined'` vÃ  `error TS18048: 'frame.highlights' is possibly 'undefined'` á»Ÿ nhiá»u component váº½ Canvas vÃ  Test Specs.
*   **MÃ£ Lá»—i:** `ERR_TS18048_FRAME_DTO_OPTIONAL_PROPERTIES`
*   **NguyÃªn nhÃ¢n gá»‘c:**
    - CÃ¡c file váº½ canvas (`useAnimationCanvas.ts`, `compareCanvasDraw.ts`, `CompareCanvasPanel.vue`) vÃ  file thá»‘ng kÃª so sÃ¡nh (`compareHelpers.ts`) truy cáº­p trá»±c tiáº¿p vÃ o `frame.dataState` vÃ  `frame.highlights` mÃ  khÃ´ng kiá»ƒm tra sá»± tá»“n táº¡i cá»§a chÃºng.
    - File test `algorithmApi.spec.ts` truy cáº­p trá»±c tiáº¿p vÃ o cÃ¡c thuá»™c tÃ­nh cá»§a `highlights` mÃ  khÃ´ng dÃ¹ng non-null assertion.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Cáº­p nháº­t cÃ¡c hÃ m váº½ canvas vÃ  helper trong frontend Ä‘á»ƒ kiá»ƒm tra sá»± tá»“n táº¡i cá»§a `dataState` vÃ  `highlights` má»™t cÃ¡ch an toÃ n báº±ng cÃ¡c toÃ¡n tá»­ nullish coalescing (`?? []`) vÃ  optional chaining (`?.`).
    - Sá»­ dá»¥ng cÃ¡c non-null assertions (`!`) trong `algorithmApi.spec.ts` khi kiá»ƒm thá»­ bubble-sort frames vÃ¬ thuáº­t toÃ¡n sorting cháº¯c cháº¯n sinh ra `highlights`.
    - Äiá»u nÃ y giÃºp build production frontend thÃ´ng suá»‘t (`vue-tsc -b` Ä‘áº¡t exit code 0) mÃ  váº«n giá»¯ Ä‘Æ°á»£c tÃ­nh linh hoáº¡t khi `FrameDTO` Ä‘Æ°á»£c dÃ¹ng chung cho cáº£ Sorting vÃ  Graph Visualizer.



### ?? L?i 157: console.log Sót L?i Trong Code Production (Rogue console.log in Production Modules)
*   **Mô t?:** L?nh console.log b? d? sót trong 3 file production (AlgorithmDashboard.vue, GamificationPanel.vue) và 1 file string template (EmbedCodeSnippet.vue — th?c ch?t là code m?u h?p l?, không ph?i debug th?c s?).
*   **Mã L?i:** ERR_CONSOLE_LOG_IN_PRODUCTION
*   **Nguyên nhân g?c:** Các hàm debug loadMore() và callback adge earned trong XPEngine không du?c d?n d?p sau giai do?n phát tri?n.
*   **Cách kh?c ph?c:**
    - AlgorithmDashboard.vue: Thay th? console.log('Loading more skills...') b?ng comment no-op.
    - GamificationPanel.vue: Thay th? (badge) => console.log(...) b?ng (_badge) => { /* no-op */ }.
    - EmbedCodeSnippet.vue:49: Không ph?i l?i — dây là chu?i template m?u hi?n th? cho user, không ph?i debug code th?c.

### ?? L?i 158: CS8618 Nullable Warnings Trong QuizDto.cs (Uninitialized Non-Nullable Reference Properties)
*   **Mô t?:** 45 warnings CS8618 Non-nullable property must contain a non-null value when exiting constructor trong QuizDto.cs.
*   **Mã L?i:** ERR_CS8618_QUIZDTO_NULLABLE
*   **Nguyên nhân g?c:** Các thu?c tính ki?u tham chi?u (string, List<T>, int[]) không du?c khai báo là 
equired ho?c nullable, khi?n .NET nullable analysis c?nh báo chúng có th? null.
*   **Cách kh?c ph?c:** Thêm 
equired modifier cho t?t c? thu?c tính ki?u tham chi?u trong QuizDto, QuizQuestionDto, QuizAttemptRequest, QuizAttemptResult, QuestionResult. Build k?t qu?: **0 Warnings, 0 Errors**.

### ?? L?i 159: L? H?ng B?o M?t Npgsql 8.0.0 (NU1903 High Severity Vulnerability)
*   **Mô t?:** NuGet báo NU1903: Package 'Npgsql' 8.0.0 has a known high severity vulnerability và Microsoft.Extensions.Caching.Memory 8.0.0 has a known high severity vulnerability.
*   **Mã L?i:** ERR_NU1903_NPGSQL_VULNERABILITY
*   **Nguyên nhân g?c:** D? án s? d?ng Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0 và Microsoft.EntityFrameworkCore 8.0.0.
*   **Cách kh?c ph?c:** Nâng c?p toàn b? EF Core ecosystem lên 9.0.1 và Npgsql lên 9.0.4. Ð?ng th?i nâng Microsoft.Extensions.Caching.Memory lên 9.0.1. K?t qu?: Build **0 Warnings, 0 Errors**, 19/19 backend tests pass.

### ðŸš¨ Lá»—i 160: TrÃ¹ng láº·p tiá»n tá»‘ API trÃªn Client (Double API Prefixing /api/v1/api/v1)
*   **MÃ´ táº£:** CÃ¡c yÃªu cáº§u API gá»­i tá»« Client Ä‘áº¿n Backend bá»‹ nhÃ¢n Ä‘Ã´i tiá»n tá»‘ /api/v1/api/v1/... dáº«n Ä‘áº¿n lá»—i 404/CORS.
*   **MÃ£ Lá»—i:** ERR_CLIENT_DOUBLE_API_PREFIX
*   **NguyÃªn nhÃ¢n gá»‘c:** Environment variable VITE_API_BASE_URL chá»©a sáºµn /api/v1, trong khi piClient.ts vÃ  cÃ¡c file Service khÃ¡c cÅ©ng tá»± Ä‘á»™ng ghÃ©p thÃªm /api/v1 vÃ o sau base URL.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Cáº¥u hÃ¬nh láº¡i VITE_API_BASE_URL=http://localhost:5000 (chá»‰ gá»“m host) trong .env.development.
    - Cáº­p nháº­t piClient.ts vÃ  shared piClient.ts Ä‘á»ƒ tá»± Ä‘á»™ng ghÃ©p háº­u tá»‘ /api/v1 má»™t cÃ¡ch chuáº©n hÃ³a.

### ðŸš¨ Lá»—i 161: Äá»‹nh hÆ°á»›ng Catch-All Router bá»‹ Silent Redirect thay vÃ¬ hiá»ƒn thá»‹ 404
*   **MÃ´ táº£:** Khi truy cáº­p cÃ¡c Ä‘Æ°á»ng dáº«n khÃ´ng tá»“n táº¡i, ngÆ°á»i dÃ¹ng bá»‹ chuyá»ƒn hÆ°á»›ng im láº·ng vá» trang chá»§ thay vÃ¬ tháº¥y trang bÃ¡o lá»—i 404.
*   **MÃ£ Lá»—i:** ERR_ROUTER_SILENT_REDIRECT_NO_404
*   **NguyÃªn nhÃ¢n gá»‘c:** Route catch-all /:pathMatch(.*)* trong 
outes.ts Ä‘Æ°á»£c cáº¥u hÃ¬nh lÃ  
edirect: '/'.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - XÃ¢y dá»±ng component NotFoundView.vue vá»›i thiáº¿t káº¿ má» kÃ­nh Glassmorphic, hiá»‡u á»©ng glitch 404, SVG vÃ  liÃªn káº¿t truy cáº­p nhanh.
    - Cáº­p nháº­t route catch-all trá» trá»±c tiáº¿p Ä‘áº¿n NotFoundView.vue.

### S?a L?i 162: S?p giao di?n khi Monaco Editor load th?t b?i (ERR_MONACO_LOAD_CRASH)
*   **Mô t?:** Monaco Editor dôi khi b? ng?t k?t n?i CDN/m?ng làm crash promise loader.init() không du?c try-catch, d?n d?n l?i màn hình tr?ng xóa.
*   **Mã L?i:** ERR_MONACO_LOAD_CRASH
*   **Nguyên nhân g?c:** Trình t?i Monaco không x? lý fallback khi CDN/network b? t? ch?i ho?c cache CDN b? l?i.
*   **Cách kh?c ph?c:** Thêm try-catch và c? tr?ng thái error, hi?n th? giao di?n m? kính Glassmorphic kèm nút " T?i l?i Monaco\ d? ngu?i dùng reload c?c b? mà không b? s?p trang.

### S?a L?i 163: Thi?u thông tin su ph?m gi?i thích SOLID LSP & DIP (ERR_SOLID_EXPLANATION_COGNITIVE_LOAD)
* **Mô t?:** Ngu?i dùng/Sinh viên vào trang SOLID LSP/DIP g?p nhi?u kho?ng den và không hi?u ý nghia c?a các kh?i mô ph?ng d?i tu?ng Bird/Ostrich hay các node Database.
* **Mã L?i:** ERR_SOLID_EXPLANATION_COGNITIVE_LOAD
* **Nguyên nhân g?c:** Thi?u ph?n gi?i nghia d?ch thu?t ti?ng Vi?t, c?u trúc trình bày lý thuy?t chua t?i uu d? gi?m t?i nh?n th?c.
* **Cách kh?c ph?c:** Thi?t k? l?i ph?n lý thuy?t trong LSPLessonPanel.vue và DIPLessonPanel.vue, b? sung toàn b? b?n d?ch ti?ng Vi?t h?c thu?t, b?ng so sánh tr?c quan, và gi?i thích chi ti?t co ch? vi ph?m/kh?c ph?c.



### Sá»­a Lá»—i 164: Lá»—i PhÃ¢n Giáº£i Base Image .NET 9.0 Cho Project Target .NET 10.0 (Docker Restore Failure) & Lá»‡ch Cáº¥u HÃ¬nh Database Local
* **MÃ´ táº£:** Cháº¡y `docker-compose up --build` bá»‹ lá»—i `The current .NET SDK does not support targeting .NET 10.0`. Cháº¡y `run-project.bat` thÃ¬ backend khÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c PostgreSQL á»Ÿ localhost:5432 do password (`password123` vs `postgres`) hoáº·c db name (`visualization_dsa_dev` vs `visualization_dsa`) lá»‡ch cáº¥u hÃ¬nh.
* **Ma Lá»—i:** ERR_DOCKER_DOTNET_10_RESTORE_AND_DB_MISMATCH
* **NguyÃªn nhÃ¢n gá»‘c:**
  1. File `backend/Dockerfile` sá»­ dá»¥ng base image `mcr.microsoft.com/dotnet/sdk:9.0` trong khi dá»± Ã¡n `.csproj` nháº¯m má»¥c tiÃªu (target) `.NET 10.0`.
  2. File `docker-compose.yml` Ä‘á»‹nh cáº¥u hÃ¬nh cÆ¡ sá»Ÿ dá»¯ liá»‡u máº·c Ä‘á»‹nh lÃ  `visualization_dsa` vÃ  máº­t kháº©u `postgres`, trong khi cáº¥u hÃ¬nh phÃ¡t triá»ƒn cá»¥c bá»™ `appsettings.Development.json` yÃªu cáº§u `visualization_dsa_dev` vÃ  máº­t kháº©u `password123`.
* **CÃ¡ch kháº¯c phá»¥c:**
  1. Cáº­p nháº­t `backend/Dockerfile` Ä‘á»ƒ sá»­ dá»¥ng base image `.NET 10.0` (sdk:10.0 vÃ  aspnet:10.0).
  2. Äá»“ng bá»™ cáº¥u hÃ¬nh database trong `docker-compose.yml` (POSTGRES_DB: visualization_dsa_dev, POSTGRES_PASSWORD: password123, cÃ¹ng vá»›i cáº­p nháº­t healthcheck vÃ  env ConnectionStrings__DefaultConnection cá»§a backend service) khá»›p 100% vá»›i `appsettings.Development.json` Ä‘á»ƒ ngÆ°á»i dÃ¹ng cÃ³ thá»ƒ cháº¡y database container Ä‘á»™c láº­p rá»“i cháº¡y backend báº±ng script `.bat` trÃªn host.

### Sá»­a Lá»—i 165: Lá»‡ch tiÃªu Ä‘á» cá»™t Excel Import khi Giáº£ng viÃªn táº£i lÃªn file máº«u cÅ© (ERR_EXCEL_IMPORT_TITLE_MISMATCH)
*   **MÃ´ táº£:** Import Quiz tá»« file Excel bá»‹ lá»—i hoáº·c tráº£ vá» dá»¯ liá»‡u rá»—ng do khÃ´ng Ã¡nh xáº¡ Ä‘Æ°á»£c cá»™t "TiÃªu Ä‘á» tráº¯c nghiá»‡m" hoáº·c "TiÃªu Ä‘á» Quiz".
*   **MÃ£ Lá»—i:** ERR_EXCEL_IMPORT_TITLE_MISMATCH
*   **NguyÃªn nhÃ¢n gá»‘c:** TrÃ¬nh phÃ¢n tÃ­ch excelParser.ts chá»‰ há»— trá»£ Ä‘á»c cá»™t vá»›i tiÃªu Ä‘á» chuáº©n hÃ³a ("TiÃªu Ä‘á» Quiz"), trong khi cÃ¡c file template cÅ© sá»­ dá»¥ng "TiÃªu Ä‘á» tráº¯c nghiá»‡m" dáº«n Ä‘áº¿n khÃ´ng nháº­n dáº¡ng Ä‘Æ°á»£c.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Cáº­p nháº­t interface ExcelRowInput Ä‘á»ƒ há»— trá»£ cáº£ hai cá»™t "TiÃªu Ä‘á» tráº¯c nghiá»‡m" vÃ  "TiÃªu Ä‘á» Quiz".
    - Bá»• sung logic tÃ¬m kiáº¿m linh hoáº¡t vá»›i Ä‘á»™ Æ°u tiÃªn Ä‘á»ƒ láº¥y Ä‘Ãºng tiÃªu Ä‘á» quiz tá»« tá»‡p tin Excel cÅ© vÃ  má»›i.
    - XÃ¡c thá»±c báº±ng Vitest thÃ nh cÃ´ng (1539 tests passed).


### Sá»­a Lá»—i 166: Lá»—i Kiá»ƒu Dá»¯ Liá»‡u Handler resize Trong GuidedTourOverlay (ERR_TOUR_RESIZE_HANDLER_TYPE_MISMATCH)
*   **MÃ´ táº£:** Lá»—i biÃªn dá»‹ch TypeScript táº¡i component `GuidedTourOverlay.vue` khi gÃ¡n trá»±c tiáº¿p hÃ m `updateSpotlight(skipScroll?: boolean)` lÃ m listener cho sá»± kiá»‡n `resize` cá»§a cá»­a sá»• `window`.
*   **MÃ£ Lá»—i:** ERR_TOUR_RESIZE_HANDLER_TYPE_MISMATCH
*   **NguyÃªn nhÃ¢n gá»‘c:** TrÃ¬nh láº¯ng nghe resize truyá»n vÃ o má»™t sá»± kiá»‡n `UIEvent` thay vÃ¬ kiá»ƒu `boolean | undefined` nhÆ° chá»¯ kÃ½ hÃ m `updateSpotlight` yÃªu cáº§u, dáº«n Ä‘áº¿n lá»—i báº¥t tÆ°Æ¡ng thÃ­ch kiá»ƒu dá»¯ liá»‡u khi compile.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Khai bÃ¡o thÃªm má»™t hÃ m wrapper `handleResize = () => updateSpotlight(true)` khÃ´ng tham sá»‘ vÃ  thiáº¿t láº­p skipScroll báº±ng `true` Ä‘á»ƒ trÃ¡nh viá»‡c tá»± Ä‘á»™ng scroll láº¡i khi ngÆ°á»i dÃ¹ng thay Ä‘á»•i kÃ­ch thÆ°á»›c cá»­a sá»•.
    - Cáº­p nháº­t `window.addEventListener('resize', handleResize)` vÃ  gá»¡ bá» tÆ°Æ¡ng á»©ng táº¡i `onBeforeUnmount` giÃºp code compile vÃ  build sáº¡ch 100%.

### Sá»­a Lá»—i 167: Lá»—i Spotlight Element Blur Trong GuidedTourOverlay (ERR_TOUR_SPOTLIGHT_BLUR)
*   **MÃ´ táº£:** Khi Tour kÃ­ch hoáº¡t, pháº§n tá»­ Ä‘Æ°á»£c spotlight bá»‹ má» theo lá»›p ná»n do sá»­ dá»¥ng filter: backdrop-blur sai chá»—.
*   **MÃ£ Lá»—i:** ERR_TOUR_SPOTLIGHT_BLUR
*   **NguyÃªn nhÃ¢n gá»‘c:** backdrop-blur Ä‘Æ°á»£c Ã¡p dá»¥ng trÃªn class phá»§ toÃ n mÃ n hÃ¬nh, gÃ¢y má» toÃ n bá»™ giao diá»‡n bao gá»“m cáº£ spotlight element.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Loáº¡i bá» lá»›p backdrop-blur trÃªn toÃ n bá»™ overlay.
    - Ãp dá»¥ng ká»¹ thuáº­t CSS clip-path Ä‘á»™ng Ä‘á»ƒ váº½ má»™t lá»›p phá»§ tá»‘i mÃ u Ä‘en (bg-black/60) bao quanh vÃ¹ng spotlight mÃ  khÃ´ng áº£nh hÆ°á»Ÿng tá»›i Ä‘á»™ sáº¯c nÃ©t cá»§a element Ä‘Ã­ch.

### Sá»­a Lá»—i 168: Lá»—i Tooltip Tour TrÃ n MÃ©p DÆ°á»›i Viewport (ERR_TOUR_TOOLTIP_BOTTOM_OVERFLOW)
*   **MÃ´ táº£:** Tooltip hÆ°á»›ng dáº«n bá»‹ trÃ n ra ngoÃ i mÃ n hÃ¬nh á»Ÿ cÃ¡c trang phá»©c táº¡p nhÆ° /state vÃ  /system thiáº¿t káº¿ dáº¡ng cá»™t.
*   **MÃ£ Lá»—i:** ERR_TOUR_TOOLTIP_BOTTOM_OVERFLOW
*   **NguyÃªn nhÃ¢n gá»‘c:** Thuáº­t toÃ¡n tÃ­nh toÃ¡n vá»‹ trÃ­ tooltip khÃ´ng tÃ­nh Ä‘áº¿n giá»›i háº¡n chiá»u cao viewport vÃ  chiá»u cao tooltip, dáº«n Ä‘áº¿n viá»‡c Ä‘áº©y tooltip vÆ°á»£t quÃ¡ mÃ©p dÆ°á»›i mÃ n hÃ¬nh.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - Äá»‹nh nghÄ©a chiá»u cao máº·c Ä‘á»‹nh Æ°á»›c tÃ­nh cá»§a Tooltip lÃ  200px.
    - Tá»± Ä‘á»™ng Ä‘áº£o hÆ°á»›ng preferredPosition tá»« 'bottom' thÃ nh 'top' khi phÃ¡t hiá»‡n cáº¡nh dÆ°á»›i cá»§a pháº§n tá»­ cá»™ng thÃªm chiá»u cao tooltip vÆ°á»£t quÃ¡ chiá»u cao mÃ n hÃ¬nh.
    - ThÃªm hÃ m káº¹p giá»›i háº¡n an toÃ n Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20)) Ä‘á»ƒ cá»‘ Ä‘á»‹nh vá»‹ trÃ­ tooltip luÃ´n náº±m trong vÃ¹ng hiá»ƒn thá»‹ an toÃ n.

### Sá»­a Lá»—i 169: Lá»—i Xung Äá»™t Layout & Contrast NhÃ£n Tráº¡ng ThÃ¡i Trong PhÃ¢n Há»‡ Concurrency (ERR_CONCURRENCY_LAYOUT_COLLISION)
*   **MÃ´ táº£:** NhÃ£n tráº¡ng thÃ¡i thread (Thread state badge) vÃ  thanh ray tiáº¿n trÃ¬nh (Thread rail tracks) bá»‹ Ä‘Ã¨ vÃ  lá»‡ch giao diá»‡n do sá»­ dá»¥ng vá»‹ trÃ­ Ä‘á»™ng khÃ´ng cá»‘ Ä‘á»‹nh. NhÃ£n tráº¡ng thÃ¡i cÅ©ng bá»‹ giáº£m tÆ°Æ¡ng pháº£n khÃ³ Ä‘á»c.
*   **MÃ£ Lá»—i:** ERR_CONCURRENCY_LAYOUT_COLLISION
*   **NguyÃªn nhÃ¢n gá»‘c:**
    - Sá»­ dá»¥ng vá»‹ trÃ­ flex-row Ä‘á»™ng cho tÃªn luá»“ng vÃ  nhÃ£n tráº¡ng thÃ¡i mÃ  khÃ´ng cÃ³ kÃ­ch thÆ°á»›c cá»‘ Ä‘á»‹nh dáº«n Ä‘áº¿n viá»‡c dá»“n Ã©p layout khi kÃ­ch thÆ°á»›c tráº¡ng thÃ¡i thay Ä‘á»•i.
    - MÃ u ná»n vÃ  mÃ u chá»¯ cá»§a tráº¡ng thÃ¡i (nhÆ° Running, Suspended, Blocked) cÃ³ tÆ°Æ¡ng pháº£n quÃ¡ yáº¿u khiáº¿n chá»¯ bá»‹ má».
*   **CÃ¡ch kháº¯c phá»¥c:**
    - TÃ¡ch biá»‡t nhÃ£n tráº¡ng thÃ¡i vÃ  rails trong ThreadRailsCanvas.vue báº±ng cÃ¡ch Ä‘áº·t nhÃ£n á»Ÿ vá»‹ trÃ­ absolute cá»‘ Ä‘á»‹nh bÃªn pháº£i vá»›i chiá»u rá»™ng xÃ¡c Ä‘á»‹nh (w-24), Ä‘á»“ng thá»i thÃªm lá» pháº£i tÆ°Æ¡ng á»©ng cho thanh ray hoáº¡t cáº£nh.
    - Chá»‰nh sá»­a Ä‘á»™ má» ná»n cá»§a cÃ¡c class mÃ u tráº¡ng thÃ¡i tá»« /5 (5%) lÃªn /15 (15%) trong useThreadClassHelpers.ts Ä‘á»ƒ táº¡o lá»›p ná»n tÆ°Æ¡ng pháº£n máº¡nh, giÃºp chá»¯ hiá»ƒn thá»‹ rÃµ rÃ ng trÃªn ná»n tá»‘i.

### Sá»­a Lá»—i 170: Lá»—i Äá»• Vá»¡ Giao Diá»‡n Do Race Condition Khi Refresh Token (ERR_AUTH_REFRESH_RACE)
*   **MÃ´ táº£:** Khi Admin chuyá»ƒn hÆ°á»›ng tá»« trang `/admin` sang cÃ¡c trang khÃ¡c, giao diá»‡n bá»‹ tráº¯ng xÃ³a do viá»‡c gá»i song song cÃ¡c request API sau khi refresh token chÆ°a hoÃ n thÃ nh gÃ¢y ra lá»—i 401 Unauthorized vÃ  phÃ¡t sinh Uncaught Exception phÃ¡ vá»¡ luá»“ng render cá»§a Vue Router.
*   **MÃ£ Lá»—i:** ERR_AUTH_REFRESH_RACE
*   **NguyÃªn nhÃ¢n gá»‘c:**
    - Thiáº¿u cÆ¡ cháº¿ promise-locking (khÃ³a lá»i há»©a) táº¡i hÃ m refresh token khiáº¿n nhiá»u request cÃ¹ng lÃºc kÃ­ch hoáº¡t nhiá»u cuá»™c gá»i `/auth/refresh` song song lÃ m máº¥t hiá»‡u lá»±c token cÅ©.
    - Thiáº¿u cÆ¡ cháº¿ retry tá»± Ä‘á»™ng táº¡i táº§ng store vÃ  táº§ng request API khi token vá»«a Ä‘Æ°á»£c lÃ m má»›i xong nhÆ°ng request hiá»‡n táº¡i Ä‘Ã£ bá»‹ tráº£ vá» 401.
*   **CÃ¡ch kháº¯c phá»¥c:**
    - CÃ i Ä‘áº·t má»™t biáº¿n `refreshPromise` Ä‘Ã³ng vai trÃ² khÃ³a Ä‘á»“ng bá»™ trong `useAuthStore.ts` Ä‘á»ƒ gá»™p toÃ n bá»™ cÃ¡c cuá»™c gá»i refresh token Ä‘á»“ng thá»i vÃ o duy nháº¥t má»™t luá»“ng xá»­ lÃ½.
    - CÃ i Ä‘áº·t cÆ¡ cháº¿ retry tá»± Ä‘á»™ng trong `useUserProgressStore.ts` khi hÃ m `loadProgress` phÃ¡t hiá»‡n lá»—i 401 báº±ng cÃ¡ch Ä‘á»£i refresh token má»›i rá»“i gá»i láº¡i API.
    - Triá»ƒn khai má»™t Global Fetch Interceptor trong `main.ts` cháº·n toÃ n bá»™ lá»‡nh fetch Ä‘i tá»›i há»‡ thá»‘ng API cá»§a VisualizationDSA, tá»± Ä‘á»™ng Ä‘Ã­nh kÃ¨m Header Authorization vÃ  tá»± Ä‘á»™ng thá»±c hiá»‡n refresh token + retry khi pháº£n há»“i lÃ  401.

### Sua Loi 171: Blank Screen Sau Khi Vao /admin Do Interceptor Xu Ly 403 Nhu 401 (ERR_AUTH_FORBIDDEN_MISMATCH)
*   **Mo ta:** Admin dang nhap, vao /admin thanh cong. Sau do bam bat ky trang nao (OOP, Teacher, Sorting...) toan bo noi dung bi blank trang + banner 'Dong bo tien trinh that bai' hien ra.
*   **Ma Loi:** ERR_AUTH_FORBIDDEN_MISMATCH
*   **Nguyen nhan goc:**
    - Global Fetch Interceptor (main.ts) xu ly MOI response 401 bang cach goi refreshAccessToken(). Khi Admin vao /teacher (role Teacher only), backend tra ve 403 Forbidden (khong phai 401). NHUNG Interceptor khong phan biet 401 vs 403 - no van goi refreshAccessToken() nham. refreshAccessToken() that bai (token van hop le nhung sai role) va clear toan bo auth state: accessToken = null, currentUser = null. Ket qua: isAuthenticated = false, moi component render cung blank.
    - Router guard beforeEach goi stopImpersonating() khong dieu kien khi roi /admin, gay mutation state thua khi Admin chua impersonate ai.
*   **Cach khac phuc:**
    - main.ts: Chi goi refreshAccessToken() khi response.status === 401 (token het han), KHONG xu ly 403 (quyen bi tu choi). Them log warning phan biet cho 403.
    - router/index.ts: Chi goi stopImpersonating() khi authStore.isImpersonating === true (co vdsa_admin_access_token trong localStorage).
    - useUserProgressStore.spec.ts: Them cac truong con thieu (badgesEarned, modulesCompleted, badges) vao mock UserProgressDto de fix TS build error trong Docker.

### Sua Loi 172: Loi Xac Thu C Claim va Stuck Vue Transition Khi Admin Dieu Huong (ERR_ADMIN_NAV_AUTH_RACE)
*   **Mo ta:** Khi Admin vao page /admin roi dieu huong sang cac sandbox (OOP, Sorting...), content area bi trang xoa (blank) kem thong bao 'Dong bo tien trinh that bai'.
*   **Ma Loi:** ERR_ADMIN_NAV_AUTH_RACE
*   **Nguyen nhan goc:**
    - Tren Backend: Token validation trong Program.cs thieu cau hinh mapping NameClaimType = "sub" cho JWT. Do do claim "sub" sinh ra boi AuthService khong duoc map vao ClaimTypes.NameIdentifier, khien cho GetCurrentUserId() trong UsersController.cs tra ve null va nem UnauthorizedAccessException (401) tai endpoint /users/me/progress.
    - Tren Frontend: Component <Transition> trong App.vue su dung mode="out-in". Khi gap loi 401, error banner duoc render lam anh huong den lifecycle cua router view khien animation transition cua component tiep theo bi ket o opacity = 0 (stuck transition).
*   **Cach khac phuc:**
    - Backend Program.cs: Bo sung NameClaimType = "sub" va RoleClaimType = "role" vao TokenValidationParameters cua AddJwtBearer de map dung claim "sub" vao ClaimTypes.NameIdentifier.
    - Backend UsersController.cs: Toi uu hoa ham GetCurrentUserId() doc theo do uu tien tu NameIdentifier -> JwtRegisteredClaimNames.Sub -> "sub" va kiem tra Guid.TryParse mot cach an toan.
    - Frontend App.vue: Loai bo mode="out-in" tai page-fade transition va them :key=".fullPath" de ep component re-mount doc lap va hoat canh muot ma hon ma khong lo bi stuck opacity 0.
    - useUserProgressStore.ts & spec.ts: Xoa bo trung lap logic retry 401 de tap trung vao Global Interceptor thuc hien. Fix don vi kiem thu unit tests cho dung luong moi.

### Sua Loi 173: Thieu Co Che Chan Spam Va Phong Ngua DDoS/Can Kiet Tai Nguyen O Backend (ERR_BACKEND_SPAM_EXHAUSTION)
*   **Mo ta:** Cac endpoint backend chay thuat toan hoac tai thong ke khong co co che gioi han toc do truy cap (Rate Limiting), khong gioi han kich thuoc input dau vao gay nguy co treo Kestrel thread pool, va gay tai lon cho co so du lieu do query lien tuc.
*   **Ma Loi:** ERR_BACKEND_SPAM_EXHAUSTION
*   **Nguyen nhan goc:**
    - Cac endpoint chay thuat toan `Execute` va `Compare` la cac tac vu nang CPU nhung chay dong bo va thieu kiem tra do dai mang dau vao, khien ke xau co the gui mang lon de tan cong CPU/RAM.
    - Cac controller lay cac scenario dynamic (SOLID, OOP, DI, System Design, Design Patterns) thieu cache, dan den CPU phai tinh toan lai nhieu lan.
    - Thieu cau hinh gioi han so luong request tren moi IP khien he thong de bi spam hoac crawl trai phep.
*   **Cach khac phuc:**
    - Tich hop `ConstraintResolver.ValidateSize` vao AlgorithmsController de gioi han phan tu mang dau vao, dong thoi bọc logic chay thuat toan trong `Task.Run` de chay bat dong bo, tranh block Kestrel thread pool.
    - Cấu hinh `IMemoryCache` tren AnalyticsController cho public statistics (cache GetOverview trong 2 phut, GetPopularModules trong 10 phut) va clamp tham so limit de tranh query ton tai nguyen DB.
    - Khai bao 2 chinh sach rate limit tai `Program.cs`: `"api"` (60 request/phut) va `"heavy"` (15 request/phut, 0 queue de fail-fast) theo IP nguoi dung.
    - Ap dung decorator `[EnableRateLimiting("heavy")]` cho tat ca cac simulation controllers va `[EnableRateLimiting("api")]` cho AnalyticsController.
