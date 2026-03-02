import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Download, FileText, Layout, ScrollText, ShieldCheck } from "lucide-react";

/**
 * Resources metadata based on user-provided image and mainresources folder
 */
const resources = [
    {
        title: "Team Registration Form",
        description: "Authorization letter template for team registration",
        icon: <FileText className="w-10 h-10 text-white" />,
        color: "bg-[#f59e0b]", // Orange
        buttonColor: "bg-[#f59e0b] hover:bg-[#d97706]",
        link: "/mainresources/KBTavinyathon-Team-Authorization-Letter-2026.docx",
    },
    {
        title: "Idea Submission Template",
        description: "Document template for idea submission",
        icon: <Layout className="w-10 h-10 text-white" />,
        color: "bg-[#10b981]", // Emerald Green
        buttonColor: "bg-[#10b981] hover:bg-[#059669]",
        link: "/mainresources/KBT-Avinyathon-Presentation-Template.pptx",
    },
    {
        title: "Hackathon Rulebook",
        description: "Complete rules and regulations document",
        icon: <ScrollText className="w-10 h-10 text-white" />,
        color: "bg-[#8b5cf6]", // Purple/Violet
        buttonColor: "bg-[#8b5cf6] hover:bg-[#7c3aed]",
        link: "/mainresources/rules%20hackathon.docx",
    },
    {
        title: "Code of Conduct",
        description: "Ethics and behavior guidelines for participants",
        icon: <ShieldCheck className="w-10 h-10 text-white" />,
        color: "bg-[#ef4444]", // Red
        buttonColor: "bg-[#ef4444] hover:bg-[#dc2626]",
        link: "/mainresources/code%20of%20conduct.docx",
    },
];

const Resources = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Header />
            <Navbar />

            <main className="flex-grow py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Hero/Header Section */}
                    <div className="text-center mb-20 animate-fade-in">
                        <h1 className="text-4xl md:text-6xl font-black text-[#1a4789] mb-6 tracking-tight">
                            Download Resources
                        </h1>
                        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
                            Find and download all the essential documentation, templates, and guidelines needed for a successful hackathon journey.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-blue-600 rounded-full"></div>
                        </div>
                    </div>

                    {/* Grid Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {resources.map((resource, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 p-10 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:border-slate-200 overflow-hidden"
                            >
                                {/* Decorative Background Blob */}
                                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-[1.5] ${resource.color}`}></div>

                                {/* Icon Container */}
                                <div className={`w-24 h-24 ${resource.color} rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-opacity-20 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                                    {resource.icon}
                                </div>

                                {/* Text Content */}
                                <div className="relative z-10 flex-grow mb-8">
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-[#1a4789] transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-lg text-slate-400 font-medium">
                                        {resource.description}
                                    </p>
                                </div>

                                {/* Download Link Wrapper */}
                                <a
                                    href={resource.link}
                                    download
                                    className="w-full relative z-10"
                                >
                                    <Button className={`w-full py-8 text-lg rounded-2xl text-white font-black flex items-center justify-center gap-3 ${resource.buttonColor} shadow-lg transition-all border-none active:scale-[0.98]`}>
                                        <Download className="w-6 h-6 stroke-[3px]" />
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
