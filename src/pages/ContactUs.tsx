import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Phone, Mail, User, Building } from "lucide-react";

const contacts = [
  {
    name: "Dr. S. B. Sonawane",
    role: "Event Coordinator, Dean R&D.",
    phone: "9167004398",
    email: "sonawane.sandipkumar@kbtcoe.org",
  },
  {
    name: "Mrs. Tejaswini Deshmukh",
    role: "Event Co-Coordinator",
    phone: "9403498919",
    email: "deshmukh.tejaswini@kbtcoe.org",
  },
  {
    name: "Mr. P.D. Aher",
    role: "Sponsorship Coordinator",
    phone: "7588833992",
    email: "aher.pritesh@kbtcoe.org",
  },
];

const ContactUs = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-center mb-4 text-foreground">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-center mb-10 text-lg">
            Have questions about registration, problem statements, or event details? We're here to help.
          </p>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {contacts.map((contact) => (
              <div
                key={contact.phone}
                className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow duration-300 min-w-0"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg text-card-foreground">{contact.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{contact.role}</p>
                <div className="space-y-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    {contact.phone}
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    {contact.email}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-xl text-card-foreground">For Any Other Details</h2>
            </div>
            <div className="space-y-3 ml-[52px]">
              <a
                href="tel:02532571439"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                0253-2571439
              </a>
              <a
                href="tel:02532582891"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                0253-2582891
              </a>
              <a
                href="mailto:kbt.hackathon@kbtcoe.org"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary" />
                kbt.hackathon@kbtcoe.org
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
