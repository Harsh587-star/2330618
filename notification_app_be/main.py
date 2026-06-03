import requests
import json
from datetime import datetime

API_URL = "http://4.224.186.213/evaluation-service/notifications"
TOP_N = 10
AUTH_TOKEN = "nwwsKx"

PRIORITY_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1,
}


def detect_auth_header():
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
                print(f"  auth ok: {list(headers.keys())[0]}")
                return headers
        except Exception as e:
            print(f"  error: {e}")

    # fallback: token as query param
    try:
        resp = requests.get(API_URL, params={"token": AUTH_TOKEN, "limit": 1}, timeout=10)
        if resp.status_code == 200:
            return None
    except Exception:
        pass

    print("Could not authenticate. Check your token.")
    return {}


def fetch_all_notifications(headers):
    all_notifications = []
    page = 1

    while True:
        try:
            params = {"page": page, "limit": 100}

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
            print(f"  page {page}: {len(notifications)} notifications")
            page += 1

        except requests.exceptions.RequestException as e:
            print(f"  failed on page {page}: {e}")
            break

    return all_notifications


def priority_score(notification):
    # rank by type weight first, then by recency
    type_weight = PRIORITY_WEIGHT.get(notification.get("Type", "Event"), 0)
    try:
        dt = datetime.strptime(notification.get("Timestamp", ""), "%Y-%m-%d %H:%M:%S")
        recency = int(dt.timestamp())
    except (ValueError, TypeError):
        recency = 0

    return type_weight * 1_000_000_000 + recency


def get_top_n(n=TOP_N):
    print(f"\nPriority Inbox — Top {n} Notifications\n")

    headers = detect_auth_header()
    notifications = fetch_all_notifications(headers)

    if not notifications:
        print("No notifications found.")
        return []

    print(f"\nTotal fetched: {len(notifications)}")

    top_n = sorted(notifications, key=priority_score, reverse=True)[:n]

    print(f"\n--- Top {n} ---\n")
    for i, n in enumerate(top_n, 1):
        print(f"#{i}  [{n.get('Type')}]  {n.get('Message')}  |  {n.get('Timestamp')}")

    return top_n


if __name__ == "__main__":
    results = get_top_n(TOP_N)
    with open("top_notifications_output.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nSaved to top_notifications_output.json")
