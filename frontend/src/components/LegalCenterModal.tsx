import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  FileText,
  Lock,
  UserCheck,
  Cookie,
  Cpu,
  Search,
  ExternalLink,
  Printer,
  Check,
  AlertTriangle,
  Scale,
} from 'lucide-react';

export type LegalTab = 'terms' | 'privacy' | 'permissions' | 'cookies' | 'ai-ethics';

interface LegalCenterModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalCenterModal: React.FC<LegalCenterModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Prevent body scrolling while modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '#legal-' + activeTab);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div
        className="bg-[#FAF6F0] border-2 sm:border-3 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 font-sans my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Top Header Bar */}
        <div className="bg-white border-b-2 border-black p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
              <Scale className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="legal-modal-title" className="text-base sm:text-lg font-black text-black">
                  Legal & Regulatory Compliance Center
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#DDF282] border border-black text-[10px] font-black uppercase">
                  Verified Active
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                Terms of Service, GDPR/CCPA Privacy, AI User Permissions & Fair Hiring Disclaimers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              title="Print document"
              className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-slate-200 border-2 border-black text-black text-xs font-bold shadow-[2px_2px_0px_0px_#000] transition-all hidden sm:flex items-center space-x-1"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white hover:bg-[#FFCCD5] border-2 border-black text-black font-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              aria-label="Close legal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="bg-[#FAF6F0] border-b-2 border-black p-2.5 sm:px-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'terms'
                ? 'bg-[#FFE2C8] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-slate-700 hover:text-black border border-black/40 hover:border-black'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-slate-700 hover:text-black border border-black/40 hover:border-black'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy (GDPR / CCPA)</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'permissions'
                ? 'bg-[#DDF282] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-slate-700 hover:text-black border border-black/40 hover:border-black'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>User Permissions & Consent</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'cookies'
                ? 'bg-[#BAE6FD] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-slate-700 hover:text-black border border-black/40 hover:border-black'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookies & Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-ethics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'ai-ethics'
                ? 'bg-[#FFCCD5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-slate-700 hover:text-black border border-black/40 hover:border-black'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Ethics & Transparency</span>
          </button>
        </div>

        {/* Search bar inside modal */}
        <div className="bg-white/70 border-b border-black/20 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter topics (e.g., liability, GDPR, Ollama, retention)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-black placeholder-slate-400 focus:outline-none w-full font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-black text-[11px] font-bold"
              >
                Clear
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
            Last Updated: Nov 14, 2026
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-800 leading-relaxed max-h-[60vh] bg-white">
          {/* TAB 1: TERMS AND CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#FFE2C8] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <h3 className="text-base font-black text-amber-950 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-black" />
                  <span>Terms and Conditions of Use</span>
                </h3>
                <p className="text-xs text-amber-900 mt-1 font-medium">
                  Please read these Terms carefully before utilizing the multi-agent resume simulation and rewrite platform.
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  1. Acceptance of Terms & Legal Eligibility
                </h4>
                <p>
                  By uploading a resume document, submitting raw experience text, or configuring API parameters on this platform, you agree to be bound by these Terms of Service and all applicable local, national, and international laws. You affirm that you are at least eighteen (18) years of age or the age of majority in your jurisdiction.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  2. Adversarial Simulation & No Guarantee of Employment
                </h4>
                <p>
                  The platform simulates an intentionally adversarial hiring committee consisting of seven automated agents (ATS Compatibility Specialist, 6-Second Glance Recruiter, Technical Lead, Experience Scrutinizer, Formatting Auditor, Credibility Investigator, and Job Match Specialist).
                </p>
                <div className="p-3 bg-[#FEF08A]/70 border border-black rounded-xl text-xs font-semibold space-y-1">
                  <div className="flex items-center space-x-1.5 font-black text-black">
                    <AlertTriangle className="w-3.5 h-3.5 text-black" />
                    <span>CRITICAL LEGAL DISCLAIMER:</span>
                  </div>
                  <p className="text-slate-800">
                    This platform is an independent career preparation and educational simulation tool. It is <strong>NOT</strong> an employment agency, headhunter, staffing firm, or official hiring body. Use of this service does <strong>NOT</strong> guarantee job interviews, placement, employment offers, or approval by any specific corporate Applicant Tracking System (ATS).
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  3. User Content Ownership & Intellectual Property
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>You Own Your Data:</strong> You retain complete, unencumbered ownership, copyright, and moral rights over your resume, career history, and credentials.
                  </li>
                  <li>
                    <strong>Ownership of Generated Rewrites:</strong> You own all output text and export documents (PDF/DOCX) created by the platform for your application.
                  </li>
                  <li>
                    <strong>Platform Intellectual Property:</strong> The platform design, system prompts, verification heuristics, and codebase are protected under international copyright, trademark, and proprietary software laws.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  4. Factual Verification Policy & Candidate Responsibility
                </h4>
                <p>
                  The platform implements a deterministic Factual Verification Release Gate (CON-005) designed to prevent ungrounded AI fabrications. However, you acknowledge that:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>You are solely responsible for verifying that every statement on your final exported resume is factually accurate and truthful.</li>
                  <li>You must review and replace all structured placeholders (e.g., <code>[CANDIDATE_INPUT: ...]</code>) with genuine, verifiable achievements before presenting them to employers.</li>
                  <li>The platform expressly disclaims any liability resulting from resume misrepresentations submitted by candidates to prospective employers.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  5. Acceptable Use Policy
                </h4>
                <p>You agree not to:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Upload files containing malicious software, scripts, or corrupted structures;</li>
                  <li>Submit confidential employer trade secrets or classified government materials;</li>
                  <li>Attempt prompt injection, system overrides, model jailbreaks, or reverse-engineering of security gates;</li>
                  <li>Use automated bots or scrapers to overload or degrade server performance.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  6. Limitation of Liability
                </h4>
                <p className="text-xs text-slate-700 uppercase font-medium">
                  To the fullest extent permitted under law, in no event shall the platform creators, contributors, or operators be liable for any direct, indirect, incidental, consequential, special, or exemplary damages, including loss of career opportunity, wages, data, or reputation, arising from the use or inability to use the service.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#C9B7F5] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <h3 className="text-base font-black text-purple-950 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-black" />
                  <span>Global Privacy Policy (GDPR & CCPA/CPRA Compliant)</span>
                </h3>
                <p className="text-xs text-purple-900 mt-1 font-medium">
                  Engineered with Data Minimization, Ephemeral Processing, and Zero Public AI Training.
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  1. Information We Collect & Legal Bases
                </h4>
                <p>
                  Under Article 6 of the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), we process personal information strictly based on <strong>Explicit Consent</strong> and <strong>Service Necessity</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF6F0] border-2 border-black rounded-xl">
                    <span className="font-black text-black block mb-1">Uploaded Resume Content</span>
                    <span className="text-slate-600">
                      Biographical details, career history, education, and skills provided in PDF/DOCX or pasted text.
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF6F0] border-2 border-black rounded-xl">
                    <span className="font-black text-black block mb-1">BYOK API Credentials</span>
                    <span className="text-slate-600">
                      Saved <strong>only in your browser&apos;s localStorage</strong>. Never transmitted to our backend database.
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  2. Zero Public AI Training Guarantee
                </h4>
                <div className="p-3.5 bg-[#DDF282] border-2 border-black rounded-xl text-xs font-bold text-lime-950 flex items-start space-x-2.5">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 text-black mt-0.5" />
                  <div>
                    <span>OUR PLEDGE: Your resume is NEVER used to train public AI foundation models.</span>
                    <p className="text-[11px] font-normal text-lime-900 mt-1">
                      Whether using Google Gemini API or local Ollama inference, queries are dispatched for immediate inference under enterprise privacy covenants and discarded without retention for model fine-tuning.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  3. Third-Party Sub-processors & 100% Offline Ollama Option
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>Google Gemini API:</strong> Data sent over TLS 1.3 encryption directly to Google Cloud under Google Enterprise privacy safeguards.
                  </li>
                  <li>
                    <strong>Local Ollama (Offline):</strong> For zero external transmission, users can select local Ollama (<code>gemma4:latest</code>). All inference remains 100% on your own device.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  4. Your Rights under GDPR & CCPA/CPRA
                </h4>
                <p className="text-xs">You have enforceable rights regarding your personal information:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-black rounded-lg">
                    <span className="font-black block text-black">Right to Erasure</span>
                    <span className="text-slate-600 text-[11px]">Request immediate purging of session data and uploaded documents.</span>
                  </div>
                  <div className="p-2.5 bg-white border border-black rounded-lg">
                    <span className="font-black block text-black">Right to Portability</span>
                    <span className="text-slate-600 text-[11px]">Download your verified resume in open DOCX and PDF formats.</span>
                  </div>
                  <div className="p-2.5 bg-white border border-black rounded-lg">
                    <span className="font-black block text-black">No Sale of Data</span>
                    <span className="text-slate-600 text-[11px]">We never sell, rent, or share personal information with data brokers.</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: USER PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#DDF282] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <h3 className="text-base font-black text-lime-950 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-black" />
                  <span>Candidate Permission & Data Processing Consent</span>
                </h3>
                <p className="text-xs text-lime-900 mt-1 font-medium">
                  Clear, transparent authorization granted by the candidate prior to automated audit.
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  Scope of Permission Granted
                </h4>
                <p>By proceeding with resume analysis, you provide explicit affirmative consent to:</p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2.5 p-3 bg-[#FAF6F0] border-2 border-black rounded-xl">
                    <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-black block">Document Ingestion & Text Parsing:</span>
                      <span className="text-slate-700 text-xs">
                        Authorize automated linear extraction of text, headers, and section hierarchies from uploaded PDF or DOCX files.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 bg-[#FAF6F0] border-2 border-black rounded-xl">
                    <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-black block">Sequential 7-Agent Auditing:</span>
                      <span className="text-slate-700 text-xs">
                        Authorize adversarial screening algorithms to flag potential discrepancies, ambiguous attributions, and weak metric claims.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 bg-[#FAF6F0] border-2 border-black rounded-xl">
                    <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-black block">LLM Prompt Transmission:</span>
                      <span className="text-slate-700 text-xs">
                        Authorize transmitting sanitized resume excerpts to your configured AI inference engine (Google Gemini or local Ollama).
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 bg-[#FAF6F0] border-2 border-black rounded-xl">
                    <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-black block">Client-Side Local Storage:</span>
                      <span className="text-slate-700 text-xs">
                        Authorize saving your selected AI provider and API keys directly in your browser&apos;s localStorage for session continuity.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  Revocation of Consent
                </h4>
                <p className="text-xs text-slate-700">
                  Consent can be revoked at any moment. You can clear your API key from local storage via the &quot;Submit API Key&quot; screen or purge temporary session data by clearing your browser cache.
                </p>
              </section>
            </div>
          )}

          {/* TAB 4: COOKIES & LOCAL STORAGE */}
          {activeTab === 'cookies' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#BAE6FD] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <h3 className="text-base font-black text-sky-950 flex items-center space-x-2">
                  <Cookie className="w-4 h-4 text-black" />
                  <span>Cookie & Local Storage Policy</span>
                </h3>
                <p className="text-xs text-sky-900 mt-1 font-medium">
                  Total transparency: Zero invasive cookies, essential local browser preferences only.
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  1. Zero Third-Party Advertising Cookies
                </h4>
                <p className="text-xs sm:text-sm">
                  We do not use tracking cookies, Google Analytics, Facebook Pixels, or cross-site advertising beacons. You will never be tracked across the web by this platform.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  2. Essential Local Storage Usage
                </h4>
                <p className="text-xs">
                  We utilize your browser&apos;s standard <code>localStorage</code> mechanism strictly for functional utility:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-2 border-black rounded-xl">
                    <thead className="bg-[#FAF6F0] border-b-2 border-black font-black text-black">
                      <tr>
                        <th className="p-2 border-r border-black">Key</th>
                        <th className="p-2 border-r border-black">Category</th>
                        <th className="p-2 border-r border-black">Purpose</th>
                        <th className="p-2">Lifespan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/20">
                      <tr>
                        <td className="p-2 font-mono font-bold border-r border-black">ai_resume_user_settings</td>
                        <td className="p-2 border-r border-black">Functional</td>
                        <td className="p-2 border-r border-black">Remembers your chosen AI provider, model, and BYOK API key</td>
                        <td className="p-2">Persistent until cleared by you</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  3. How to Clear Stored Data
                </h4>
                <p className="text-xs text-slate-700">
                  To remove all stored keys and preferences instantly, click the <strong>&quot;Clear Config & Key&quot;</strong> button in the Submit API Key tab, or clear site data in your browser settings (Chrome/Edge/Firefox/Safari: Developer Tools &rarr; Application &rarr; Clear Storage).
                </p>
              </section>
            </div>
          )}

          {/* TAB 5: AI ETHICS & FAIR HIRING */}
          {activeTab === 'ai-ethics' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#FFCCD5] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <h3 className="text-base font-black text-rose-950 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-black" />
                  <span>AI Ethics, Transparency & Fair Hiring Notice</span>
                </h3>
                <p className="text-xs text-rose-900 mt-1 font-medium">
                  Commitment to algorithmic fairness, non-discrimination, and human autonomy.
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  1. Non-Employment Decision Tool Disclosure
                </h4>
                <p>
                  In compliance with algorithmic transparency mandates (such as the European Union AI Act and NYC Local Law 144):
                </p>
                <div className="p-3 bg-white border-2 border-black rounded-xl text-xs space-y-1.5 font-medium">
                  <p>
                    • This platform is an <strong>applicant-side advisory tool</strong>, not an employer-deployed Automated Employment Decision Tool (AEDT).
                  </p>
                  <p>
                    • The platform does not rank, select, or reject candidates for actual employment openings.
                  </p>
                  <p>
                    • Evaluations are solely for the applicant&apos;s private guidance to identify areas of improvement before applying.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  2. Demographic Neutrality & Anti-Bias Principles
                </h4>
                <p className="text-xs sm:text-sm">
                  Evaluation prompts explicitly instruct the AI agents to judge solely upon demonstrable technical rigor, metric validity, and typographical scannability. The agents are barred from factoring in protected classes under Title VII and global equality statutes, including race, gender, nationality, age, religion, sexual orientation, disability status, or geographic location.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wider border-b border-black/20 pb-1">
                  3. Human-in-the-Loop Supremacy
                </h4>
                <p className="text-xs text-slate-700">
                  You are in complete control of your career documents. Every recommendation, score, and rewrite provided by our multi-agent committee is purely suggestive. You decide which suggestions to accept, modify, or reject.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="bg-[#FAF6F0] border-t-2 border-black p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>GDPR, CCPA & EU AI Act Aligned Framework</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] transition-all flex items-center justify-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Reference'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center space-x-1.5"
            >
              <span>I Understand & Agree</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
