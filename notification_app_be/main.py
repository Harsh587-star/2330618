"""
Stage 1 - Priority Inbox: Top N Notifications
Afford Medical Technologies - Campus Hiring Evaluation
"""

import requests
import json
from datetime import datetime

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
API_URL = "http://4.224.186.213/evaluation-service/notifications"
TOP_N = 10
AUTH_TOKEN = "nwwsKx"

PRIORITY_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1,
}


# ─────────────────────────────────────────────
# DETECT CORRECT AUTH FORMAT
# ─────────────────────────────────────────────
def detect_auth_header():
    """Try different auth formats and return the one that works."""
    formats = [
        {"Authorization": f"Bearer {AUTH_TOKEN}"},
        {"Authorization": AUTH_TOKEN},
        {"x-api-key": AUTH_TOKEN},
        {"token": AUTH_TOKEN},
        {"X-Auth-Token": AUTH_TOKEN},
    ]

    for headers in formats:
        try:
            resp = requests.get(API_URL, headers=headers, params={"limit": 1}, timeout=10)
            if resp.status_code == 200:
                print(f"  ✓ Auth works with header: {list(headers.keys())[0]}")
                return headers
            else:
                print(f"  ✗ {list(headers.keys())[0]} → {resp.status_code}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

    # Last resort: try token as query param
    try:
        resp = requests.get(API_URL, params={"token": AUTH_TOKEN, "limit": 1}, timeout=10)
        if resp.status_code == 200:
            print("  ✓ Auth works as query param: token=")
            return None  # signals to use query param
    except Exception:
        pass

    print("\n  ⚠ Could not find working auth format. Check your token.")
    return {}


# ─────────────────────────────────────────────
# FETCH NOTIFICATIONS
# ─────────────────────────────────────────────
def fetch_all_notifications(headers):
    """Fetch all notifications from the API (handles pagination)."""
    all_notifications = []
    page = 1

    while True:
        try:
            params = {"page": page, "limit": 100}

            # If headers is None, use token as query param
            if headers is None:
                params["token"] = AUTH_TOKEN
                response = requests.get(API_URL, params=params, timeout=10)
            else:
                response = requests.get(API_URL, headers=headers, params=params, timeout=10)

            response.raise_for_status()
            data = response.json()

            notifications = data.get("notifications", [])
            if not notifications:
                break

            all_notifications.extend(notifications)
            print(f"  Fetched page {page}: {len(notifications)} notifications")
            page += 1

        except requests.exceptions.RequestException as e:
            print(f"  Error fetching page {page}: {e}")
            break

    return all_notifications


# ─────────────────────────────────────────────
# PRIORITY SCORE
# ─────────────────────────────────────────────
def calculate_priority_score(notification):
    notification_type = notification.get("Type", "Event")
    timestamp_str = notification.get("Timestamp", "")
    type_weight = PRIORITY_WEIGHT.get(notification_type, 0)

    try:
        dt = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
        recency_score = int(dt.timestamp())
    except (ValueError, TypeError):
        recency_score = 0

    return type_weight * 1_000_000_000 + recency_score


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def get_top_n_priority_notifications(n=TOP_N):
    print(f"\n{'='*55}")
    print(f"  Priority Inbox — Top {n} Notifications")
    print(f"{'='*55}")

    print("\nDetecting auth format...")
    headers = detect_auth_header()

    print("\nFetching notifications...")
    notifications = fetch_all_notifications(headers)

    if not notifications:
        print("No notifications found or API unreachable.")
        return []

    print(f"\nTotal fetched: {len(notifications)}")

    sorted_notifications = sorted(
        notifications,
        key=calculate_priority_score,
        reverse=True
    )

    top_n = sorted_notifications[:n]

    print(f"\n{'─'*55}")
    print(f"  TOP {n} PRIORITY NOTIFICATIONS")
    print(f"{'─'*55}")

    for i, notif in enumerate(top_n, 1):
        print(f"\n#{i}")
        print(f"  Type      : {notif.get('Type', 'Unknown')}")
        print(f"  Message   : {notif.get('Message', 'No message')}")
        print(f"  Timestamp : {notif.get('Timestamp', 'Unknown')}")
        print(f"  ID        : {notif.get('ID', 'N/A')}")

    print(f"\n{'='*55}\n")
    return top_n


if __name__ == "__main__":
    results = get_top_n_priority_notifications(TOP_N)
    with open("top_notifications_output.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Output saved to top_notifications_output.json")
