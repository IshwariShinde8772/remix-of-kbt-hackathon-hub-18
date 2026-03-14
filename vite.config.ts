import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/ - v2
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    // Fallback values for when .env is missing (e.g. GitHub sync deletes it)
    // These are publishable/anon keys, safe to include in client code
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || "https://wunqjksrgdppzcucwcyd.supabase.co"),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1bnFqa3NyZ2RwcHpjdWN3Y3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDg3MDAsImV4cCI6MjA4Nzc4NDcwMH0.BKowFvDJubcfrd0XaDWcO8cEbsjCkEBPL9iTqioYCro"),
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(process.env.VITE_SUPABASE_PROJECT_ID || "wunqjksrgdppzcucwcyd"),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

