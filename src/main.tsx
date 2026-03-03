import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force env refresh
createRoot(document.getElementById("root")!).render(<App />);
