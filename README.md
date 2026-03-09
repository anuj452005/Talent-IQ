<h1 align="center">🌟 Talent IQ 🌟</h1>
<h3 align="center">The Ultimate Full-Stack Interview Platform</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Clerk-000000?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" />
</p>

<p align="center">
  <img src="/frontend/public/screenshot-for-readme.png" alt="Talent IQ Demo App" width="800" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
</p>

## 📖 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Running](#installation--running)
- [🤝 Contributing](#-contributing)

## ✨ Key Features

- **🧑‍💻 VSCode-Powered Code Editor:** Write and execute code in a familiar environment.
- **🔐 Secure Authentication:** Seamless and secure login using [Clerk](https://clerk.com/).
- **🎥 1-on-1 Video Interview Rooms:** Real-time communication via camera and microphone.
- **🧭 Live Insight Dashboard:** Track real-time stats and performance metrics.
- **🔊 Complete Media Controls:** Easily toggle mic/camera and share or record your screen.
- **💬 Real-time Chat:** Instant messaging feature during sessions.
- **⚙️ Isolated Code Execution:** Safe and secure environment to run user code.
- **🎯 Automated Feedback:** Instant success/fail responses based on test cases.
- **🎉 Interactive UI:** Confetti celebrations on success and clear notifications on failure.
- **🧩 Practice Mode:** Solo coding environment for honing skills.
- **🔒 Secure Room Locking:** Restricts rooms to exactly 2 participants for privacy.
- **🧠 Background Jobs:** Asynchronous tasks handled efficiently with [Inngest](https://www.inngest.com/).
- **⚡ Advanced Data Fetching:** Optimized caching and fetching using [TanStack Query](https://tanstack.com/query/latest).
- **🤖 AI PR Reviews:** Integrated with CodeRabbit for automated PR analysis and optimization.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, TanStack Query
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** Clerk
- **Video/Audio/Chat:** Stream API
- **Background Jobs:** Inngest
- **Deployment:** Sevalla (Free-tier friendly)

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Environment Variables

Create a `.env` file in both the `/backend` and `/frontend` directories.

#### Backend (`/backend/.env`)

```env
PORT=3000
NODE_ENV=development

DB_URL=your_mongodb_connection_url

INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

CLIENT_URL=http://localhost:5173
```

#### Frontend (`/frontend/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

VITE_API_URL=http://localhost:3000/api

VITE_STREAM_API_KEY=your_stream_api_key
```

### Installation & Running

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/talent-iq.git
cd talent-iq
```

2. **Start the Backend:**
   Open a terminal and run:

```bash
cd backend
npm install
npm run dev
```

3. **Start the Frontend:**
   Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Your app should now be running! The frontend will typically be on `http://localhost:5173` and the backend strictly on `http://localhost:3000`.

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
