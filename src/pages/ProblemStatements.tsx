import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Filter, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ProblemStatement {
  id: string;
  company_name: string;
  problem_title: string;
  problem_description: string;
  domain: string;
  expected_outcome: string | null;
  targeted_audience: string | null;
  resources_provided: string | null;
  resource_file_url: string | null;
  status: string;
  created_at: string;
}

const DOMAIN_PREFIXES: Record<string, string> = {
  "Automation": "AT",
  "Banking/Sales/Marketing": "BA",
  "Design": "DE",
  "Hardware": "HA",
  "Other": "OT",
  "Software": "SO",
  "Graphics": "GR",
  "Maintenance": "MA",
};

const DOMAIN_COLORS: Record<string, string> = {
  "Automation": "bg-blue-100 text-blue-800 border-blue-200",
  "Banking/Sales/Marketing": "bg-purple-100 text-purple-800 border-purple-200",
  "Design": "bg-pink-100 text-pink-800 border-pink-200",
  "Hardware": "bg-green-100 text-green-800 border-green-200",
  "Other": "bg-orange-100 text-orange-800 border-orange-200",
  "Software": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Graphics": "bg-teal-100 text-teal-800 border-teal-200",
  "Maintenance": "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const COMPANY_WEBSITES: Record<string, string> = {
  "Neelay Industries": "https://www.neelaygroup.com/about.php",
  "Aerogravity Pvt Ltd": "https://nxtqube.com/",
};

const ITEMS_PER_PAGE = 10;

const ProblemStatements = () => {
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [selectedProblem, setSelectedProblem] = useState<ProblemStatement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProblems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("problem_statements")
      .select("*")
      .eq("status", "approved")
      .order("domain", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) {
      setProblems(data as ProblemStatement[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProblems();

    // Real-time subscription
    const channel = supabase
      .channel("problem_statements_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "problem_statements" },
        () => fetchProblems()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Generate display IDs based on domain grouping
  const problemsWithIds = useMemo(() => {
    const domainCounters: Record<string, number> = {};
    return problems.map((p) => {
      const prefix = DOMAIN_PREFIXES[p.domain] || "XX";
      domainCounters[p.domain] = (domainCounters[p.domain] || 0) + 1;
      return { ...p, displayId: `${prefix}-${domainCounters[p.domain]}` };
    });
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problemsWithIds.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.problem_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.problem_description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = domainFilter === "all" || p.domain === domainFilter;
      const matchesOrg = orgFilter === "all" || p.company_name === orgFilter;
      return matchesSearch && matchesDomain && matchesOrg;
    });
  }, [problemsWithIds, searchQuery, domainFilter, orgFilter]);

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, domainFilter, orgFilter]);

  const domains = [...new Set(problems.map((p) => p.domain))].sort();
  const organizations = [...new Set(problems.map((p) => p.company_name))].sort();

  const selectedWithId = selectedProblem
    ? problemsWithIds.find((p) => p.id === selectedProblem.id)
    : null;

  // Count teams selected for a problem
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const fetchTeamCounts = async () => {
      const { data } = await supabase
        .from("registered_teams")
        .select("selected_problem_id");
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((t: any) => {
          if (t.selected_problem_id) {
            counts[t.selected_problem_id] = (counts[t.selected_problem_id] || 0) + 1;
          }
        });
        setTeamCounts(counts);
      }
    };
    fetchTeamCounts();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <main className="py-8 bg-muted/30 min-h-[80vh]">
        <div className="container mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground mb-2 flex items-center justify-center gap-3">
              Problem Statements
              <Button variant="outline" size="sm" onClick={fetchProblems} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the challenges posed by leading industries and organizations. Find a problem that ignites your passion and build an innovative solution.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Showing {filteredProblems.length} of {problems.length} problem statements
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 max-w-5xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, ID, organization..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="max-w-5xl mx-auto bg-background rounded-xl shadow-lg overflow-hidden border border-border">
            {/* Header */}
            <div className="grid grid-cols-[80px_140px_1fr_160px_100px_80px] gap-2 px-4 py-3 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
              <div>ID</div>
              <div>Organization</div>
              <div>Problem Statement</div>
              <div>Domain</div>
              <div className="text-center">Selected By</div>
              <div className="text-center">Action</div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Loading problem statements...</div>
            ) : paginatedProblems.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No problem statements found.</div>
            ) : (
              paginatedProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="grid grid-cols-[80px_140px_1fr_160px_100px_80px] gap-2 px-4 py-4 border-b border-border items-center hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <Badge variant="outline" className="font-mono text-xs bg-secondary/10 text-secondary border-secondary/30">
                      {problem.displayId}
                    </Badge>
                  </div>
                  <div className="text-sm text-foreground truncate" title={problem.company_name}>
                    {problem.company_name}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{problem.problem_title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{problem.problem_description}</p>
                  </div>
                  <div>
                    <Badge className={`text-xs border ${DOMAIN_COLORS[problem.domain] || "bg-gray-100 text-gray-800"}`}>
                      {problem.domain}
                    </Badge>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {teamCounts[problem.id] || 0} teams
                  </div>
                  <div className="text-center">
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground"
                      onClick={() => setSelectedProblem(problem)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Detail Dialog */}
      <Dialog open={!!selectedProblem} onOpenChange={() => setSelectedProblem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedWithId && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-heading">
                  {selectedWithId.displayId} — PROBLEM DETAILS
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <table className="w-full">
                  <tbody className="divide-y divide-border">
                    <tr><td className="py-3 pr-4 font-semibold text-sm w-44">Problem Statement ID</td><td className="py-3 text-sm">{selectedWithId.displayId}</td></tr>
                    <tr><td className="py-3 pr-4 font-semibold text-sm">Problem Statement Title</td><td className="py-3 text-sm font-bold">{selectedWithId.problem_title}</td></tr>
                    <tr><td className="py-3 pr-4 font-semibold text-sm">Description</td><td className="py-3 text-sm whitespace-pre-wrap">{selectedWithId.problem_description}</td></tr>
                    {selectedWithId.expected_outcome && <tr><td className="py-3 pr-4 font-semibold text-sm">Expected Outcome</td><td className="py-3 text-sm">{selectedWithId.expected_outcome}</td></tr>}
                    {selectedWithId.targeted_audience && <tr><td className="py-3 pr-4 font-semibold text-sm">Targeted Audience</td><td className="py-3 text-sm">{selectedWithId.targeted_audience}</td></tr>}
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-sm">Organization</td>
                      <td className="py-3 text-sm">
                        {COMPANY_WEBSITES[selectedWithId.company_name] ? (
                          <a
                            href={COMPANY_WEBSITES[selectedWithId.company_name]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 w-fit"
                          >
                            {selectedWithId.company_name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          selectedWithId.company_name
                        )}
                      </td>
                    </tr>
                    <tr><td className="py-3 pr-4 font-semibold text-sm">Domain / Category</td><td className="py-3 text-sm">{selectedWithId.domain}</td></tr>
                    {selectedWithId.resources_provided && <tr><td className="py-3 pr-4 font-semibold text-sm">Resources Provided</td><td className="py-3 text-sm">{selectedWithId.resources_provided}</td></tr>}
                    {selectedWithId.resource_file_url && (
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-sm">Additional Resources</td>
                        <td className="py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary"
                            onClick={async () => {
                              const { data } = await supabase.storage
                                .from("problem-resources")
                                .createSignedUrl(selectedWithId.resource_file_url!, 3600);
                              if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View / Download Resource File
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setSelectedProblem(null)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProblemStatements;
