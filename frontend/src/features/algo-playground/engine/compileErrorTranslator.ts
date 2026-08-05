/**
 * Chuyển message lỗi thô của JS sandbox thành gợi ý tiếng Việt dễ hiểu cho sinh viên.
 * Luôn giữ kèm message gốc trong ngoặc để người dùng có thể tự tra cứu.
 */
export function translateCompileError(message: string): string {
  if (/\bSyntaxError\b|Unexpected token|Lỗi cú pháp/.test(message)) {
    return `Lỗi cú pháp JavaScript — kiểm tra lại dấu ngoặc, dấu chấm phẩy và khai báo biến. (${message})`;
  }
  if (/Vượt quá giới hạn thực thi/.test(message)) {
    return `Thuật toán chạy quá 10.000 bước — có thể có vòng lặp vô hạn hoặc mảng quá lớn. (${message})`;
  }
  if (/giới hạn lặp/.test(message)) {
    return `Vòng lặp chạy quá 1.000.000 lần — có thể có vòng lặp vô hạn. (${message})`;
  }
  if (/Hết thời gian biên dịch/.test(message)) {
    return message;
  }
  if (/Cannot read properties of undefined/.test(message)) {
    return `Truy cập phần tử không tồn tại (undefined) — kiểm tra lại chỉ số mảng và biến đã khai báo. (${message})`;
  }
  if (/is not a function/.test(message)) {
    return `Gọi hàm không tồn tại — kiểm tra lại tên hàm. (${message})`;
  }
  if (/has already been declared/.test(message)) {
    return `Khai báo biến trùng tên — hãy đổi tên biến mới. (${message})`;
  }
  if (/không phải là số hợp lệ|Định dạng cạnh|Độ dài mảng tối đa/.test(message)) {
    return message;
  }
  return message;
}
