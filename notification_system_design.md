# Stage 1

## Notification Priority Inbox — System Design

### Overview

The Priority Inbox fetches all campus notifications from the evaluation API and surfaces the top **N** most important unread notifications. Priority is determined by a combination of **notification type weight** and **recency**.

---

## Priority Logic

### Type Weights

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

Placement notifications are the most critical to students (job opportunities), followed by academic Results, then general Events.

### Recency

Within the same type, newer notifications are ranked higher. This is achieved by using the Unix timestamp of the notification.

### Scoring Formula

```
priority_score = type_weight × 1,000,000,000 + unix_timestamp
```

Multiplying the type weight by a large constant (1 billion) ensures that **type always dominates** the ranking. Two notifications of the same type are then differentiated purely by recency.

**Example:**
- A `Placement` notification from yesterday scores: `3,000,000,000 + 1745280000 = 4,745,280,000`
- A `Result` notification from today scores: `2,000,000,000 + 1748822400 = 3,748,822,400`
- The Placement notification ranks higher despite being older.

---

## Handling New Notifications

Since new notifications keep coming in, the system is designed to be **stateless and re-runnable**:

- Every run fetches the latest data from the API (with pagination support)
- The top N is always computed fresh from the most current data
- To keep it efficient, pagination fetches 100 notifications per page and stops when a page returns empty

---

## How to Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run (fetches live data and prints top 10)
python main.py
```

To change the value of N, edit the `TOP_N` variable at the top of `main.py`.

---

## Files

| File | Description |
|------|-------------|
| `main.py` | Core logic — fetches, scores, and prints top N notifications |
| `requirements.txt` | Python dependencies |
| `top_notifications_output.json` | Output saved after each run |
