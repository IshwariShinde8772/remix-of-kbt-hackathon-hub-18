import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure env vars are loaded - rebuild trigger v2
console.log("Supabase URL loaded:", !!import.meta.env.VITE_SUPABASE_URL);

createRoot(document.getElementById("root")!).render(<App />);
