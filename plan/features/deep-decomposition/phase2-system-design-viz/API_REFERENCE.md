# 🔌 System Design Topology API & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema định dạng mô tả cấu trúc liên kết mạng kéo thả (Network Topology) và mô hình thiết lập DTO C# ASP.NET Core tiếp nhận sơ đồ hệ thống từ máy chủ.

---

## 1. Bản đặc tả JSON Schema cấu hình Topology mạng (SystemTopology Schema)

Siêu dữ liệu mô tả các Node máy chủ kéo thả và các đường dẫn SVG kết nối được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SystemDesignTopology",
  "type": "OBJECT",
  "properties": {
    "topologyId": {
      "type": "STRING"
    },
    "nodes": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "nodeId": {
            "type": "STRING"
          },
          "nodeType": {
            "type": "STRING",
            "enum": ["CLIENT", "LOAD_BALANCER", "WEB_SERVER", "REDIS_CACHE", "POSTGRES_PRIMARY", "POSTGRES_REPLICA"]
          },
          "label": {
            "type": "STRING"
          },
          "posX": {
            "type": "NUMBER"
          },
          "posY": {
            "type": "NUMBER"
          },
          "status": {
            "type": "STRING",
            "enum": ["HEALTHY", "OVERLOADED", "FAILED"]
          }
        },
        "required": ["nodeId", "nodeType", "label", "posX", "posY", "status"]
      }
    },
    "links": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "linkId": {
            "type": "STRING"
          },
          "sourceId": {
            "type": "STRING"
          },
          "targetId": {
            "type": "STRING"
          },
          "latencyMs": {
            "type": "INTEGER"
          }
        },
        "required": ["linkId", "sourceId", "targetId", "latencyMs"]
      }
    }
  },
  "required": ["topologyId", "nodes", "links"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO chịu trách nhiệm nạp sơ đồ kiến trúc hệ thống từ máy chủ C# ASP.NET Core:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class SystemTopologyPayloadDto
    {
        [Required]
        public string TopologyId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public List<TopologyNodeDto> Nodes { get; set; }

        [Required]
        public List<TopologyLinkDto> Links { get; set; }
    }

    public class TopologyNodeDto
    {
        [Required]
        public string NodeId { get; set; }

        [Required]
        public string NodeType { get; set; } // e.g. "CLIENT", "WEB_SERVER"

        [Required]
        public string Label { get; set; }

        [Required]
        public double PosX { get; set; }

        [Required]
        public double PosY { get; set; }

        [Required]
        public string Status { get; set; } // e.g. "HEALTHY", "FAILED"
    }

    public class TopologyLinkDto
    {
        [Required]
        public string LinkId { get; set; }

        [Required]
        public string SourceId { get; set; }

        [Required]
        public string TargetId { get; set; }

        [Required]
        public int LatencyMs { get; set; }
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Lưu trữ Sơ đồ (Topology storage API)

*   **Lưu sơ đồ kéo thả của sinh viên:**
    *   *Endpoint:* `POST /api/v1/system-design/topologies`
    *   *Mẫu Payload gửi đi (201 Created):*
        ```json
        {
          "topologyId": "my-custom-lb-architecture",
          "title": "Sơ đồ Cân bằng tải dự phòng Failover",
          "nodes": [
            {
              "nodeId": "lb-1",
              "nodeType": "LOAD_BALANCER",
              "label": "Nginx LB",
              "posX": 350.0,
              "posY": 180.0,
              "status": "HEALTHY"
            }
          ],
          "links": [
            {
              "linkId": "link-client-lb",
              "sourceId": "client-1",
              "targetId": "lb-1",
              "latencyMs": 15
            }
          ]
        }
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và API lưu trữ cấu hình mạng kéo thả bám sát thiết kế debugger giúp toàn bộ phân hệ vận hành vô cùng trơn tru, bảo mật và chịu tải lớn.
