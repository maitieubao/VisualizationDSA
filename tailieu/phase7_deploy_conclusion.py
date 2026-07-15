"""
phase7_deploy_conclusion.py
Phần 7: Đóng gói & Triển khai + Kết luận + Tài liệu tham khảo
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from helpers import *


def build_phan7(doc: Document) -> None:

    add_heading1(doc, 'PHẦN 7: ĐÓNG GÓI & TRIỂN KHAI – DEPLOYMENT')
    add_section_divider(doc)

    add_body(doc,
        'Hệ thống VisualizationDSA được đóng gói và triển khai tách biệt '
        'cho hai thành phần Frontend và Backend, đảm bảo tính độc lập và '
        'khả năng scale từng phần riêng biệt theo nhu cầu.')

    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'deploy_flow.png'),
              'Hình 7.1: Quy trình build và deploy ứng dụng', width_cm=14.0)

    # ── 7.1 Yêu cầu môi trường ────────────────────────────────────────────────
    add_heading2(doc, '7.1. Yêu cầu môi trường (Prerequisites)')

    env_reqs = [
        ('Node.js', '≥ 18.x LTS', 'Runtime để build và chạy Frontend Vue 3 + Vite'),
        ('.NET SDK', '9.0', 'SDK để build và chạy Backend ASP.NET Core Web API'),
        ('PostgreSQL', '16.x', 'Database server (hoặc kết nối Supabase Cloud)'),
        ('Git', '≥ 2.40', 'Quản lý phiên bản source code'),
        ('Docker', '≥ 24.x (tùy chọn)', 'Container hóa backend và database'),
    ]
    table_env = create_table(doc, ['Công nghệ', 'Phiên bản', 'Mục đích'],
                             col_widths=[1.2, 1.2, 4.5])
    for i, row in enumerate(env_reqs):
        add_table_row(table_env, list(row),
                      centers=[False, True, False],
                      bolds=[True, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 7.1: Yêu cầu môi trường triển khai')

    # ── 7.2 Cấu hình môi trường ───────────────────────────────────────────────
    add_heading2(doc, '7.2. Cấu hình biến môi trường')
    add_heading3(doc, '7.2.1. Backend – appsettings.json')
    backend_config = """\
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-supabase-host;Port=5432;Database=visualization_dsa;Username=postgres;Password=your_password"
  },
  "JwtSettings": {
    "SecretKey": "your-256-bit-secret-key-min-32-characters",
    "Issuer": "VisualizationDSA",
    "Audience": "VisualizationDSA-Clients",
    "ExpiryMinutes": 1440
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [ "http://localhost:5173", "https://your-production-domain.com" ]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}"""
    add_code_block(doc, backend_config, lang='JSON')

    add_heading3(doc, '7.2.2. Frontend – .env.production')
    frontend_env = """\
# File: frontend/.env.production
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
VITE_APP_TITLE=VisualizationDSA
VITE_PAYMENT_GATEWAY_URL=https://payment.gateway.com
VITE_APP_VERSION=1.0.0"""
    add_code_block(doc, frontend_env, lang='Shell (.env)')

    # ── 7.3 Quy trình Build ───────────────────────────────────────────────────
    add_heading2(doc, '7.3. Quy trình Build')
    add_heading3(doc, '7.3.1. Build Frontend (Vue 3 + Vite)')
    frontend_build = """\
# 1. Vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Chạy Development Server (port 5173)
npm run dev

# 4. Kiểm tra TypeScript errors (bắt buộc)
npx vue-tsc -b --noEmit

# 5. Build production bundle
npm run build

# 6. Kiết quả: Thư mục dist/ chứa static files
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js     (bundle chính)
# │   └── index-[hash].css    (styles)
# └── ...

# 7. Preview production build (optional)
npm run preview"""
    add_code_block(doc, frontend_build, lang='Shell')

    add_heading3(doc, '7.3.2. Build Backend (ASP.NET Core .NET 9)')
    backend_build = """\
