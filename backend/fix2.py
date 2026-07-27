import os

filepath = 'src/WebApi/Controllers/AdminController.cs'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('o.Status == VisualizationDSA.Domain.Enums.OrderStatus.Completed || o.Status == \"paid\"', 'o.Status == VisualizationDSA.Domain.Enums.OrderStatus.Completed')
content = content.replace('newUser.Role.ToString(),', 'Role = newUser.Role.ToString(),')
content = content.replace('Role = dbUser.Role.ToString();', 'role = dbUser.Role.ToString();')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

filepath = 'src/WebApi/Controllers/CourseController.cs'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('u.Role == \"Teacher\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Teacher')
content = content.replace('u.Role ?? \"Student\"', '(u.Role != null ? u.Role.ToString() : \"Student\")')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed remaining errors!')
