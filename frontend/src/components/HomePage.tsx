import React from 'react';
import {
  FileText,
  Calculator,
  UserCheck,
  Code,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Key,
  ShieldCheck,
  Star,
  ChevronRight,
} from 'lucide-react';

interface HomePageProps {
  onNavigateToProject: () => void;
  onNavigateToApiKey: () => void;
  hasKey?: boolean;
}

interface AgentCardInfo {
  id: string;
  phase: string;
  name: string;
  shortDesc: string;
  detailedRole: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  tags: string[];
}

const AGENTS: AgentCardInfo[] = [
  {
    id: 'format',
    phase: 'Agent 01',
    name: 'Format & ATS Screener',
    shortDesc: 'Layout hierarchies, parsing pitfalls, and machine readability check.',
    detailedRole:
      'Parses PDF and DOCX structural hierarchies, detecting multi-column traps, unreadable text layers, nested tables, and formatting flaws that cause 75% of ATS systems to silently drop applicant resumes.',
    bgColor: 'bg-[#FFE2C8]', // Peach / Warm Apricot
    textColor: 'text-amber-950',
    icon: <FileText className="w-5 h-5 text-black" />,
    tags: ['ATS Parsing', 'Font Hierarchy', 'Column Trap Detection'],
  },
  {
    id: 'metrics',
    phase: 'Agent 02',
    name: 'Metric Authenticity Verifier',
    shortDesc: 'Exposes fabricated percentages and impossible ROI multipliers.',
    detailedRole:
      'Cross-examines quantitative claims against mathematical and industry baselines. Flags suspicious stats like "increased revenue by 400%" when unsupported by company size, team context, or timeframes.',
    bgColor: 'bg-[#DDF282]', // Lime Green
    textColor: 'text-lime-950',
    icon: <Calculator className="w-5 h-5 text-black" />,
    tags: ['Hallucination Detection', 'Math Baselines', 'Metric Grounding'],
  },
  {
    id: 'ownership',
    phase: 'Agent 03',
    name: 'Ownership & Attribution Auditor',
    shortDesc: 'Separates individual contribution from inflated team achievements.',
    detailedRole:
      'Detects "we" vs "I" attribution drift and title inflation. Identifies when candidates claim end-to-end authorship over enterprise multi-year projects where their role was limited to bug triage or junior support.',
    bgColor: 'bg-[#C9B7F5]', // Lavender
    textColor: 'text-purple-950',
    icon: <UserCheck className="w-5 h-5 text-black" />,
    tags: ['Attribution Drift', 'Role Inflation', 'Individual Impact'],
  },
  {
    id: 'technical',
    phase: 'Agent 04',
    name: 'Technical Depth & Stack Assessor',
    shortDesc: 'Tests actual codebase proof against keyword-stuffed skill lists.',
    detailedRole:
      'Examines whether listed technical keywords (e.g. Kubernetes, PyTorch, Rust) are authentically integrated into architectural problem-solving statements or merely copy-pasted into a laundry list.',
    bgColor: 'bg-[#FFCCD5]', // Coral Pink
    textColor: 'text-rose-950',
    icon: <Code className="w-5 h-5 text-black" />,
    tags: ['Keyword Stuffing', 'Architectural Depth', 'Stack Grounding'],
  },
  {
    id: 'impact',
    phase: 'Agent 05',
    name: 'Impact & Business Relevance Analyst',
    shortDesc: 'Quantifies commercial value, latency savings, and scale delivered.',
    detailedRole:
      'Measures whether accomplishments connect to core business outcomes (cost reduction, customer retention, throughput, compliance) rather than mundane daily job duty checklists.',
    bgColor: 'bg-[#BAE6FD]', // Sky Blue
    textColor: 'text-sky-950',
    icon: <TrendingUp className="w-5 h-5 text-black" />,
    tags: ['Business ROI', 'Latency Reduction', 'Bottom-Line Scale'],
  },
  {
    id: 'fluff',
    phase: 'Agent 06',
    name: 'Fluff & Filler Elimination Agent',
    shortDesc: 'Eradicates corporate jargon, buzzwords, and vague self-praise.',
    detailedRole:
      'Ruthlessly red-pencils hollow filler phrases like "results-driven visionary", "dynamic team player", and "leveraged synergies", replacing them with hard verifiable verbs and concrete outcomes.',
    bgColor: 'bg-[#FEF08A]', // Lemon Yellow
    textColor: 'text-yellow-950',
    icon: <Sparkles className="w-5 h-5 text-black" />,
    tags: ['Jargon Stripper', 'Cliché Eradication', 'Action Verbs'],
  },
  {
    id: 'decision',
    phase: 'Agent 07',
    name: 'Adversarial Final Decision Maker',
    shortDesc: 'Synthesizes all findings into a definitive PASS / WARN / REJECT.',
    detailedRole:
      'Aggregates all findings across the prior 6 agents, weights severity, removes false positives, and calculates a ruthless 0-100 overall score that mirrors a real-life skeptical hiring committee review.',
    bgColor: 'bg-white', // Crisp White
    textColor: 'text-slate-900',
    icon: <ShieldAlert className="w-5 h-5 text-black" />,
    tags: ['Committee Verdict', 'Weighted Scoring', 'Hiring Gatekeeper'],
  },
  {
    id: 'rewriter',
    phase: 'Bonus Agent',
    name: 'Provenance-Gated Rewriter',
    shortDesc: 'Rewrites flagged bullets with zero hallucinations and full release gate.',
    detailedRole:
      'Generates improved line-by-line bullet rewrites backed by strict factual provenance. Enforces an automated mathematical release gate: any unverified metric or claim is rejected and must be confirmed.',
    bgColor: 'bg-[#A7F3D0]', // Mint Emerald
    textColor: 'text-emerald-950',
    icon: <RefreshCw className="w-5 h-5 text-black" />,
    tags: ['Zero Hallucination', 'Release Gate Engine', 'Side-by-Side Diff'],
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToProject,
  onNavigateToApiKey,
  hasKey = false,
}) => {
  return (
    <div className="w-full bg-[#FAF6F0] text-slate-900 font-sans pb-20 selection:bg-[#c9b7f5] selection:text-black">
      {/* Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* ======================================================== */}
        {/* HERO FOLDER CARD (Inspired by Reference Design)          */}
        {/* ======================================================== */}
        <div className="relative mb-16 sm:mb-20">
          {/* Top Folder Tab Notch */}
          <div className="flex items-center space-x-3 mb-[-2px] pl-4 sm:pl-8 z-10 relative">
            {/* Pink Washi Tape Sticker */}
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-[#FFCCD5] border-2 border-black rounded-lg text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] rotate-[-2deg] select-none">
              <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>COMMITTEE DOSSIER #007</span>
            </div>

            {/* Yellow Sticker */}
            <div className="inline-flex items-center space-x-1 px-3 py-1 bg-[#FEF08A] border-2 border-black rounded-lg text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] rotate-[1.5deg] select-none">
              <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
              <span>7 HOSTILE AGENTS</span>
            </div>

            {hasKey && (
              <div className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 bg-[#DDF282] border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000] select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>API KEY ACTIVE</span>
              </div>
            )}
          </div>

          {/* Folder Main Body */}
          <div className="bg-[#F3EBE1] border-2 border-black rounded-3xl p-6 sm:p-10 lg:p-12 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Left Column: Headline & Action Buttons */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-block text-xs font-black tracking-widest text-slate-700 uppercase bg-white/80 border border-black/40 px-2.5 py-0.5 rounded-md">
                  hi, candidate!
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-[1.04] tracking-tight">
                  we are hostile <br />
                  <span className="relative inline-block">
                    hiring committee.
                    <span className="absolute left-0 bottom-1.5 w-full h-3 bg-[#FEF08A] -z-10 -rotate-1 rounded-sm opacity-80" />
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium max-w-xl">
                  7 out of 10 resumes get rejected in 6 seconds by skeptical screeners and automated ATS bots. 
                  Our <strong>7 adversarial AI agents</strong> simulate the most hostile hiring committee on Earth—ruthlessly finding every inflated metric, formatting error, and ungrounded claim before recruiters do.
                </p>

                {/* Action Buttons Row */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={onNavigateToProject}
                    className="inline-flex items-center space-x-2.5 px-6 py-3.5 bg-black hover:bg-slate-800 text-white font-black text-sm rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all"
                  >
                    <span>Launch Agent Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onNavigateToApiKey}
                    className="inline-flex items-center space-x-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-black font-black text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
                  >
                    <Key className="w-4 h-4 text-slate-700" />
                    <span>Submit Your API Key</span>
                  </button>
                </div>

                <div className="flex items-center space-x-4 pt-1 text-xs font-semibold text-slate-600">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Free & Open Source</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Zero Hallucination Gate</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Interactive Dossier Mockup (Image 1 style) */}
              <div className="lg:col-span-5 relative">
                <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] relative rotate-[1deg]">
                  {/* Top Bar of Window */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#FFCCD5] border border-black" />
                      <span className="w-3 h-3 rounded-full bg-[#FEF08A] border border-black" />
                      <span className="w-3 h-3 rounded-full bg-[#DDF282] border border-black" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                      LIVE AUDIT SIMULATION
                    </span>
                  </div>

                  {/* Rejection Badge */}
                  <div className="mb-3.5 p-3 rounded-xl bg-[#FFCCD5]/60 border-2 border-black flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider">
                        Initial Verdict
                      </span>
                      <div className="text-lg font-black text-rose-950">
                        REJECTED • 42/100
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-black uppercase tracking-wider">
                      7 RED FLAGS
                    </span>
                  </div>

                  {/* Red Flags Clustered */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#FAF6F0] border border-black/80 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-black block">Metric Authenticity:</span>
                        <span className="text-slate-700 text-[11px]">
                          &quot;Scaled revenue 400%&quot; lacks baseline data or proof.
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF6F0] border border-black/80 flex items-start space-x-2">
                      <UserCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-black block">Ownership Inflation:</span>
                        <span className="text-slate-700 text-[11px]">
                          &quot;Architected system&quot; conflicts with junior tenure.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Green Provenance Stamp */}
                  <div className="mt-4 p-2.5 rounded-xl bg-[#DDF282] border-2 border-black flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-black" />
                      <span className="text-xs font-black text-black">
                        RELEASE GATE PASS: 94/100
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-800">
                      Zero Hallucination
                    </span>
                  </div>
                </div>

                {/* Decorative floating retro badge */}
                <div className="absolute -bottom-4 -left-4 bg-[#C9B7F5] border-2 border-black rounded-xl px-3 py-1.5 shadow-[3px_3px_0px_0px_#000] rotate-[-6deg] hidden sm:flex items-center space-x-1.5 select-none">
                  <Star className="w-3.5 h-3.5 text-black fill-black" />
                  <span className="text-[11px] font-black text-black">
                    ATS-PROVEN
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SERVICES WE OFFER: THE 7 AGENTS COMMITTEE BREAKDOWN      */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-3 border-b-2 border-black gap-3">
            <div>
              <div className="inline-block px-3 py-0.5 rounded-md bg-[#FEF08A] border border-black text-[10px] font-black uppercase tracking-wider mb-2">
                EXHAUSTIVE AGENT DOSSIER
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                services we offer
              </h2>
              <p className="text-sm text-slate-700 font-medium mt-1">
                Here is what each of our 7 sequential agents rigorously checks during the audit:
              </p>
            </div>

            <button
              onClick={onNavigateToProject}
              className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-black hover:underline"
            >
              <span>Test All 7 in Application</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Grid (Styled exactly like the 4 cards in Image 1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className={`${agent.bgColor} border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all flex flex-col justify-between`}
              >
                <div>
                  {/* Top Icon Badge & Phase */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                      {agent.icon}
                    </div>
                    <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {agent.phase}
                    </span>
                  </div>

                  {/* Agent Name */}
                  <h3 className={`text-base font-black ${agent.textColor} leading-tight mb-2`}>
                    {agent.name}
                  </h3>

                  {/* Short description */}
                  <p className="text-xs text-slate-800 font-bold mb-3 leading-snug">
                    {agent.shortDesc}
                  </p>

                  {/* Detailed role */}
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4">
                    {agent.detailedRole}
                  </p>
                </div>

                {/* Bottom Tags */}
                <div className="pt-3 border-t border-black/20 flex flex-wrap gap-1.5">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/70 border border-black/40 text-[10px] font-bold text-black"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* HOW THE PIPELINE WORKS: 4-STAGE ADVERSARIAL PROCESS      */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="bg-white border-2 border-black rounded-3xl p-7 sm:p-10 shadow-[6px_6px_0px_0px_#000]">
            <div className="max-w-3xl mb-8">
              <span className="inline-block px-3 py-0.5 rounded-md bg-[#BAE6FD] border border-black text-[10px] font-black uppercase tracking-wider mb-2">
                PIPELINE ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                how the agent application works
              </h2>
              <p className="text-sm text-slate-700 font-medium mt-1">
                The entire system operates as a strict multi-agent state machine with sandboxed memory boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF6F0] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <div className="w-8 h-8 rounded-lg bg-[#FFE2C8] border-2 border-black font-black text-sm flex items-center justify-center mb-3">
                  1
                </div>
                <h4 className="font-black text-black text-sm mb-1">
                  1. Ingestion & Ground Truth
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Upload PDF/DOCX resume + paste target Job Description. The system segments text into clean standard sections and detects competencies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF6F0] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <div className="w-8 h-8 rounded-lg bg-[#DDF282] border-2 border-black font-black text-sm flex items-center justify-center mb-3">
                  2
                </div>
                <h4 className="font-black text-black text-sm mb-1">
                  2. 7 Sequential Probes
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Agents 1 through 7 execute in strict sequence. Each agent receives the candidate text plus prior agent findings, isolating issues without bias.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF6F0] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <div className="w-8 h-8 rounded-lg bg-[#C9B7F5] border-2 border-black font-black text-sm flex items-center justify-center mb-3">
                  3
                </div>
                <h4 className="font-black text-black text-sm mb-1">
                  3. Committee Verdict
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Deduplicates findings, groups severity distributions (Critical/High/Medium), and calculates weighted scores to issue PASS, WARN, or REJECT.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF6F0] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <div className="w-8 h-8 rounded-lg bg-[#A7F3D0] border-2 border-black font-black text-sm flex items-center justify-center mb-3">
                  4
                </div>
                <h4 className="font-black text-black text-sm mb-1">
                  4. Gated Rewrite Export
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  The Rewriter Agent synthesizes clean bullets. The Verification Gate validates every factual claim against original ground truth before download.
                </p>
              </div>
            </div>

            {/* Quick Link to Launch */}
            <div className="mt-8 pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-700">
                Ready to try it on your own resume? Click below to launch the full application.
              </span>
              <button
                onClick={onNavigateToProject}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-black text-white font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-slate-800 transition-all"
              >
                <span>Launch Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* WHY IT BEATS ORDINARY CHECKERS (Retro Comparison)        */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="bg-[#FAF0E6] border-2 border-black rounded-3xl p-7 sm:p-10 shadow-[6px_6px_0px_0px_#000]">
            <h3 className="text-2xl font-black text-black mb-2">
              Why this beats ordinary resume checkers
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mb-6">
              Compare shallow keyword matchers with our multi-agent adversarial simulation:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-black font-black">
                    <th className="py-2.5 px-3">Feature</th>
                    <th className="py-2.5 px-3 bg-rose-100/60 text-rose-900 border-x-2 border-black">
                      Generic ATS Checkers
                    </th>
                    <th className="py-2.5 px-3 bg-[#DDF282]/70 text-lime-950">
                      Our Adversarial Multi-Agent Platform
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/20">
                  <tr>
                    <td className="py-3 px-3 font-bold text-black">Evaluation Depth</td>
                    <td className="py-3 px-3 text-slate-700 border-x-2 border-black">
                      Simple keyword frequency counting
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-900">
                      7 distinct specialized evaluators with adversarial memory
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-black">Hallucination Risk</td>
                    <td className="py-3 px-3 text-slate-700 border-x-2 border-black">
                      High: Rewriters make up fake metrics & company names
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-900">
                      Zero: Mathematical provenance release gate prevents made-up facts
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-black">Metric Verification</td>
                    <td className="py-3 px-3 text-slate-700 border-x-2 border-black">
                      Blindly accepts any &quot;+300%&quot; stat
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-900">
                      Audits baseline consistency, scope, and plausibility
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-black">Model Flexibility (BYOK)</td>
                    <td className="py-3 px-3 text-slate-700 border-x-2 border-black">
                      Locked to paid subscriptions
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-900">
                      Bring Your Own Key: Google Gemini, OpenAI, or 100% offline Ollama
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* BOTTOM CALL TO ACTION                                    */}
        {/* ======================================================== */}
        <div className="bg-[#FFE2C8] border-2 border-black rounded-3xl p-8 sm:p-12 text-center shadow-[6px_6px_0px_0px_#000] relative">
          <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-3">
            Stop guessing. Put your resume through the committee.
          </h2>
          <p className="text-sm text-slate-800 font-semibold max-w-xl mx-auto mb-6">
            Get an unsparing score breakdown from all 7 hiring agents and generate a verified, ATS-proof resume in seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToProject}
              className="px-7 py-3.5 bg-black hover:bg-slate-800 text-white font-black text-sm rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all inline-flex items-center space-x-2"
            >
              <span>Audit Resume Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToApiKey}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-black font-black text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all inline-flex items-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Configure API Key</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
