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

## 📐 Architecture

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

### 🧠 Version 3.0 (Smart Memory & Co-activity)
*   [ ] **AI Relationship Prompts**: Custom generative prompt triggers suggesting memory entries based on past activities.
*   [ ] **Shared Bucket List**: Collaborative checklists where couples can check off future travel destinations, dates, and milestones.
*   [ ] **Enhanced Memory Galaxy**: 3D Orbit physics in WebGL/Three.js allowing couples to navigate their stars interactively.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