# 1. Vào thư mục backend
cd backend

# 2. Restore NuGet packages
dotnet restore

# 3. Build (Release mode)
dotnet build -c Release

# 4. Áp dụng EF Core Migrations
cd src/WebApi
dotnet ef database update --project ../Infrastructure/Infrastructure.csproj

# 5. Chạy Development Server (port 5055)
dotnet run --project src/WebApi/WebApi.csproj

# 6. Build production publish
dotnet publish src/WebApi/WebApi.csproj -c Release -o ./publish

# 7. Chạy production (từ thư mục publish/)
cd publish
dotnet VisualizationDSA.WebApi.dll --urls "http://0.0.0.0:5055"

# 8. Swagger UI: http://localhost:5055/swagger
#    API Base: http://localhost:5055/api/v1"""
    add_code_block(doc, backend_build, lang='Shell')

    add_heading3(doc, '7.3.3. Script khởi động nhanh (run-project.bat)')
    bat_script = """\
@echo off
REM VisualizationDSA — Script khởi động nhanh
echo ======================================
echo   VISUALIZATION DSA — DEV STARTUP
echo ======================================

REM Khởi động Backend
echo [1/2] Khoi dong Backend (.NET 9 / Port 5055)...
start "Backend Server" cmd /k "cd /d %~dp0backend && dotnet run --project src/WebApi/WebApi.csproj"

REM Delay 3 giây để Backend khởi động xong
timeout /t 3 /nobreak > nul

REM Khởi động Frontend
echo [2/2] Khoi dong Frontend (Vue 3 / Port 5173)...
start "Frontend Dev Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend : http://localhost:5055
echo Frontend: http://localhost:5173
echo Swagger : http://localhost:5055/swagger
echo ======================================
pause"""
    add_code_block(doc, bat_script, lang='Batch Script (Windows)')

    # ── 7.4 Deploy lên Hosting ─────────────────────────────────────────────────
    add_heading2(doc, '7.4. Hướng dẫn Deploy lên Hosting')

    add_heading3(doc, 'Frontend — Vercel / Netlify (Static Hosting)')
    vercel_deploy = """\
# Deploy lên Vercel (tự động CI/CD từ GitHub)
# 1. Push code lên GitHub repository
git push origin main

# 2. Kết nối Vercel với repository tại vercel.com
# 3. Cấu hình Build Settings:
#    - Framework Preset: Vite
#    - Build Command: npm run build
#    - Output Directory: dist
# 4. Thêm Environment Variables trong Vercel Dashboard:
#    VITE_API_BASE_URL = https://api.your-domain.com/api/v1
# 5. Deploy tự động mỗi khi push lên main branch"""
    add_code_block(doc, vercel_deploy, lang='Shell')

    add_heading3(doc, 'Backend — Docker Container')
    dockerfile_content = """\
# Dockerfile — Backend ASP.NET Core
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY backend/ .
RUN dotnet restore src/WebApi/WebApi.csproj
RUN dotnet publish src/WebApi/WebApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5055
ENV ASPNETCORE_URLS=http://+:5055
ENTRYPOINT ["dotnet", "VisualizationDSA.WebApi.dll"]"""
    add_code_block(doc, dockerfile_content, lang='Dockerfile')

    docker_run = """\
# Build và chạy Docker container
docker build -t visualization-dsa-backend .
docker run -d \\
  -p 5055:5055 \\
  -e ConnectionStrings__DefaultConnection="Host=..." \\
  -e JwtSettings__SecretKey="your-secret-key" \\
  --name dsa-backend \\
  visualization-dsa-backend"""
    add_code_block(doc, docker_run, lang='Shell (Docker)')

    add_page_break(doc)


