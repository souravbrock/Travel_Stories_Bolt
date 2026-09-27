import sqlite3
import sys
import urllib.request
import json

BASE = "http://localhost:8080/api"


def post(path, payload, token=None):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def get(path, token=None):
    req = urllib.request.Request(BASE + path)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


fails = []


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name, detail)
    if not cond:
        fails.append(name)


import urllib.error

s, r = post("/auth/send-code.php", {"email": "vendor1@test.com"})
check("send-code", s == 200 and "dev_code" in r, str(r))
code = r.get("dev_code", "")

s, r = post("/auth/verify-code.php", {"email": "vendor1@test.com", "code": "00000"})
check("verify-wrong-rejected", s == 400, str(r))

s, r = post("/auth/signup.php", {"email": "vendor1@test.com", "full_name": "Vikram Vendor",
    "phone": "999", "role": "vendor", "vendor_type": "travel_agent",
    "password": "secret123", "code": code})
check("vendor-signup", s == 200 and "token" in r, str(r)[:120])
vtok = r.get("token", "")

s, r = post("/auth/signup.php", {"email": "admin1@test.com", "full_name": "A Admin",
    "phone": "", "role": "admin", "vendor_type": None, "password": "secret123", "code": "x"})
check("admin-signup-blocked", s == 400, str(r))

s, r = post("/auth/signin.php", {"email": "vendor1@test.com", "password": "wrong"})
check("signin-wrong-rejected", s == 401, str(r))

s, r = post("/auth/signin.php", {"email": "vendor1@test.com", "password": "secret123"})
check("signin-ok", s == 200 and r["user"]["role"] == "vendor", str(r)[:120])

s, r = get("/auth/me.php", vtok)
check("me", s == 200 and r["email"] == "vendor1@test.com", str(r)[:120])

s, r = get("/auth/me.php", "badtoken")
check("me-bad-token-401", s == 401, str(r))

s, r = post("/vendor/create.php", {"type": "packages",
    "data": {"title": "Test Package", "state_name": "Goa", "price": 9999}}, vtok)
check("vendor-create", s == 200, str(r))

s, r = get("/vendor/list.php", vtok)
check("vendor-list", s == 200 and len(r["packages"]) == 1, str(r)[:150])

# create admin directly in DB (mirrors production first-admin step)
import pathlib
db = pathlib.Path(__file__).resolve().parent.parent / "preview" / "trvlstory.db"
con = sqlite3.connect(db)
con.execute("INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES (?,?,?,?,?)",
    ("admin@test.com", "x", "Admin", "admin", 1))
con.commit()
s, r = post("/auth/signin.php", {"email": "admin@test.com", "password": "x"})
check("admin-login-note", s == 401, "(expected: placeholder hash cannot verify)")

con.execute("UPDATE users SET password_hash = ? WHERE email = 'admin@test.com'",
    (__import__("hashlib").sha256(b"nope").hexdigest(),))
con.commit()

# proper admin: signup as customer then promote
s, r = post("/auth/send-code.php", {"email": "admin2@test.com"})
acode = r.get("dev_code", "")
s, r = post("/auth/signup.php", {"email": "admin2@test.com", "full_name": "Admin Two",
    "phone": "", "role": "customer", "vendor_type": None, "password": "secret123", "code": acode})
check("customer-signup", s == 200, str(r)[:100])
con.execute("UPDATE users SET role = 'admin' WHERE email = 'admin2@test.com'")
con.commit()
s, r = post("/auth/signin.php", {"email": "admin2@test.com", "password": "secret123"})
atok = r.get("token", "")
check("admin-signin", s == 200 and r["user"]["role"] == "admin", str(r)[:100])

s, r = get("/admin/overview.php", atok)
check("admin-overview", s == 200 and len(r["vendors"]) == 1, str(r)[:150])

s, r = post("/admin/approve-vendor.php", {"id": 1}, atok)
check("approve-vendor", s == 200, str(r))

s, r = post("/admin/approve-listing.php", {"type": "packages", "id": 1}, atok)
check("approve-listing", s == 200, str(r))

s, r = get("/auth/me.php", vtok)
check("vendor-approved-flag", s == 200 and r["vendor_approved"] is True, str(r)[:120])

import urllib.request as _u
with _u.urlopen(BASE + "/packages.php") as resp:
    pkgs = json.loads(resp.read())
check("marketplace-merges-vendor", any(p["id"] >= 1000000 for p in pkgs), f"total={len(pkgs)}")

s, r = post("/inquire.php", {"package_id": 1000001, "name": "T", "email": "t@t.com",
    "travelers": "2", "message": "hi"})
check("inquire-vendor-pkg", s == 200, str(r))
row = con.execute("SELECT package_id, vendor_package_id FROM inquiries ORDER BY id DESC LIMIT 1").fetchone()
check("inquire-routing", row == (None, 1), str(row))
con.close()

print("FAILURES:", fails if fails else "none")
sys.exit(1 if fails else 0)
