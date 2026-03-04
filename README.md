# KBT Avinyathon 2026 – Hackathon Hub

![KBT Avinyathon 2026](https://img.shields.io/badge/KBT_Avinyathon-2026-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)

A premium, state-of-the-art hackathon management portal designed for **KBTCOE Nashik**. This platform streamlines participant registration, problem statement management, and real-time synchronization between industrial challenges and student innovation.

## 🚀 Key Features

-   **Seamless Registration**: Dynamic multi-step team registration form with real-time validation.
-   **Dual-Database Sync**: Automated synchronization between primary and external Supabase instances using Edge Functions.
-   **Problem Management**: Industrial partner challenges categorized by domain with unique human-readable IDs.
-   **Automated Notifications**: Professional confirmation emails sent via Gmail SMTP (Nodemailer) with unique Team IDs for submission tracking.
-   **Responsive UI**: Modern, high-performance interface built with React, Shadcn/UI, and Tailwind CSS.

## 🛠️ Technology Stack

-   **Frontend**: React 18, Vite, TypeScript
-   **Styling**: Tailwind CSS, Lucide React, Shadcn/UI
-   **Backend/BaaS**: Supabase (Database, Edge Functions, Auth, Storage)
-   **Email Engine**: Nodemailer with Deno/Supabase Edge Functions
-   **State Management**: TanStack Query (React Query)

## 💻 Local Development

Follow these steps to set up the project locally:

### 1. Clone the repository
```sh
git clone https://github.com/IshwariShinde8772/remix-of-kbt-hackathon-hub-18.git
cd remix-of-kbt-hackathon-hub-18
```

### 2. Install dependencies
```sh
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```sh
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Main application pages (Registration, Solutions, etc.)
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions and Supabase client
├── supabase/
│   ├── functions/      # Edge Functions (Registration, Sync, Email)
│   └── migrations/     # SQL Database migrations
└── public/             # Static assets (Logos, Icons)
```

## 📧 Contact & Support

For any queries regarding the KBT Avinyathon 2026 portal, please reach out to:
- **Email**: [kbtavinyathon@gmail.com](mailto:kbtavinyathon@gmail.com)
- **Institution**: KBT College of Engineering, Nashik

---
Developed with ❤️ for the KBT Hackathon Community.