def build_ket_luan(doc: Document) -> None:
    """Kết luận & Hướng phát triển."""
    add_heading1(doc, 'KẾT LUẬN & HƯỚNG PHÁT TRIỂN')
    add_section_divider(doc)

    add_heading2(doc, 'Kết quả đạt được')

    add_body(doc,
        'Sau 14 tuần thực hiện dự án tốt nghiệp với sự đầu tư nghiêm túc và tâm '
        'huyết từ cả nhóm, hệ thống "VisualizationDSA" đã được hoàn thành với '
        'toàn bộ 16 tính năng chức năng theo yêu cầu ban đầu, vượt qua bộ '
        '39 Test Case tự động và đạt tỷ lệ kiểm thử 100% PASS.')

    achievements = [
        'Xây dựng thành công Canvas Animation Engine đạt 60 FPS ổn định với kỹ thuật Vector Lerp và Double Buffering — trực quan hóa 15+ thuật toán DSA.',
        'Triển khai đầy đủ 29 Strategy Classes bao phủ toàn bộ kiến thức: Sorting, Graph, Tree, Search, OOP, SOLID, Design Patterns, DI Container.',
        'Hoàn thiện hệ sinh thái học tập: Quiz System (30+ câu hỏi), Gamification (XP + Level + Badge), Leaderboard, E-Lecture Mode.',
        'Xây dựng Admin Panel với khả năng graceful degradation — vẫn hoạt động khi PostgreSQL ngắt kết nối nhờ StatelessAuth fallback.',
        'Thiết kế RESTful API chuẩn với 22 Controllers, Swagger documentation, JWT authentication và phân quyền RBAC.',
        'Áp dụng thực tế Clean Architecture, Strategy Pattern, Repository Pattern và nguyên tắc SOLID trong toàn bộ backend.',
    ]
    for item in achievements:
        add_bullet(doc, item)

    add_heading2(doc, 'Hướng phát triển trong tương lai')
    future = [
        ('Mobile App', 'Phát triển ứng dụng di động React Native để người học có thể truy cập trên smartphone và tablet.'),
        ('AI-Powered Hints', 'Tích hợp Large Language Model (GPT-4/Gemini) để tự động giải thích thuật toán và gợi ý khi người học gặp khó khăn.'),
        ('Collaborative Mode', 'Chế độ học nhóm — nhiều người cùng xem và điều khiển animation trên cùng một phòng học ảo (WebSocket).'),
        ('Offline PWA', 'Chuyển đổi sang Progressive Web App hỗ trợ offline mode, cho phép học ngay cả khi không có internet.'),
        ('More Algorithms', 'Mở rộng thư viện với 20+ thuật toán nâng cao: A*, Floyd-Warshall, Kruskal, Prim, Red-Black Tree, B-Tree.'),
        ('Analytics Dashboard', 'Dashboard phân tích học tập sâu hơn với biểu đồ tiến trình, điểm yếu và đề xuất bài học cá nhân hóa.'),
        ('Multi-language', 'Hỗ trợ đa ngôn ngữ: English, 日本語, 한국어 để phục vụ người dùng quốc tế.'),
    ]
    for feat, desc in future:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r1 = p.add_run(f'• {feat}: ')
        r1.font.name = FONT_NAME; r1.font.size = Pt(12); r1.font.bold = True
        r2 = p.add_run(desc)
        r2.font.name = FONT_NAME; r2.font.size = Pt(12)

    add_heading2(doc, 'Lời kết')
    add_body(doc,
        'Dự án VisualizationDSA không chỉ là một bài tập tốt nghiệp, mà còn '
        'là kết quả của hành trình học hỏi, rèn luyện và áp dụng thực tế toàn '
        'bộ kiến thức chuyên ngành trong 3 năm học tại FPT Polytechnic. Thông '
        'qua dự án này, nhóm đã học được cách thiết kế hệ thống thực tế, viết '
        'code sạch và dễ bảo trì, làm việc nhóm theo Agile Scrum và giải quyết '
        'các bài toán kỹ thuật phức tạp trong thực tế.')

    add_body(doc,
        'Nhóm hy vọng rằng VisualizationDSA sẽ thực sự trở thành một công cụ '
        'học tập hữu ích, giúp không chỉ sinh viên FPT Polytechnic mà còn '
        'nhiều người học lập trình khác nắm bắt được các khái niệm quan trọng '
        'của Khoa học Máy tính một cách trực quan, thú vị và hiệu quả hơn.')

    add_page_break(doc)


