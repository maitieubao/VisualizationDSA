# 🔌 Graph Parser & Backend API Integration (Phase 1)

Tài liệu này đặc tả chi tiết giao diện chuyển đổi dữ liệu bản vẽ (Parser) sang ma trận kề hoặc danh sách kề và mô hình hợp đồng C# tiếp nhận ở Backend.

---

## 1. Bản Biên dịch Đồ thị (Graph Parser Model)

Sau khi người học hoàn tất bản vẽ đồ thị trên Canvas, dữ liệu lưu trữ tại Pinia Store (`nodes` và `edges`) sẽ được bộ chuyển đổi chuyển sang định dạng **Adjacency List (Danh sách kề)** trước khi truyền tải qua API Backend.

### 1.1. Dữ liệu Đồ thị thô trong Store:
```json
{
  "nodes": [
    { "id": "node_A", "label": "A", "x": 100, "y": 150 },
    { "id": "node_B", "label": "B", "x": 300, "y": 250 },
    { "id": "node_C", "label": "C", "x": 150, "y": 400 }
  ],
  "edges": [
    { "id": "edge_1", "from": "node_A", "to": "node_B", "weight": 8 },
    { "id": "edge_2", "from": "node_B", "to": "node_C", "weight": 5 }
  ]
}
```

### 1.2. JSON Payload gửi POST `/api/v1/algorithms/execute`:
```json
{
  "algorithmId": "dijkstra",
  "inputType": "adjacency-list",
  "nodes": ["A", "B", "C"],
  "adjacencyList": {
    "A": [ { "target": "B", "weight": 8 } ],
    "B": [ { "target": "A", "weight": 8 }, { "target": "C", "weight": 5 } ],
    "C": [ { "target": "B", "weight": 5 } ]
  }
}
```

---

## 2. Mô hình tiếp nhận C# tại Backend Controller (.NET Core)

Để tiếp nhận và xử lý cấu trúc đồ thị từ Client-side gửi lên để tính toán hoạt ảnh, ở Backend chúng ta xây dựng cấu trúc các lớp tiếp nhận DTO như sau:

```csharp
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class AlgorithmExecutionRequest
    {
        [Required]
        public string AlgorithmId { get; set; }

        [Required]
        // Kiểu dữ liệu nhập: "adjacency-list" hoặc "adjacency-matrix"
        public string InputType { get; set; }

        [Required]
        // Danh sách các đỉnh nhãn chữ
        public List<string> Nodes { get; set; } = new List<string>();

        [Required]
        // Danh sách kề biểu thị mối nối chéo và trọng số
        public Dictionary<string, List<AdjacencyNode>> AdjacencyList { get; set; } 
            = new Dictionary<string, List<AdjacencyNode>>();
    }

    public class AdjacencyNode
    {
        [Required]
        public string Target { get; set; }

        [Required]
        [Range(1, 999, ErrorMessage = "Trọng số cạnh phải nằm trong khoảng từ 1 đến 999.")]
        public int Weight { get; set; }
    }
}
```

---

## 3. Các quy tắc Kiểm tra tính toàn vẹn (Payload Validation)

Khi nhận yêu cầu tính toán giải thuật đồ thị từ Sân chơi tương tác, Backend áp dụng các luật kiểm tra biên:
1.  **Tính liên thông (Connectedness):** Cảnh báo nếu đồ thị chứa đỉnh cô lập không kết nối với bất kỳ ai (đối với thuật toán Dijkstra hoặc Prim).
2.  **Chu trình âm (Negative Cycles):** Trả về mã lỗi `HTTP 400 Bad Request` nếu phát hiện có trọng số âm trong thuật toán Dijkstra (đề xuất nâng cấp Bellman-Ford ở Phase 2).
