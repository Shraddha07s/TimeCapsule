# 💖 TimeCapsule — Write Today, Relive Tomorrow

TimeCapsule is a modern, romantic, and emotional full-stack web application designed for couples to preserve memories, letters, photos, videos, and weekly journals. These digital capsules remain locked until a designated future date, opening automatically with celebratory visual effects when the countdown ends.

---

## 🌟 Features & Pages

### 1. Landing Page
* **Tagline**: *"Write Today, Relive Tomorrow."*
* Dynamic hero section, features list, interactive "How It Works" step-cards, testimonials, and glassmorphic Call-to-Actions for Sign Up/Login.

### 2. Dashboard
* **Relationship Stats**: Real-time ticker displaying "Days Together".
* **Interactive Lock Countdowns**: Ticking countdown timers showing the exact hours, minutes, and seconds until the next capsule unlocks.
* **Anniversary tracker**: Countdown to your next yearly anniversary.
* **Quick Stats & Activities**: Live feedback showing capsule storage streaks and recent partner actions.

### 3. Time Capsule Archive (Memory List)
* Filter, search, and sort options for all sealed memories by category, mood, and lock status.
* Locked items are secure; media, descriptions, and metadata are scrubbed on the backend, preventing any inspect-element spoilers.
* Real-time millisecond countdown tickers on locked cards.

### 4. Interactive Stars Galaxy
* A full-viewport, mathematical `<canvas>` simulation of a rotating spiral galaxy.
* Every unlocked memory becomes a clickable star, colored according to its mood.
* Hovering displays elegant, floating glass tooltips; clicking performs a smooth zoom-in transition and opens a slide details modal.

### 5. Future Letters
* Virtual lined writing sheets with cursive handwriting typography.
* Write letters to yourself or your partner, scheduled to unlock on specific dates.
* Separated into **Inbox** (Received), **Sent**, and **Notes to Self**.

### 6. Weekly Collaborative Journal
* Shared weekly reflection entries (`YYYY-Www`).
* Double-blind writing: neither partner can see the other's entry until both complete their weekly reflection, or the lock date (next Monday) expires.

### 7. Custom Media Uploader
* Multi-file inputs supporting images, videos, and custom voice recordings.
* In-browser microphone voice recorder with real-time waveform updates, playbacks, and memory attachment capabilities.

### 8. Digital Memory Book (PDF Export)
* Custom CSS print stylesheets configured for standard margins, page breaks, and high-contrast text.
* Unlocked memories compile into a structured layout ready to be printed or saved as a PDF memory book.

### 9. Dynamic Relationship Milestones (Anniversaries)
* A romantic timeline charting major relationship events (First Date, Engagement, etc.) interspersed with unlocked memory stars.
* Dynamic anniversary letter generator providing pre-set romantic messages.

### 10. Vector Analytics (Stats)
* Beautiful vector SVG graphs (streaks dials, monthly activity counts, mood splits) rendered dynamically without heavy package dependencies.

---

## 🎨 Design Systems & Themes

TimeCapsule supports **5 premium themes** that transition seamlessly:
1. **Dark Mode (Default)**: Deep midnight purple with glowing violet accents.
2. **Blush Theme**: Soft pinkish-white background (`#FFF8FC`), white cards, pink glass borders, and high-contrast dark text (`#1F2937`).
3. **Romantic Pink (Dark Pink)**: Deep violet-pink background gradient (`#2A0A24` to `#4C1D45`), purple cards, and neon magenta accents (`#FF4FA2`).
4. **Sunset Theme**: Warm orange-purple gradient, golden stars, and crimson highlights.
5. **Space Theme**: Celestial radial dark gradient with cyan/blue accents.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite, Tailwind CSS, Framer Motion for smooth overlays).
* **Backend**: Node.js, Express.js.
* **Uploader**: Multer (configured for local static folder writes).
* **Security**: JWT-based auth headers, bcrypt passwords hashing, and backend locking sanitizers.
* **Database (Dual-Mode)**:
  * **Production**: MongoDB + Mongoose.
  * **Development / Offline Fallback**: Automatically connects to local file-based database (`server/data/*.json`) if MongoDB is unavailable.

---

## 📁 Project Architecture

```text
├── server/
│   ├── config/             # DB connection managers
│   ├── controllers/        # Express routers endpoint logic
│   ├── data/               # Local JSON Database file stores (fallback)
│   ├── middleware/         # Multer static uploads & JWT guards
│   ├── models/             # Mongoose & Local CRUD wrappers
│   ├── uploads/            # Statically served photo, video, and audio assets
│   └── server.js           # Server port binding & API router registration
├── src/
│   ├── components/         # Reusable layouts, sidebars, and navigation
│   ├── context/            # Auth, Theme, and global Toast notification providers
│   ├── pages/              # React view routes (Dashboard, Galaxy, Archive, Profile)
│   ├── App.jsx             # React Routes router mappings
│   ├── index.css           # Global custom scrollbars, print sheets, & theme variables
│   └── main.jsx            # App root mounting
├── nodemon.json            # Nodemon file ignores config (prevents session restarts)
└── vite.config.js          # Tailwind & proxy routing configurations
```

---

## 🚀 Setup & Installation

### 1. Install Dependencies
Ensure you have Node.js installed, then run the installer at the project root:
```bash
npm install
```

### 2. Run the Development Environment
Start both the Vite frontend server and Express backend concurrently:
```bash
npm run dev
```
* **Frontend**: Running on [http://localhost:5173](http://localhost:5173)
* **Backend**: Running on [http://localhost:5000](http://localhost:5000)

### 3. Build for Production
To compile and bundle assets for production deployment:
```bash
npm run build
```

---

## 🧪 Verification Walkthrough

1. **Sign Up**: Register `User A` and `User B`.
2. **Verify Email**: Click the **Verify Account Now** banner on the dashboard (simulates email link verification).
3. **Link Couple**: Copy the invite code from `User A`'s Couple Connection page, log in as `User B`, paste the code, and click "Connect".
4. **Seal a Memory**: Go to **New Memory**, type a message, record a browser **Voice Note**, set the unlock date to **5 seconds from now**, and click Save.
5. **Unlock**: Go to **Time Capsule**. Let the countdown tick down, click **Unlock Memory Now**, and celebrate with confetti and the unlocked details view!
