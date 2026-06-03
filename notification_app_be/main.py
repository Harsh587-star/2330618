import requests
import json
from datetime import datetime

API_URL = "http://4.224.186.213/evaluation-service/notifications"
TOP_N = 10

# Priority order: Placement > Result > Event
PRIORITY_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}


def fetch_all_notifications():
    all_notifications = []
    page = 1

    while True:
        try:
            response = requests.get(
                API_URL,
                params={"page": page, "limit": 100},
                timeout=10
            )
            response.raise_for_status()

            data = response.json()
            notifications = data.get("notifications", [])

            if not notifications:
                break

            all_notifications.extend(notifications)
            page += 1

        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            break

    return all_notifications


def calculate_priority_score(notification):
    notif_type = notification.get("Type", "Event")
    timestamp = notification.get("Timestamp", "")

    try:
        # Convert timestamp for recency comparison
        dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        time_score = int(dt.timestamp())
    except (ValueError, TypeError):
        time_score = 0

    priority = PRIORITY_WEIGHT.get(notif_type, 0)

    # Priority decides the main ranking, timestamp breaks ties
    return priority * 1_000_000_000 + time_score


def get_top_n_priority_notifications(n=TOP_N):
    notifications = fetch_all_notifications()

    if not notifications:
        print("No notifications found.")
        return []

    # Sort from highest priority to lowest
    sorted_notifications = sorted(
        notifications,
        key=calculate_priority_score,
        reverse=True
    )

    top_n = sorted_notifications[:n]

    for i, notif in enumerate(top_n, start=1):
        print(f"\n#{i}")
        print(f"Type      : {notif.get('Type', 'Unknown')}")
        print(f"Message   : {notif.get('Message', 'No message')}")
        print(f"Timestamp : {notif.get('Timestamp', 'Unknown')}")
        print(f"ID        : {notif.get('ID', 'N/A')}")

    return top_n


if __name__ == "__main__":
    results = get_top_n_priority_notifications(TOP_N)

    # Save output for reference
    with open("top_notifications_output.json", "w") as f:
        json.dump(results, f, indent=2)

    print("Output saved to top_notifications_output.json")
