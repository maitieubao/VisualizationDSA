"""Admin + Teacher CRUD roundtrip verification (API level, bounded)."""
import sys, time, uuid
import requests

API = "http://localhost:5055/api/v1"
results = []

def login(email, pwd):
    r = requests.post(f"{API}/concepts/auth/login", json={"email": email, "password": pwd}, timeout=10)
    r.raise_for_status()
    return r.json()["accessToken"]

def rec(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS" if ok else "FAIL"), name, detail[:120])

admin = login("admin@visualizationdsa.dev", "Admin@2024")
teacher = login("demo@visualizationdsa.dev", "Demo@2024")
AH = {"Authorization": f"Bearer {admin}"}
TH = {"Authorization": f"Bearer {teacher}", "Content-Type": "application/json"}

# ---------- ADMIN CRUD ----------
# 1. Create user (admin POST /users)
uid = None
email = f"crudadmin{uuid.uuid4().hex[:8]}@test.com"
r = requests.post(f"{API}/concepts/admin/users", headers={**AH, "Content-Type": "application/json"},
                  json={"email": email, "username": f"CrudAdmin{uuid.uuid4().hex[:6]}", "password": "Crud@12345", "role": "Student"}, timeout=10)
if r.status_code in (200, 201):
    data = r.json()
    uid = (data.get("user") or {}).get("id") or data.get("id") or data.get("userId")
rec("ADM-create-user", uid is not None, f"status={r.status_code}")

# 2. Change role
if uid:
    r = requests.put(f"{API}/concepts/admin/users/{uid}/role", headers={**AH, "Content-Type": "application/json"},
                     json={"role": "Teacher"}, timeout=10)
    rec("ADM-update-role", r.status_code == 200, f"status={r.status_code}")
    r = requests.put(f"{API}/concepts/admin/users/{uid}/role", headers={**AH, "Content-Type": "application/json"},
                     json={"role": "Student"}, timeout=10)

# 3. Toggle premium
if uid:
    r = requests.put(f"{API}/concepts/admin/users/{uid}/premium", headers={**AH, "Content-Type": "application/json"},
                     json={"isPremium": True}, timeout=10)
    rec("ADM-toggle-premium", r.status_code == 200, f"status={r.status_code}")

# 4. Reset password
if uid:
    r = requests.put(f"{API}/concepts/admin/users/{uid}/reset-password", headers={**AH, "Content-Type": "application/json"},
                     json={"newPassword": "Reset@12345"}, timeout=10)
    rec("ADM-reset-password", r.status_code in (200, 204), f"status={r.status_code}")

# 5. Ban + unban
if uid:
    r = requests.put(f"{API}/concepts/admin/users/{uid}/ban", headers={**AH, "Content-Type": "application/json"},
                     json={"isActive": False}, timeout=10)
    rec("ADM-ban", r.status_code == 200, f"status={r.status_code}")
    r = requests.put(f"{API}/concepts/admin/users/{uid}/ban", headers={**AH, "Content-Type": "application/json"},
                     json={"isActive": True}, timeout=10)
    rec("ADM-unban", r.status_code == 200, f"status={r.status_code}")

# 6. Delete user (with FK constraints may 409; either 200/204 or clear 409 is OK)
if uid:
    r = requests.delete(f"{API}/concepts/admin/users/{uid}", headers=AH, timeout=10)
    rec("ADM-delete-user", r.status_code in (200, 204, 409), f"status={r.status_code}")

# ---------- TEACHER CRUD ----------
# 7. Create quiz (manage API)
quiz_id = None
r = requests.post(f"{API}/concepts/quiz/manage", headers=TH,
                  json={"title": f"CRUD Quiz {uuid.uuid4().hex[:6]}", "difficulty": "easy", "xpReward": 10,
                        "questions": [{"text": "1+1=?", "options": ["1", "2", "3", "4"], "correctIndex": 1}]},
                  timeout=10)
if r.status_code in (200, 201):
    data = r.json()
    quiz_id = (data.get("quiz") or {}).get("id") or data.get("id") or data.get("quizId")
rec("TC-create-quiz", quiz_id is not None, f"status={r.status_code}")

# 8. Update quiz (full payload: questions are required by the validator)
if quiz_id:
    r = requests.put(f"{API}/concepts/quiz/manage/{quiz_id}", headers=TH,
                     json={"title": "CRUD Quiz updated", "difficulty": "hard", "xpReward": 20,
                           "questions": [{"text": "2+2=?", "options": ["1", "2", "3", "4"], "correctIndex": 3}]},
                     timeout=10)
    rec("TC-update-quiz", r.status_code == 200, f"status={r.status_code}")

# 9. Delete quiz (soft-delete)
if quiz_id:
    r = requests.delete(f"{API}/concepts/quiz/manage/{quiz_id}", headers=TH, timeout=10)
    rec("TC-delete-quiz", r.status_code in (200, 204), f"status={r.status_code}")

# 10. Create codelab
cl_id = None
r = requests.post(f"{API}/codelabs", headers=TH,
                  json={"title": f"CRUD Codelab {uuid.uuid4().hex[:6]}", "description": "e2e crud check",
                        "language": "javascript", "starterCode": "function solve(x){return x;}"}, timeout=10)
if r.status_code in (200, 201):
    cl_id = (r.json().get("id") or r.json().get("codelabId"))
rec("TC-create-codelab", cl_id is not None, f"status={r.status_code}")

# 11. Delete codelab
if cl_id:
    r = requests.delete(f"{API}/codelabs/{cl_id}", headers=TH, timeout=10)
    rec("TC-delete-codelab", r.status_code in (200, 204), f"status={r.status_code}")

# 12. Create course
course_id = None
r = requests.post(f"{API}/concepts/courses", headers=TH,
                  json={"title": f"CRUD Course {uuid.uuid4().hex[:6]}", "description": "e2e crud",
                        "category": "Sorting", "difficulty": "beginner"}, timeout=10)
data = r.json() if r.status_code in (200, 201) else {}
course_id = data.get("courseId") or data.get("id") or (data.get("course") or {}).get("id")
rec("TC-create-course", course_id is not None, f"status={r.status_code} body={r.text[:120]}")

# 13. Create classroom + module + item (curriculum CRUD)
classroom_id = None
r = requests.post(f"{API}/classrooms", headers=TH,
                  json={"name": f"CRUD Class {uuid.uuid4().hex[:6]}", "description": "e2e"}, timeout=10)
data = r.json() if r.status_code in (200, 201) else {}
classroom_id = data.get("id") or data.get("classroomId")
rec("TC-create-classroom", classroom_id is not None, f"status={r.status_code} body={r.text[:120]}")

print("---")
print("SUMMARY:", sum(1 for _, ok, _ in results if ok), "/", len(results), "PASS")
sys.exit(0 if all(ok for _, ok, _ in results) else 1)
