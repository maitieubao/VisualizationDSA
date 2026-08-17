"""API helpers backed by requests: used for server-side steps (webhook,
XP probes) that cannot be performed through the UI."""
import json

import requests

from conftest import API_BASE


def _token_header(driver):
    token = driver.execute_script(
        "return window.localStorage.getItem('vdsa_access_token')"
        " || window.localStorage.getItem('vdsa_refresh_token')")
    return {"Authorization": f"Bearer {token}"} if token else {}


def login_admin_api():
    """Login as admin through the API; returns (access_token, refresh_token)."""
    resp = requests.post(f"{API_BASE}/concepts/auth/login",
                         json={"email": "admin@visualizationdsa.dev", "password": "Admin@2024"},
                         timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return data.get("accessToken"), data.get("refreshToken")


def admin_request(method, path, token, payload=None):
    return requests.request(method, f"{API_BASE}{path}", json=payload,
                            headers={"Authorization": f"Bearer {token}"}, timeout=10)


def ban_user(token, user_id, is_active=False):
    return admin_request("PUT", f"/concepts/admin/users/{user_id}/ban", token,
                         {"isActive": is_active})


def find_user_by_email(token, email):
    resp = admin_request("GET", "/concepts/admin/users?page=1&pageSize=100", token)
    resp.raise_for_status()
    for u in resp.json().get("users", []):
        if str(u.get("email", "")).lower() == email.lower():
            return u
    return None


def revoke_refresh_token(driver):
    """Revoke the current refresh token server-side (simulates expiry)."""
    token = driver.execute_script("return window.localStorage.getItem('vdsa_refresh_token')")
    if not token:
        raise RuntimeError("no refresh token in localStorage")
    return requests.post(f"{API_BASE}/concepts/auth/logout", json={"refreshToken": token}, timeout=10)


def api_get(driver, path, **kwargs):
    return requests.get(f"{API_BASE}{path}", headers=_token_header(driver),
                        timeout=10, **kwargs)


def api_post(driver, path, payload=None, **kwargs):
    return requests.post(f"{API_BASE}{path}", json=payload or {},
                         headers=_token_header(driver), timeout=10, **kwargs)


def simulate_webhook(driver, order_id):
    """Trigger the SePay webhook simulator (Development only)."""
    return requests.post(
        f"{API_BASE}/concepts/payment/simulate-webhook",
        json={"orderId": order_id}, timeout=10)


def create_order(driver):
    resp = api_post(driver, "/concepts/payment/orders", {})
    resp.raise_for_status()
    data = resp.json()
    order_id = data.get("orderId") or data.get("id")
    return order_id


def settle_pending_orders(user_token):
    """Complete any stale Pending checkout orders so a new checkout can start."""
    resp = requests.get(f"{API_BASE}/concepts/payment/transactions",
                        headers={"Authorization": f"Bearer {user_token}"}, timeout=10)
    if resp.status_code != 200:
        return 0
    settled = 0
    for txn in resp.json():
        if txn.get("status") == "Pending" and txn.get("orderId"):
            r = requests.post(f"{API_BASE}/concepts/payment/simulate-webhook",
                              json={"orderId": txn["orderId"]}, timeout=10)
            if r.status_code in (200, 201, 204):
                settled += 1
    return settled


def login_user_api(email, password):
    resp = requests.post(f"{API_BASE}/concepts/auth/login",
                         json={"email": email, "password": password}, timeout=10)
    resp.raise_for_status()
    return resp.json()


def user_profile(driver):
    resp = api_get(driver, "/users/me")
    if resp.status_code == 200:
        return resp.json()
    return None


def user_xp(driver):
    profile = user_profile(driver)
    if not profile:
        return None
    return profile.get("totalXP", profile.get("xp", None))
