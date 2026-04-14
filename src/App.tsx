import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SubmitProblem from "./pages/SubmitProblem";
import ProblemStatements from "./pages/ProblemStatements";
import RegisterTeam from "./pages/RegisterTeam";
import SubmitSolution from "./pages/SubmitSolution";
import Resources from "./pages/Resources";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import Result from "./pages/Result";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/problems" element={<ProblemStatements />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/register" element={<RegisterTeam />} />
          <Route path="/submit-solution" element={<SubmitSolution />} />
          <Route path="/submit" element={<SubmitProblem />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/result" element={<Result />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
