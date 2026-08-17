import sys, time
sys.path.insert(0, ".")
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from helpers.ui import login, goto
from conftest import wait_for

def safe(s):
    return s.encode("ascii", "replace").decode()

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=1440,900")
d = webdriver.Chrome(options=opts)
try:
    d.get("http://localhost:5173/#/")
    time.sleep(2)
    d.execute_script(
        "window.localStorage.clear(); window.sessionStorage.clear();"
        "window.localStorage.setItem('guided_tour_seen', 'true');"
        "[ '', 'sorting', 'profile', 'admin', 'checkout', 'playground', 'courses',"
        "  'lessons', 'classrooms', 'teacher', 'gamification', 'embed',"
        "  'export-share', 'graph', 'code-ide', 'quiz', 'docs', 'dashboard' ]"
        ".forEach(p => window.localStorage.setItem('page_tour_' + p + '_seen', 'true'));")
    d.refresh()
    time.sleep(2)
    login(d, "nguyenvana@visualizationdsa.dev", "User@2024")
    goto(d, "/classrooms")
    ok = wait_for(lambda: d.find_elements(By.XPATH,
        "//*[contains(normalize-space(.), 'Tham gia bằng mã mời')]"), 20, message="join entry")
    print("wait ok:", ok)
    body = d.find_element(By.TAG_NAME, "body").text
    print("BODY:", safe(body[:900].replace(chr(10), " | ")))
    print("has Tham gia:", "Tham gia" in body)
    print("has mã mời:", "mã mời" in body)
    print("has chưa tham gia:", "chưa tham gia" in body.lower())
finally:
    d.quit()
