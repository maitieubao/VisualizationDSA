# 🎨 SÂN CHƠI TƯƠNG TÁC ĐỒ THỊ & CÂY (INTERACTIVE PLAYGROUND)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Interactive Playground** - phân hệ mang tính chất phát triển game (Game Development) sống động nhất trong **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc tương tác đồ họa hoàn toàn trên một thẻ HTML5 Canvas duy nhất thông qua cơ chế phân phối sự kiện (Event Delegation), thuật toán lượng giác định vị đầu mũi tên liên kết, công thức vật lý lực đẩy-kéo cân bằng (Force-Directed Graph), và bộ chuyển đổi dữ liệu đồ họa (Graph Parser) sang cấu trúc JSON tiêu chuẩn gửi về Backend.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Mục tiêu Nghiệp vụ & Sân chơi Đồ họa (PRD)](#1-mục-tiêu-nghiệp-vụ--sân-chơi-đồ-họa-prd)
2. [Kiến trúc Phân phối Canvas & Nhận diện Va chạm (TECHNICAL SPEC)](#2-kiến-trúc-phân-phối-canvas--nhận-diện-va-chạm-technical-spec)
3. [Hiện thực hóa Toán học Lượng giác & Vật lý Lực đẩy (Core Logic)](#3-hiện-thực-hóa-toán-học-lượng-giác--vật-lý-lực-đẩy-core-logic)
4. [Đặc tả Thanh Công cụ Nổi & Snapping Glow (UI/UX Interface)](#4-đặc-tả-thanh-công-cụ-nổi--snapping-glow-uiux-interface)
5. [Quản lý Trạng thái Bản vẽ & Pinia Store (State Management)](#5-quản-lý-trạng-thái-bản-vẽ--pinia-store-state-management)
6. [Bộ Biên dịch Đồ thị Graph-to-JSON Schema (API Reference)](#6-bộ-biên-dịch-đồ-thị-graph-to-json-schema-api-reference)
7. [Quyết định Kiến trúc & Tối ưu Hiệu năng 60 FPS (ADR)](#7-quyết-định-kiến-trúc--tối-ưu-hiệu-năng-60-fps-adr)
8. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#8-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. MỤC TIÊU NGHIỆP VỤ & SÂN CHƠI ĐỒ HỌA (PRD)

### 1.1. Tầm nhìn: Chuyển hóa lý thuyết khô khan thành tương tác vật lý trực quan
Khi học các cấu trúc dữ liệu dạng mạng lưới phức tạp như Đồ thị (Graphs) hay Cây (Trees), việc bắt sinh viên phải nhập danh sách số thô sơ hay ma trận kề (Adjacency Matrix) là một cực hình tẻ nhạt và cực kỳ khó mường tượng. 

**Interactive Playground** giải quyết triệt để nỗi sợ này bằng cách cung cấp một "bảng vẽ trắng" thông minh:
*   **Vẽ Node bằng chuột:** Click đúp hoặc nhấn nút chọn vẽ để "đẻ" Node trực tiếp tại vị trí con trỏ.
*   **Kéo thả tạo Cạnh liên kết (Edges):** Nhấn giữ từ Node A kéo dây chun nối sang Node B tạo liên kết có hướng hoặc vô hướng nhanh chóng.
*   **Định trọng số bằng cú click:** Nhấp chọn cạnh để gán nhãn trọng số dữ liệu (Weights), phục vụ các giải thuật tìm đường đi ngắn nhất như Dijkstra hay cây bao trùm nhỏ nhất Prim/Kruskal.
*   **Khả năng co giãn đàn hồi (Elastic Dragging):** Nắm kéo một Node vứt sang góc khác, toàn bộ các cạnh liên kết bám theo tự động co giãn mềm mại như những sợi dây thun.

---

## 2. KIẾN TRÚC PHÂN PHỐI CANVAS & NHẬN DIỆN VA CHẠM (TECHNICAL SPEC)

### 2.1. Phân phối Sự kiện Điểm đơn (Single-point Event Delegation)
Để Canvas có thể xử lý hàng trăm Node và Cạnh liên kết mà không bị nghẽn luồng DOM của trình duyệt:
*   Chúng ta không tạo các thẻ `<div>` HTML độc lập cho mỗi Node.
*   Thay vào đó, chúng ta chỉ đăng ký **DUY NHẤT một bộ lắng nghe sự kiện** (`mousedown`, `mousemove`, `mouseup`) lên bề mặt thẻ `<canvas>`.
*   Tọa độ tương tác chuột ($X, Y$) được tính toán bằng các hàm hình học để xác định xem người dùng đang click trúng đối tượng nào.

### Sơ đồ Quy trình Nhận diện Va chạm (Hit Detection)
```
         [Người học click chuột tại tọa độ X, Y trên Canvas]
                                  |
                                  v
                    Duyệt qua mảng nodes trong Store
            Tính khoảng cách Euclide d tới tâm mỗi Node (Cx, Cy)
                                  |
         +------------------------+------------------------+
         |                                                 |
     [d <= Bán kính R]                              [d > Bán kính R]
         |                                                 |
         v                                                 v
  Va chạm thành công!                               Không trúng Node.
  User đang Click/Kéo Node này.                      Kiểm tra va chạm với Edge...
```

---

## 3. TOÁN HỌC LƯỢNG GIÁC & VẬT LÝ LỰC ĐẨY (CORE LOGIC)

### 3.1. Tính toán Điểm tiếp xúc Đầu Mũi tên (Edge Arrow Routing)
Khi vẽ mũi tên chỉ hướng nối từ tâm Node A ($x_1, y_1$) sang tâm Node B ($x_2, y_2$), nếu đầu mũi tên vẽ thẳng vào tâm sẽ bị che khuất bởi hình tròn Node B. Đầu mũi tên bắt buộc phải dừng lại và vẽ chính xác tại **đường viền ngoài** của Node B.

Chúng ta sử dụng lượng giác học để tính toán tọa độ tiếp xúc thực tế ($x_t, y_t$):

```typescript
// Tính góc hướng từ A sang B
const angle = Math.atan2(y2 - y1, x2 - x1);

// Bán kính hình tròn Node B là R
const targetX = x2 - R * Math.cos(angle);
const targetY = y2 - R * Math.sin(angle);
```
Tọa độ tiếp xúc ($targetX, targetY$) này chính là điểm gốc để vẽ đầu tam giác mũi tên, giúp giao diện trông vô cùng sắc sảo và chuyên nghiệp.

### 3.2. Thuật toán Vật lý Lực đẩy Đồ thị (Force-Directed Simulation)
Để đồ thị tự động căn chỉnh khoảng cách đẹp mắt mà người dùng không cần chỉnh tay:
*   **Lực đẩy tĩnh điện (Repulsion Force):** Giữa 2 Node bất kỳ $i$ và $j$ luôn xuất hiện một lực đẩy tỉ lệ nghịch với bình phương khoảng cách để chúng không đè lên nhau:
    $$F_{rep} = \frac{K_r}{d(i, j)^2}$$
*   **Lực kéo đàn hồi lò xo (Attraction Force):** Nếu giữa 2 Node có một Cạnh liên kết nối với nhau, xuất hiện lực kéo lò xo kéo chúng lại gần:
    $$F_{att} = K_a \times (d(i, j) - L_0)$$
Hệ thống chạy vòng lặp cập nhật vận tốc và tọa độ các Node ở tần suất 60 FPS giúp đồ thị chuyển động rung rinh mềm mại (jiggling) ổn định cực kỳ tự nhiên.

---

## 4. THANH CÔNG CỤ NỔI & DOCK TƯƠNG TÁC (UI/UX INTERFACE)

### 4.1. Thanh Công cụ Trôi nổi (Floating Toolbar Pane)
Một thanh dọc bo viền kính mờ (Glassmorphism) nằm nổi bên mép trái của Canvas chứa 5 biểu tượng công cụ chuyên dụng:
1.  **Cursor `[ 🖱️ ]` (Select/Move):** Chọn, nắm kéo di chuyển các Node tự do trên màn hình.
2.  **Add Node `[ ➕ ]`:** Click chuột vào vùng trống bất kỳ trên Canvas để sản sinh một đỉnh mới màu Slate.
3.  **Add Edge `[ ↘️ ]`:** Nhấn giữ từ Node nguồn kéo một sợi dây đứt nét di động, nhả chuột tại Node đích để thiết lập đường liên kết.
4.  **Weight `[ 🏷️ ]`:** Click chọn cạnh để bật ô hội thoại nhỏ gán trọng số cho cạnh đó.
5.  **Trash `[ 🗑️ ]`:** Click chọn đỉnh hoặc cạnh để xóa vĩnh viễn khỏi sân chơi.

---

## 5. QUẢN LÝ TRẠNG THÁI BẢN VẼ & PINIA STORE (STATE MANAGEMENT)

Sử dụng Pinia Setup Store để quản lý toàn bộ thực thể cấu trúc đồ thị hiện hành:

```typescript
export const usePlaygroundStore = defineStore('playground', () => {
  const mode = ref<'SELECT' | 'ADD_NODE' | 'ADD_EDGE' | 'WEIGHT' | 'DELETE'>('SELECT');
  const nodes = ref<NodeDTO[]>([]);
  const edges = ref<EdgeDTO[]>([]);
  const selectedNodeId = ref<string | null>(null);

  // Đăng ký Node mới
  function addNode(x: number, y: number) {
    const id = `node_${Date.now()}`;
    nodes.value.push({ id, label: String.fromCharCode(65 + nodes.value.length), x, y });
  }

  // Tạo liên kết mới
  function addEdge(fromId: string, toId: string) {
    // Tránh trùng lặp
    const exists = edges.value.some(e => e.from === fromId && e.to === toId);
    if (!exists) {
      edges.value.push({ id: `edge_${Date.now()}`, from: fromId, to: toId, weight: 1 });
    }
  }

  return { mode, nodes, edges, selectedNodeId, addNode, addEdge };
});
```

---

## 6. BỘ BIÊN DỊCH ĐỒ THỊ GRAPH-TO-JSON (API REFERENCE)

Nhiệm vụ cốt lõi của Playground là chuyển đổi (parse) trạng thái vẽ hình vectơ của người dùng sang cấu trúc JSON thuần túy mà thuật toán của Backend .NET Core có thể hiểu được:

### Sơ đồ dữ liệu vẽ gốc ở Store:
```json
{
  "nodes": [
    { "id": "node_A", "x": 120, "y": 180 },
    { "id": "node_B", "x": 340, "y": 250 }
  ],
  "edges": [
    { "id": "edge_1", "from": "node_A", "to": "node_B", "weight": 7 }
  ]
}
```

### Bộ biên dịch chuyển đổi thành Adjacency List Payload gửi qua POST API:
```json
{
  "algorithmId": "dijkstra",
  "inputType": "adjacency-list",
  "data": {
    "A": [ { "target": "B", "weight": 7 } ],
    "B": [ { "target": "A", "weight": 7 } ]
  }
}
```

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & TỐI ƯU HIỆU NĂNG 60 FPS (ADR)

### ADR-06: mathematical collision checking over DOM rendering

*   **Bối cảnh:** Việc tạo mỗi Node đồ thị là một phần tử HTML `div` sẽ làm DOM phình to cực kỳ nhanh. Khi có lực đẩy vật lý tính toán liên tục ở 60 FPS, việc ép trình duyệt Reflow và Repaint hàng trăm phần tử DOM cùng lúc sẽ gây ra hiện tượng giật giật (Jank) không thể chấp nhận được.
*   **Quyết định:** Sử dụng 100% HTML5 Canvas 2D Context (`ctx`) để vẽ trực tiếp các hình vectơ. Tất cả sự tương tác chuột được ánh xạ qua các phép tính hình học Euclide tĩnh ($x^2 + y^2 \le R^2$).
*   **Kết quả:** Đồ thị chuyển động mượt mà phi thường đạt mức 60 FPS chuẩn mực, tiêu tốn cực kỳ ít tài nguyên RAM của thiết bị di động hay máy tính bảng yếu.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Phát triển
1.  **Sprint A: Thiết lập Canvas & Nhận diện Va chạm (Ngày 1-3):** Dựng Canvas trống, viết hàm xác định click chuột trúng vòng tròn đỉnh, dựng thanh công cụ nổi Glassmorphic.
2.  **Sprint B: Vẽ liên kết & Lực đẩy Vật lý (Ngày 4-6):** Viết logic kéo dây đứt nét tạo cạnh có mũi tên lượng giác, cài đặt vòng lặp vật lý lực đẩy-kéo cân bằng đồ thị và viết Parser xuất JSON.

### 8.2. Tiêu chí Nghiệm thu (DoD)
*   Thực hiện click đúp đẻ ra Node mới mượt mà, kéo thả Node di chuyển đàn hồi dây thun bám theo xuất sắc.
*   Mũi tên định hướng dừng chính xác sát viền ngoài của hình tròn đích, không đâm xuyên qua tâm.
*   Bấm nút "Chạy thuật toán" xuất đúng định dạng JSON danh sách kề không lỗi cú pháp.
