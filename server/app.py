from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from zoneinfo import ZoneInfo
import json, os, re

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE_DIR, "user.json")
LOG_FILE = os.path.join(BASE_DIR, "log.txt")


def get_now():
    return datetime.now(ZoneInfo("Asia/Manila")).strftime("%Y-%m-%d %H:%M:%S")


def ensure_files_exist():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w", encoding="utf-8") as file:
            json.dump([], file, indent=2)

    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w", encoding="utf-8") as file:
            file.write("")


def load_users():
    ensure_files_exist()

    with open(USERS_FILE, "r", encoding="utf-8") as file:
        try:
            return json.load(file)
        except json.JSONDecodeError:
            return []


def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as file:
        json.dump(users, file, indent=2)


def write_log(action, username, result):
    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(f"[{get_now()}] {action} | username={username} | result={result}\n")


def is_valid_username(username):
    return isinstance(username, str) and 3 <= len(username.strip()) <= 8


def is_valid_password(password):
    if not isinstance(password, str):
        return False

    # Exactly 8 characters, letters and numbers only.
    return re.fullmatch(r"[A-Za-z0-9]{8}", password) is not None


def find_user_by_username(users, username):
    username_key = username.lower()

    for user in users:
        if user.get("usernameKey") == username_key:
            return user

    return None


def sanitize_user(user):
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "registeredDate": user["registeredDate"]
    }


def register_user(username, password):
    username = username.strip()
    password = password.strip()

    if not is_valid_username(username):
        return False, "Username must be 3 to 8 characters only.", None

    if not is_valid_password(password):
        return False, "Password must be exactly 8 alphanumeric characters.", None

    users = load_users()

    existing_user = find_user_by_username(users, username)

    if existing_user:
        return False, "Username already used.", None

    new_user = {
        "id": len(users) + 1,
        "username": username,
        "usernameKey": username.lower(),
        "passwordHash": generate_password_hash(password),
        "role": 2,
        "registeredDate": get_now()
    }

    users.append(new_user)
    save_users(users)

    write_log("REGISTER", username, "SUCCESS")

    return True, "Registration successful.", sanitize_user(new_user)


def login_user(username, password):
    username = username.strip()
    password = password.strip()

    if not is_valid_username(username):
        return False, "Invalid username.", None

    if not is_valid_password(password):
        return False, "Invalid password format.", None

    users = load_users()
    user = find_user_by_username(users, username)

    if not user:
        write_log("LOGIN", username, "FAILED_USER_NOT_FOUND")
        return False, "Account not found.", None

    if not check_password_hash(user["passwordHash"], password):
        write_log("LOGIN", username, "FAILED_WRONG_PASSWORD")
        return False, "Incorrect password.", None

    write_log("LOGIN", username, "SUCCESS")

    return True, "Login successful.", sanitize_user(user)


@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "")
    password = data.get("password", "")

    success, message, user = register_user(username, password)

    if not success:
        return jsonify({
            "success": False,
            "message": message
        }), 400

    return jsonify({
        "success": True,
        "message": message,
        "user": user
    }), 201


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "")
    password = data.get("password", "")

    success, message, user = login_user(username, password)

    if not success:
        return jsonify({
            "success": False,
            "message": message
        }), 401

    return jsonify({
        "success": True,
        "message": message,
        "user": user
    }), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "running",
        "time": get_now()
    })


if __name__ == "__main__":
    ensure_files_exist()
    app.run(host="0.0.0.0", port=5000, debug=False)