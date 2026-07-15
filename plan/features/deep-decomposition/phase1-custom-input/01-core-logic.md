# 🧠 Core Logic & Backend Validation Pipeline (C# .NET)

Tài liệu này đặc tả chi tiết cơ chế phân tích chuỗi thô (String Parsing) và hệ thống kiểm soát giới hạn tài nguyên đa lớp ở phía máy chủ sử dụng **C# .NET Core**.

---

## 1. Bộ Phân tích Cú pháp Đầu vào (Input Parsing Engine)

Để trích xuất chuỗi dữ liệu văn bản thô do người dùng nhập từ trình duyệt thành mảng số nguyên an toàn, hệ thống áp dụng bộ phân tích cú pháp tĩnh sử dụng biểu thức chính quy (Regular Expressions) mạnh mẽ:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace VisualizationDSA.Core.Input
{
    public static class InputParser
    {
        // Biểu thức chính quy kiểm tra định dạng mảng cách nhau bởi dấu phẩy
        // Cho phép số âm, số dương, khoảng trắng tuỳ ý trước/sau dấu phẩy
        private static readonly Regex ArrayPattern = new(@"^([+-]?\d+)(\s*,\s*[+-]?\d+)*$");

        /// <summary>
        /// Phân tích và chuyển đổi chuỗi thô thành mảng số nguyên.
        /// </summary>
        /// <param name="rawInput">Chuỗi dữ liệu thô nhập từ textarea</param>
        /// <returns>Mảng số nguyên an toàn</returns>
        public static int[] ParseArray(string rawInput)
        {
            if (string.IsNullOrWhiteSpace(rawInput))
            {
                throw new ArgumentException("Dữ liệu đầu vào không được để trống.");
            }

            string cleanInput = rawInput.Trim();

            // 1. Kiểm tra cấu trúc định dạng bằng Regex trước khi bóc tách
            if (!ArrayPattern.IsMatch(cleanInput))
            {
                throw new FormatException("Định dạng mảng không hợp lệ. Chỉ cho phép các số nguyên cách nhau bằng dấu phẩy.");
            }

            // 2. Tách chuỗi và chuyển đổi kiểu dữ liệu
            try
            {
                return cleanInput
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => int.Parse(s.Trim()))
                    .ToArray();
            }
            catch (OverflowException)
            {
                throw new OverflowException("Phát hiện phần tử vượt quá giá trị giới hạn tối đa của kiểu số nguyên 32-bit (Int32.MaxValue/MinValue).");
            }
            catch (Exception ex)
            {
                throw new FormatException($"Đã xảy ra lỗi không xác định trong quá trình xử lý chuỗi: {ex.Message}");
            }
        }
    }
}
```

---

## 2. Bộ Giải quyết Giới hạn Tài nguyên (Safety Constraints Resolver)

Mỗi giải thuật có độ phức tạp thời gian khác nhau sẽ tiêu thụ số lượng chu kỳ CPU khác nhau để sinh các frame hoạt họa. `ConstraintResolver` đóng vai trò chốt chặn giám sát kích thước đầu vào an toàn tương ứng:

```csharp
using System;
using System.Collections.Generic;

namespace VisualizationDSA.Core.Input
{
    public static class ConstraintResolver
    {
        // Ánh xạ giới hạn phần tử tối đa cho phép đối với từng giải thuật
        private static readonly Dictionary<string, int> SafetyLimits = new(StringComparer.OrdinalIgnoreCase)
        {
            { "linear-search", 100 },
            { "binary-search", 150 },
            { "bubble-sort", 50 },
            { "selection-sort", 50 },
            { "insertion-sort", 50 },
            { "quick-sort", 150 },
            { "merge-sort", 150 },
            { "tsp-backtracking", 10 } // Giới hạn cực thấp do độ phức tạp O(N!)
        };

        /// <summary>
        /// Tra cứu giới hạn kích thước mảng tối đa cho giải thuật được chọn.
        /// </summary>
        public static int GetAllowedLimit(string algorithmId)
        {
            if (SafetyLimits.TryGetValue(algorithmId, out int maxLimit))
            {
                return maxLimit;
            }
            return 10; // Giới hạn an toàn mặc định cực thấp đối với giải thuật lạ
        }

        /// <summary>
        /// Xác thực kích thước mảng nhập vào có nằm trong ngưỡng an toàn hay không.
        /// </summary>
        public static bool ValidateSize(string algorithmId, int currentSize, out int allowedLimit)
        {
            allowedLimit = GetAllowedLimit(algorithmId);
            return currentSize <= allowedLimit;
        }
    }
}
```

---

## 3. Xác thực Logic cấu trúc nâng cao (Graph/Tree Validation Gate)

Đối với các cấu trúc dữ liệu phân nhánh (như Cây nhị phân, Đồ thị), Backend tiến hành kiểm tra tính toàn vẹn cấu trúc logic của đầu vào tùy chỉnh trước khi nạp vào máy chạy giải thuật:

### 3.1. Xác thực tính liên thông của Đồ thị (Connected Graph Check)
Nếu giải thuật duyệt đồ thị yêu cầu đồ thị phải liên thông (Connected Graph), Backend sử dụng thuật toán duyệt theo chiều sâu (DFS) để kiểm tra tất cả các node có liên kết với nhau hay không:
*   *Quy tắc:* Khởi chạy DFS từ node 0. Nếu số lượng node được duyệt qua nhỏ hơn tổng số node khai báo trong danh sách cạnh thô, ném ra lỗi `Unprocessable Entity` báo đồ thị bị cô lập thành nhiều thành phần độc lập.

### 3.2. Phát hiện Chu trình trên Cây (Cycle Detection for Trees)
Nếu người dùng gõ danh sách cạnh để xây dựng Cây nhị phân (Binary Tree), Backend áp dụng bộ lọc phát hiện chu trình (Cycle Detection) thông qua cấu trúc tập hợp không giao nhau (Disjoint Set Union - DSU):
*   *Quy tắc:* Quét qua từng cạnh $\{u, v\}$. Nếu tìm thấy `Find(u) == Find(v)`, nghĩa là cạnh này sẽ tạo ra một chu trình khép kín, cấu trúc đầu vào không phải là một Cây hợp lệ. Ném ra lỗi cảnh báo ngay lập tức.
