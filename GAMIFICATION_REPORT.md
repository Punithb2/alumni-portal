# Gamification System — Analysis Report
**Alumni Portal · March 6, 2026**

---

## 1. Architecture Overview

The gamification system is built as a **React Context module** (`GamificationContext.jsx`) that wraps the entire application tree from `App.jsx`. It provides a single source of truth for points and badges, persisted to `localStorage` between sessions.

```
App.jsx
 └── GamificationProvider          ← wraps everything
      └── AuthProvider
           └── MentoringProvider
                └── <Routes />
```

### Context API surface

| Export | Type | Description |
|---|---|---|
| `GamificationProvider` | Component | Root provider, owns all state |
| `useGamification()` | Hook | Consumer hook — throws if used outside provider |
| `BADGES` | Constant object | Badge definitions (id, title, description, icon, pointsRequired) |
| `awardPoints(amount, reason, badgeId?)` | Function | Primary trigger; updates points + checks badges |

### Persistence

State is synced to `localStorage` on every change via a `useEffect`.

| Key | Value |
|---|---|
| `gamification_points` | Integer string e.g. `"350"` |
| `gamification_badges` | JSON array e.g. `["NEWCOMER","FIRST_EVENT"]` |

---

## 2. Badge Catalogue

| Badge ID | Title | Icon | Points Threshold | Trigger Type |
|---|---|---|---|---|
| `NEWCOMER` | Newcomer | 🌟 | 0 (default) | Auto-granted on first load |
| `FIRST_EVENT` | Social Butterfly | 🎟️ | 50 pts | Action-based (RSVP) |
| `CLUB_MEMBER` | Team Player | 🤝 | 100 pts | Action-based (Join Club) |
| `MENTOR_PRO` | Guiding Light | 💡 | 150 pts | Action-based (Request Session) |
| `PHILANTHROPIST` | Philanthropist | 💖 | 200 pts | Action-based (Donate to Campaign) |
| `ALUMNI_VIP` | Alumni VIP | 👑 | 500 pts | Points-threshold only |

---

## 3. Point Triggers (Currently Wired)

| User Action | Component | Points Awarded | Badge Targeted |
|---|---|---|---|
| RSVP to an event (free or paid) | `Events/RSVPModal.jsx` | +50 | `FIRST_EVENT` |
| Join a public club/group | `Clubs/ClubDetail.jsx` | +100 | `CLUB_MEMBER` |
| Donate to a campaign | `Campaigns/CampaignDetail.jsx` | +100 | `PHILANTHROPIST` |
| Request a mentorship session | `Mentorship/MentorProfile.jsx` | +150 | `MENTOR_PRO` |

**Maximum attainable points from a single pass of all actions: 400 pts.**  
The `ALUMNI_VIP` badge (500 pts) currently requires repeating at least one action a second time (e.g. donate again or RSVP to a second event).

---

## 4. Display Integration

| Location | What is shown |
|---|---|
| `Alumni/Dashboard.jsx` — right sidebar | Total points counter + earned badge grid with hover tooltips |
| `Student/Dashboard.jsx` — right sidebar | Total points counter + earned badge grid with hover tooltips |
| `GamificationContext.jsx` — global overlay | Bottom-right toast notification on every point award + badge unlock |

---

## 5. Identified Bugs

### B-1 · `checkBadges` only retains the last matching badge
**File:** `GamificationContext.jsx` · Line ~36

```js
// CURRENT (broken for multiple thresholds crossed at once)
Object.values(BADGES).forEach(badge => {
  if (!currentBadges.includes(badge.id) && currentPoints >= badge.pointsRequired && badge.pointsRequired > 0) {
    newBadgeEarned = badge;   // ← overwrites every iteration
  }
});
```

If a user skips directly from 0 → 400 pts, this loop overwrites `newBadgeEarned` on every matching badge and only notifies about the *last* one in object-iteration order. Fix: collect all new badges into an array and process each one.

---

### B-2 · `useClubs.js` imports `useGamification` without calling it
**File:** `useClubs.js` · Line 4

```js
import { useGamification, BADGES } from '../contexts/GamificationContext'
```

This import was added during development but `useGamification()` is never called inside `useClubs`. Hooks cannot be called from non-hook files conditionally; this import is dead code and can cause confusion. It should be removed.

