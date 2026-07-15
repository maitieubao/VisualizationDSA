# -*- coding: utf-8 -*-
"""
run_all.py - Master Runner
Chạy tất cả 8 phases theo thứ tự để tạo file .docx hoàn chỉnh.

Cách dùng:
  cd d:\FPT\Hihi\tailieu
  python run_all.py

Yêu cầu:
  pip install python-docx
"""
import sys
import os
import time
import io
import sys
# Fix Unicode output tren Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Đảm bảo import đúng thư mục hiện tại
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def check_dependencies() -> bool:
    """Kiểm tra thư viện python-docx đã được cài đặt chưa."""
    try:
        import docx
        return True
    except ImportError:
        print('❌ Thiếu thư viện python-docx!')
        print('   Chạy lệnh sau để cài đặt:')
        print('   pip install python-docx')
        return False


def run_all() -> None:
    if not check_dependencies():
        sys.exit(1)

    # Xóa file nguồn diagram cũ nếu tồn tại để tránh tích lũy trùng lặp
    uml_txt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hinhanh_uml_source.txt')
    if os.path.exists(uml_txt_path):
        try:
            os.remove(uml_txt_path)
            print(f'🧹 Đã dọn dẹp file diagram cũ: {uml_txt_path}')
        except Exception as e:
            print(f'⚠️ Không thể xóa file diagram cũ: {e}')

    print('=' * 60)
    print('   VISUALIZATION DSA - Document Generator')
    print('   Ma hoc phan: PRO2192 | FPT Polytechnic')
    print('=' * 60)
    print()

    phases = [
        ('Phase 0', 'phase0_cover_ack',        'Trang bìa, Lời cảm ơn, Mục lục, Danh mục, Lời mở đầu'),
        ('Phase 1', 'phase1_intro',             'Phần 1: Giới thiệu đề tài + Ban dự án'),
        ('Phase 2', 'phase2_survey',            'Phần 2: Khảo sát – Yêu cầu + Kế hoạch dự án'),
        ('Phase 3', 'phase3_analysis',          'Phần 3: Phân tích – Client-Server, Use Cases, SRS'),
        ('Phase 4', 'phase4_design',            'Phần 4: Thiết kế – Tech Stack, ERD, Class Diagram'),
        ('Phase 5', 'phase5_implement',         'Phần 5: Thực hiện – Database, Sequence, API'),
        ('Phase 6', 'phase6_testing',           'Phần 6: Kiểm thử – Test Cases'),
        ('Phase 7', 'phase7_deploy_conclusion', 'Phần 7: Deploy + Kết luận + Tài liệu tham khảo'),
    ]

    total_start = time.time()

    for phase_label, module_name, description in phases:
        print(f'▶ [{phase_label}] {description}')
        t_start = time.time()
        try:
            module = __import__(module_name)
            module.run()
            elapsed = time.time() - t_start
            print(f'  ✅ Hoàn thành trong {elapsed:.2f}s\n')
        except Exception as e:
            print(f'  ❌ LỖI khi chạy {module_name}: {e}')
            import traceback
            traceback.print_exc()
            print('\n  ⚠️  Dừng lại. Kiểm tra lỗi và thử lại.')
            sys.exit(1)

    total_elapsed = time.time() - total_start

    from helpers import get_output_path
    output_path = get_output_path()

    print('=' * 60)
    print(f'  [OK] DA TAO TAI LIEU THANH CONG!')
    print(f'       Tong thoi gian: {total_elapsed:.2f} giay')
    print(f'       File output:')
    print(f'       {output_path}')
    print('=' * 60)
    print()
    print('[LUU Y] Sau khi mo file .docx:')
    print('   1. Ctrl+A chon toan bo -> F9 cap nhat TOC')
    print('   2. Tim [IMAGE_PLACEHOLDER_*] mau do de chen anh thuc')
    print('   3. Tim [...] dien thong tin con thieu (GVHD, ngay thang)')
    print('   4. Cap nhat so trang trong Muc luc va Danh muc')
    print()


if __name__ == '__main__':
    run_all()
