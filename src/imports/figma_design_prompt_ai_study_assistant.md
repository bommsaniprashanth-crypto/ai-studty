# Figma Design Prompt — AI Study Assistant (AI Learning OS)

Use this as a single prompt for Figma AI / Figma Make, or as a creative brief for a designer.

---

## 1. Project Context (paste this first)

Design a web application called **"AI Study Assistant"** — an AI-powered Learning Operating System for engineering students (Cybersecurity / CS focus). It unifies four learning tools that are normally scattered across separate apps: PDF study-material analysis, YouTube lecture summarization, AI diagram/image interpretation, and an AI chat tutor — plus a progress dashboard and AI roadmap generator. The tone should feel like a modern **EdTech + productivity SaaS** (think Notion AI × Duolingo × Coursera), not a generic admin panel: warm, focused, motivating, and "smart" without feeling cold or overly corporate.

---

## 2. Design System

- **Style**: Clean, modern SaaS UI. Rounded corners (12–16px), soft shadows, generous whitespace, card-based layout.
- **Color palette**:
  - Primary: deep indigo/violet (#4F46E5 or similar) — for AI/intelligence branding
  - Accent: teal or lime green — for progress, streaks, success states
  - Neutral base: off-white background (#F8F9FC), dark slate text (#1E1E2E)
  - Semantic colors: amber for warnings/deadlines, red for overdue, green for completed
- **Typography**: A geometric sans-serif for headings (e.g., Inter, Manrope, or Sora — bold, confident) paired with a readable body font (Inter/Sarabun). Clear hierarchy: H1 32–40px, H2 24px, body 16px, caption 13px.
- **Iconography**: Line icons (Lucide/Feather style), consistent 1.5px stroke.
- **Components to define in a shared library**: buttons (primary/secondary/ghost), input fields, file-upload dropzone, progress bars/rings, badges/tags, tabs, modals, toast notifications, chat bubbles, quiz/flashcard cards, empty states, loading/skeleton states (important — many actions involve AI "thinking" time).
- **Motion cues to design for**: subtle skeleton loaders and a "typing/generating" indicator (dots or pulsing AI icon) during AI processing, since every module depends on API calls that take a few seconds.

---

## 3. Site Map / Pages to Design

### A. Marketing / Landing Page
- Hero section: headline about consolidating fragmented study tools into one AI OS, subheadline, primary CTA ("Get Started Free"), hero illustration/screenshot mockup.
- "The Problem" section: icons showing scattered tools (YouTube, PDF reader, Anki, chatbot) with a crossed-out/chaotic visual, contrasted with the unified product.
- Feature showcase: 4 cards for the 4 modules, each with icon, short description, and a small UI preview.
- Social proof / stats band (e.g., "modules," "supported formats," "AI models used").
- Footer with simple nav.

### B. Auth Screens
- Sign up / Log in (email + Google/GitHub OAuth buttons)
- Onboarding flow (3 short steps): select course/track (e.g., Cybersecurity, Full Stack, AI Engineering), set weekly study goal, connect first material (upload a PDF or paste a YouTube link) — this should feel like a guided setup wizard with a progress indicator at top.

### C. Dashboard (Home / Command Center)
- Left sidebar navigation: Dashboard, PDF Learning, Image Analyzer, YouTube + Tutor, Roadmap, Progress, Settings.
- Top bar: search, notifications bell, streak counter (flame icon + number), profile avatar.
- Main content:
  - "Continue Learning" card — large, prominent, shows last active topic with a resume button.
  - Study streak + weekly goal progress ring/bar.
  - Upcoming deadlines list (cards with due dates, color-coded urgency).
  - Performance graph (line/area chart) showing progress over time.
  - "AI Recommendations" panel — a card feed of AI-suggested next actions (e.g., "Review Chapter 4 — you scored low on this quiz").
- Design 3 states: empty state (new user, no data yet), populated state, and a state mid-loading (skeletons).

### D. Module 1 — PDF & Document Learning Engine
- Upload screen: drag-and-drop dropzone, supports PDF, shows upload progress + "extracting text" processing state.
- Document workspace (2-pane layout):
  - Left pane: PDF viewer/thumbnail with page navigation.
  - Right pane: tabs for **Summary**, **Flashcards**, **MCQ Quiz**, **Ask AI (chat)**.
- Flashcard component: flip-card interaction, "Anki-style" front/back, progress dots showing card X of Y.
- MCQ quiz component: question card, 4 answer options, immediate feedback (correct/incorrect color), score summary screen at the end.
- "Ask AI" chat panel: citation-aware answers — show small reference chips/footnotes linking back to the page/section of the PDF the answer was grounded in.

### E. Module 2 — AI Image & Diagram Analyzer
- Upload screen: dropzone for images (diagrams, flowcharts, UML, handwritten notes), with example thumbnails showing supported types.
- Analysis results screen (split view):
  - Left: uploaded image with AI-detected regions/labels overlaid (bounding boxes or numbered callouts on diagram components).
  - Right: tabs for **Explanation** (plain-language breakdown by component), **Structured Notes**, **Key Concepts** (highlighted tags), **Quiz** (auto-generated from the diagram).
- This should visually communicate "the AI understood the image" — consider annotation-style UI (like Figma's own comment pins) pointing to parts of the diagram.

### F. Module 3 — YouTube Lecture Analyzer + AI Chat Tutor
- URL input screen: paste-a-link field, video thumbnail preview + duration once fetched.
- Analysis screen (2-pane):
  - Left: embedded video player.
  - Right: tabs for **Timestamped Notes** (clickable timestamps that jump the video), **Topic Summary**, **Quiz**.
- AI Chat Tutor (persistent, accessible from anywhere — consider a floating action button or docked side panel):
  - Chat bubble UI, distinguishing user vs. AI messages.
  - Quick-prompt suggestion chips (e.g., "Explain recursion," "Create a mock exam on networking").
  - Context indicator showing which course/module the tutor is currently scoped to.

### G. AI Roadmap Generator
- Track selection screen: cards for Cybersecurity, Full Stack Development, AI Engineering, etc.
- Generated roadmap view: vertical timeline/journey map with milestones, estimated completion time per stage, and linked resources per node (visually similar to a skill-tree or metro-map style).

### H. Progress & Analytics Page
- Full performance dashboard: charts for study time by subject, quiz accuracy trends, streak calendar (heatmap, GitHub-contributions style), weak-topic breakdown.

### I. Settings / Profile
- Profile info, course/track selection, notification preferences, connected accounts, theme toggle (light/dark).

---

## 4. Responsive & Accessibility Notes
- Design desktop-first (primary use case: studying at a laptop) but include tablet and mobile breakpoints for the Dashboard, Chat Tutor, and Flashcards views at minimum.
- Ensure color contrast meets WCAG AA, especially for quiz correct/incorrect states (don't rely on color alone — add icons/text).

---

## 5. Deliverables to Ask Figma AI For
1. A shared design system / style guide page (colors, type, components).
2. High-fidelity screens for each page listed in Section 3.
3. At least one interactive prototype flow: Landing → Sign up → Onboarding → Dashboard → Upload a PDF → View flashcards.
4. Component variants for loading/empty/error/populated states on the Dashboard and each module's results view.

---

**Tip when pasting into Figma AI**: paste Sections 1–2 first to set style, then paste one page from Section 3 at a time (it generates better results per-screen than all-at-once).
