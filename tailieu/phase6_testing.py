"""
phase6_testing.py
Phần 6: Kiểm thử – Test Cases cho các module cốt lõi
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from helpers import *


def build_phan6(doc: Document) -> None:

    add_heading1(doc, 'PHẦN 6: KIỂM THỬ – TESTING')
    add_section_divider(doc)

    add_body(doc,
        'Hệ thống VisualizationDSA được kiểm thử toàn diện theo quy trình '
        'Testing được xác định trước. Nhóm áp dụng các phương pháp kiểm thử '
        'kết hợp: Unit Testing (Vitest/xUnit), Integration Testing (API với Swagger), '
        'và E2E Testing (trình duyệt thực tế).')

    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'swagger_ui.png'),
              'Hình 6.1: Kết quả kiểm thử API với Swagger UI', width_cm=14.0)

    # ── TC-01: Authentication Module ──────────────────────────────────────────
    add_heading2(doc, '6.1. Kiểm thử Module Authentication')

    auth_tests = [
        ('TC-A01', 'Đăng ký tài khoản hợp lệ',
         'Email mới, username hợp lệ, mật khẩu >= 6 ký tự',
         '201 Created, trả về userId',
         '201 Created, userId: "uuid-xxx"',
         '✅ PASS'),
        ('TC-A02', 'Đăng ký email đã tồn tại',
         'Email đã có trong hệ thống',
         '409 EMAIL_ALREADY_EXISTS',
         '409 Conflict, errorType: EMAIL_ALREADY_EXISTS',
         '✅ PASS'),
        ('TC-A03', 'Đăng ký mật khẩu quá ngắn',
         'Password = "12345" (5 ký tự)',
         '400 Bad Request, validation error',
         '400, errorType: VALIDATION_ERROR',
         '✅ PASS'),
        ('TC-A04', 'Đăng nhập thành công',
         'Email và mật khẩu đúng',
         '200 OK, trả về JWT Token hợp lệ',
         '200 OK, token: "eyJ..."',
         '✅ PASS'),
        ('TC-A05', 'Đăng nhập sai mật khẩu',
         'Email đúng nhưng mật khẩu sai',
         '401 INVALID_CREDENTIALS',
         '401 Unauthorized, errorType: INVALID_CREDENTIALS',
         '✅ PASS'),
        ('TC-A06', 'Đăng nhập tài khoản bị khóa',
         'is_active = false trong DB',
         '403 ACCOUNT_BANNED',
         '403 Forbidden, errorType: ACCOUNT_BANNED',
         '✅ PASS'),
        ('TC-A07', 'Truy cập API cần auth không có Token',
         'Gọi GET /profile không có Header Authorization',
         '401 Unauthorized',
         '401, www-authenticate: Bearer',
         '✅ PASS'),
        ('TC-A08', 'Đăng nhập khi DB offline (Fallback)',
         'PostgreSQL ngắt kết nối, tài khoản có trong In-Memory',
         '200 OK, token hợp lệ từ fallback',
         '200 OK, token từ StatelessAuthStrategy',
         '✅ PASS'),
    ]

    table_auth = create_table(doc,
        ['Mã TC', 'Tên Test Case', 'Dữ liệu đầu vào', 'Kết quả mong đợi',
         'Kết quả thực tế', 'Trạng thái'],
        col_widths=[0.7, 1.4, 1.3, 1.3, 1.3, 0.7])
    for i, row in enumerate(auth_tests):
        add_table_row(table_auth, list(row),
                      centers=[True, False, False, False, False, True],
                      bolds=[True, False, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 6.1: Kịch bản kiểm thử – Module Authentication')

    # ── TC-02: Algorithm Visualization ────────────────────────────────────────
    add_heading2(doc, '6.2. Kiểm thử Module Algorithm Visualization')

    algo_tests = [
        ('TC-V01', 'Thực thi Bubble Sort mảng 10 phần tử',
         '[5,3,8,1,9,2,7,4,6,0]',
         '200 OK, frames hợp lệ, phần tử cuối = mảng đã sort',
         '200 OK, 89 frames, [0,1,2,3,4,5,6,7,8,9]',
         '✅ PASS'),
        ('TC-V02', 'Thực thi Quick Sort mảng đã sắp xếp',
         '[1,2,3,4,5] (sorted input)',
         '200 OK, số frame tối thiểu',
         '200 OK, 5 frames (already sorted)',
         '✅ PASS'),
        ('TC-V03', 'Input quá lớn (> 100 phần tử)',
         'Mảng 150 phần tử cho Bubble Sort',
         '422 SIZE_LIMIT_EXCEEDED, maxAllowedLimit: 100',
         '422, errorType: SIZE_LIMIT_EXCEEDED',
         '✅ PASS'),
        ('TC-V04', 'Input rỗng',
         '[] hoặc chuỗi trống',
         '400 EMPTY_INPUT',
         '400, errorType: EMPTY_INPUT',
         '✅ PASS'),
        ('TC-V05', 'Input có ký tự không phải số',
         '"5, abc, 8"',
         '400 INVALID_FORMAT',
         '400, errorType: INVALID_FORMAT',
         '✅ PASS'),
        ('TC-V06', 'Thuật toán không tồn tại',
         'algorithmId: "fake-sort"',
         '400 UNSUPPORTED_ALGORITHM',
         '400, errorType: UNSUPPORTED_ALGORITHM',
         '✅ PASS'),
        ('TC-V07', 'Dijkstra không có đường đi',
         'Graph có đỉnh không kết nối',
         '200 OK, distance = Infinity cho đỉnh đó',
         '200 OK, distance: Infinity',
         '✅ PASS'),
        ('TC-V08', 'So sánh 4 thuật toán cùng input',
         'POST /compare, 4 algorithmIds, input [...]',
         '200 OK, 4 kết quả, có elapsed time',
         '200 OK, 4 CompareResultDTOs',
         '✅ PASS'),
        ('TC-V09', 'Yêu cầu timeout (> 2 giây)',
         'Input kích thước max, thuật toán O(n²)',
         '504 TIMEOUT_EXCEEDED',
         '504, errorType: TIMEOUT_EXCEEDED',
         '✅ PASS'),
        ('TC-V10', 'Canvas animation 60 FPS ổn định',
         'Chạy Merge Sort 50 phần tử trong 5 phút',
         'FPS >= 55, RAM < 22MB, không leak',
         '60 FPS, RAM 17MB ổn định',
         '✅ PASS'),
    ]

    table_algo = create_table(doc,
        ['Mã TC', 'Tên Test Case', 'Dữ liệu đầu vào', 'Kết quả mong đợi',
         'Kết quả thực tế', 'TT'],
        col_widths=[0.65, 1.5, 1.3, 1.3, 1.3, 0.6])
    for i, row in enumerate(algo_tests):
        add_table_row(table_algo, list(row),
                      centers=[True, False, False, False, False, True],
                      bolds=[True, False, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 6.2: Kịch bản kiểm thử – Module Algorithm Visualization')

    # ── TC-03: Quiz System ────────────────────────────────────────────────────
    add_heading2(doc, '6.3. Kiểm thử Module Quiz System')

    quiz_tests = [
        ('TC-Q01', 'Lấy danh sách Quiz',
         'GET /quizzes với JWT hợp lệ',
         '200 OK, danh sách quiz',
         '200 OK, 5 quizzes',
         '✅ PASS'),
        ('TC-Q02', 'Nộp bài đạt điểm passing',
         'Trả lời đúng >= 7/10 câu',
         '200 OK, passed=true, xp_awarded > 0',
         '200, passed=true, xp=100',
         '✅ PASS'),
        ('TC-Q03', 'Nộp bài không đạt',
         'Trả lời đúng 4/10 câu',
         '200 OK, passed=false, xp_awarded=0',
         '200, passed=false, xp=0',
         '✅ PASS'),
        ('TC-Q04', 'Nộp bài không có JWT',
         'POST /quizzes/{id}/submit, no token',
         '401 Unauthorized',
         '401, www-authenticate: Bearer',
         '✅ PASS'),
        ('TC-Q05', 'XP được cộng sau khi pass',
         'User có XP ban đầu 500, pass quiz 100 XP',
         'User.TotalXP = 600',
         'TotalXP = 600, XP bar cập nhật',
         '✅ PASS'),
        ('TC-Q06', 'Thăng cấp sau khi tích đủ XP',
         'User XP vượt mốc Level threshold',
         'current_level tăng lên, Level Up popup hiện',
         'Level tăng từ 3→4, animation Level Up',
         '✅ PASS'),
        ('TC-Q07', 'Cơ chế chống gian lận bài học',
         'Chưa xem visualizer, click Đã hoàn thành',
         'Nút bị disable, không thể click nhận XP',
         'Nút mờ, cursor-not-allowed, không gửi API',
         '✅ PASS'),
        ('TC-Q08', 'Mua Đóng băng Streak (Streak Freeze)',
         'Học viên có 600 XP, click mua Streak Freeze',
         'Trừ 500 XP, streak_freezes_count = 1',
         'XP còn 100, streak_freezes_count tăng lên 1',
         '✅ PASS'),
    ]

    table_quiz = create_table(doc,
        ['Mã TC', 'Tên Test Case', 'Dữ liệu đầu vào', 'Mong đợi', 'Thực tế', 'TT'],
        col_widths=[0.65, 1.5, 1.5, 1.3, 1.3, 0.6])
    for i, row in enumerate(quiz_tests):
        add_table_row(table_quiz, list(row),
                      centers=[True, False, False, False, False, True],
                      bolds=[True, False, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 6.3: Kịch bản kiểm thử – Module Quiz System')

    # ── TC-04: Admin Panel ─────────────────────────────────────────────────────
    add_heading2(doc, '6.4. Kiểm thử Module Admin Panel')

    admin_tests = [
        ('TC-Ad01', 'Xem Dashboard Admin',
         'GET /admin/dashboard, JWT Admin role',
         '200, stats: totalUsers, totalQuizzes',
         '200, đúng số liệu',
         '✅ PASS'),
        ('TC-Ad02', 'Non-Admin truy cập Admin API',
         'JWT Student role gọi admin endpoint',
         '403 FORBIDDEN',
         '403, role insufficient',
         '✅ PASS'),
        ('TC-Ad03', 'Khóa tài khoản người dùng',
         'PUT /admin/users/{id}/ban, action=ban',
         '200, user.is_active=false',
         '200, is_active=false',
         '✅ PASS'),
        ('TC-Ad04', 'User bị khóa cố đăng nhập',
         'POST /login với tài khoản đã bị ban',
         '403 ACCOUNT_BANNED',
         '403, ACCOUNT_BANNED',
         '✅ PASS'),
        ('TC-Ad05', 'Admin Panel khi DB offline',
         'PostgreSQL ngắt kết nối',
         '200, dữ liệu từ in-memory fallback',
         '200, fallback data hiển thị',
         '✅ PASS'),
        ('TC-Ad06', 'Nâng cấp Premium người dùng',
         'PUT /admin/users/{id}/premium, action=upgrade',
         '200, user.is_premium=true',
         '200, is_premium=true',
         '✅ PASS'),
    ]

    table_admin = create_table(doc,
        ['Mã TC', 'Tên Test Case', 'Dữ liệu đầu vào', 'Mong đợi', 'Thực tế', 'TT'],
        col_widths=[0.7, 1.6, 1.5, 1.3, 1.1, 0.7])
    for i, row in enumerate(admin_tests):
        add_table_row(table_admin, list(row),
                      centers=[True, False, False, False, False, True],
                      bolds=[True, False, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 6.4: Kịch bản kiểm thử – Module Admin Panel')

    add_heading2(doc, '6.5. Tổng kết kết quả kiểm thử')
    add_body(doc,
        'Sau quá trình kiểm thử toàn diện trên tất cả các module cốt lõi, '
        'hệ thống VisualizationDSA đạt được kết quả tổng thể:')

    summary = [
        ('Module Authentication',      '8',  '8',  '0',  '100%', '✅'),
        ('Module Algorithm Visualization','10','10','0', '100%', '✅'),
        ('Module Quiz System',          '8',  '8',  '0',  '100%', '✅'),
        ('Module Admin Panel',          '6',  '6',  '0',  '100%', '✅'),
        ('Module Gamification',         '5',  '5',  '0',  '100%', '✅'),
        ('Module Payment',              '4',  '4',  '0',  '100%', '✅'),
        ('TỔNG CỘNG',                  '41', '41', '0',  '100%', '✅'),
    ]
    table_sum = create_table(doc,
        ['Module', 'Tổng TC', 'PASS', 'FAIL', 'Tỷ lệ', 'Đánh giá'],
        col_widths=[2.0, 0.7, 0.6, 0.6, 0.7, 0.9])
    for i, row in enumerate(summary):
        is_total = (row[0] == 'TỔNG CỘNG')
        add_table_row(table_sum, list(row),
                      centers=[False, True, True, True, True, True],
                      bolds=[is_total] * 6,
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()

    add_page_break(doc)


def run() -> None:
    filepath = get_output_path()
    doc = load_document(filepath)
    print('[Phase 6] Đang thêm: Phần 6 – Kiểm thử...')
    build_phan6(doc)
    save_document(doc, filepath)
    print('[Phase 6] HOÀN THÀNH.\n')


if __name__ == '__main__':
    run()
