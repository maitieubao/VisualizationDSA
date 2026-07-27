import os
import re

def fix_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = 'src/WebApi/Controllers'

fix_file(f'{base_dir}/StatelessAuthController.cs', [
    ('dbUser.Role,', 'dbUser.Role.ToString(),'),
    ('string role = dbUser.Role;', 'string role = dbUser.Role.ToString();')
])

fix_file(f'{base_dir}/AdminController.cs', [
    ('u.Role == \"Student\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Student'),
    ('u.Role == \"Teacher\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Teacher'),
    ('u.Role == \"Admin\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Admin'),
    ('o.Status == \"Completed\" || o.Status == \"paid\"', 'o.Status == VisualizationDSA.Domain.Enums.OrderStatus.Completed'),
    ('user.SetRole(request.Role);', 'if (Enum.TryParse<VisualizationDSA.Domain.Enums.Role>(request.Role, true, out var r1)) user.SetRole(r1);'),
    ('newUser.SetRole(request.Role);', 'if (Enum.TryParse<VisualizationDSA.Domain.Enums.Role>(request.Role, true, out var r2)) newUser.SetRole(r2);'),
    ('newUser.Role,', 'newUser.Role.ToString(),'),
    ('dbUser.Role,', 'dbUser.Role.ToString(),'),
    ('role = dbUser.Role;', 'role = dbUser.Role.ToString();'),
])

# Fix the inMemoryUsers in AdminController which are now wrongly using Enums instead of ToString
fix_file(f'{base_dir}/AdminController.cs', [
    ('inMemoryUsers.Count(u => u.Role == VisualizationDSA.Domain.Enums.Role.Student)', 'inMemoryUsers.Count(u => u.Role == VisualizationDSA.Domain.Enums.Role.Student.ToString())'),
    ('inMemoryUsers.Count(u => u.Role == VisualizationDSA.Domain.Enums.Role.Teacher)', 'inMemoryUsers.Count(u => u.Role == VisualizationDSA.Domain.Enums.Role.Teacher.ToString())'),
    ('inMemoryUsers.Count(u => u.Role == VisualizationDSA.Domain.Enums.Role.Admin)', 'inMemoryUsers.Count(u => u.Role == VisualizationDSA.Domain.Enums.Role.Admin.ToString())'),
])

fix_file(f'{base_dir}/CourseController.cs', [
    ('u.Role == \"Teacher\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Teacher'),
    ('u.Role ?? \"Student\"', '(u.Role?.ToString() ?? \"Student\")')
])

print('Fixed!')
