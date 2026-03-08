import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Download, FileText, Layout, ScrollText, ShieldCheck } from "lucide-react";

const resources = [
    {
        title: "Team Registration Form",
        description: "Authorization letter template for team registration",
        icon: <FileText className="w-10 h-10 text-white" />,
        color: "from-primary to-primary/80",
        link: "/mainresources/KBTavinyathon-Team-Authorization-Letter-2026.docx",
    },
    {
        title: "Idea Submission Template",
        description: "Document template for idea submission",
        icon: <Layout className="w-10 h-10 text-white" />,
        color: "from-secondary to-secondary/80",
        link: "/mainresources/KBT-Avinyathon-Presentation-Template.pptx",
    },
    {
        title: "Hackathon Rulebook",
        description: "Complete rules and regulations document",
        icon: <ScrollText className="w-10 h-10 text-white" />,
        color: "from-accent-foreground to-accent-foreground/80",
        link: "/mainresources/rules-hackathon.docx",
    },
    {
        title: "Code of Conduct",
        description: "Ethics and behavior guidelines for participants",
        icon: <ShieldCheck className="w-10 h-10 text-white" />,
        color: "from-destructive to-destructive/80",
        link: "/mainresources/code-of-conduct.docx",
    },
];

const Resources = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Header />
            <Navbar />

            <main className="flex-grow py-12 md:py-24 bg-gradient-to-b from-muted/30 to-background">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header Section */}
                    <div className="text-center mb-16 animate-fade-in">
                        <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Download className="w-4 h-4" />
                            Resources
                        </span>
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground mb-4">
                            Download Resources
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Find and download all the essential documentation, templates, and guidelines needed for a successful hackathon journey.
                        </p>
                    </div>

                    {/* Grid Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {resources.map((resource, index) => (
                            <div
                                key={index}
                                className="group bg-background rounded-2xl shadow-md border border-border p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
                            >
                                {/* Icon Container */}
                                <div className={`w-20 h-20 bg-gradient-to-br ${resource.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                    {resource.icon}
                                </div>

                                {/* Text Content */}
                                <div className="flex-grow mb-6">
                                    <h3 className="text-xl font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {resource.description}
                                    </p>
                                </div>

                                {/* Download Button */}
                                <a href={resource.link} download className="w-full">
                                    <Button className="w-full gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 py-5 rounded-xl">
                                        <Download className="w-5 h-5" />
                                        Download
                                    </Button>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Resources;