---

### B-3 · `setTimeout` inside a React state setter (memory leak risk)
**File:** `GamificationContext.jsx` · Lines ~67–72

```js
setEarnedBadges(prevBadges => {
  ...
  setTimeout(() => setNotification(null), 5000);  // ← side-effect inside setter
  ...
});
```

Calling `setTimeout` inside a `setState` updater function is a side-effect and runs on every re-render in Strict Mode. The timeout is never cleared if the component unmounts. 

---

### B-4 · Private-club join requests grant no points
**File:** `Clubs/ClubDetail.jsx` · Lines ~778–781

```js
const handleJoinToggle = () => {
  ...
  joinClub(group.id)
  if (!group.isPrivate) {       // ← private-club request skipped
    awardPoints(100, 'Joined a club', BADGES.CLUB_MEMBER.id)
  }
}
```

When the user requests to join a **private** club their request may be approved later, but no points are awarded at approval time. Public join is the only rewarded path.

---

## 6. Coverage Gaps (No Gamification Yet)

| Feature Area | High-Value Actions | Suggested Points | Suggested Badge |
|---|---|---|---|
| **Jobs** | Apply to a job listing | +75 | 🏢 *Job Seeker* |
| **Jobs** | Alumni posts a job referral | +80 | 🔗 *Connector* |
| **Chat** | Send first message to a peer | +25 | 💬 *Conversation Starter* |
| **Directory** | Connect with / message an alumni | +30 | 🤜 *Networker* |
| **Profile** | Complete 100% of profile fields | +50 | ✅ *Complete Profile* |
| **Mentorship** | Complete a mentoring session (join SessionRoom) | +200 | 🏆 *Mentor Champion* |
| **Campaigns** | Share a campaign link | +20 | 📣 *Advocate* |
| **Events** | Attend multiple events (3, 5, 10) | +50 each tier | 🎖️ *Super Attendee* |
| **Clubs** | Create a new club/group | +120 | 👥 *Community Builder* |
| **Settings** | Dedicated "Achievements" tab | — | Leaderboard / progress view |

---

## 7. Recommended Improvements

### Priority 1 — Fix existing bugs

- **Fix B-1**: Replace `forEach` with a loop that collects all threshold-cleared badges, then award them sequentially (or award the highest-value one first and queue the rest).
- **Fix B-2**: Remove the dead `useGamification` import from `useClubs.js`.
- **Fix B-3**: Move `setTimeout` calls outside the state-setter into a `useEffect` or a synchronous function body.

### Priority 2 — Add a dedicated Achievements / Leaderboard page

A `/achievements` route visible to all roles that shows:
- Points progress bar toward next badge threshold
- Full badge grid (locked badges greyed-out with tooltip showing how to unlock)
- Top-N leaderboard (requires backend or mock data) — opt-in for privacy

### Priority 3 — Expand trigger coverage

Wire up the six highest-impact missing triggers: Job Apply, Post Job, Complete Profile, Join SessionRoom, Connect in Directory, Create Club.

### Priority 4 — Streak / Multiplier mechanics

Consider a **daily login streak** multiplier (1× → 1.5× bonus points per day streak) to encourage regular engagement without adding new badges.

### Priority 5 — Role-differentiated badges

Alumni and Student users perform different actions. Some badges should be exclusive:

| Role | Exclusive Badges |
|---|---|
| Alumni | 🔗 Connector (post job), 💼 Mentor (conduct sessions), 🏛 Patron (donate 3+ campaigns) |
| Student | 🎓 Achiever (apply to 3 jobs), 📖 Mentee (complete 3 sessions), 🌱 Newcomer Leader (first post) |

---

## 8. Quick Stats

| Metric | Value |
|---|---|
| Total badges defined | 6 |
| Badges auto-granted | 1 (NEWCOMER) |
| Badges reachable via current UI | 5 |
| Badges unreachable without repeating actions | 1 (ALUMNI_VIP — needs 500 pts, max 400 in one pass) |
| Components wiring awardPoints | 4 |
| Components displaying gamification UI | 2 dashboards + 1 global toast |
| Persistence mechanism | localStorage |
| Backend integration | ❌ None (frontend-only, resets on localStorage clear) |

---

*Report generated from static code analysis of the frontend source tree.*
