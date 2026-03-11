import { CheckCircle2 } from "lucide-react";
import innovationLightbulb from "@/assets/innovation-lightbulb.jpg";

const TrackRecordSection = () => {
  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-border">
              <img
                src={innovationLightbulb}
                alt="Innovation lightbulb with blue energy trails"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 space-y-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-foreground leading-tight">
              Proven Track Record of Success
            </h2>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg leading-relaxed">
              Many companies have already transformed their challenges into innovative solutions through our institute. Join the innovation revolution today.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-success-bg rounded-xl">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground text-sm md:text-base">95% Satisfaction Rate</h4>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    Companies consistently rate their experience highly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-success-bg rounded-xl">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground text-sm md:text-base">Rapid Implementation</h4>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    Many solutions move to production within 3 months
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackRecordSection;
