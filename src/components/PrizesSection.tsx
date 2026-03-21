import { Trophy, Gift, Award, Star } from "lucide-react";

const prizes = [
  {
    rank: 2,
    label: "2nd Prize",
    amount: "₹15,000",
    cardGrad: "from-slate-100 via-white to-slate-50",
    borderColor: "border-slate-300",
    iconGrad: "from-slate-400 to-slate-200",
    iconShadow: "shadow-slate-200",
    amountColor: "text-slate-700",
    labelColor: "text-slate-500",
    accentBar: "bg-slate-300",
    mobileOrder: "order-2",
    elevated: false,
  },
  {
    rank: 1,
    label: "1st Prize",
    amount: "₹25,000",
    cardGrad: "from-yellow-50 via-amber-50 to-orange-50",
    borderColor: "border-yellow-300",
    iconGrad: "from-yellow-400 to-amber-300",
    iconShadow: "shadow-yellow-200",
    amountColor: "text-amber-700",
    labelColor: "text-amber-600",
    accentBar: "bg-gradient-to-r from-yellow-400 to-amber-400",
    topBadge: "🏆 Grand Winner",
    mobileOrder: "order-1",
    elevated: true,
  },
  {
    rank: 3,
    label: "3rd Prize",
    amount: "₹10,000",
    cardGrad: "from-orange-50 via-amber-50 to-yellow-50",
    borderColor: "border-amber-300",
    iconGrad: "from-amber-600 to-amber-400",
    iconShadow: "shadow-amber-200",
    amountColor: "text-amber-800",
    labelColor: "text-amber-600",
    accentBar: "bg-gradient-to-r from-amber-500 to-orange-400",
    mobileOrder: "order-3",
    elevated: false,
  },
];

const PrizesSection = () => {
  return (
    <section id="prizes" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">

        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-1.5 rounded-full text-xs md:text-sm font-semibold uppercase tracking-widest">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Powered by Winjit
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </span>
        </div>

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-3 text-foreground leading-tight tracking-tight">
            Prizes &amp;{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, hsl(38,95%,45%) 0%, hsl(25,90%,50%) 100%)",
              }}
            >
              Rewards
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base font-sans leading-relaxed">
            Compete, innovate, and walk away with exciting cash prizes and
            exclusive goodies.
          </p>
        </div>

        {/* Prize Cards */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto md:items-end">
          {prizes.map((prize) => {
            const isFirst = prize.rank === 1;
            return (
              <div
                key={prize.rank}
                className={`
                  relative flex flex-col items-center text-center
                  ${prize.mobileOrder} md:order-none
                  ${isFirst ? "md:-translate-y-6 z-10" : ""}
                `}
              >
                {/* Colorful top accent bar */}
                <div className={`absolute top-0 left-8 right-8 h-1.5 rounded-b-full ${prize.accentBar} ${isFirst ? "h-2" : ""}`} />

                {/* Card */}
                <div
                  className={`
                    w-full rounded-3xl border-2 ${prize.borderColor}
                    bg-gradient-to-br ${prize.cardGrad}
                    shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1
                    p-6 sm:p-8 flex flex-col items-center
                    ${isFirst ? "pt-12 shadow-amber-100 border-yellow-300" : "pt-10"}
                  `}
                >
                  {/* Badge */}
                  {prize.topBadge && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 text-[11px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      {prize.topBadge}
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`
                      rounded-3xl bg-gradient-to-br ${prize.iconGrad}
                      flex items-center justify-center shadow-lg ${prize.iconShadow} mb-6
                      ${isFirst ? "w-24 h-24 sm:w-28 sm:h-28" : "w-20 h-20"}
                    `}
                  >
                    <Trophy
                      className={`text-white drop-shadow ${isFirst ? "w-12 h-12 sm:w-14 sm:h-14" : "w-9 h-9"}`}
                    />
                  </div>

                  {/* Label */}
                  <p
                    className={`text-xs font-heading font-bold uppercase tracking-[0.15em] mb-2 ${prize.labelColor}`}
                  >
                    {prize.label}
                  </p>

                  {/* Amount */}
                  <p
                    className={`font-heading font-extrabold ${prize.amountColor} leading-none mb-6
                      ${isFirst ? "text-5xl sm:text-6xl md:text-6xl" : "text-4xl sm:text-5xl"}`}
                  >
                    {prize.amount}
                  </p>

                  {/* Footer */}
                  <div className="border-t border-black/8 pt-4 w-full">
                    <span className="text-[11px] font-bold font-sans text-muted-foreground/80 uppercase tracking-widest">
                      Cash Reward + Perks
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Perks Row */}
        <div className="mt-12 md:mt-16 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

          {/* Goody Bag */}
          <div className="flex items-start gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(270,65%,55%), hsl(217,91%,55%))" }}
            >
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-heading font-bold text-foreground mb-1">
                Goody Bags for All Participants
              </h3>
              <p className="text-xs md:text-sm font-sans text-muted-foreground leading-relaxed">
                Every team member receives an exclusive{" "}
                <strong className="text-foreground">Goody Bag from Winjit</strong>{" "}
                — a premium token of appreciation for your innovation!
              </p>
            </div>
          </div>

          {/* Certificate */}
          <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(45,95%,55%), hsl(30,90%,50%))" }}
            >
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-heading font-bold text-foreground mb-1">
                Certificate of Participation
              </h3>
              <p className="text-xs md:text-sm font-sans text-muted-foreground leading-relaxed">
                All participants receive an official{" "}
                <strong className="text-foreground">Certificate of Participation</strong>{" "}
                to showcase their achievement.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PrizesSection;
