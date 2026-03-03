import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug: check if env vars are loaded
console.log("ENV check - SUPABASE_URL defined:", !!import.meta.env.VITE_SUPABASE_URL);
console.log("ENV check - SUPABASE_KEY defined:", !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")!).render(<App />);