import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Filter, ExternalLink, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ProblemStatement {
  id: string;
  company_name: string;
  company_website: string | null;
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
  "Neelay Industries Ltd": "https://www.neelaygroup.com/about.php",
  "Aerogravity Pvt Ltd (NxtQube)": "https://nxtqube.com/",
  "Chemito Infotech Pvt Ltd": "https://www.chemitoinfotech.com/",
};

const LOCAL_RESOURCES: Record<string, { label: string; url: string }[]> = {
  "Development of fixture for control panel assembly": [
    { label: "Control Panel Frame Reference", url: "/resources/Control_Panel_Frame.png" },
  ],
  "Set-up for accurate position of central cylinder of calendar unit of plastic sheet extrusion machine": [
    { label: "Avani Resource", url: "/resources/avani/avani_resource.jpg" },
  ],
  "Design and fabrication of set-up for manufacturing of locking pin and washer": [
    { label: "Pentas Insulation (Design)", url: "/resources/pentas/Pentas Insulation (Design).pdf" },
  ],
  "Temperature distribution of composite wall using CFD": [
    { label: "Pentas Insulation (Temperature)", url: "/resources/pentas/Pentas Insulation (Temperature).pdf" },
  ],
  "Real-time Payment Management, Inventory management and respective Invoice generation customised for construction management": [
    { label: "Samarth Developers Resource", url: "/resources/samarth/Samarth developers.pdf" },
  ],
};

const ITEMS_PER_PAGE = 10;

/* ─────────────────────────────────────────────
   MOBILE / TABLET  –  Card for each problem
───────────────────────────────────────────── */
type ProblemWithId = ProblemStatement & { displayId: string };

