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
  if (/Cannot read properties of null/i.test(message)) {
    return `Truy cập phần tử null — biến đang trỏ tới null thay vì đối tượng; kiểm tra lại nơi gán giá trị. (${message})`;
  }
  if (/Invalid array length/i.test(message)) {
    return `Kích thước mảng không hợp lệ — thường do khởi tạo mảng với độ dài âm/quá lớn hoặc dữ liệu đầu vào rỗng. (${message})`;
  }
  if (/Maximum call stack size exceeded/i.test(message)) {
    return `Đệ quy quá sâu (tràn ngăn xếp) — kiểm tra điều kiện dừng của hàm đệ quy hoặc mảng quá lớn. (${message})`;
  }
  if (/is not defined/.test(message)) {
    return `Biến chưa được khai báo — kiểm tra lại tên biến và thứ tự khai báo. (${message})`;
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
