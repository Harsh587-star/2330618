# Stage 1

# Notification Priority Inbox

## Overview

This solution fetches notifications from the evaluation API and displays the top **N** most important notifications based on their type and timestamp.

The ranking is determined using a priority score, where notification type is considered first and recency is used to rank notifications of the same type.

---

## Priority Order

The following priority order is used:

| Type      | Weight |
| --------- | ------ |
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

Placement notifications are given the highest priority, followed by Result notifications and then Event notifications.

---

## Ranking Strategy

Each notification is assigned a score using:

```text
priority_score = (priority_weight × 1,000,000,000) + unix_timestamp
```

Where:

* `priority_weight` comes from the notification type
* `unix_timestamp` represents the notification time

This ensures that notification type has a greater impact on ranking than recency.

### Example

```text
Placement:
3 × 1,000,000,000 + 1748822400
= 4,748,822,400

Result:
2 × 1,000,000,000 + 1749000000
= 3,749,000,000
```

Even though the Result notification is newer, the Placement notification ranks higher because of its higher priority.

---

## Workflow

1. Fetch all notifications from the API.
2. Handle pagination until no more notifications are available.
3. Calculate a priority score for every notification.
4. Sort notifications in descending order of score.
5. Select the top N notifications.
6. Save the output to a JSON file.

---

## Handling New Notifications

The solution always works on the latest available data.

* Notifications are fetched directly from the API on every run.
* Pagination is supported automatically.
* The ranking is recalculated each time the program executes.
* New notifications are included without any code changes.

---

## How to Run

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the program:

```bash
python main.py
```

To change the number of notifications displayed, update the `TOP_N` variable in `main.py`.

---

## Project Files

| File                            | Purpose                                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `main.py`                       | Fetches notifications, calculates scores, and displays the top N results |
| `requirements.txt`              | Required Python packages                                                 |
| `top_notifications_output.json` | Stores the generated output after execution                              |

---

## Assumptions

* Notification types are limited to Placement, Result, and Event.
* Notifications contain a valid timestamp in the format:

```text
YYYY-MM-DD HH:MM:SS
```

* If a timestamp cannot be parsed, it is treated as the lowest possible value during ranking.