def build_tai_lieu_tham_khao(doc: Document) -> None:
    """Tài liệu tham khảo."""
    add_heading1(doc, 'TÀI LIỆU THAM KHẢO')
    add_section_divider(doc)

    references = [
        ('[1]', 'Robert C. Martin, "Clean Architecture: A Craftsman\'s Guide to Software Structure and Design", Prentice Hall, 2017.'),
        ('[2]', 'Gang of Four (Gamma, Helm, Johnson, Vlissides), "Design Patterns: Elements of Reusable Object-Oriented Software", Addison-Wesley, 1994.'),
        ('[3]', 'Microsoft Corporation, "ASP.NET Core Documentation", Phiên bản .NET 9. Truy cập từ: https://learn.microsoft.com/en-us/aspnet/core'),
        ('[4]', 'Vue.js Team, "Vue 3 Official Documentation", 2024. Truy cập từ: https://vuejs.org/guide/'),
        ('[5]', 'TypeScript Team, "TypeScript Documentation", Microsoft, 2024. Truy cập từ: https://www.typescriptlang.org/docs/'),
        ('[6]', 'Pinia Team, "Pinia Documentation – Vue Store", 2024. Truy cập từ: https://pinia.vuejs.org/'),
        ('[7]', 'PostgreSQL Global Development Group, "PostgreSQL 16 Documentation", 2024. Truy cập từ: https://www.postgresql.org/docs/16/'),
        ('[8]', 'Microsoft Corporation, "Entity Framework Core Documentation", 2024. Truy cập từ: https://learn.microsoft.com/en-us/ef/core/'),
        ('[9]', 'Thomas H. Cormen et al., "Introduction to Algorithms", 4th Edition, MIT Press, 2022.'),
        ('[10]', 'Steven S. Skiena, "The Algorithm Design Manual", 3rd Edition, Springer, 2020.'),
        ('[11]', 'MDN Web Docs, "Canvas API", Mozilla Foundation, 2024. Truy cập từ: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API'),
        ('[12]', 'OWASP Foundation, "OWASP Top 10 Security Risks", 2021. Truy cập từ: https://owasp.org/www-project-top-ten/'),
        ('[13]', 'JWT.io, "JSON Web Tokens Introduction", Auth0, 2024. Truy cập từ: https://jwt.io/introduction'),
        ('[14]', 'VisuAlgo Team, "VisuAlgo - Data Structures and Algorithms Visualization", National University of Singapore, 2024. Truy cập từ: https://visualgo.net/'),
        ('[15]', 'Vitejs Team, "Vite Documentation – Next Generation Frontend Tooling", 2024. Truy cập từ: https://vitejs.dev/'),
    ]

    for ref_num, ref_text in references:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.left_indent = Pt(24)
        p.paragraph_format.first_line_indent = Pt(-24)
        r1 = p.add_run(f'{ref_num} ')
        r1.font.name = FONT_NAME; r1.font.size = Pt(12); r1.font.bold = True
        r2 = p.add_run(ref_text)
        r2.font.name = FONT_NAME; r2.font.size = Pt(12)


def run() -> None:
    filepath = get_output_path()
    doc = load_document(filepath)
    print('[Phase 7] Đang thêm: Phần 7, Kết luận, Tài liệu tham khảo...')
    build_phan7(doc)
    build_ket_luan(doc)
    build_tai_lieu_tham_khao(doc)
    save_document(doc, filepath)
    print('[Phase 7] HOÀN THÀNH.\n')
    print('=' * 55)
    print(f'  ✅  Toàn bộ tài liệu đã được ghi vào:')
    print(f'      {filepath}')
    print('=' * 55)


if __name__ == '__main__':
    run()
