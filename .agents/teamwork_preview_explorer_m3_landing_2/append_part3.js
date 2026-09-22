const fs = require('fs');
const target = 'e:/doctor-appointment-saas-platform/.agents/teamwork_preview_explorer_m3_landing_2/handoff.md';

const chunk3 = `
        {/* "We Build Monopolies, Not Marketplaces" Scarcity Pillar Bento Box */}
        <div className="mt-20 sm:mt-24 text-left max-w-5xl mx-auto">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00B7A8]" />
              <span>The Scarcity Principle • Practice Moat</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
              We Build Monopolies, Not Marketplaces.
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto mt-2">
              Why Clinic Diary will never sell software to your competitor across the street.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Column 1: The Aggregator Marketplace Trap */}
            <div className="bg-rose-50/40 border border-rose-200/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-800 text-[11px] font-black uppercase tracking-wider mb-4">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>The Aggregator Marketplace Model</span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-[#0B132B] mb-2 tracking-tight">
                  Directory Commoditization Trap
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Aggregator platforms (Practo, JustDial, etc.) thrive on saturation. They pit you against dozens of local doctors in a race to the bottom.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Local Saturation:</strong> Sells software to 20+ rival clinics within your exact 2km catchment area.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Sponsored Bidding Wars:</strong> Forces you to pay per click to outbid neighboring doctors for your own patient visibility.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>15% - 30% Commission Tax:</strong> Takes an aggressive cut on every single appointment your clinic fulfills.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Patient Poaching:</strong> Directly markets cheaper rival doctors and discount labs to your returning patients.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Zero Brand Equity:</strong> You are just an interchangeable profile row in someone else's directory.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-rose-200/60 text-[11px] font-semibold text-rose-700 italic">
                "Their business model depends on keeping doctors commoditized and dependent on lead auctions."
              </div>
            </div>

            {/* Column 2: The Clinic Diary Territorial Monopoly */}
            <div className="bg-[#0B132B] text-white border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Radial glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>The Clinic Diary Exclusivity License</span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Contractual Territorial Monopoly
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  We limit access to exactly one clinic per specialty per postal code. We succeed only when your clinic completely dominates its local area.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>1 Clinic Per Specialty:</strong> Strict postal area lock. We contractually bar rival practices in your PIN code.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>100% Demand Routing:</strong> Every digital scan and local search booking routes exclusively to your front desk.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>0% Commissions Forever:</strong> Transparent flat software subscription. Keep 100% of your consulting fees.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>Unbreakable Patient Fortress:</strong> Patients interact solely with your branded portal and WhatsApp channel.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>Complete Practice Sovereignty:</strong> You own your database, your patient charts, and your domain forever.</span>
                  </li>
                </ul>
              </div>

              <div className="relative z-10 mt-8 pt-4 border-t border-slate-800 text-[11px] font-semibold text-emerald-300 italic">
                "If we sold software to your neighbor across the street, we would dilute your value. We protect your territory."
              </div>
            </div>

          </div>

          {/* Bottom Reassurance Banner */}
          <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00B7A8] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0B132B]">
                  Territories are claimed on a strict first-come, first-verified basis.
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Once a PIN is locked for your specialty, applications from competing clinics are automatically rejected.
                </div>
              </div>
            </div>
            <Link href="/signup" className="shrink-0">
              <Button size="sm" className="bg-[#0B132B] hover:bg-slate-800 text-white font-bold rounded-xl px-4 h-10 text-xs cursor-pointer">
                Claim Your Practice Monopoly
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}

export default TerritoryChecker;
\`\`\`
`;

fs.appendFileSync(target, chunk3, 'utf-8');
console.log('Chunk 3 appended. Entire handoff.md complete!');