const ProblemCard = ({
  problem,
  teamCount,
  onView,
}: {
  problem: ProblemWithId;
  teamCount: number;
  onView: () => void;
}) => {
  const domainColor = DOMAIN_COLORS[problem.domain] || "bg-gray-100 text-gray-800";

  return (
    <div className="bg-background border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Top row: ID + Domain badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <Badge
          variant="outline"
          className="font-mono text-xs bg-secondary/10 text-secondary border-secondary/30 shrink-0"
        >
          {problem.displayId}
        </Badge>
        <Badge className={`text-xs border ${domainColor} shrink-0`}>
          {problem.domain}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-foreground leading-snug mb-1">
        {problem.problem_title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {problem.problem_description}
      </p>

      {/* Bottom row: org + teams + view */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground font-medium truncate max-w-[160px]">
            {problem.company_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {teamCount} team{teamCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <Button
          size="sm"
          className="gradient-primary text-primary-foreground shrink-0 h-8 px-3 text-xs"
          onClick={onView}
        >
          <Eye className="w-3 h-3 mr-1" />
          View Details
        </Button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
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

  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const fetchTeamCounts = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isExternal = supabaseUrl.includes("lxawemydhhmqjahttrlb");
      const regTable = isExternal ? "team_registrations" : "registered_teams";
      const probIdCol = isExternal ? "problem_statement_id" : "selected_problem_id";

      const { data }: { data: any[] | null } = await supabase
        .from(regTable as any)
        .select(probIdCol);

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((t: any) => {
          const pid = t[probIdCol];
          if (pid) {
            counts[pid] = (counts[pid] || 0) + 1;
          }
        });
        setTeamCounts(counts);
      }
    };
    
    fetchTeamCounts();

    // Set up real-time subscription for team registration changes
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isExternal = supabaseUrl.includes("lxawemydhhmqjahttrlb");
    const regTable = isExternal ? "team_registrations" : "registered_teams";
    const probIdCol = isExternal ? "problem_statement_id" : "selected_problem_id";

    const channel = supabase
      .channel("team_registrations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: regTable },
        () => fetchTeamCounts()
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);

  /* Pagination controls (shared) */
  const PaginationBar = () =>
    totalPages > 1 ? (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage((p) => p - 1);
              setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => {
              setCurrentPage((p) => p + 1);
              setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
            }}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <main className="py-8 bg-muted/30 min-h-[80vh]">
        <div className="container mx-auto px-4">

          {/* ── Title ── */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-foreground mb-2 flex items-center justify-center gap-3 flex-wrap">
              Problem Statements
              <Button variant="outline" size="sm" onClick={fetchProblems} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Explore the challenges posed by leading industries and organizations. Find a problem that ignites your passion and build an innovative solution.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Showing {filteredProblems.length} of {problems.length} problem statements
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-5xl mx-auto">
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
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="w-4 h-4 mr-2 shrink-0" />
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
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2 shrink-0" />
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

          {/* ══════════════════════════════════════════════════════
              MOBILE / TABLET  (<lg)  –  Card grid
          ══════════════════════════════════════════════════════ */}
          <div className="block lg:hidden max-w-5xl mx-auto">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground bg-background rounded-xl border border-border">
                Loading problem statements...
              </div>
            ) : paginatedProblems.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-background rounded-xl border border-border">
                No problem statements found.
              </div>
            ) : (
              <>
                {/* 1-col on mobile, 2-col on tablet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedProblems.map((problem) => (
                    <ProblemCard
                      key={problem.id}
                      problem={problem}
                      teamCount={teamCounts[problem.id] || 0}
                      onView={() => setSelectedProblem(problem)}
                    />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => {
                          setCurrentPage((p) => p - 1);
                          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
                        }}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => {
                          setCurrentPage((p) => p + 1);
                          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
                        }}
                      >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
              DESKTOP  (≥lg)  –  Original table layout
          ══════════════════════════════════════════════════════ */}
          <div className="hidden lg:block max-w-5xl mx-auto bg-background rounded-xl shadow-lg overflow-hidden border border-border">
            {/* Table header */}
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

            <PaginationBar />
          </div>
        </div>
      </main>
      <Footer />

      {/* ── Detail Dialog ── */}
      <Dialog open={!!selectedProblem} onOpenChange={() => setSelectedProblem(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedWithId && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl font-heading">
                  {selectedWithId.displayId} — PROBLEM DETAILS
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-0">
                {/* On mobile use stacked label/value blocks; on md+ use table */}
                <div className="block md:hidden space-y-3">
                  {[
                    { label: "Problem Statement ID", value: selectedWithId.displayId },
                    { label: "Problem Statement Title", value: <span className="font-bold">{selectedWithId.problem_title}</span> },
                    { label: "Description", value: <span className="whitespace-pre-wrap">{selectedWithId.problem_description}</span> },
                    ...(selectedWithId.expected_outcome ? [{ label: "Expected Outcome", value: selectedWithId.expected_outcome }] : []),
                    ...(selectedWithId.targeted_audience ? [{ label: "Targeted Audience", value: selectedWithId.targeted_audience }] : []),
                    {
                      label: "Organization", value: (() => {
                        const url = selectedWithId.company_website || COMPANY_WEBSITES[selectedWithId.company_name];
                        return url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 w-fit">
                            {selectedWithId.company_name} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : selectedWithId.company_name;
                      })()
                    },
                    { label: "Domain / Category", value: selectedWithId.domain },
                    ...(selectedWithId.resources_provided ? [{ label: "Resources Provided", value: selectedWithId.resources_provided }] : []),
                  ].map(({ label, value }, i) => (
                    <div key={i} className="border-b border-border pb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm text-foreground">{value as any}</p>
                    </div>
                  ))}
                  {/* Resource file buttons */}
                  {selectedWithId.resource_file_url && (
                    <div className="border-b border-border pb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Additional Resources</p>
                      <Button variant="outline" size="sm" className="text-primary w-full" onClick={async () => {
                        const { data } = await supabase.storage.from("problem-resources").createSignedUrl(selectedWithId.resource_file_url!, 3600);
                        if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                      }}>
                        <ExternalLink className="w-4 h-4 mr-2" /> View / Download Resource File
                      </Button>
                    </div>
                  )}
                  {LOCAL_RESOURCES[selectedWithId.problem_title] && (
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Reference Resources</p>
                      <div className="flex flex-col gap-2">
                        {LOCAL_RESOURCES[selectedWithId.problem_title].map((res, idx) => (
                          <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-primary w-full">
                              <ExternalLink className="w-4 h-4 mr-2" /> {res.label}
                            </Button>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop table inside dialog */}
                <div className="hidden md:block">
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
                          {(() => {
                            const url = selectedWithId.company_website || COMPANY_WEBSITES[selectedWithId.company_name];
                            return url ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 w-fit">
                                {selectedWithId.company_name}<ExternalLink className="w-3 h-3" />
                              </a>
                            ) : selectedWithId.company_name;
                          })()}
                        </td>
                      </tr>
                      <tr><td className="py-3 pr-4 font-semibold text-sm">Domain / Category</td><td className="py-3 text-sm">{selectedWithId.domain}</td></tr>
                      {selectedWithId.resources_provided && <tr><td className="py-3 pr-4 font-semibold text-sm">Resources Provided</td><td className="py-3 text-sm">{selectedWithId.resources_provided}</td></tr>}
                      {selectedWithId.resource_file_url && (
                        <tr>
                          <td className="py-3 pr-4 font-semibold text-sm">Additional Resources</td>
                          <td className="py-3">
                            <Button variant="outline" size="sm" className="text-primary" onClick={async () => {
                              const { data } = await supabase.storage.from("problem-resources").createSignedUrl(selectedWithId.resource_file_url!, 3600);
                              if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                            }}>
                              <ExternalLink className="w-4 h-4 mr-2" /> View / Download Resource File
                            </Button>
                          </td>
                        </tr>
                      )}
                      {LOCAL_RESOURCES[selectedWithId.problem_title] && (
                        <tr>
                          <td className="py-3 pr-4 font-semibold text-sm">Reference Resources</td>
                          <td className="py-3">
                            <div className="flex flex-col gap-2">
                              {LOCAL_RESOURCES[selectedWithId.problem_title].map((res, idx) => (
                                <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                                  <Button variant="outline" size="sm" className="text-primary">
                                    <ExternalLink className="w-4 h-4 mr-2" /> {res.label}
                                  </Button>
                                </a>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
