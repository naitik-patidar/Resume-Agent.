# Legal Center & Compliance Policies
**AI Multi-Agent Resume Rejection & Truthful Improvement Platform**  
*Last Updated: November 14, 2026*

This document provides the complete, authoritative legal framework for the AI Multi-Agent Resume Rejection & Truthful Improvement Platform ("Platform", "we", "us", or "our"), including our **Terms and Conditions**, **Privacy Policy (GDPR / CCPA / CPRA compliant)**, **User Permission & Candidate Data Consent Agreement**, **Cookie & Local Storage Policy**, and **AI Ethics & Fair Hiring Transparency Disclosure**.

---

## Table of Contents
1. [Terms and Conditions (Terms of Service)](#1-terms-and-conditions-terms-of-service)
2. [Privacy Policy (Global GDPR & CCPA/CPRA Standards)](#2-privacy-policy-global-gdpr--ccpacpra-standards)
3. [User Permissions & Candidate Data Consent Agreement](#3-user-permissions--candidate-data-consent-agreement)
4. [Cookie & Local Storage Policy](#4-cookie--local-storage-policy)
5. [AI Ethics, Transparency & Fair Hiring Disclosure](#5-ai-ethics-transparency--fair-hiring-disclosure)
6. [Contact & Legal Inquiries](#6-contact--legal-inquiries)

---

## 1. Terms and Conditions (Terms of Service)

### 1.1 Acceptance of Terms
By accessing, browsing, interacting with, or submitting data to the AI Multi-Agent Resume Rejection & Truthful Improvement Platform (the "Service"), you ("User", "Candidate", or "You") acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions ("Terms"), as well as our Privacy Policy and User Permission agreements. If you do not agree to these Terms, you must discontinue use of the Service immediately.

### 1.2 Eligibility and Age Requirements
The Service is intended solely for individuals who are at least eighteen (18) years of age or the age of legal majority in their jurisdiction. By using this Service, you represent and warrant that you possess the legal capacity to enter into these binding Terms.

### 1.3 Nature of the Service: Adversarial Simulation
The Service operates an automated, sequential multi-agent artificial intelligence simulation designed to critique, audit, and improve professional resumes. You expressly understand and agree that:
1. **Adversarial Critique**: The evaluation agents (e.g., ATS Screener, 6-Second Glance Recruiter, Technical Lead, Experience Scrutinizer, Formatting Auditor, Credibility Investigator, and Job Match Specialist) are engineered to adopt an adversarial, gatekeeper stance. Objections, rejection reasons, and severity scores are generated to stress-test your application materials against hostile hiring criteria.
2. **Educational & Preparation Purposes Only**: The critiques, scores, and rewritten resume outputs are for your self-assessment, interview preparation, and personal resume enhancement only.
3. **No Employment Guarantee**: We are NOT a staffing agency, employment agency, headhunter, or employer. Use of this Platform does NOT guarantee job placement, interview callbacks, hiring offers, or that any specific Applicant Tracking System (ATS) or human recruiter will advance your application.

### 1.4 User Intellectual Property and Content Ownership
1. **Your Data Remains Yours**: You retain 100% full ownership, copyright, and title to all resume documents, work histories, employment dates, credentials, and personal data that you upload, paste, or transmit to the Platform ("User Content").
2. **Generated Output Ownership**: You own all rights to the refined resume text, diff suggestions, and final exported documents (DOCX/PDF) generated specifically for your profile.
3. **Platform License**: You grant the Platform a worldwide, non-exclusive, royalty-free, limited license solely to parse, analyze, evaluate, and process your User Content for the sole duration of your active analysis session. We do not claim ownership of your career history.

### 1.5 Strict Truthfulness & Anti-Hallucination Invariant
The platform enforces a strict anti-hallucination release gate (CON-005). The system is programmatically constrained from fabricating metrics, unearned degrees, or fictitious employment history. By using the platform, you agree that:
1. You are solely responsible for the authenticity and factual truth of all background experience you submit.
2. You will not rely on automated rewriters to misrepresent your actual qualifications to employers.
3. You will review all generated placeholders (`[CANDIDATE_INPUT: ...]`) to input genuine, verifiable figures before distributing your resume to prospective employers.

### 1.6 Acceptable Use & Prohibited Conduct
You agree not to use the Service to:
1. Submit resumes, files, or information belonging to another person without their express written authorization;
2. Upload any document containing malicious code, viruses, corrupted files, trojans, or automated scripts;
3. Submit classified materials, military secrets, confidential non-disclosure agreement (NDA) protected trade secrets, or unauthorized proprietary information;
4. Attempt prompt injection, jailbreaking, reverse-engineering of backend orchestration heuristics, or unauthorized circumvention of security gates;
5. Launch automated scraping, denial of service (DoS), or excessive bot requests against the API endpoints;
6. Misrepresent employment qualifications for unlawful or fraudulent purposes.

### 1.7 Bring Your Own Key (BYOK) & Third-Party AI APIs
The Platform provides support for third-party Large Language Model providers, including Google Gemini and local Ollama inference:
1. When you supply your own API key ("BYOK"), your key is stored locally in your browser's `localStorage` and transmitted to the API endpoint for authentication.
2. You are solely responsible for compliance with the terms of service, billing policies, and rate limits established by your third-party provider (e.g., Google Cloud, OpenAI).
3. The Platform is not liable for costs incurred, quotas exceeded, or service disruptions caused by third-party AI provider downtime.

### 1.8 Disclaimer of Warranties
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. WE EXPRESSLY DISCLAIM ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR FREE OF HALLUCINATIONS.

### 1.9 Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE PLATFORM, ITS DEVELOPERS, CONTRIBUTORS, LICENSORS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF EMPLOYMENT OPPORTUNITIES, LOSS OF INCOME, LOSS OF DATA, REPUTATIONAL DAMAGE, OR SYSTEM OUTAGES, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

### 1.10 Governing Law and Dispute Resolution
These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to conflict of law principles. Any dispute arising under or relating to these Terms shall be resolved through good-faith negotiation, and if unresolved, through binding arbitration or competent courts in accordance with applicable rules.

---

## 2. Privacy Policy (Global GDPR & CCPA/CPRA Standards)

### 2.1 Overview & Scope
We take your privacy seriously. Because resumes contain sensitive biographical, educational, and employment information, our privacy architecture is built on the principles of **Data Minimization**, **User Autonomy**, **Ephemeral Storage**, and **Zero Model Training**.

### 2.2 Data We Collect
We collect and process the following categories of information:
1. **Candidate Resume Data**: Candidate full name, email address, telephone number, physical location/address, educational qualifications, employment history, job titles, duties, accomplishments, skills, and certifications uploaded via PDF/DOCX or pasted directly.
2. **Target Job Description Data**: Text of target job postings, job requirements, and company profiles submitted for keyword and alignment analysis.
3. **BYOK API Credentials & Preferences**: Your chosen AI provider (Google Gemini or Ollama), custom model names, base URLs, and your API keys. **Crucially, your API keys are stored solely inside your browser's `localStorage`** and are never logged, stored in persistent server databases, or broadcasted to unauthorized parties.
4. **Session & Diagnostic Metadata**: Temporary session IDs, document file sizes, MIME types, processing timestamps, and sequential agent execution metrics stored in the local session database.

### 2.3 Legal Bases for Processing (GDPR Article 6)
If you reside within the European Economic Area (EEA), the United Kingdom, or Switzerland, our legal bases for processing your personal data include:
- **Consent (Art. 6(1)(a))**: You provide explicit, unambiguous consent when you upload your resume or paste career details into the input field.
- **Contractual Necessity (Art. 6(1)(b))**: Processing is necessary to perform the requested multi-agent audit and return your rewritten document.
- **Legitimate Interests (Art. 6(1)(f))**: Processing is necessary for defending against automated prompt injection attacks, safeguarding server integrity, and preventing platform abuse.

### 2.4 How We Use Your Data & The "Zero Public AI Training" Guarantee
- **Strictly Operational**: Your data is used exclusively to parse document formatting, execute the 7 adversarial evaluations, calculate objective scores, and compile truthful resume rewrites.
- **NO Public Model Training**: We do NOT sell, rent, monetize, or use your resume content or personal information to train, fine-tune, or calibrate public AI foundation models.
- **Local Ollama Option**: For users desiring 100% data sovereignty, our integration with local Ollama (`gemma4:latest`) allows full offline execution on your own hardware without a single packet of resume text leaving your local computer.

### 2.5 Third-Party AI Sub-Processors
When you select cloud AI inference (e.g., Google Gemini), your resume text and job description are transmitted over encrypted TLS 1.3 connections directly to the respective provider's API. These providers operate under rigorous enterprise data protection standards and data processing agreements:
- **Google Cloud Gemini API**: Processes queries strictly according to Google Cloud Data Protection Addenda.
- **Local Ollama**: Operates on `http://127.0.0.1:11434` on your machine; no external sub-processor is involved.

### 2.6 Data Retention & Ephemeral Storage
- Uploaded candidate documents (PDF/DOCX) are stored in temporary processing directories strictly for the duration of the audit pipeline.
- Session logs stored in the local SQLite database can be purged upon request.
- Client-side settings (such as your API key) reside solely in your browser storage and can be erased instantly via the "Clear Settings" button or browser cache reset.

### 2.7 Your Rights Under GDPR (EEA / UK Users)
Under the General Data Protection Regulation, you possess the following rights:
1. **Right of Access (Art. 15)**: Request a copy of the candidate data processed during your session.
2. **Right to Rectification (Art. 16)**: Correct any inaccurate personal details or employment dates.
3. **Right to Erasure ("Right to be Forgotten", Art. 17)**: Request immediate deletion of your uploaded files and session records.
4. **Right to Restriction of Processing (Art. 18)**: Request suspension of processing under specific circumstances.
5. **Right to Data Portability (Art. 20)**: Download your verified resume in structured DOCX or PDF format.
6. **Right to Withdraw Consent (Art. 7(3))**: Withdraw consent at any time without affecting the lawfulness of prior processing.

### 2.8 Your Rights Under CCPA / CPRA (California Residents)
Under the California Consumer Privacy Act as amended by the California Privacy Rights Act:
1. **Right to Know**: You have the right to know what personal information we collect, use, and disclose.
2. **Right to Delete**: You have the right to request deletion of your personal information.
3. **No Sale or Sharing of Personal Information**: We do NOT sell or share your personal information to third parties, data brokers, or advertisers. We have never sold personal information.
4. **Right to Non-Discrimination**: We will never deny services, charge different prices, or degrade service quality because you exercised your privacy rights.

### 2.9 Security Safeguards
We implement multi-layered administrative, technical, and physical security measures, including:
- **Magic-Byte File Validation**: Enforces strict verification of genuine file headers for PDF and DOCX uploads, preventing arbitrary code execution.
- **Prompt Injection Guardrails**: Sanitizes input strings against instruction overrides, tag escapes, and malicious prompt jailbreaks.
- **Client-Side Key Encryption**: API keys are handled client-side without permanent server storage.

---

## 3. User Permissions & Candidate Data Consent Agreement

### 3.1 Scope of User Permission
By submitting a resume or career description, you grant the Platform the following explicit permissions:
1. **Document Ingestion Permission**: Permission to extract raw plain text, formatting structures, tables, and section hierarchies from your uploaded PDF or DOCX file.
2. **Sequential Multi-Agent Audit Permission**: Permission to feed extracted text sequentially through the 7 evaluators to identify syntax, metric, technical, and credibility vulnerabilities.
3. **LLM Inference Permission**: Permission to transmit prompt-wrapped text to your configured AI inference provider (Google Gemini or local Ollama).
4. **Deterministic Rewriting & Verification Permission**: Permission to generate revised text and execute the mathematical provenance verification gate.

### 3.2 Candidate Representations
You represent and affirm that:
- You are the lawful owner of the resume submitted, or you have explicit authorization from the subject;
- The resume does not violate any third-party confidentiality, copyright, or non-compete agreements;
- The submitted details are accurate to the best of your knowledge.

### 3.3 Revocation of Permission
You may revoke permission at any moment by closing your session, clearing your browser's local storage via the settings tab, or requesting server session purging.

---

## 4. Cookie & Local Storage Policy

### 4.1 Zero Invasive Tracking Cookies
The Platform operates with **ZERO third-party advertising cookies, zero affiliate tracking pixels, and zero cross-site telemetry trackers**.

### 4.2 Essential Browser Local Storage
To provide a smooth, stateless user experience, the Platform utilizes browser `localStorage`:
- **Storage Key**: `ai_resume_user_settings`
- **Purpose**: Retains your selected provider (`gemini` or `ollama`), chosen model name, optional local base URL, and your BYOK API key across page reloads.
- **Location**: Resides exclusively on your local machine and is never transmitted to marketing services.
- **Management**: You can clear this data at any time by clicking "Clear Config & Key" in the **Submit API Key** workplace tab or via your browser's Storage Manager (`F12` -> Application -> Local Storage).

---

## 5. AI Ethics, Transparency & Fair Hiring Disclosure

### 5.1 Compliance with AI Transparency Principles (EU AI Act & US Guidelines)
Modern AI governance frameworks (including the European Union Artificial Intelligence Act and United States EEOC guidance) require algorithmic transparency and fairness. In compliance with these principles:
1. **Not an Automated Employment Decision Tool (AEDT)**: This Platform does NOT make employment selections, does not reject candidates on behalf of employers, and is not deployed by companies to automate hiring. It is exclusively an applicant-side simulation tool.
2. **Human in the Loop**: The user retains complete autonomy to accept, reject, edit, or disregard any feedback, score, or rewrite suggested by the agents.
3. **Anti-Bias Directives**: Our system prompts strictly forbid evaluation based on protected demographic characteristics, including race, gender, national origin, religion, age, sexual orientation, disability status, or veteran status. Evaluations focus strictly on technical depth, metric plausibility, and formatting readability.

---

## 6. Contact & Legal Inquiries

If you have questions regarding these Terms, your personal data, or exercising your privacy rights, please contact the maintainers via the official GitHub repository:
- **Repository**: [https://github.com/naitik-patidar/Resume-Agent..git](https://github.com/naitik-patidar/Resume-Agent..git)
- **Issues & Data Requests**: Open an issue labeled `privacy-request` or `legal-inquiry` in the repository issue tracker.

---
*© 2026 AI Multi-Agent Resume Rejection & Truthful Improvement Platform. All Rights Reserved.*
