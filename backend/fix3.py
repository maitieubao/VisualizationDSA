import os

filepath = 'src/WebApi/Controllers/AdminController.cs'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Role = newUser.Role.ToString(),', 'newUser.Role.ToString(),')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

filepath = 'src/WebApi/Controllers/CourseController.cs'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('u.Role == \"Admin\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Admin')
content = content.replace('u.Role == \"Teacher\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Teacher')
content = content.replace('u.Role == \"Student\"', 'u.Role == VisualizationDSA.Domain.Enums.Role.Student')
content = content.replace('(u.Role != null ? u.Role.ToString() : \"Student\")', '((u.Role != null) ? u.Role.ToString() : \"Student\")')
# wait, the previous fix didn't match 'u.Role ?? \"Student\"' maybe?
content = content.replace('u.Role ?? \"Student\"', '((u.Role != null) ? u.Role.ToString() : \"Student\")')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed!')
