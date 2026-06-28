# 💖 TimeCapsule

> **Write Today, Relive Tomorrow.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62B)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](https://opensource.org/licenses/MIT)

An elegant, full-stack digital time capsule platform where couples can preserve their memories, letters, photos, videos, voice notes, and weekly journals that remain locked until a future date and automatically unlock with visual celebrations when the countdown ends.

---

## ✨ Features

*   **🔒 Secure Authentication**: Robust signup, login, password recovery, and email verification.
*   **💑 Couple Connection**: Sync profiles and share memories using unique linking invite codes.
*   **⏳ Time-Locked Memories**: Seal letters, photos, videos, and custom voice recordings. Locked content is scrubbed on the backend to prevent cheats or inspect-element inspects.
*   **💌 Future Letters**: Write digital letters to yourself or your partner, rendered on virtual cursive letter sheets.
*   **📓 Collaborative Weekly Journals**: Write weekly reflections. Entries remain hidden until both partners complete theirs, or the week expires.
*   **🎙️ Voice Note Recording**: Record, preview, and lock browser voice recordings using the HTML5 `MediaRecorder` API.
*   **🖼️ Memory Gallery**: View all unlocked media files in a responsive media wall with a cinematic slideshow player.
*   **🌌 Memory Galaxy**: An interactive HTML5 `<canvas>` simulation. Every unlocked memory floats in space as a rotating star, color-coordinated by mood. Hover to view tooltips; click to trigger smooth zoom transitions.
*   **🎉 Anniversary Tracking**: Automatic relationship anniversary countdowns and custom milestones timeline.
*   **📊 Statistics Dashboard**: SVG-based relationship dashboard tracking streaks, mood splits, and activity charts.
*   **🎭 5 Beautiful Themes**: Switch between Dark Mode, Sunset Glow, Romantic Pink, Cyber Space, and the premium glassmorphic **Blush Theme** with smooth transitions.
*   **🔔 Toast Notification System**: Rich alerts (success, info, warning, error) that pop up dynamically.
*   **🖨️ PDF Export Layout**: Clean print sheets that compile your memories into a structured "Digital Memory Book".
*   **📄 Legal & Info Pages**: Dedicated **About**, **Contact**, and **Privacy Policy** layouts accessible publicly or within the sidebar layout.
*   **📱 Responsive & Fluid**: Built with glassmorphism layout utilities and responsive flex containers for mobile, tablet, and desktop views.

---

## 🛠️ Tech Stack

### Frontend
*   **React.js** (Component-driven UI library)
*   **Vite** (Next-generation frontend tooling)
*   **Tailwind CSS** (Utility-first styling framework)
*   **Framer Motion** (Production-ready React animations)

### Backend
*   **Node.js** (JavaScript runtime)
*   **Express.js** (Minimalist web framework)

### Database
*   **MongoDB Atlas** (Cloud-hosted database cluster)
*   **Local JSON DB Fallback** (Auto-fallback local JSON storage for developer convenience when offline)

### Media Storage
*   **Cloudinary** (Cloud asset storage and transformations management)

### Authentication
*   **JWT (JSON Web Tokens)** (Stateless authorization headers)
*   **Bcrypt** (Secure password hashing)

### Deployment
*   **Frontend**: Hosted on Vercel
*   **Backend**: Hosted on Render

---

## 📐 Architecture & Data Flow

```text
                               ┌─────────────────┐
                               │   Vercel CDN    │
                               │ (React Frontend)│
                               └────────┬────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │ Render Backend  │
                               │ (Node/Express)  │
                               └────────┬────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
       ┌─────────────────┐                           ┌──────────────────┐
       │  MongoDB Atlas  │                           │    Cloudinary    │
       │ (JSON database) │                           │ (Photos & Video) │
       └─────────────────┘                           └──────────────────┘
```

When a couple uploads a new time capsule:
1. The Vite client sends file uploads to the backend.
2. The Express server passes media streams directly to Cloudinary using `multer-storage-cloudinary`.
3. Cloudinary returns secure, fully-qualified asset URLs (`https://res.cloudinary.com/...`).
4. The Express server saves references alongside metadata (unlock countdown dates, category keys) into MongoDB Atlas.
5. Clients query APIs through encrypted JWT header parameters to fetch and render content securely.

---

## 📂 Project Directory Structure

```text
TimeCapsule/
├── server/                    # Node.js + Express Backend
│   ├── config/                # Cloudinary SDK and Mongo client setups
│   ├── controllers/           # APIs business logic handlers
│   ├── middleware/            # JWT authorization and Cloudinary multer engines
│   ├── models/                # MongoDB models and schemas
│   └── server.js              # Express app entries and error capture handlers
├── src/                       # React.js Client Frontend
│   ├── components/            # Reusable UI controls (Sidebar, Toasts, Layout)
│   ├── context/               # Auth, Notification, and Theme React contexts
│   ├── pages/                 # Full Page route layouts
│   │   ├── AboutPage.jsx      # Dedicated project mission and vision
│   │   ├── ContactPage.jsx    # Contact details and copy email widget
│   │   ├── PrivacyPolicy.jsx  # Security guidelines and data erasure policies
│   │   ├── Dashboard.jsx      # Anniversary timeline and statistics widgets
│   │   └── LandingPage.jsx    # Hero call-to-actions and reviews footer
│   ├── App.jsx                # Router registry and provider trees
│   ├── index.css              # Custom themes variables and scrapbook animations
│   └── main.jsx               # Entry DOM node bootstrap
└── README.md                  # System overview and setup instructions
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root and specify the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🚀 Setup & Run Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/TimeCapsule.git
    cd TimeCapsule
    ```

2.  **Install Project Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    Starts both the backend uploader/API and the frontend Vite server concurrently:
    ```bash
    npm run dev
    ```
    *   **Frontend Client**: [http://localhost:5173/](http://localhost:5173/)
    *   **Backend Server**: [http://localhost:5000/](http://localhost:5000/)

4.  **Build for Production**:
    ```bash
    npm run build
    ```

---

## 📸 Screenshots

*Place your application screenshots inside `/public/screenshots/` and reference them below:*

*   **Landing Page**: `![Landing Page](https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800)`
*   **Dashboard & Streaks**: `![Dashboard](https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800)`
*   **Memory Galaxy Canvas**: `![Memory Galaxy](https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800)`
*   **Create Time Capsule**: `![Create Memory](https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800)`
*   **Future Letters cursive**: `![Future Letters](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800)`
*   **About & Contact Info**: `![About Pages](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800)`

---

## 🗺️ Product Roadmap

### 🚀 Version 1.0 (Core Features)
*   [x] Secure User registration, password resets, and verification mock-inbox.
*   [x] Partner-linking codes and couple connection models.
*   [x] Time-locked memory creation, descriptions sanitization, and voice note attachments.
*   [x] Auto-fallback disk uploads and local database backups.

### 📈 Version 2.0 (Analytics & Personalizations)
*   [x] Custom SVG streaks dials and monthly activity line graphs.
*   [x] PDF Print layouts to export physical memory books.
*   [x] Anniversary milestones timeline and romantic message presets.
*   [x] Global multi-theme system (Dark, Sunset, Pink, Space, Blush).
*   [x] Cloudinary media uploads migration.
*   [x] Custom Toast notification context alerts.
*   [x] Dedicated **About**, **Contact**, and **Privacy Policy** footer pages and routes.

### 🧠 Version 3.0 (Smart Memory & Co-activity)
*   [ ] **AI Relationship Prompts**: Custom generative prompt triggers suggesting memory entries based on past activities.
*   [ ] **Shared Bucket List**: Collaborative checklists where couples can check off future travel destinations, dates, and milestones.
*   [ ] **Enhanced Memory Galaxy**: 3D Orbit physics in WebGL/Three.js allowing couples to navigate their stars interactively.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
