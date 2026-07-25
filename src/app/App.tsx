import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, FileText, Image, Youtube, Map, BarChart2, Settings,
  Sparkles, Brain, Flame, Bell, Search, ChevronRight, Upload, X, Plus,
  Play, Pause, SkipForward, Clock, CheckCircle, AlertCircle, BookOpen,
  Code, Shield, Cpu, Zap, Star, Trophy, Target, TrendingUp, ArrowRight,
  MessageSquare, Send, Mic, ThumbsUp, ThumbsDown, RotateCcw, ChevronLeft,
  ChevronDown, ChevronUp, Layers, Globe, Lock, Mail, Github, Chrome,
  User, LogOut, Moon, Sun, Volume2, Bookmark, Share2, Download, Eye,
  Check, RefreshCw, Hash, AlertTriangle, Info, Lightbulb, GraduationCap,
  PanelLeft, Menu, ExternalLink, Copy, Wand2, Loader2, WifiOff, Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ─── API SERVICE ──────────────────────────────────────────────────────────────
const API_BASE = `https://${projectId}.supabase.co/functions/v1/server/make-server-32a97fea`;

async function apiFetch<T = any>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const isFormData = options?.body instanceof FormData;
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${publicAnonKey}`,
        ...(options?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { data: null, error: err.error ?? res.statusText };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (e: any) {
    // Network error or server not reachable — frontend falls back to mock data
    console.warn('[API] Request failed, using mock data:', path, e.message);
    return { data: null, error: e.message };
  }
}

// Typed API helpers
const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (name: string, email: string, password: string) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  // User
  getUser: (userId: string) => apiFetch(`/user/${userId}`),
  updateUser: (userId: string, updates: Record<string, any>) =>
    apiFetch(`/user/${userId}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Progress
  getProgress: (userId: string) => apiFetch(`/progress/${userId}`),
  logActivity: (userId: string, data: Record<string, any>) =>
    apiFetch(`/progress/${userId}/activity`, { method: 'POST', body: JSON.stringify(data) }),

  // Goals
  getGoals: (userId: string) => apiFetch(`/goals/${userId}`),
  addGoal: (userId: string, goal: Record<string, any>) =>
    apiFetch(`/goals/${userId}`, { method: 'POST', body: JSON.stringify(goal) }),
  updateGoal: (userId: string, goalId: string, updates: Record<string, any>) =>
    apiFetch(`/goals/${userId}/${goalId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteGoal: (userId: string, goalId: string) =>
    apiFetch(`/goals/${userId}/${goalId}`, { method: 'DELETE' }),

  // PDF Module
  uploadPDF: (formData: FormData) =>
    apiFetch('/pdf/upload', { method: 'POST', body: formData, headers: {} }),
  getPDFStatus: (docId: string) => apiFetch(`/pdf/${docId}/status`),
  getPDFSummary: (docId: string) => apiFetch(`/pdf/${docId}/summary`),
  getPDFFlashcards: (docId: string) => apiFetch(`/pdf/${docId}/flashcards`),
  getPDFQuiz: (docId: string, count = 5) => apiFetch(`/pdf/${docId}/quiz?count=${count}`),
  getPDFInterviewQs: (docId: string) => apiFetch(`/pdf/${docId}/interview-questions`),
  chatWithPDF: (docId: string, message: string, history: any[]) =>
    apiFetch(`/pdf/${docId}/chat`, { method: 'POST', body: JSON.stringify({ message, history }) }),

  // Image Module
  analyzeImage: (formData: FormData) =>
    apiFetch('/image/analyze', { method: 'POST', body: formData, headers: {} }),
  getImageAnalysis: (analysisId: string) => apiFetch(`/image/${analysisId}`),

  // YouTube Module
  analyzeYouTube: (url: string) =>
    apiFetch('/youtube/analyze', { method: 'POST', body: JSON.stringify({ url }) }),
  getYouTubeAnalysis: (videoId: string) => apiFetch(`/youtube/${videoId}`),
  chatYouTube: (videoId: string, message: string, history: any[]) =>
    apiFetch(`/youtube/${videoId}/chat`, { method: 'POST', body: JSON.stringify({ message, history }) }),

  // AI Tutor
  tutorChat: (userId: string, message: string, context: string, history: any[]) =>
    apiFetch('/tutor/chat', { method: 'POST', body: JSON.stringify({ userId, message, context, history }) }),
  getTutorHistory: (userId: string) => apiFetch(`/tutor/history/${userId}`),

  // Roadmap
  getRoadmap: (userId: string) => apiFetch(`/roadmap/${userId}`),
  updateMilestone: (userId: string, milestoneId: string, status: string) =>
    apiFetch(`/roadmap/${userId}/milestone/${milestoneId}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Page = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'pdf' | 'image' | 'youtube' | 'roadmap' | 'progress' | 'settings';
type AuthView = 'login' | 'signup';
type OnboardingStep = 1 | 2 | 3;
type Theme = 'dark' | 'light';
type Track = 'cybersecurity' | 'fullstack' | 'ai-engineering' | 'data-science' | 'cloud';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: Date;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TimestampNote {
  time: string;
  seconds: number;
  topic: string;
  note: string;
}

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  resources: string[];
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

interface UserProfile {
  name: string;
  email: string;
  track: Track;
  weeklyGoalHours: number;
  avatar: string;
  joinedAt: Date;
  streak: number;
  totalStudyHours: number;
  xp: number;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_SUMMARY = `## Network Security Fundamentals — Chapter Summary

### Key Concepts
This chapter covers the foundational principles of network security including the **CIA Triad** (Confidentiality, Integrity, Availability), threat modeling, and defense-in-depth strategies.

### Core Takeaways
1. **Threat Vectors** — Attackers exploit vulnerabilities in software, configurations, or human behavior
2. **Cryptography Basics** — Symmetric vs asymmetric encryption, hash functions (SHA-256, MD5)
3. **Firewalls & IDS/IPS** — Stateful packet inspection, signature-based vs anomaly-based detection
4. **Zero Trust Architecture** — "Never trust, always verify" — treat every request as potentially hostile
5. **Incident Response** — Preparation → Detection → Containment → Eradication → Recovery → Lessons

### Important Definitions
- **Vulnerability**: A weakness that can be exploited
- **Exploit**: Code or technique that takes advantage of a vulnerability
- **Patch Management**: Process of applying updates to reduce attack surface`;

const MOCK_FLASHCARDS: Flashcard[] = [
  { id: '1', front: 'What does CIA stand for in cybersecurity?', back: 'Confidentiality, Integrity, and Availability — the three core principles of information security.' },
  { id: '2', front: 'What is a Man-in-the-Middle (MitM) attack?', back: 'An attack where the adversary secretly intercepts and potentially alters communication between two parties who believe they are directly communicating.' },
  { id: '3', front: 'Difference between symmetric and asymmetric encryption?', back: 'Symmetric uses the same key for encryption and decryption (AES). Asymmetric uses a key pair — public for encryption, private for decryption (RSA, ECC).' },
  { id: '4', front: 'What is SQL Injection?', back: 'A code injection technique where malicious SQL statements are inserted into an input field, allowing attackers to manipulate the backend database.' },
  { id: '5', front: 'Define Zero Trust Architecture', back: 'A security model that requires strict identity verification for every person/device trying to access resources, regardless of whether they are inside or outside the network perimeter.' },
];

const MOCK_QUIZ: MCQQuestion[] = [
  {
    id: '1',
    question: 'Which of the following best describes the "Confidentiality" component of the CIA triad?',
    options: ['Ensuring data is accurate and unmodified', 'Ensuring data is accessible when needed', 'Ensuring data is only accessible to authorized parties', 'Ensuring data is encrypted at all times'],
    correctIndex: 2,
    explanation: 'Confidentiality ensures that sensitive information is only accessible to those with explicit authorization, preventing unauthorized disclosure.',
  },
  {
    id: '2',
    question: 'Which encryption algorithm uses the same key for both encryption and decryption?',
    options: ['RSA', 'AES', 'ECC', 'Diffie-Hellman'],
    correctIndex: 1,
    explanation: 'AES (Advanced Encryption Standard) is a symmetric encryption algorithm — the same secret key is used for both encrypting and decrypting data.',
  },
  {
    id: '3',
    question: 'What is the primary purpose of an Intrusion Detection System (IDS)?',
    options: ['Block malicious traffic', 'Monitor and alert on suspicious activity', 'Encrypt network traffic', 'Authenticate users'],
    correctIndex: 1,
    explanation: 'An IDS monitors network traffic and system activities for signs of attack or policy violations, then generates alerts — unlike an IPS which can actively block threats.',
  },
  {
    id: '4',
    question: 'In Zero Trust Architecture, what is the default access policy?',
    options: ['Trust all internal network traffic', 'Never trust, always verify', 'Allow once authenticated', 'Block all external traffic'],
    correctIndex: 1,
    explanation: 'Zero Trust operates on the principle of "Never trust, always verify" — no user or device is trusted by default, regardless of location.',
  },
  {
    id: '5',
    question: 'Which phase comes immediately AFTER "Detection" in the NIST Incident Response lifecycle?',
    options: ['Recovery', 'Preparation', 'Eradication', 'Containment'],
    correctIndex: 3,
    explanation: 'The NIST IR lifecycle is: Preparation → Detection → Containment → Eradication → Recovery → Post-Incident Activity.',
  },
];

const MOCK_TIMESTAMPS: TimestampNote[] = [
  { time: '0:45', seconds: 45, topic: 'Introduction to Asymmetric Cryptography', note: 'Overview of public/private key infrastructure and how RSA works conceptually.' },
  { time: '3:20', seconds: 200, topic: 'RSA Key Generation', note: 'Key steps: choose two large primes p and q, compute n = p×q, choose e, compute d.' },
  { time: '7:15', seconds: 435, topic: 'Diffie-Hellman Key Exchange', note: 'Both parties agree on prime p and base g (public). Exchange computed values to derive shared secret.' },
  { time: '12:40', seconds: 760, topic: 'Elliptic Curve Cryptography (ECC)', note: 'Same security as RSA with much smaller key sizes. Preferred for mobile/IoT devices.' },
  { time: '18:05', seconds: 1085, topic: 'Digital Signatures', note: 'Hash the message → encrypt with private key → recipient decrypts with public key to verify authenticity.' },
  { time: '24:30', seconds: 1470, topic: 'PKI and Certificate Authorities', note: 'CAs sign certificates binding public keys to identities. Root CA → Intermediate CA → End-entity cert chain.' },
  { time: '31:00', seconds: 1860, topic: 'TLS Handshake Walkthrough', note: 'ClientHello → ServerHello + Cert → Key Exchange → Finished. Session keys derived from handshake.' },
];

const MOCK_VIDEO_SUMMARY = `## Asymmetric Cryptography: From RSA to TLS

This lecture provides a comprehensive walkthrough of public-key cryptography, covering the mathematical foundations and practical applications used in modern secure communications.

### Main Topics Covered
- **RSA Algorithm** — Key generation, encryption/decryption, and security assumptions
- **Diffie-Hellman Exchange** — How two parties establish a shared secret over an insecure channel
- **Elliptic Curve Cryptography** — Modern alternative to RSA with smaller key sizes
- **Digital Signatures** — Proving message authenticity and non-repudiation
- **PKI & TLS** — How certificates chain trust from CAs to websites

### Key Insight
The security of asymmetric cryptography relies on mathematical "trapdoor functions" — problems that are easy to compute in one direction but computationally infeasible to reverse without additional secret information.`;

const ROADMAPS: Record<Track, RoadmapMilestone[]> = {
  cybersecurity: [
    { id: 'c1', title: 'Security Fundamentals', description: 'CIA triad, threat modeling, basic networking', duration: '3 weeks', topics: ['CIA Triad', 'OSI Model', 'TCP/IP', 'Basic Cryptography'], resources: ['CompTIA Security+ Guide', 'TryHackMe: Pre-Security'], status: 'completed' },
    { id: 'c2', title: 'Network Security', description: 'Firewalls, IDS/IPS, VPNs, network attacks', duration: '4 weeks', topics: ['Firewall Rules', 'IDS/IPS', 'VPN Protocols', 'DDoS', 'MitM'], resources: ['Wireshark Docs', 'TryHackMe: Network Fundamentals'], status: 'in-progress' },
    { id: 'c3', title: 'Application Security', description: 'OWASP Top 10, web vulnerabilities, secure SDLC', duration: '5 weeks', topics: ['SQL Injection', 'XSS', 'CSRF', 'SSRF', 'Secure Coding'], resources: ['OWASP Top 10', 'PortSwigger Web Academy'], status: 'available' },
    { id: 'c4', title: 'Penetration Testing', description: 'Ethical hacking methodology, tools, reporting', duration: '6 weeks', topics: ['Kali Linux', 'Nmap', 'Metasploit', 'Burp Suite', 'PTES'], resources: ['HTB Academy', 'Offensive Security PWK'], status: 'locked' },
    { id: 'c5', title: 'Incident Response & Forensics', description: 'IR lifecycle, memory forensics, log analysis', duration: '4 weeks', topics: ['NIST IR Framework', 'Memory Forensics', 'SIEM', 'Chain of Custody'], resources: ['SANS FOR508', 'Splunk SIEM Training'], status: 'locked' },
    { id: 'c6', title: 'Certification & Specialization', description: 'CEH, OSCP, or cloud security path', duration: '8 weeks', topics: ['OSCP Exam Prep', 'Report Writing', 'Bug Bounty', 'Cloud Security'], resources: ['Hack The Box', 'OffSec PEN-200'], status: 'locked' },
  ],
  fullstack: [
    { id: 'f1', title: 'HTML, CSS & JavaScript', description: 'Web fundamentals, DOM, ES6+', duration: '4 weeks', topics: ['Semantic HTML', 'CSS Grid/Flex', 'ES6+', 'DOM APIs'], resources: ['MDN Web Docs', 'The Odin Project'], status: 'completed' },
    { id: 'f2', title: 'React & Frontend Ecosystem', description: 'React, TypeScript, state management', duration: '6 weeks', topics: ['React Hooks', 'TypeScript', 'Redux/Zustand', 'Testing'], resources: ['React Docs', 'Full Stack Open'], status: 'in-progress' },
    { id: 'f3', title: 'Node.js & Backend APIs', description: 'REST APIs, Express, databases', duration: '5 weeks', topics: ['Node.js', 'Express', 'REST Design', 'PostgreSQL', 'MongoDB'], resources: ['Node.js Docs', 'Full Stack Open Part 3'], status: 'available' },
    { id: 'f4', title: 'System Design & Architecture', description: 'Scalability, microservices, caching', duration: '5 weeks', topics: ['Load Balancing', 'Caching', 'Message Queues', 'Microservices'], resources: ['System Design Primer', "Alex Xu's Book"], status: 'locked' },
    { id: 'f5', title: 'DevOps & Deployment', description: 'CI/CD, Docker, cloud platforms', duration: '4 weeks', topics: ['Docker', 'GitHub Actions', 'AWS/GCP Basics', 'Nginx'], resources: ['Docker Docs', 'AWS Free Tier'], status: 'locked' },
    { id: 'f6', title: 'Capstone & Portfolio', description: 'Full-stack projects and job prep', duration: '6 weeks', topics: ['Project Architecture', 'Code Review', 'Portfolio', 'Interviews'], resources: ['Leetcode', 'GitHub Portfolio Guide'], status: 'locked' },
  ],
  'ai-engineering': [
    { id: 'a1', title: 'Python & Math Foundations', description: 'NumPy, Pandas, Linear Algebra, Statistics', duration: '3 weeks', topics: ['Python', 'NumPy/Pandas', 'Linear Algebra', 'Probability'], resources: ['Python Docs', '3Blue1Brown Linear Algebra'], status: 'completed' },
    { id: 'a2', title: 'Machine Learning Core', description: 'Supervised/unsupervised learning, scikit-learn', duration: '5 weeks', topics: ['Regression', 'Classification', 'Clustering', 'SVMs', 'Decision Trees'], resources: ["Andrew Ng's ML Course", 'Hands-On ML Book'], status: 'in-progress' },
    { id: 'a3', title: 'Deep Learning & Neural Networks', description: 'PyTorch, CNNs, RNNs, Transformers', duration: '7 weeks', topics: ['PyTorch', 'CNNs', 'RNNs/LSTMs', 'Attention', 'Transformers'], resources: ['fast.ai', 'Deep Learning Book'], status: 'available' },
    { id: 'a4', title: 'LLMs & Generative AI', description: 'Fine-tuning, RAG, prompt engineering', duration: '5 weeks', topics: ['Prompt Engineering', 'RAG', 'Fine-tuning', 'LangChain', 'Vector DBs'], resources: ['Hugging Face Course', 'LangChain Docs'], status: 'locked' },
    { id: 'a5', title: 'MLOps & Deployment', description: 'Model serving, monitoring, pipelines', duration: '4 weeks', topics: ['MLflow', 'BentoML', 'Model Monitoring', 'Feature Stores'], resources: ['MLOps Community', 'Made With ML'], status: 'locked' },
    { id: 'a6', title: 'Capstone AI Project', description: 'End-to-end production ML system', duration: '6 weeks', topics: ['Project Design', 'Data Collection', 'Training Pipeline', 'API'], resources: ['Papers With Code', 'AI Project Template'], status: 'locked' },
  ],
  'data-science': [
    { id: 'd1', title: 'Data Wrangling', description: 'Pandas, data cleaning, EDA', duration: '3 weeks', topics: ['Pandas', 'Data Cleaning', 'EDA', 'Matplotlib/Seaborn'], resources: ['Kaggle Learn', 'Pandas Docs'], status: 'completed' },
    { id: 'd2', title: 'Statistical Analysis', description: 'Hypothesis testing, regression, A/B testing', duration: '4 weeks', topics: ['Hypothesis Testing', 'Regression', 'A/B Testing', 'Bayesian Stats'], resources: ['StatQuest', 'Think Stats Book'], status: 'in-progress' },
    { id: 'd3', title: 'Machine Learning for DS', description: 'Feature engineering, model selection', duration: '5 weeks', topics: ['Feature Engineering', 'Cross-Validation', 'Ensemble Methods', 'SHAP'], resources: ['Kaggle Competitions', "Aurélien Géron's Book"], status: 'available' },
    { id: 'd4', title: 'SQL & Data Engineering', description: 'Advanced SQL, pipelines, data lakes', duration: '4 weeks', topics: ['Advanced SQL', 'dbt', 'Airflow', 'Spark Basics'], resources: ['Mode SQL Tutorial', 'Data Engineering Zoomcamp'], status: 'locked' },
    { id: 'd5', title: 'Business Intelligence & Visualization', description: 'Dashboards, storytelling with data', duration: '3 weeks', topics: ['Tableau/Power BI', 'Data Storytelling', 'Metrics Design'], resources: ['Storytelling with Data Book', 'Tableau Public'], status: 'locked' },
    { id: 'd6', title: 'DS Portfolio & Specialization', description: 'Kaggle competitions, industry projects', duration: '5 weeks', topics: ['End-to-End Projects', 'Kaggle Gold', 'Portfolio Site', 'DS Interviews'], resources: ['Kaggle', 'Data Science Interview Guide'], status: 'locked' },
  ],
  cloud: [
    { id: 'cl1', title: 'Cloud Fundamentals', description: 'Core cloud concepts, IaaS/PaaS/SaaS', duration: '3 weeks', topics: ['Cloud Models', 'AWS/Azure/GCP', 'IAM', 'Billing'], resources: ['AWS Cloud Practitioner', 'A Cloud Guru'], status: 'completed' },
    { id: 'cl2', title: 'Compute & Storage', description: 'EC2, S3, RDS, Lambda basics', duration: '4 weeks', topics: ['EC2', 'S3/EBS', 'RDS', 'Lambda', 'VPC'], resources: ['AWS Docs', 'Linux Academy'], status: 'in-progress' },
    { id: 'cl3', title: 'Networking & Security', description: 'VPC design, security groups, WAF', duration: '4 weeks', topics: ['VPC', 'CloudFront', 'Route 53', 'WAF', 'KMS'], resources: ['AWS Networking Specialty', 'Cloud Security Alliance'], status: 'available' },
    { id: 'cl4', title: 'DevOps on Cloud', description: 'CI/CD pipelines, IaC, monitoring', duration: '5 weeks', topics: ['Terraform', 'CloudFormation', 'CodePipeline', 'CloudWatch'], resources: ['Terraform Docs', 'AWS DevOps Engineer Pro'], status: 'locked' },
    { id: 'cl5', title: 'Kubernetes & Containers', description: 'EKS, container orchestration', duration: '5 weeks', topics: ['Docker', 'Kubernetes', 'EKS/GKE', 'Helm', 'Service Mesh'], resources: ['Kubernetes Docs', 'CKA Exam Prep'], status: 'locked' },
    { id: 'cl6', title: 'Cloud Architecture & Certifications', description: 'Well-Architected Framework, SAA/SAP', duration: '6 weeks', topics: ['Well-Architected', 'Disaster Recovery', 'Cost Optimization', 'SAA Exam'], resources: ['AWS SAA-C03 Prep', 'Adrian Cantrill Course'], status: 'locked' },
  ],
};

const PROGRESS_DATA = [
  { week: 'Week 1', studyHours: 4, quizScore: 62, problems: 5 },
  { week: 'Week 2', studyHours: 6, quizScore: 71, problems: 8 },
  { week: 'Week 3', studyHours: 5, quizScore: 68, problems: 6 },
  { week: 'Week 4', studyHours: 8, quizScore: 78, problems: 12 },
  { week: 'Week 5', studyHours: 7, quizScore: 82, problems: 11 },
  { week: 'Week 6', studyHours: 9, quizScore: 85, problems: 14 },
  { week: 'Week 7', studyHours: 11, quizScore: 88, problems: 18 },
  { week: 'Week 8', studyHours: 10, quizScore: 91, problems: 16 },
];

const PROGRESS_MONTH_DATA = Array.from({ length: 30 }, (_, i) => ({
  week: `Day ${i + 1}`,
  studyHours: Math.round((1 + Math.sin(i / 2) * 0.5 + Math.random() * 0.4) * 10) / 10,
  quizScore: 60 + Math.floor(Math.sin(i / 3) * 15 + Math.random() * 20),
}));

const MOCK_CHAPTERS = [
  {
    id: 'ch1',
    title: 'Chapter 1: Network Security Principles & CIA Triad',
    concepts: ['Confidentiality', 'Integrity', 'Availability', 'Threat Vector'],
    content: 'This chapter covers the foundational principles of network security including the CIA Triad. Confidentiality ensures data is only accessible to authorized parties. Integrity guarantees that data remains accurate and unmodified. Availability ensures that systems and data are accessible when needed. Attackers leverage various Threat Vectors to compromise these principles.'
  },
  {
    id: 'ch2',
    title: 'Chapter 2: Cryptography Basics & Encryption Methods',
    concepts: ['Symmetric Encryption', 'Asymmetric Encryption', 'Hash Functions', 'SHA-256'],
    content: 'An introduction to cryptography. We compare Symmetric Encryption (same key for lock/unlock, like AES) and Asymmetric Encryption (key pairs: public/private keys, like RSA). Hash Functions generate fixed-size fingerprints (e.g. SHA-256) which are one-way and collision-resistant, crucial for proving integrity.'
  },
  {
    id: 'ch3',
    title: 'Chapter 3: Perimeter Defense & Threat Management',
    concepts: ['Firewalls', 'IDS', 'IPS', 'Zero Trust'],
    content: 'Firewalls screen packets based on rules. Intrusion Detection Systems (IDS) monitor and alert on threat behaviors, whereas Intrusion Prevention Systems (IPS) actively block payloads in real-time. Zero Trust Architecture asserts "Never trust, always verify" — validating all traffic segments.'
  }
];

const MOCK_INTERVIEW_QS = [
  { id: 'iq1', question: 'How does the firewall differentiate between stateful and stateless packet inspection?', answer: 'Stateless inspection evaluates each packet individually based only on static header information (IP, port) without context. Stateful inspection tracks the status of network connections (e.g. TCP handshake state) and maintains a state table to allow return traffic automatically for established streams, offering higher security.' },
  { id: 'iq2', question: 'Can you explain the security vulnerabilities associated with a flat network architecture compared to a segmented one?', answer: 'In a flat network, there are no internal barriers; if an attacker gains entry to one node, they can move laterally to access any other node (unrestricted blast radius). Network segmentation divides the network into distinct subnetworks, separating sensitive assets (like DB servers) behind firewalls, restricting lateral movement and reducing the blast radius.' },
  { id: 'iq3', question: 'Explain the mechanism of a Man-in-the-Middle (MitM) attack and how it can be mitigated using asymmetric cryptography.', answer: 'In a MitM attack, the adversary intercepts communications between two parties, masquerading as each to eavesdrop or modify traffic. Mitigation involves asymmetric cryptography where public keys are signed by a trusted Certificate Authority (CA) in a PKI. By verifying the CA signature, the client verifies they are communicating with the genuine server, not an interceptor.' },
];


const SUBJECT_DATA = [
  { subject: 'Network Security', hours: 18, accuracy: 84, fill: '#4F46E5' },
  { subject: 'Cryptography', hours: 12, accuracy: 76, fill: '#06b6d4' },
  { subject: 'App Security', hours: 9, accuracy: 91, fill: '#10b981' },
  { subject: 'Forensics', hours: 6, accuracy: 68, fill: '#f59e0b' },
  { subject: 'Pen Testing', hours: 15, accuracy: 79, fill: '#ec4899' },
];

const AI_CHAT_MOCK_RESPONSES: Record<string, string> = {
  default: "That's a great question! Based on the material we've been studying, I can break this down for you. The key concept here relates to the security principles we covered earlier. Would you like me to elaborate on any specific aspect or generate a practice question on this topic?",
  explain: "Great question! Let me break this down step by step:\n\n1. **Core Principle** — The concept you're asking about is fundamental to how modern security systems work\n2. **How It Works** — The process involves multiple layers of verification to ensure authenticity\n3. **Why It Matters** — Without this mechanism, attackers could easily impersonate legitimate entities\n4. **Real-World Example** — TLS certificates use exactly this mechanism to secure HTTPS connections\n\nWould you like me to create a flashcard set on this topic or generate a quiz to test your understanding?",
  quiz: "Sure! Here's a practice question based on our current material:\n\n**Question:** Which component of PKI is responsible for signing certificates to establish trust?\n\na) Subject\nb) Certificate Authority (CA)\nc) Certificate Revocation List\nd) Public Key\n\nTake your time to think about it! Reply with your answer (a, b, c, or d) and I'll explain the reasoning.",
};

const QUICK_PROMPTS = [
  'Explain this in simple terms',
  'Create a quiz on this topic',
  'What are the key differences?',
  'Give me a real-world example',
  'What should I study next?',
];

// ─── UTILITY ─────────────────────────────────────────────────────────────────

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── SHARED UI COMPONENTS ────────────────────────────────────────────────────

function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={cn(sizes[size], 'animate-spin text-indigo-400')} />;
}

function AIThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          className="w-2 h-2 rounded-full bg-indigo-400"
        />
      ))}
    </div>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={cn('bg-white/6 rounded-lg', className)}
    />
  );
}

function ProgressRing({ value, size = 80, color = '#4F46E5', label }: { value: number; size?: number; color?: string; label?: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-base font-bold text-white leading-none">{label || `${value}%`}</p>
        {label && <p className="text-[8px] text-gray-600 mt-1 uppercase font-bold tracking-wider">Score</p>}
      </div>
    </div>
  );
}

function Badge({ children, color = 'indigo' }: { children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    gray: 'bg-white/8 text-gray-400 border-white/12',
    pink: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', colorMap[color] || colorMap.gray)}>
      {children}
    </span>
  );
}

function Card({ children, className = '', hover = false, onClick }: { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#0F1117] border border-white/7 rounded-2xl',
        hover && 'hover:border-white/15 hover:bg-[#121520] cursor-pointer transition-all',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

function InputField({ label, icon: Icon, type = 'text', placeholder, value, onChange, required }: {
  label?: string; icon?: React.ElementType; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className={cn(
            'w-full py-3 bg-white/4 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
            'hover:border-white/18 transition-all',
            Icon ? 'pl-10 pr-4' : 'px-4'
          )}
        />
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, loading, full, size = 'md', variant = 'primary' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  loading?: boolean; full?: boolean; size?: 'sm' | 'md' | 'lg'; variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25',
    secondary: 'bg-white/8 hover:bg-white/12 text-white border border-white/12',
    ghost: 'bg-transparent hover:bg-white/6 text-gray-400 hover:text-white',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/25',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all',
        sizes[size], variants[variant],
        full && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
      )}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </motion.button>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: FileText, color: '#4F46E5', title: 'PDF Learning Engine',
    desc: 'Upload any PDF and instantly get AI-generated summaries, flashcards, MCQ quizzes, and a citation-aware chat tutor.',
    preview: ['📄 Auto-Summary', '🃏 Flashcards', '✅ MCQ Quiz', '💬 Ask AI'],
  },
  {
    icon: Image, color: '#06b6d4', title: 'Diagram Analyzer',
    desc: 'Drop in any diagram, flowchart, UML, or handwritten notes. AI labels every component and generates structured notes.',
    preview: ['🔍 Region Detection', '📝 Structured Notes', '🏷️ Key Concepts', '🧩 Auto Quiz'],
  },
  {
    icon: Youtube, color: '#ec4899', title: 'YouTube Lecture Analyzer',
    desc: 'Paste any lecture URL. Get timestamped notes you can click to jump directly in the video, plus full summary and quiz.',
    preview: ['⏱️ Timestamped Notes', '📋 Topic Summary', '✅ Quiz', '⏩ Click-to-Seek'],
  },
  {
    icon: Map, color: '#10b981', title: 'AI Roadmap Generator',
    desc: 'Pick your track and get a personalized learning roadmap with milestones, time estimates, and curated resources for each stage.',
    preview: ['🗺️ Visual Roadmap', '⏳ Time Estimates', '📚 Curated Resources', '🏆 Milestones'],
  },
];

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090D] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08090D]/80 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17 }}>StudyOS</span>
            <Badge color="indigo">Beta</Badge>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Roadmaps', 'Pricing', 'Docs'].map(item => (
              <button key={item} className="text-sm text-gray-500 hover:text-white transition-colors">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <PrimaryButton variant="ghost" size="sm" onClick={onGetStarted}>Sign In</PrimaryButton>
            <PrimaryButton size="sm" onClick={onGetStarted}>Get Started Free</PrimaryButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/12 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/12 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Claude 3.5 Sonnet & Gemini 1.5 Pro
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Your AI-Powered<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Learning OS
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop juggling 6 different study tools. Upload PDFs, analyze YouTube lectures, decode diagrams, and chat with an AI tutor — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Start Learning Free
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <button className="flex items-center gap-2 px-6 py-4 bg-white/6 border border-white/12 text-gray-300 hover:text-white rounded-2xl text-sm transition-all">
              <Play className="w-4 h-4 text-indigo-400" fill="currentColor" />
              Watch 2-min demo
            </button>
          </div>
        </motion.div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative max-w-5xl mx-auto mt-20"
        >
          <div className="bg-[#0F1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-[#0a0b0e] px-4 py-3 flex items-center gap-2 border-b border-white/8">
              <div className="flex gap-1.5">
                {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
              </div>
              <div className="flex-1 mx-4 py-1 px-3 bg-white/5 rounded-lg text-xs text-gray-600 text-center">app.studyos.ai/dashboard</div>
            </div>
            <div className="grid grid-cols-5 h-64">
              <div className="col-span-1 border-r border-white/8 p-4 space-y-2">
                {[{ icon: LayoutDashboard, label: 'Dashboard', active: true }, { icon: FileText, label: 'PDF' }, { icon: Image, label: 'Image' }, { icon: Youtube, label: 'YouTube' }, { icon: Map, label: 'Roadmap' }].map(item => (
                  <div key={item.label} className={cn('flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs', item.active ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-600')}>
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="col-span-4 p-5">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[{ l: 'Study Streak', v: '8 days', c: '#f59e0b' }, { l: 'Quiz Accuracy', v: '88%', c: '#10b981' }, { l: 'Hours Today', v: '2.4h', c: '#4F46E5' }].map(s => (
                    <div key={s.l} className="bg-white/4 rounded-xl p-3 border border-white/6">
                      <p className="text-xs text-gray-600 mb-0.5">{s.l}</p>
                      <p className="text-lg font-bold" style={{ color: s.c }}>{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/3 rounded-xl h-28 flex items-center justify-center border border-white/6">
                  <div className="text-center">
                    <SkeletonBlock className="w-48 h-3 mx-auto mb-2" />
                    <SkeletonBlock className="w-32 h-2 mx-auto mb-2" />
                    <SkeletonBlock className="w-40 h-2 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-indigo-600/15 rounded-full blur-2xl" />
        </motion.div>
      </section>

      {/* Problem → Solution */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Stop Switching Between 6 Tools
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Engineering students waste 40% of their study time context-switching between scattered apps.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div>
              <Badge color="red">❌ The Old Way</Badge>
              <div className="mt-6 space-y-3">
                {[
                  { icon: '📄', label: 'PDF Reader', sub: 'No AI, manual notes' },
                  { icon: '▶️', label: 'YouTube', sub: 'No timestamps, no summaries' },
                  { icon: '🃏', label: 'Anki', sub: 'Manual flashcard creation' },
                  { icon: '💬', label: 'ChatGPT', sub: 'No context from your material' },
                  { icon: '📊', label: 'Notion', sub: 'Disconnected from learning data' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-red-500/6 border border-red-500/15 rounded-xl opacity-80">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">{item.label}</p>
                      <p className="text-xs text-gray-600">{item.sub}</p>
                    </div>
                    <X className="w-4 h-4 text-red-500/60" />
                  </div>
                ))}
              </div>
            </div>
            {/* Solution */}
            <div>
              <Badge color="green">✅ With StudyOS</Badge>
              <div className="mt-6 space-y-3">
                {[
                  { icon: '🧠', label: 'Everything in One AI OS', sub: 'PDF + Video + Chat + Roadmap unified' },
                  { icon: '⚡', label: 'Instant AI Processing', sub: 'Summary, flashcards & quiz in seconds' },
                  { icon: '🎯', label: 'Context-Aware Tutor', sub: 'Chat grounded in your actual study material' },
                  { icon: '📈', label: 'Real Progress Tracking', sub: 'Quiz accuracy, streaks, time-to-mastery' },
                  { icon: '🗺️', label: 'Personalized Roadmaps', sub: 'AI-curated paths for your specific track' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-emerald-500/8 border border-emerald-500/18 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-indigo-950/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Four AI Modules. One Platform.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn('p-6 h-full transition-all duration-300', activeFeature === i ? 'border-white/18 bg-[#111520]' : '')} hover onClick={() => setActiveFeature(i)}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${feat.color}18` }}>
                      <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{feat.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {feat.preview.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-xs text-gray-400">{tag}</span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '4', label: 'AI Modules', icon: Layers },
            { value: '3', label: 'AI Models', icon: Brain },
            { value: '10+', label: 'File Formats', icon: FileText },
            { value: '∞', label: 'Study Sessions', icon: Zap },
          ].map(stat => (
            <div key={stat.label} className="p-6 bg-white/3 border border-white/7 rounded-2xl">
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-indigo-400" />
              <p className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/30 border border-indigo-500/20 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Ready to study smarter?</h2>
              <p className="text-gray-400 mb-8">Join thousands of CS and cybersecurity students using AI to learn 3× faster.</p>
              <PrimaryButton size="lg" onClick={onGetStarted}>
                <Sparkles className="w-5 h-5" />
                Get Started — It's Free
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">StudyOS</span>
          </div>
          <p className="text-xs text-gray-700">© 2026 StudyOS. Built for engineers who want to learn faster.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <button key={item} className="text-xs text-gray-700 hover:text-gray-400 transition-colors">{item}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────

function AuthPage({ view, setView, onSuccess }: {
  view: AuthView; setView: (v: AuthView) => void; onSuccess: (name: string, email: string, userId?: string) => void;
}) {
  const [name, setName] = useState('Prashanth');
  const [email, setEmail] = useState('prashanth@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    if (view === 'login') {
      const { data, error } = await api.login(email, password);
      if (data?.user) {
        onSuccess(data.user.name, data.user.email, data.user.id);
      } else {
        // Fallback: allow login even if backend unreachable (demo mode)
        onSuccess(name || 'Prashanth', email);
      }
    } else {
      const { data, error } = await api.signup(name, email, password);
      if (data?.user) {
        onSuccess(data.user.name, data.user.email, data.user.id);
      } else {
        onSuccess(name || 'Prashanth', email);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#08090D] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/30">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>StudyOS</h1>
          <p className="text-sm text-gray-600 mt-1">{view === 'login' ? 'Welcome back! Let\'s keep learning.' : 'Start your AI-powered study journey.'}</p>
        </div>

        <Card className="p-7">
          {/* Tabs */}
          <div className="flex gap-1 bg-white/4 border border-white/8 p-1 rounded-xl mb-6">
            {(['login', 'signup'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all', view === v ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300')}>
                {v === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-gray-200 transition-all">
              <Chrome className="w-4 h-4" />Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-gray-200 transition-all">
              <Github className="w-4 h-4" />GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-gray-700">or continue with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {view === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <InputField label="Full Name" icon={User} placeholder="Your name" value={name} onChange={setName} />
                </motion.div>
              )}
            </AnimatePresence>
            <InputField label="Email" icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <InputField label="Password" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={setPassword} />
            <PrimaryButton full loading={loading} onClick={handleSubmit as any}>
              {view === 'login' ? 'Sign In' : 'Create Account'}
            </PrimaryButton>
          </form>

          <div className="mt-5 pt-5 border-t border-white/8 text-center">
            <p className="text-xs text-gray-600 mb-3">Quick demo access</p>
            <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess('Prashanth', 'prashanth@example.com'); }, 800); }}
              className="w-full py-2.5 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-indigo-500/30 text-gray-400 hover:text-gray-200 text-sm rounded-xl transition-all flex items-center justify-center gap-2">
              <span>👨‍💻</span> Continue as Prashanth
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── ONBOARDING WIZARD ────────────────────────────────────────────────────────

const TRACKS = [
  { id: 'cybersecurity', label: 'Cybersecurity', icon: Shield, desc: 'Ethical hacking, network defense, forensics', color: '#4F46E5' },
  { id: 'fullstack', label: 'Full Stack Dev', icon: Code, desc: 'React, Node.js, databases, deployment', color: '#06b6d4' },
  { id: 'ai-engineering', label: 'AI Engineering', icon: Brain, desc: 'ML, deep learning, LLMs, MLOps', color: '#10b981' },
  { id: 'data-science', label: 'Data Science', icon: BarChart2, desc: 'Statistics, analysis, visualization, SQL', color: '#f59e0b' },
  { id: 'cloud', label: 'Cloud & DevOps', icon: Globe, desc: 'AWS/GCP, Kubernetes, Terraform, CI/CD', color: '#ec4899' },
] as const;

function OnboardingPage({ step, name, onComplete }: { step: OnboardingStep; name: string; onComplete: (track: Track, hours: number) => void }) {
  const [selectedTrack, setSelectedTrack] = useState<Track>('cybersecurity');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(step);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((currentStep + 1) as OnboardingStep);
    else onComplete(selectedTrack, weeklyHours);
  };

  const progress = ((currentStep - 1) / 2) * 100;

  return (
    <div className="min-h-screen bg-[#08090D] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm text-gray-600 mb-4">Step {currentStep} of 3</p>
          <div className="w-full bg-white/6 rounded-full h-1.5 mb-2">
            <motion.div animate={{ width: `${progress + 33.3}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Track */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  What are you studying, {name.split(' ')[0]}?
                </h2>
                <p className="text-gray-500 text-sm">We'll personalize your roadmap and AI tutor based on your track.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRACKS.map(track => (
                  <motion.div key={track.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div onClick={() => setSelectedTrack(track.id as Track)}
                      className={cn('p-4 border rounded-2xl cursor-pointer transition-all', selectedTrack === track.id ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-white/8 bg-white/3 hover:border-white/15')}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${track.color}18` }}>
                          <track.icon className="w-5 h-5" style={{ color: track.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{track.label}</p>
                          <p className="text-xs text-gray-600">{track.desc}</p>
                        </div>
                        {selectedTrack === track.id && <Check className="w-4 h-4 text-indigo-400 ml-auto" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Goal */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Set your weekly study goal</h2>
                <p className="text-gray-500 text-sm">Consistent daily practice beats weekend cramming. Aim for what's sustainable.</p>
              </div>
              <Card className="p-8 text-center">
                <div className="mb-8">
                  <motion.p key={weeklyHours} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-6xl font-black text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {weeklyHours}h
                  </motion.p>
                  <p className="text-gray-500 text-sm">per week ≈ {Math.round(weeklyHours / 7 * 10) / 10}h/day</p>
                </div>
                <input
                  type="range" min={2} max={40} step={2} value={weeklyHours}
                  onChange={e => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-700">
                  <span>2h (casual)</span><span>20h (focused)</span><span>40h (intensive)</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-8">
                  {[
                    { h: weeklyHours, label: 'Hours / Week', icon: Clock },
                    { h: Math.round(weeklyHours * 4), label: 'Hours / Month', icon: Calendar },
                    { h: Math.round(weeklyHours / 7 * 10) / 10, label: 'Hours / Day', icon: Target },
                  ].map(({ h, label, icon: Icon }) => (
                    <div key={label} className="p-3 bg-white/4 rounded-xl border border-white/8">
                      <Icon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{h}</p>
                      <p className="text-xs text-gray-600">{label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: First material */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Add your first study material</h2>
                <p className="text-gray-500 text-sm">Upload a PDF or paste a YouTube link to kick off your first AI analysis session.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <Card className="p-6 border-2 border-dashed border-white/15 text-center hover:border-indigo-500/40 cursor-pointer transition-all group">
                  <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-white text-sm mb-1">Upload PDF</p>
                  <p className="text-xs text-gray-600">Lecture notes, textbooks, research papers</p>
                </Card>
                <Card className="p-6 border-2 border-dashed border-white/15 text-center hover:border-pink-500/40 cursor-pointer transition-all group">
                  <Youtube className="w-10 h-10 text-pink-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-white text-sm mb-1">YouTube Lecture</p>
                  <p className="text-xs text-gray-600">Paste any lecture URL to analyze</p>
                </Card>
              </div>
              <Card className="p-5">
                <p className="text-xs text-gray-600 mb-3 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Or skip and explore the demo content</p>
                <button onClick={handleNext} className="w-full py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 text-gray-400 hover:text-gray-200 text-sm rounded-xl transition-all">
                  Skip — take me to the dashboard
                </button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => currentStep > 1 && setCurrentStep((currentStep - 1) as OnboardingStep)}
            className={cn('flex items-center gap-2 text-sm text-gray-600 hover:text-gray-300 transition-colors', currentStep === 1 && 'opacity-0 pointer-events-none')}>
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <PrimaryButton onClick={handleNext}>
            {currentStep === 3 ? 'Go to Dashboard' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─── APP SIDEBAR ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pdf', label: 'PDF Learning', icon: FileText },
  { id: 'image', label: 'Image Analyzer', icon: Image },
  { id: 'youtube', label: 'YouTube + Tutor', icon: Youtube },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'progress', label: 'Progress', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

function AppSidebar({ page, setPage, user, onLogout, collapsed, setCollapsed }: {
  page: Page; setPage: (p: Page) => void; user: UserProfile;
  onLogout: () => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const levelInfo = [
    { level: 1, name: 'Novice', minXP: 0, maxXP: 500 },
    { level: 2, name: 'Learner', minXP: 500, maxXP: 1500 },
    { level: 3, name: 'Practitioner', minXP: 1500, maxXP: 3000 },
    { level: 4, name: 'Expert', minXP: 3000, maxXP: 6000 },
    { level: 5, name: 'Master', minXP: 6000, maxXP: 10000 },
  ].find(l => user.xp < l.maxXP) || { level: 5, name: 'Master', minXP: 6000, maxXP: 10000 };
  const xpProgress = ((user.xp - levelInfo.minXP) / (levelInfo.maxXP - levelInfo.minXP)) * 100;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 236 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="h-screen bg-[#08090D] border-r border-white/6 flex flex-col fixed left-0 top-0 z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-black text-white text-base flex-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
              StudyOS
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)} className={cn('p-1.5 hover:bg-white/7 rounded-lg transition-colors text-gray-600 hover:text-gray-300 flex-shrink-0', collapsed && 'mx-auto')}>
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Level badge (when expanded) */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 bg-white/4 border border-white/7 rounded-xl flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-300">Lv.{levelInfo.level} {levelInfo.name}</span>
            <span className="text-xs text-gray-600 font-mono">{user.xp} XP</span>
          </div>
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${xpProgress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id as Page)} title={collapsed ? item.label : undefined}
              className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-left relative',
                active ? 'bg-indigo-600/16 text-indigo-400' : 'text-gray-600 hover:text-gray-200 hover:bg-white/5')}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-400 rounded-full" />}
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User / bottom */}
      <div className="p-3 border-t border-white/6 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-300 truncate">{user.name}</p>
              <p className="text-xs text-gray-700 truncate flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />{user.streak}d streak
              </p>
            </div>
          </div>
        )}
        <button onClick={onLogout} title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:text-red-400 hover:bg-red-500/6 transition-all">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────

function TopBar({ page, user, onOpenChat, apiOnline }: { page: Page; user: UserProfile; onOpenChat: () => void; apiOnline?: boolean | null }) {
  const titles: Record<Page, string> = {
    landing: '', auth: '', onboarding: '', dashboard: 'Dashboard',
    pdf: 'PDF Learning Engine', image: 'Image Analyzer', youtube: 'YouTube Analyzer',
    roadmap: 'AI Roadmap Generator', progress: 'Progress & Analytics', settings: 'Settings',
  };
  const [searchQ, setSearchQ] = useState('');

  return (
    <div className="h-14 bg-[#08090D]/80 backdrop-blur-xl border-b border-white/6 flex items-center px-5 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-xs text-gray-600 flex-1">
        <span>StudyOS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-300">{titles[page]}</span>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search anything..."
          className="pl-8 pr-4 py-2 bg-white/4 border border-white/8 rounded-xl text-xs text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52" />
      </div>

      {/* API Status */}
      {apiOnline !== null && (
        <div title={apiOnline ? 'Backend connected' : 'Running in demo mode — backend offline'}
          className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border ${apiOnline ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/8 border-amber-500/20 text-amber-400'}`}>
          {apiOnline ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />API</> : <><WifiOff className="w-3 h-3" />Demo</>}
        </div>
      )}

      {/* Streak */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <Flame className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-semibold text-orange-400">{user.streak}d</span>
      </div>

      {/* AI Tutor FAB */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenChat}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-600/25">
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AI Tutor</span>
      </motion.button>

      {/* Notifications */}
      <button className="relative p-2 hover:bg-white/6 rounded-xl transition-colors text-gray-600 hover:text-gray-300">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        {user.name[0]}
      </div>
    </div>
  );
}

// ─── AI CHAT TUTOR ────────────────────────────────────────────────────────────

function AIChatTutor({ open, onClose, context, userId = 'demo' }: { open: boolean; onClose: () => void; context: string; userId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: `Hi! I'm your AI Study Tutor, currently scoped to **${context}**. Ask me anything, request a quiz, or ask for a concept explained differently. What would you like to explore?`, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: uid(), role: 'user', content: text, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setThinking(true);

    // Try real API first
    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const { data, error } = await api.tutorChat(userId, text, context, history);

    if (data?.reply) {
      setApiOnline(true);
      setMessages(m => [...m, { id: uid(), role: 'assistant', content: data.reply, timestamp: new Date() }]);
    } else {
      // Graceful fallback to local mock responses
      setApiOnline(false);
      const response = text.toLowerCase().includes('quiz') ? AI_CHAT_MOCK_RESPONSES.quiz
        : text.toLowerCase().includes('explain') ? AI_CHAT_MOCK_RESPONSES.explain
        : AI_CHAT_MOCK_RESPONSES.default;
      setMessages(m => [...m, {
        id: uid(), role: 'assistant', content: response, timestamp: new Date(),
        citations: text.toLowerCase().includes('explain') ? ['PDF p.12', 'PDF p.18'] : undefined,
      }]);
    }
    setThinking(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#08090D] border-l border-white/8 z-[100] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/8 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">AI Study Tutor</p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${apiOnline ? 'bg-green-400' : 'bg-amber-400'}`} />
                {apiOnline ? `Scoped to: ${context}` : `Demo mode · ${context}`}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/7 rounded-lg transition-colors text-gray-600 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold', msg.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600')}>
                  {msg.role === 'user' ? 'P' : <Brain className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className={cn('max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed', msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/7 border border-white/8 text-gray-200 rounded-tl-sm')}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.citations && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.citations.map(c => <Badge key={c} color="indigo"><Hash className="w-2.5 h-2.5" />{c}</Badge>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white/7 border border-white/8 rounded-2xl rounded-tl-sm px-1 py-1">
                  <AIThinkingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => send(p)} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-500 hover:text-gray-300 text-xs rounded-full transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/8 flex-shrink-0">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
                placeholder="Ask anything..." className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <button onClick={() => send(input)} disabled={!input.trim() || thinking}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

function DashboardPage({
  user, setPage, chatContext, userId = 'demo',
  isEmptyState = false, isLoadingState = false
}: {
  user: UserProfile; setPage: (p: Page) => void; chatContext: (c: string) => void; userId?: string;
  isEmptyState?: boolean; isLoadingState?: boolean;
}) {
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [chartView, setChartView] = useState<'week' | 'month'>('week');

  useEffect(() => {
    setTimeout(() => setLoadingRecs(false), 1800);
  }, []);

  const AI_RECS = [
    { icon: AlertTriangle, color: '#f59e0b', title: 'Review Cryptography', desc: 'Your last quiz score was 76% — below your average. Revisit symmetric vs. asymmetric encryption.', action: 'pdf' },
    { icon: Zap, color: '#4F46E5', title: 'Continue: Network Security', desc: '68% through "Network Security Fundamentals" — you\'re on a roll. 32% left!', action: 'pdf' },
    { icon: Trophy, color: '#10b981', title: 'Try the Pen Testing module', desc: 'You\'ve mastered App Security (91% accuracy). Pen Testing is your next roadmap milestone.', action: 'roadmap' },
    { icon: Lightbulb, color: '#ec4899', title: 'New: Diagram Analysis', desc: 'Upload your OSI model diagram — let AI label and quiz you on it.', action: 'image' },
  ];

  const DEADLINES = [
    { title: 'Complete OWASP Top 10 Flashcards', due: 'Due Today', urgency: 'red' },
    { title: 'Mock Exam: Network Security', due: 'In 3 days', urgency: 'amber' },
    { title: 'Roadmap: App Security milestone', due: 'This week', urgency: 'amber' },
    { title: 'Submit weekly progress review', due: 'Sunday', urgency: 'green' },
  ];

  const activeTrack = TRACKS.find(t => t.id === user.track);
  const trackLabel = activeTrack ? activeTrack.label : 'Cybersecurity';
  const trackEmoji = user.track === 'cybersecurity' ? '🛡️' : user.track === 'fullstack' ? '💻' : user.track === 'ai-engineering' ? '🧠' : user.track === 'data-science' ? '📊' : '☁️';

  if (isLoadingState) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <SkeletonBlock className="w-24 h-4" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="w-64 h-8" />
            <SkeletonBlock className="w-40 h-6 rounded-full" />
          </div>
          <SkeletonBlock className="w-80 h-4" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5 flex items-center justify-between">
              <div className="flex-1 space-y-2.5">
                <SkeletonBlock className="w-20 h-3" />
                <SkeletonBlock className="w-32 h-6" />
                <SkeletonBlock className="w-24 h-3.5" />
              </div>
              <SkeletonBlock className="w-14 h-14 rounded-full" />
            </Card>
          ))}
        </div>

        {/* Main section Skeletons */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 space-y-4">
            <SkeletonBlock className="w-32 h-4" />
            <div className="flex items-start gap-4">
              <SkeletonBlock className="w-12 h-14 rounded-xl" />
              <div className="flex-1 space-y-2.5">
                <SkeletonBlock className="w-48 h-5" />
                <SkeletonBlock className="w-36 h-3" />
                <SkeletonBlock className="w-full h-2" />
                <SkeletonBlock className="w-28 h-8 rounded-lg" />
              </div>
            </div>
          </Card>
          <Card className="p-5 flex flex-col items-center justify-center space-y-3">
            <SkeletonBlock className="w-28 h-3" />
            <SkeletonBlock className="w-20 h-20 rounded-full" />
            <SkeletonBlock className="w-24 h-5" />
          </Card>
        </div>

        {/* Performance & Deadlines Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 space-y-4">
            <div className="flex justify-between">
              <SkeletonBlock className="w-44 h-4" />
              <SkeletonBlock className="w-20 h-5" />
            </div>
            <SkeletonBlock className="w-full h-32" />
          </Card>
          <Card className="p-5 space-y-3">
            <SkeletonBlock className="w-32 h-4" />
            {[1, 2, 3].map(i => (
              <SkeletonBlock key={i} className="w-full h-11" />
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (isEmptyState) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <p className="text-sm text-gray-600 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span> 👋
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-400">
              <span>{trackEmoji}</span> {trackLabel} Fundamentals
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-1">Get started by uploading your first learning material.</p>
        </motion.div>

        {/* Zero-value Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center justify-between opacity-50">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Overall Progress</p>
              <p className="text-lg font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>0% Completed</p>
            </div>
            <ProgressRing value={0} size={76} color="#8b5cf6" />
          </Card>
          <Card className="p-5 opacity-50">
            <p className="text-xs text-gray-500 font-medium mb-1">Daily Goal</p>
            <p className="text-lg font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>0 / 45 min today</p>
            <div className="h-2 bg-white/6 rounded-full overflow-hidden mt-3" />
          </Card>
          <Card className="p-5 opacity-50">
            <p className="text-xs text-gray-500 font-medium mb-1">Study Streak</p>
            <p className="text-lg font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>0 Days</p>
            <div className="flex gap-2.5 justify-between mt-3 px-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-2.5 h-2.5 rounded-full border border-white/10 bg-transparent" />
                  <span className="text-[9px] text-gray-700 font-semibold">{d}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Empty State Hero */}
        <Card className="p-12 text-center bg-gradient-to-br from-indigo-950/20 to-purple-950/15 border-indigo-500/25 max-w-3xl mx-auto flex flex-col items-center justify-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/5"
          >
            <Brain className="w-12 h-12 text-indigo-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Your Study Assistant is Ready</h2>
          <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
            You don't have any uploaded materials yet. Upload a PDF textbook, paste a YouTube lecture, or scan a diagram to start your AI learning journey.
          </p>
          <PrimaryButton onClick={() => setPage('pdf')} size="lg">
            <Upload className="w-5 h-5 animate-pulse" />
            Upload Your First Material
          </PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-gray-600 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-400 shadow-lg shadow-indigo-500/10 self-start sm:self-auto">
            <span>{trackEmoji}</span> {trackLabel} Fundamentals
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1">You've studied <strong className="text-indigo-400">{user.totalStudyHours} hours</strong> total. Keep the streak alive!</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Overall Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-5 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-1">Overall Progress</p>
              <p className="text-lg font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>Course Completion</p>
              <p className="text-xs text-gray-600 mt-2">68% of modules completed</p>
            </div>
            <div className="flex-shrink-0 relative">
              <ProgressRing value={68} size={76} color="#8b5cf6" />
            </div>
          </Card>
        </motion.div>

        {/* Card 2: Daily Goal */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">Daily Goal</p>
              <Badge color="indigo">Target: 45 min</Badge>
            </div>
            <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>32 / 45 min today</p>
            <div className="h-2 bg-white/6 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" style={{ width: '71%' }} />
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5">71% of today's target achieved</p>
          </Card>
        </motion.div>

        {/* Card 3: Study Streak */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-gray-500 font-medium">Study Streak</p>
              <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
                <span className="text-xs font-bold text-orange-400">{user.streak} days</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Keep studying daily to maintain the streak!</p>
            <div className="flex gap-2.5 justify-between mt-3 px-1">
              {[
                { name: 'M', active: true },
                { name: 'T', active: true },
                { name: 'W', active: true },
                { name: 'T', active: true },
                { name: 'F', active: true },
                { name: 'S', active: true },
                { name: 'S', active: false },
              ].map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <div className={cn('w-2.5 h-2.5 rounded-full transition-all', d.active ? 'bg-indigo-400 shadow-[0_0_8px_#8b5cf6]' : 'border border-white/20 bg-transparent')} />
                  <span className="text-[9px] text-gray-700 font-semibold">{d.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Continue Learning */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <Card className="p-5 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-indigo-500/20">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">▶ Continue Learning</p>
            <div className="flex items-start gap-4">
              <div className="w-12 h-14 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/25 flex-shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-0.5" style={{ fontFamily: 'Manrope, sans-serif' }}>Network Security Fundamentals</h3>
                <p className="text-xs text-gray-500 mb-3">Chapter 4 — Intrusion Detection Systems · 32% remaining</p>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" style={{ width: '68%' }} />
                </div>
                <div className="flex items-center gap-3">
                  <PrimaryButton size="sm" onClick={() => setPage('pdf')}>
                    <Play className="w-3.5 h-3.5" fill="currentColor" />Resume PDF
                  </PrimaryButton>
                  <button onClick={() => chatContext('Network Security Fundamentals')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />Ask AI Tutor
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Goal Ring */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 text-center h-full flex flex-col items-center justify-center">
            <p className="text-xs text-gray-600 font-medium mb-4">Weekly Goal Progress</p>
            <ProgressRing value={62} size={100} color="#4F46E5" />
            <p className="text-sm font-semibold text-white mt-4">6.2 / {user.weeklyGoalHours}h</p>
            <p className="text-xs text-gray-600 mt-1">{user.weeklyGoalHours - 6.2}h left this week</p>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Performance chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-300">Your Progress Over Time</p>
              <div className="flex bg-white/4 border border-white/8 p-0.5 rounded-lg">
                {(['week', 'month'] as const).map(v => (
                  <button key={v} onClick={() => setChartView(v)}
                    className={cn('px-2.5 py-1 rounded-md text-[10px] font-medium capitalize transition-all',
                      chartView === v ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'
                    )}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartView === 'week' ? PROGRESS_DATA : PROGRESS_MONTH_DATA}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="week" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => chartView === 'week' ? v.replace('Week ', 'W') : v.replace('Day ', 'D')} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="studyHours" name="Study Hours" stroke="#4F46E5" strokeWidth={2} fill="url(#hoursGrad)" />
                <Area type="monotone" dataKey="quizScore" name="Quiz Score %" stroke="#10b981" strokeWidth={2} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Deadlines */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5">
            <p className="text-sm font-semibold text-gray-300 mb-4">Upcoming Deadlines</p>
            <div className="space-y-2.5">
              {DEADLINES.map(d => {
                const colors = {
                  red: 'border-red-500/20 bg-red-500/5 text-red-400',
                  amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
                  green: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                };
                const dotColors = {
                  red: 'bg-red-400 shadow-[0_0_8px_#f87171]',
                  amber: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
                  green: 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                };
                return (
                  <div key={d.title} className={cn('p-2.5 border rounded-xl flex items-center justify-between', colors[d.urgency as keyof typeof colors])}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColors[d.urgency as keyof typeof dotColors])} />
                      <p className="text-xs font-semibold text-gray-200 truncate">{d.title}</p>
                    </div>
                    <span className="text-[10px] opacity-70 flex-shrink-0 pl-2 font-medium">{d.due}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <p className="text-sm font-semibold text-gray-300">AI Recommendations</p>
            <Badge color="indigo">Personalized</Badge>
          </div>
          {loadingRecs ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {AI_RECS.map(rec => (
                <div key={rec.title}
                  className="flex items-start gap-3 p-3 bg-white/3 border border-white/7 rounded-xl transition-all group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${rec.color}18` }}>
                    <rec.icon className="w-4 h-4" style={{ color: rec.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 mb-0.5">{rec.title}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed truncate">{rec.desc}</p>
                  </div>
                  <PrimaryButton size="sm" variant="secondary" onClick={() => setPage(rec.action as Page)} className="flex-shrink-0 py-1 px-2.5 text-xs text-indigo-400 group-hover:text-white transition-colors">
                    Go →
                  </PrimaryButton>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

// ─── PDF LEARNING PAGE ────────────────────────────────────────────────────────

type PDFTab = 'summary' | 'flashcards' | 'quiz' | 'interview' | 'chat';

function PDFPage({ chatContext, userId = 'demo' }: { chatContext: (c: string) => void; userId?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [activeTab, setActiveTab] = useState<PDFTab>('summary');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [docId, setDocId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>('ch1');
  const [expandedIntId, setExpandedIntId] = useState<string | null>(null);
  const [chatMsgs, setChatMsgs] = useState<Message[]>([
    { id: '0', role: 'assistant', content: "I've analyzed your PDF. Ask me anything — I'll cite specific pages in my answers!", timestamp: new Date() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [chapters, setChapters] = useState(MOCK_CHAPTERS);
  const [flashcards, setFlashcards] = useState(MOCK_FLASHCARDS);
  const [quizQuestions, setQuizQuestions] = useState(MOCK_QUIZ);
  const [interviewQuestions, setInterviewQuestions] = useState(MOCK_INTERVIEW_QS);

  const loadPdfResults = useCallback(async (id: string) => {
    const [summaryRes, flashRes, quizRes, intRes] = await Promise.all([
      api.getPDFSummary(id),
      api.getPDFFlashcards(id),
      api.getPDFQuiz(id),
      api.getPDFInterviewQs(id),
    ]);
    if (summaryRes.data?.chapters?.length) setChapters(summaryRes.data.chapters);
    if (flashRes.data?.flashcards?.length) setFlashcards(flashRes.data.flashcards);
    if (quizRes.data?.questions?.length) setQuizQuestions(quizRes.data.questions);
    if (intRes.data?.questions?.length) setInterviewQuestions(intRes.data.questions);
    const isDemo = !!(summaryRes.data?.demoMode || flashRes.data?.demoMode);
    setUsingDemoData(isDemo);
  }, []);

  const handleUpload = async (name: string, file?: File) => {
    console.log('PDF Drag/Drop or Select action triggered:', { name, file });
    setFileName(name);
    setProcessing(true);
    setUploadStep(1);
    setErrorMessage(null);
    chatContext(name.replace('.pdf', ''));

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('Attempting PDF upload to real backend...');
        const { data, error } = await api.uploadPDF(formData);
        
        if (error) {
          throw new Error(typeof error === 'string' ? error : (error as any).message || 'Server error during upload');
        }

        if (data?.status === 'error') {
          throw new Error(data.errorMessage || 'PDF upload failed');
        }
        
        if (data?.docId) {
          setDocId(data.docId);
          let isReady = false;
          let attempts = 0;
          while (!isReady && attempts < 60) {
            attempts++;
            setUploadStep(attempts > 3 ? 2 : 1);
            await new Promise(r => setTimeout(r, 2000));
            const { data: statusData } = await api.getPDFStatus(data.docId);
            if (statusData?.status === 'ready') {
              isReady = true;
              await loadPdfResults(data.docId);
              if (statusData.demoMode) {
                setUsingDemoData(true);
                setErrorMessage('Running in demo mode — set GEMINI_API_KEY on the backend for live AI analysis.');
              }
              break;
            }
            if (statusData?.status === 'error') {
              throw new Error(statusData.errorMessage || 'PDF analysis failed');
            }
          }
          if (isReady) {
            setUploaded(true);
            setProcessing(false);
            return;
          }
          throw new Error('PDF analysis timed out. Please try again.');
        }
      }
      throw new Error('No file provided');
    } catch (err: any) {
      console.warn('Real backend upload failed, falling back to simulated demo mode. Error:', err.message);
      if (file) {
        setErrorMessage(`Notice: ${err.message}. Switched to offline simulation.`);
        setUsingDemoData(true);
      }
      
      setUploadStep(1);
      setTimeout(() => {
        setUploadStep(2);
        setTimeout(() => {
          setUploadStep(3);
          setProcessing(false);
          setUploaded(true);
        }, 1200);
      }, 1200);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file.name, file);
  };

  const sendChat = async (text: string) => {
    if (!text.trim()) return;
    setChatMsgs(m => [...m, { id: uid(), role: 'user', content: text, timestamp: new Date() }]);
    setChatInput('');
    setChatThinking(true);

    if (docId && !usingDemoData) {
      const { data } = await api.chatWithPDF(docId, text, chatMsgs);
      if (data?.reply) {
        setChatMsgs(m => [...m, {
          id: uid(),
          role: 'assistant',
          content: data.reply,
          citations: data.citations,
          timestamp: new Date(),
        }]);
        setChatThinking(false);
        return;
      }
    }

    setTimeout(() => {
      setChatMsgs(m => [...m, { id: uid(), role: 'assistant', content: AI_CHAT_MOCK_RESPONSES.explain, citations: ['PDF p.4', 'PDF p.7', 'PDF p.11'], timestamp: new Date() }]);
      setChatThinking(false);
    }, 1500);
  };

  const exportToAnki = () => {
    const csvRows = [
      ['Front', 'Back'],
      ...flashcards.map(f => [f.front, f.back])
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName.replace('.pdf', '')}_flashcards.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCitationClick = (citation: string) => {
    const match = citation.match(/\d+/);
    if (match) {
      const pageNum = parseInt(match[0], 10);
      if (pageNum >= 1 && pageNum <= 12) {
        setPdfPage(pageNum);
      }
    }
  };

  const quizScore = quizQuestions.filter(q => quizAnswers[q.id] === q.correctIndex).length;

  if (!uploaded && !processing) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-left">
          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PDF Learning Engine</span>
          </h1>
          <p className="text-gray-500 text-sm">Upload any PDF — lecture notes, textbooks, papers — and let AI transform it into your study toolkit.</p>
        </motion.div>

        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Hidden File Picker Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file.name, file);
          }}
        />

        {/* Dropzone */}
        <motion.div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          whileHover={{ scale: 1.005 }}
          animate={{ borderColor: dragging ? '#4F46E5' : 'rgba(255,255,255,0.12)' }}
          className="border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer mb-6 transition-colors"
          style={{ background: dragging ? 'rgba(79,70,229,0.06)' : 'rgba(255,255,255,0.02)' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <motion.div animate={{ y: dragging ? -8 : 0 }} transition={{ type: 'spring', stiffness: 400 }}>
            <div className="w-16 h-16 bg-indigo-600/15 border border-indigo-500/25 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {dragging ? 'Drop your PDF here' : 'Drag & drop your PDF'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">Supports PDF · Max 50MB · Text-based or scanned</p>
            <PrimaryButton size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <FileText className="w-4 h-4" />Browse Files
            </PrimaryButton>
          </motion.div>
        </motion.div>

        {/* Previous Documents Grid */}
        <div className="text-left">
          <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider">Your Study Library</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Network Security Fundamentals.pdf', date: 'Jul 4, 2026', progress: 68, size: '4.2 MB' },
              { name: 'Applied Cryptography Ch.5.pdf', date: 'Jun 28, 2026', progress: 40, size: '2.8 MB' },
              { name: 'OWASP Top 10 2025.pdf', date: 'Jun 15, 2026', progress: 90, size: '1.5 MB' },
              { name: 'Penetration Testing Basics.pdf', date: 'May 30, 2026', progress: 12, size: '8.4 MB' },
            ].map(doc => (
              <Card key={doc.name} onClick={() => handleUpload(doc.name)} hover className="p-4 flex flex-col justify-between text-left group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/40 transition-colors">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-indigo-400 transition-colors">{doc.name}</p>
                    <p className="text-[10px] text-gray-600">{doc.date} · {doc.size}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-gray-600 font-medium">Studied</span>
                    <span className="text-[10px] font-bold text-indigo-400">{doc.progress}%</span>
                  </div>
                  <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" style={{ width: `${doc.progress}%` }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-indigo-600/15 border border-indigo-500/25 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Brain className="w-10 h-10 text-indigo-400" />
          </motion.div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>AI is analyzing your PDF…</h2>
        
        {/* Step-by-Step line progress bar */}
        <div className="max-w-xs mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Extracting Text</span>
            <span>Analyzing Concepts</span>
          </div>
          <div className="h-1.5 bg-white/6 rounded-full relative overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: uploadStep === 1 ? '50%' : '100%' }}
              transition={{ duration: 1.2 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
            />
          </div>
          <div className="space-y-2 mt-4 text-left">
            <div className="flex items-center gap-2.5 text-xs">
              {uploadStep >= 1 ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />}
              <span className={cn(uploadStep === 1 ? 'text-white font-medium' : 'text-gray-600')}>Step 1: Extracting text from document...</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              {uploadStep >= 2 ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-white/20 animate-pulse flex-shrink-0" />}
              <span className={cn(uploadStep === 2 ? 'text-white font-medium' : 'text-gray-600')}>Step 2: Performing vision and conceptual indexing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TABS: { id: PDFTab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'flashcards', label: `Flashcards (${flashcards.length})` },
    { id: 'quiz', label: 'MCQ Quiz' },
    { id: 'interview', label: 'Interview Qs' },
    { id: 'chat', label: 'Ask AI' },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left: PDF Viewer */}
      <div className="w-56 lg:w-64 border-r border-white/7 flex flex-col flex-shrink-0 bg-[#08090D]">
        <div className="p-3 border-b border-white/7">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <p className="text-xs font-medium text-gray-400 truncate">{fileName}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {[...Array(12)].map((_, i) => (
            <button key={i} onClick={() => setPdfPage(i + 1)}
              className={cn('w-full aspect-[3/4] rounded-lg border flex items-center justify-center text-xs font-mono transition-all', pdfPage === i + 1 ? 'border-indigo-500/50 bg-indigo-600/15 text-indigo-400' : 'border-white/6 bg-white/3 text-gray-700 hover:border-white/12 hover:text-gray-500')}>
              p.{i + 1}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/7 flex items-center justify-between">
          <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} className="p-1.5 hover:bg-white/7 rounded-lg transition-colors text-gray-600"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-gray-600 font-mono">{pdfPage} / 12</span>
          <button onClick={() => setPdfPage(p => Math.min(12, p + 1))} className="p-1.5 hover:bg-white/7 rounded-lg transition-colors text-gray-600"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-white/7 bg-[#08090D] flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('px-3.5 py-2 rounded-lg text-xs font-medium transition-all', activeTab === t.id ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5')}>
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button className="p-2 hover:bg-white/7 rounded-lg text-gray-600 hover:text-gray-300 transition-colors"><Download className="w-4 h-4" /></button>
            <button onClick={() => setUploaded(false)} className="p-2 hover:bg-white/7 rounded-lg text-gray-600 hover:text-gray-300 transition-colors"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-3xl space-y-4">
                <div className="flex items-center gap-2 mb-2 text-left">
                  <Badge color="indigo"><Sparkles className="w-3 h-3" />AI Generated Summary</Badge>
                  <Badge color="gray">Pg. {pdfPage} context</Badge>
                </div>
                <div className="space-y-3">
                  {chapters.map(ch => {
                    const isOpen = expandedChapterId === ch.id;
                    return (
                      <Card key={ch.id} className={cn('overflow-hidden transition-all text-left', isOpen && 'border-indigo-500/25 bg-gradient-to-br from-indigo-900/10 to-purple-900/5')}>
                        <button className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-white/3" onClick={() => setExpandedChapterId(isOpen ? null : ch.id)}>
                          <span className="text-sm font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>{ch.title}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 pt-2 border-t border-white/6 space-y-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {ch.concepts.map(concept => (
                                    <span key={concept} className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-[10px] font-semibold text-indigo-300 shadow-[0_0_6px_rgba(139,92,246,0.1)]">
                                      {concept}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                                  {ch.content}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Flashcards Tab */}
            {activeTab === 'flashcards' && (
              <motion.div key="flashcards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex flex-col items-center">
                <div className="w-full max-w-lg flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-505 font-mono">{currentCard + 1} of {flashcards.length} cards · Click to flip</p>
                  <PrimaryButton size="sm" variant="secondary" onClick={exportToAnki}>
                    <Download className="w-3.5 h-3.5" /> Export to Anki
                  </PrimaryButton>
                </div>
                {/* Card */}
                <div className="w-full max-w-lg cursor-pointer" style={{ perspective: 1000 }} onClick={() => setCardFlipped(f => !f)}>
                  <motion.div
                    animate={{ rotateY: cardFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
                    style={{ transformStyle: 'preserve-3d', position: 'relative', height: 240 }}
                  >
                    {/* Front */}
                    <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}>
                      <Card className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-indigo-500/20">
                        <Badge color="indigo" className="mb-4">Question</Badge>
                        <p className="text-sm md:text-base font-bold text-white leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {flashcards[currentCard].front}
                        </p>
                        <p className="text-xs text-gray-600 mt-6 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Click to reveal answer</p>
                      </Card>
                    </div>
                    {/* Back */}
                    <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }}>
                      <Card className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-emerald-900/30 to-cyan-900/20 border-emerald-500/20">
                        <Badge color="green">Answer</Badge>
                        <p className="text-xs md:text-sm text-gray-200 mt-4 leading-relaxed">{flashcards[currentCard].back}</p>
                      </Card>
                    </div>
                  </motion.div>
                </div>
                {/* Navigation */}
                <div className="flex items-center gap-4 mt-6">
                  <button onClick={() => { setCurrentCard(c => Math.max(0, c - 1)); setCardFlipped(false); }}
                    disabled={currentCard === 0} className="p-2.5 bg-white/5 border border-white/8 rounded-xl disabled:opacity-30 text-gray-400 hover:text-white transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-1.5">
                    {flashcards.map((_, i) => (
                      <button key={i} onClick={() => { setCurrentCard(i); setCardFlipped(false); }}
                        className={cn('w-2 h-2 rounded-full transition-all', i === currentCard ? 'bg-indigo-400 scale-125' : 'bg-white/15 hover:bg-white/30')} />
                    ))}
                  </div>
                  <button onClick={() => { setCurrentCard(c => Math.min(flashcards.length - 1, c + 1)); setCardFlipped(false); }}
                    disabled={currentCard === flashcards.length - 1} className="p-2.5 bg-white/5 border border-white/8 rounded-xl disabled:opacity-30 text-gray-400 hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-3xl">
                {quizDone ? (
                  <Card className="p-8 text-center max-w-xl mx-auto">
                    <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Quiz Complete!</h2>
                    {/* Circle Score */}
                    <div className="my-6 flex justify-center">
                      <ProgressRing value={Math.round((quizScore / quizQuestions.length) * 100)} size={110} color="#10b981" label={`${quizScore} / ${quizQuestions.length}`} />
                    </div>
                    <div className="text-left space-y-3 mb-6">
                      {quizQuestions.map((q, idx) => {
                        const correct = quizAnswers[q.id] === q.correctIndex;
                        return (
                          <div key={q.id} className={cn('p-3 rounded-xl border text-xs', correct ? 'border-emerald-500/25 bg-emerald-500/8' : 'border-red-500/25 bg-red-500/8')}>
                            <div className="flex items-start gap-2">
                              {correct ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                              <div>
                                <p className="text-gray-300 font-medium font-sans">Q{idx + 1}: {q.question}</p>
                                <p className="text-[10px] text-gray-505 mt-0.5 font-sans">Your answer: {q.options[quizAnswers[q.id]]} {correct ? '' : `(Correct: ${q.options[q.correctIndex]})`}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <PrimaryButton onClick={() => { setQuizDone(false); setQuizAnswers({}); setCurrentQuizIndex(0); }}>
                      <RotateCcw className="w-4 h-4" />Retry Quiz
                    </PrimaryButton>
                  </Card>
                ) : (
                  <div className="space-y-4 max-w-xl mx-auto text-left">
                    <div className="flex items-center justify-between mb-2">
                      <Badge color="indigo">MCQ Quiz</Badge>
                      <span className="text-xs text-gray-650 font-mono">Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                    </div>

                    <Card className="p-6">
                      <p className="font-semibold text-white text-sm mb-5 leading-relaxed font-sans">
                        {quizQuestions[currentQuizIndex].question}
                      </p>
                      <div className="space-y-2.5">
                        {quizQuestions[currentQuizIndex].options.map((opt, oi) => {
                          const answered = quizAnswers[quizQuestions[currentQuizIndex].id] !== undefined;
                          const selected = quizAnswers[quizQuestions[currentQuizIndex].id];
                          const isSelected = selected === oi;
                          const isCorrect = oi === quizQuestions[currentQuizIndex].correctIndex;
                          return (
                            <button
                              key={oi}
                              onClick={() => !answered && setQuizAnswers(a => ({ ...a, [quizQuestions[currentQuizIndex].id]: oi }))}
                              disabled={answered}
                              className={cn('w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between',
                                !answered && 'hover:border-indigo-500/40 hover:bg-indigo-500/8 border-white/8 bg-white/3 text-gray-300',
                                answered && isSelected && isCorrect && 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
                                answered && isSelected && !isCorrect && 'border-red-500 bg-red-500/10 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
                                answered && !isSelected && isCorrect && 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5.5 h-5.5 rounded-lg border flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-white/12">
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <span className="font-sans">{opt}</span>
                              </div>
                              {answered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                              {answered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {quizAnswers[quizQuestions[currentQuizIndex].id] !== undefined && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 p-3.5 bg-white/4 border border-white/8 rounded-xl text-[11px] text-gray-400 leading-relaxed italic">
                          <p className="font-semibold text-gray-305 mb-1">Explanation:</p>
                          {quizQuestions[currentQuizIndex].explanation}
                        </motion.div>
                      )}
                    </Card>

                    {/* Nav controls */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setCurrentQuizIndex(c => Math.max(0, c - 1))}
                        disabled={currentQuizIndex === 0}
                        className="px-3.5 py-2 bg-white/4 border border-white/10 rounded-xl text-xs text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-all font-sans"
                      >
                        Previous
                      </button>
                      
                      {quizAnswers[quizQuestions[currentQuizIndex].id] !== undefined && (
                        currentQuizIndex < quizQuestions.length - 1 ? (
                          <PrimaryButton size="sm" onClick={() => setCurrentQuizIndex(c => c + 1)}>
                            Next Question
                          </PrimaryButton>
                        ) : (
                          <PrimaryButton size="sm" onClick={() => setQuizDone(true)}>
                            Finish Quiz
                          </PrimaryButton>
                        )
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Interview Qs Tab */}
            {activeTab === 'interview' && (
              <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-3xl space-y-4">
                <div className="flex items-center gap-2 mb-2 text-left">
                  <Badge color="indigo">Interview Prep</Badge>
                  <span className="text-xs text-gray-600 font-sans">Click a question to reveal the model answer</span>
                </div>
                <div className="space-y-3">
                  {interviewQuestions.map(q => {
                    const isOpen = expandedIntId === q.id;
                    return (
                      <Card key={q.id} className={cn('overflow-hidden transition-all text-left', isOpen && 'border-indigo-500/30')}>
                        <button className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-white/3" onClick={() => setExpandedIntId(isOpen ? null : q.id)}>
                          <span className="text-sm font-bold text-gray-205 font-sans leading-snug">{q.question}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 pt-2 border-t border-white/6 bg-white/1 text-xs text-gray-400 leading-relaxed font-sans">
                                <p className="font-semibold text-indigo-300 mb-1">Model Answer:</p>
                                {q.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Ask AI Tab */}
            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-140px)]">
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {chatMsgs.map(msg => (
                    <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold', msg.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600')}>
                        {msg.role === 'user' ? 'P' : <Brain className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={cn('max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed text-left', msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/7 border border-white/8 text-gray-200 rounded-tl-sm')}>
                        <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                        {msg.citations && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {msg.citations.map(c => (
                              <button key={c} onClick={() => handleCitationClick(c)} className="px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-xs text-indigo-300 hover:text-white transition-colors font-mono flex items-center gap-1">
                                <Hash className="w-2.5 h-2.5" />{c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatThinking && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                        <Brain className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white/7 border border-white/8 rounded-2xl rounded-tl-sm px-1 py-1">
                        <AIThinkingDots />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/7 flex-shrink-0">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {['What is IDS?', 'Explain Zero Trust', 'Create a quiz', 'Key differences?'].map(p => (
                      <button key={p} onClick={() => sendChat(p)} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/8 text-gray-600 hover:text-gray-300 text-xs rounded-full transition-all">{p}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat(chatInput)}
                      placeholder="Ask anything about this PDF..." className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    <button onClick={() => sendChat(chatInput)} disabled={!chatInput.trim() || chatThinking} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── IMAGE ANALYZER PAGE ──────────────────────────────────────────────────────

type ImgTab = 'explanation' | 'notes' | 'concepts' | 'quiz';

function ImageAnalyzerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [activeTab, setActiveTab] = useState<ImgTab>('explanation');
  const [dragging, setDragging] = useState(false);
  const [quizAnswers, setImgQuizAnswers] = useState<Record<string, number>>({});
  const [activePinId, setActivePinId] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleUpload = (file?: File) => {
    if (file) {
      setImageSrc(URL.createObjectURL(file));
    } else {
      setImageSrc(null);
    }
    setProcessing(true);
    setUploadStep(1);
    
    // Simulate steps: Step 1 (1.1s) -> Step 2 (1.1s) -> Done
    setTimeout(() => {
      setUploadStep(2);
      setTimeout(() => {
        setProcessing(false);
        setUploaded(true);
      }, 1100);
    }, 1100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const ANNOTATIONS = [
    { id: 1, x: 22, y: 18, label: 'Client', color: '#4F46E5' },
    { id: 2, x: 50, y: 18, label: 'Firewall', color: '#f59e0b' },
    { id: 3, x: 78, y: 18, label: 'Web Server', color: '#10b981' },
    { id: 4, x: 50, y: 65, label: 'IDS/IPS', color: '#ec4899' },
    { id: 5, x: 22, y: 65, label: 'Internet', color: '#06b6d4' },
    { id: 6, x: 78, y: 65, label: 'DB Server', color: '#8b5cf6' },
  ];

  const EXPLANATIONS = [
    { id: 1, label: 'Client', color: '#4F46E5', text: 'The end-user device initiating requests. Represents external traffic entering the network boundary.' },
    { id: 2, label: 'Firewall', color: '#f59e0b', text: 'First line of defense — filters incoming/outgoing traffic based on predefined security rules (ACLs). Can be stateful or stateless.' },
    { id: 3, label: 'Web Server', color: '#10b981', text: 'Hosts the application layer. Located in the DMZ (De-Militarized Zone) to limit exposure of backend systems.' },
    { id: 4, label: 'IDS/IPS', color: '#ec4899', text: 'Monitors network traffic for suspicious activity. IDS alerts only; IPS can actively block malicious packets in real-time.' },
    { id: 5, label: 'Internet', color: '#06b6d4', text: 'The public WAN boundary representing untrusted external networks requesting access.' },
    { id: 6, label: 'DB Server', color: '#8b5cf6', text: 'Internal database in a protected segment. Should never be directly accessible from the internet — only reachable from the web server.' },
  ];

  const IMG_QUIZ: MCQQuestion[] = [
    { id: 'iq1', question: 'In the diagram, which component sits between the Internet and the Web Server?', options: ['IDS/IPS', 'Database', 'Firewall', 'Client'], correctIndex: 2, explanation: 'The Firewall is the first security checkpoint that all external traffic must pass through before reaching internal servers.' },
    { id: 'iq2', question: 'What architectural pattern does this network diagram represent?', options: ['Flat network', 'Defense-in-depth', 'Air-gapped network', 'Peer-to-peer'], correctIndex: 1, explanation: 'Defense-in-depth uses multiple layers of security controls (Firewall + IDS/IPS + segmentation) to protect critical assets.' },
    { id: 'iq3', question: 'Why is the DB Server in a separate segment from the Web Server?', options: ['For faster performance', 'Network segmentation reduces blast radius', 'Required by HTTP protocol', 'To reduce latency'], correctIndex: 1, explanation: 'Segmenting the database server limits what an attacker can access if they compromise the web server — a core defense-in-depth principle.' },
  ];

  if (!uploaded && !processing) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto text-left">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Image & Diagram Analyzer</span>
          </h1>
          <p className="text-gray-500 text-sm">Drop in any diagram, flowchart, UML, or handwritten notes. AI labels every component and generates explanations.</p>
        </motion.div>

        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs rounded-xl flex items-center gap-2 text-left mb-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Hidden File Picker Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />

        <motion.div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
          animate={{ borderColor: dragging ? '#06b6d4' : 'rgba(255,255,255,0.12)' }}
          className="border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer mb-6 transition-colors"
          style={{ background: dragging ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)' }}
          onClick={() => fileInputRef.current?.click()}>
          <div className="w-16 h-16 bg-cyan-600/15 border border-cyan-500/25 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Image className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Drop any image or diagram</h3>
          <p className="text-gray-600 text-sm mb-4">PNG · JPG · SVG · Handwritten notes · UML · Flowcharts</p>
          <PrimaryButton size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            <Image className="w-4 h-4" />Browse Images
          </PrimaryButton>
        </motion.div>

        <div className="grid grid-cols-4 gap-3">
          {['Network Diagram', 'OSI Model', 'TCP Handshake', 'UML Class'].map((label, i) => (
            <button key={label} onClick={handleUpload} className="aspect-square bg-white/3 border border-white/7 hover:border-cyan-500/30 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:bg-white/5 group">
              <div className="w-8 h-8 bg-cyan-500/15 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-gray-400">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh] text-center">
        <div className="max-w-sm space-y-6">
          <div className="relative w-48 h-32 bg-[#0F1117] border border-white/8 rounded-2xl overflow-hidden flex items-center justify-center mx-auto">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.1),_transparent)] animate-pulse" />
            <Eye className="w-10 h-10 text-cyan-400 opacity-50" />
            <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-laser" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {uploadStep === 1 ? 'Extracting visual features...' : 'Indexing diagram components...'}
            </h2>
            <p className="text-gray-600 text-sm">
              {uploadStep === 1 ? 'Analyzing spatial relationships and shapes...' : 'Mapping pins and linking definitions...'}
            </p>
          </div>
          <div className="flex justify-center"><AIThinkingDots /></div>
        </div>
      </div>
    );
  }

  const IMG_TABS: { id: ImgTab; label: string }[] = [
    { id: 'explanation', label: 'Explanation' },
    { id: 'notes', label: 'Structured Notes' },
    { id: 'concepts', label: 'Key Concepts' },
    { id: 'quiz', label: 'Quiz' },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left: Image with annotations */}
      <div className="flex-1 p-5 overflow-y-auto text-left">
        <div className="flex items-center justify-between mb-3">
          <Badge color="cyan"><Eye className="w-3 h-3" />AI Annotated</Badge>
          <button onClick={() => setUploaded(false)} className="text-xs text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1"><RotateCcw className="w-3 h-3" />New Image</button>
        </div>
        {/* Annotated image mockup */}
        <div className="relative bg-[#0F1117] border border-white/8 rounded-2xl overflow-hidden" style={{ paddingTop: '60%' }}>
          {/* Custom image background if uploaded */}
          {imageSrc ? (
            <img src={imageSrc} className="absolute inset-0 w-full h-full object-contain opacity-30 select-none pointer-events-none" alt="Uploaded Diagram" />
          ) : (
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          )}
          {/* Grid background simulating a network diagram */}
          <div className="absolute inset-0 p-6">
            <div className="w-full h-full relative">
              {/* Lines connecting nodes */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <line x1="22%" y1="30%" x2="50%" y2="30%" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1="50%" y1="30%" x2="78%" y2="30%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1="50%" y1="30%" x2="50%" y2="70%" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1="22%" y1="70%" x2="22%" y2="30%" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1="78%" y1="30%" x2="78%" y2="70%" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,4" />
              </svg>
              {/* Annotation pins */}
              {ANNOTATIONS.map(ann => {
                const isActive = activePinId === ann.id;
                return (
                  <motion.div
                    key={ann.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: isActive ? 1.25 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    onMouseEnter={() => setActivePinId(ann.id)}
                    onMouseLeave={() => setActivePinId(null)}
                    onClick={() => setActivePinId(ann.id)}
                    className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                    style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white shadow-lg transition-all',
                        isActive ? 'ring-4 ring-cyan-400/30 scale-110 border-white' : 'border-transparent'
                      )}
                      style={{ background: ann.color }}
                    >
                      {ann.id}
                    </div>
                    <div className={cn(
                      'transition-all duration-200 absolute -top-8 px-2 py-1 bg-[#0d1117] border border-white/10 rounded-lg text-[10px] text-white whitespace-nowrap',
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    )}>
                      {ann.label}
                    </div>
                  </motion.div>
                );
              })}
              <p className="absolute bottom-4 left-4 text-xs text-gray-700">Network Security Architecture Diagram</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-700 mt-2">Hover/Click pins on diagram or list items on right to highlight components.</p>
      </div>

      {/* Right: Analysis */}
      <div className="w-80 lg:w-96 border-l border-white/7 flex flex-col flex-shrink-0 bg-[#08090D] text-left">
        <div className="flex items-center gap-1 p-3 border-b border-white/7 flex-shrink-0">
          {IMG_TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', activeTab === t.id ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/25' : 'text-gray-600 hover:text-gray-300')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'explanation' && (
              <motion.div key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {EXPLANATIONS.map(ex => {
                  const isActive = activePinId === ex.id;
                  return (
                    <div
                      key={ex.label}
                      onMouseEnter={() => setActivePinId(ex.id)}
                      onMouseLeave={() => setActivePinId(null)}
                      onClick={() => setActivePinId(ex.id)}
                      className={cn(
                        'p-3 border rounded-xl transition-all cursor-pointer text-left',
                        isActive ? 'bg-cyan-950/15 border-cyan-500/50 shadow-md shadow-cyan-500/5' : 'bg-white/3 border-white/7 hover:border-white/14'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ex.color }} />
                          <p className="text-xs font-bold text-white">{ex.label}</p>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">Pin #{ex.id}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{ex.text}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}
            {activeTab === 'notes' && (
              <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-4 text-xs text-gray-400 leading-relaxed space-y-2 text-left">
                  <p className="font-bold text-white text-sm">Defense-in-Depth Architecture</p>
                  <p><strong className="text-indigo-400">Perimeter Layer:</strong> Firewall → stateful inspection, ACL rules, NAT</p>
                  <p><strong className="text-pink-400">Detection Layer:</strong> IDS/IPS → signature + anomaly-based monitoring</p>
                  <p><strong className="text-emerald-400">Application Layer:</strong> Web Server in DMZ → separates public-facing apps from internal network</p>
                  <p><strong className="text-purple-400">Data Layer:</strong> DB Server in internal segment → minimal attack surface, only accessible via Web Server</p>
                  <p><strong className="text-cyan-400">Traffic Flow:</strong> Internet → Firewall → IDS/IPS → Web Server → DB (internal request only)</p>
                </Card>
              </motion.div>
            )}
            {activeTab === 'concepts' && (
              <motion.div key="concepts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 text-left">
                {['Defense-in-Depth', 'Network Segmentation', 'DMZ', 'Stateful Inspection', 'IDS vs IPS', 'ACL', 'NAT', 'Zero Trust', 'Blast Radius', 'Perimeter Security', 'Internal Network', 'Attack Surface'].map(c => (
                  <span key={c} className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400">{c}</span>
                ))}
              </motion.div>
            )}
            {activeTab === 'quiz' && (
              <motion.div key="imgquiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-left">
                {IMG_QUIZ.map((q, qi) => {
                  const answered = quizAnswers[q.id] !== undefined;
                  const selected = quizAnswers[q.id];
                  
                  const croppedSnippets: Record<string, { label: string; pinNum: number; color: string }> = {
                    iq1: { label: 'Firewall (Pin #2)', pinNum: 2, color: 'from-amber-500/20 to-orange-500/20' },
                    iq2: { label: 'Overall Security Topology', pinNum: 4, color: 'from-indigo-500/20 to-purple-500/20' },
                    iq3: { label: 'DB Server (Pin #6)', pinNum: 6, color: 'from-emerald-500/20 to-teal-500/20' }
                  };
                  const snippet = croppedSnippets[q.id];

                  return (
                    <div key={q.id} className="p-4 bg-white/3 border border-white/7 rounded-xl space-y-3">
                      {snippet && (
                        <div className="relative h-20 bg-black/40 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                          <div className={cn("absolute inset-0 bg-gradient-to-r opacity-30", snippet.color)} />
                          
                          <div className="relative z-10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0F1117] border border-cyan-500/35 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                              #{snippet.pinNum}
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Diagram Crop Focus</p>
                              <p className="text-xs text-white font-semibold flex items-center gap-1">
                                <Search className="w-3 h-3 text-cyan-400" />
                                Focused on {snippet.label}
                              </p>
                            </div>
                          </div>
                          <Badge color="cyan" className="absolute top-2 right-2 scale-90">Snippet</Badge>
                        </div>
                      )}

                      <p className="text-xs font-semibold text-white mb-2">{qi + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const isSelected = selected === oi;
                          const isCorrect = oi === q.correctIndex;
                          return (
                            <button key={oi} onClick={() => !answered && setImgQuizAnswers(a => ({ ...a, [q.id]: oi }))} disabled={answered}
                              className={cn('w-full text-left px-3 py-2 rounded-lg text-xs transition-all border',
                                !answered && 'border-white/8 hover:border-cyan-500/30 hover:bg-cyan-500/6 text-gray-400',
                                answered && isSelected && isCorrect && 'border-emerald-500/45 bg-emerald-500/10 text-emerald-300',
                                answered && isSelected && !isCorrect && 'border-red-500/45 bg-red-500/10 text-red-300',
                                answered && !isSelected && isCorrect && 'border-emerald-500/25 text-emerald-400',
                              )}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          );
                        })}
                      </div>
                      {answered && <p className="text-xs text-gray-650 mt-2 italic">{q.explanation}</p>}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── YOUTUBE ANALYZER PAGE ────────────────────────────────────────────────────

type YTTab = 'timestamps' | 'summary' | 'quiz';

function YouTubePage({ chatContext }: { chatContext: (c: string) => void }) {
  const [url, setUrl] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<YTTab>('timestamps');
  const [quizAnswers, setYTQuizAnswers] = useState<Record<string, number>>({});
  const [videoData, setVideoData] = useState<any>(null);
  const [apiTimestamps, setApiTimestamps] = useState<TimestampNote[] | null>(null);
  const [apiSummary, setApiSummary] = useState<string | null>(null);
  const [videoStartTime, setVideoStartTime] = useState<number>(0);

  const SAMPLE_URL = 'https://youtube.com/watch?v=UNANP_Uq4Mc';
  const VIDEO_INFO = { title: 'Asymmetric Cryptography Explained — RSA, ECC, TLS', channel: 'CS Simplified', duration: '34:22', views: '284K' };

  const parseTimestampToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const getEmbedUrl = (videoUrl: string, startSec?: number) => {
    let videoId = 'UNANP_Uq4Mc';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoUrl.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    } catch (e) {}
    
    let base = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    if (startSec) {
      base += `&start=${startSec}`;
    }
    return base;
  };

  const handleLoad = async () => {
    if (!url.trim()) return;
    setLoading(true);

    // Call real YouTube analyzer API
    const { data } = await api.analyzeYouTube(url);
    if (data) {
      setVideoData(data);
      if (data.status === 'processing') {
        const videoId = data.videoId;
        const poll = setInterval(async () => {
          const { data: fresh } = await api.getYouTubeAnalysis(videoId);
          if (fresh?.status === 'ready') {
            clearInterval(poll);
            setVideoData(fresh);
            if (fresh.timestamps?.length) setApiTimestamps(fresh.timestamps);
            if (fresh.summary) setApiSummary(fresh.summary);
            chatContext(fresh.title || 'YouTube Lecture');
            setLoaded(true);
            setLoading(false);
          }
        }, 2000);
        setTimeout(() => {
          clearInterval(poll);
          chatContext('Asymmetric Cryptography Lecture');
          setLoaded(true);
          setLoading(false);
        }, 30000);
        return;
      }
      if (data.timestamps?.length) setApiTimestamps(data.timestamps);
      if (data.summary) setApiSummary(data.summary);
      chatContext(data.title || 'YouTube Lecture');
    } else {
      chatContext('Asymmetric Cryptography Lecture');
    }
    setLoaded(true);
    setLoading(false);
  };

  const YT_QUIZ: MCQQuestion[] = [
    { id: 'yt1', question: 'According to the lecture, which is the "trapdoor function" that RSA relies on?', options: ['Multiplication of large numbers', 'Factoring the product of two large primes', 'Computing discrete logarithms', 'Solving elliptic curve equations'], correctIndex: 1, explanation: 'RSA security relies on the difficulty of factoring n = p×q back into its prime components, even when n is public.' },
    { id: 'yt2', question: 'At timestamp 7:15, Diffie-Hellman requires agreement on which two public values?', options: ['Private keys p and q', 'Public prime p and generator g', 'Shared secret and salt', 'Certificate and CA signature'], correctIndex: 1, explanation: 'DH key exchange: both parties agree publicly on prime p and base g, then each creates a private exponent and exchanges computed values.' },
    { id: 'yt3', question: 'Why does the lecturer recommend ECC over RSA for mobile/IoT devices?', options: ['ECC is easier to implement', 'ECC has the same security with much smaller key sizes', 'ECC is faster on high-end hardware', 'ECC is open source'], correctIndex: 1, explanation: 'A 256-bit ECC key provides equivalent security to a 3072-bit RSA key — much more efficient for constrained devices.' },
  ];

  if (!loaded) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto text-left">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <span className="bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">YouTube Analyzer</span>
          </h1>
          <p className="text-gray-500 text-sm">Paste any lecture URL to get timestamped notes, a full summary, and an AI-generated quiz.</p>
        </motion.div>

        <Card className="p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">Paste a YouTube lecture URL</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
              <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLoad()}
                placeholder="https://youtube.com/watch?v=..." className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
            </div>
            <PrimaryButton onClick={handleLoad} loading={loading} disabled={!url.trim()}>
              {loading ? 'Analyzing…' : 'Analyze'}
              {!loading && <Sparkles className="w-4 h-4" />}
            </PrimaryButton>
          </div>
        </Card>

        {/* Video Preview Card */}
        {url.trim().length > 10 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="p-4 bg-white/4 border border-pink-500/20 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Youtube className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <Badge color="pink" className="mb-1">Detected Video</Badge>
                  <h4 className="text-xs font-bold text-white truncate max-w-md">{VIDEO_INFO.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{VIDEO_INFO.channel} · {VIDEO_INFO.duration} · 3 Chapters</p>
                </div>
              </div>
              <PrimaryButton size="sm" onClick={handleLoad} loading={loading} className="flex-shrink-0">
                Confirm & Analyze
              </PrimaryButton>
            </Card>
          </motion.div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Or try a featured lecture:</p>
          {[
            { title: 'Asymmetric Cryptography Explained — RSA, ECC, TLS', channel: 'CS Simplified', duration: '34:22', url: SAMPLE_URL },
            { title: 'SQL Injection Attack Tutorial — OWASP Top 10', channel: 'Security Now', duration: '28:10', url: 'https://youtube.com' },
            { title: 'System Design: Designing a CDN', channel: 'Exponent', duration: '41:55', url: 'https://youtube.com' },
          ].map(v => (
            <button key={v.title} onClick={() => { setUrl(v.url); setLoading(true); setTimeout(() => { setLoading(false); setLoaded(true); chatContext(v.title); }, 2000); }}
              className="w-full flex items-center gap-3 p-3 bg-white/3 hover:bg-white/6 border border-white/7 hover:border-pink-500/30 rounded-xl transition-all text-left group">
              <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Youtube className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate transition-colors">{v.title}</p>
                <p className="text-xs text-gray-600">{v.channel} · {v.duration}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-pink-400 flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const YT_TABS: { id: YTTab; label: string }[] = [
    { id: 'timestamps', label: 'Timestamped Notes' },
    { id: 'summary', label: 'Topic Summary' },
    { id: 'quiz', label: 'Quiz' },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left: Video */}
      <div className="flex-1 flex flex-col overflow-hidden text-left bg-black">
        {/* Video embed frame */}
        <div className="bg-black relative flex-shrink-0" style={{ paddingTop: '48%' }}>
          <iframe
            key={videoStartTime}
            className="absolute inset-0 w-full h-full"
            src={getEmbedUrl(url || SAMPLE_URL, videoStartTime)}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="p-4 flex items-center gap-2 border-t border-white/7 bg-[#050505]">
          <Badge color="pink"><Youtube className="w-3 h-3" />{VIDEO_INFO.channel}</Badge>
          <Badge color="gray">{VIDEO_INFO.views} views</Badge>
          <button onClick={() => { setLoaded(false); setUrl(''); setVideoStartTime(0); }} className="ml-auto text-xs text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1"><RotateCcw className="w-3 h-3" />New Video</button>
        </div>
      </div>

      {/* Right: Analysis */}
      <div className="w-80 lg:w-96 border-l border-white/7 flex flex-col flex-shrink-0 bg-[#08090D] text-left">
        <div className="flex items-center gap-1 p-3 border-b border-white/7 flex-shrink-0">
          {YT_TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all', activeTab === t.id ? 'bg-pink-600/20 text-pink-400 border border-pink-500/25' : 'text-gray-600 hover:text-gray-300')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'timestamps' && (
              <motion.div key="ts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <p className="text-[10px] text-gray-600 mb-3 font-semibold uppercase tracking-wider">Click a timestamp to jump in video:</p>
                {(apiTimestamps ?? MOCK_TIMESTAMPS).map(ts => (
                  <button key={ts.time}
                    onClick={() => {
                      const secs = parseTimestampToSeconds(ts.time);
                      setVideoStartTime(secs);
                    }}
                    className="w-full text-left p-3 bg-white/3 hover:bg-pink-500/8 border border-white/7 hover:border-pink-500/25 rounded-xl transition-all group">
                    <div className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono text-pink-400 bg-pink-500/15 px-1.5 py-0.5 rounded flex-shrink-0 font-bold">{ts.time}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">{ts.topic}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{ts.note}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
            {activeTab === 'summary' && (
              <motion.div key="sum" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-4 bg-white/3">
                  <div className="space-y-2 text-xs text-gray-400 leading-relaxed font-sans">
                    {(apiSummary ?? MOCK_VIDEO_SUMMARY).split('\n').map((line, i) => {
                      if (line.startsWith('## ')) return <p key={i} className="text-sm font-bold text-white font-sans">{line.replace('## ', '')}</p>;
                      if (line.startsWith('### ')) return <p key={i} className="text-xs font-bold text-pink-300 uppercase tracking-wide mt-3 font-sans">{line.replace('### ', '')}</p>;
                      if (line.startsWith('- ')) return <p key={i} className="flex items-start gap-1.5 font-sans"><span className="text-pink-400 mt-0.5 flex-shrink-0">•</span>{line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      if (!line.trim()) return <div key={i} className="h-1" />;
                      return <p key={i} className="font-sans">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                    })}
                  </div>
                </Card>
              </motion.div>
            )}
            {activeTab === 'quiz' && (
              <motion.div key="ytq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {YT_QUIZ.map((q, qi) => {
                  const answered = quizAnswers[q.id] !== undefined;
                  return (
                    <div key={q.id} className="p-4 bg-white/3 border border-white/7 rounded-xl text-left">
                      <p className="text-xs font-semibold text-white mb-3 font-sans">{qi + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const isCorrect = oi === q.correctIndex;
                          const isSelected = quizAnswers[q.id] === oi;
                          return (
                            <button key={oi} onClick={() => !answered && setYTQuizAnswers(a => ({ ...a, [q.id]: oi }))} disabled={answered}
                              className={cn('w-full text-left px-3 py-2 rounded-lg text-xs transition-all border font-sans',
                                !answered && 'border-white/8 hover:border-pink-500/30 hover:bg-pink-500/6 text-gray-400',
                                answered && isSelected && isCorrect && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                                answered && isSelected && !isCorrect && 'border-red-500/40 bg-red-500/10 text-red-300',
                                answered && !isSelected && isCorrect && 'border-emerald-500/25 text-emerald-400',
                              )}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          );
                        })}
                      </div>
                      {answered && <p className="text-xs text-gray-500 mt-2 italic font-sans">{q.explanation}</p>}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── ROADMAP PAGE ─────────────────────────────────────────────────────────────

function RoadmapPage({ defaultTrack, userId = 'demo' }: { defaultTrack: Track; userId?: string }) {
  const [selectedTrack, setSelectedTrack] = useState<Track>(defaultTrack);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>('c2');

  const handleGenerate = (track: Track) => {
    setSelectedTrack(track);
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); setExpandedId(ROADMAPS[track][1].id); }, 1800);
  };

  const milestones = ROADMAPS[selectedTrack];
  const statusColors: Record<string, string> = { completed: '#10b981', 'in-progress': '#4F46E5', available: '#f59e0b', locked: '#374151' };
  const statusLabels: Record<string, string> = { completed: '✓ Done', 'in-progress': '⚡ Active', available: '→ Up Next', locked: '🔒 Locked' };
  const trackInfo = TRACKS.find(t => t.id === selectedTrack);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AI Roadmap Generator</span>
        </h1>
        <p className="text-gray-500 text-sm">Select your track for a personalized, milestone-based learning path.</p>
      </motion.div>

      {/* Track selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TRACKS.map(track => (
          <button key={track.id} onClick={() => handleGenerate(track.id as Track)}
            className={cn('flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all',
              selectedTrack === track.id ? 'text-white' : 'border-white/8 text-gray-500 hover:text-gray-200 hover:border-white/18')}
            style={selectedTrack === track.id ? { background: `${track.color}20`, borderColor: `${track.color}45`, color: track.color } : {}}>
            <track.icon className="w-3.5 h-3.5" />
            {track.label}
          </button>
        ))}
      </div>

      {generating && (
        <div className="text-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="inline-block mb-4">
            <Wand2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-lg font-bold text-white mb-2">Generating your roadmap…</h2>
          <p className="text-gray-600 text-sm">Curating milestones and resources for {TRACKS.find(t => t.id === selectedTrack)?.label}</p>
          <div className="flex justify-center mt-4"><AIThinkingDots /></div>
        </div>
      )}

      {generated && !generating && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Overview */}
          <div>
            <Card className="p-5 sticky top-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${trackInfo?.color}18` }}>
                  {trackInfo && <trackInfo.icon className="w-5 h-5" style={{ color: trackInfo.color }} />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>{trackInfo?.label}</h3>
                  <p className="text-xs text-gray-600">{milestones.length} milestones</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: statusColors[m.status] }} />
                    <p className="text-xs text-gray-500 truncate">{m.title}</p>
                  </div>
                ))}
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${(milestones.filter(m => m.status === 'completed').length / milestones.length) * 100}%` }} />
              </div>
              <p className="text-xs text-gray-600 mt-2">{milestones.filter(m => m.status === 'completed').length}/{milestones.length} milestones complete</p>
            </Card>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/50 to-white/8 rounded-full" />
              <div className="space-y-4">
                {milestones.map((m, i) => {
                  const isExpanded = expandedId === m.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative pl-10">
                      {/* Status dot */}
                      <div className="absolute left-0 top-4 w-8 h-8 rounded-full border-2 flex items-center justify-center"
                        style={{ background: statusColors[m.status], borderColor: `${statusColors[m.status]}50` }}>
                        {m.status === 'completed' && <Check className="w-4 h-4 text-white" />}
                        {m.status === 'in-progress' && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 bg-white rounded-full" />}
                        {m.status === 'available' && <ArrowRight className="w-3.5 h-3.5 text-white" />}
                        {m.status === 'locked' && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                      </div>

                      <Card className={cn('overflow-hidden transition-all', m.status === 'locked' && 'opacity-60', m.status === 'in-progress' && 'border-indigo-500/30')}>
                        <button className="w-full p-5 text-left" onClick={() => setExpandedId(isExpanded ? null : m.id)}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${statusColors[m.status]}20`, color: statusColors[m.status] }}>
                                  {statusLabels[m.status]}
                                </span>
                                <span className="text-xs text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{m.duration}</span>
                              </div>
                              <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>{m.title}</h3>
                              <p className="text-xs text-gray-600 mt-0.5">{m.description}</p>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="px-5 pb-5 border-t border-white/7 pt-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Topics</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {m.topics.map(t => <Badge key={t} color="gray">{t}</Badge>)}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Resources</p>
                                    <div className="space-y-1">
                                      {m.resources.map(r => (
                                        <p key={r} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors">
                                          <ExternalLink className="w-3 h-3" />{r}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {m.status === 'available' && (
                                  <div className="mt-4"><PrimaryButton size="sm" onClick={() => api.updateMilestone(userId, m.id, 'in-progress').catch(() => {})}><Play className="w-3.5 h-3.5" fill="currentColor" />Start This Milestone</PrimaryButton></div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS PAGE ────────────────────────────────────────────────────────────

function ProgressPage({ user, userId = 'demo' }: { user: UserProfile; userId?: string }) {
  const HEATMAP_DATA = Array.from({ length: 91 }, (_, i) => ({
    day: i,
    count: Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 0,
  }));
  const WEAK_TOPICS = [
    { topic: 'Cryptography — Hash Functions', accuracy: 62, color: '#ef4444' },
    { topic: 'Forensics — Memory Analysis', accuracy: 68, color: '#f59e0b' },
    { topic: 'Network — VLAN Configuration', accuracy: 71, color: '#f59e0b' },
    { topic: 'AppSec — SSRF Exploitation', accuracy: 74, color: '#f59e0b' },
    { topic: 'Pen Testing — Privilege Escalation', accuracy: 77, color: '#10b981' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Progress & Analytics</span>
        </h1>
        <p className="text-gray-500 text-sm">Deep dive into your learning performance across all modules.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Study Hours', value: `${user.totalStudyHours}h`, icon: Clock, color: '#4F46E5' },
          { label: 'Avg Quiz Score', value: '83%', icon: Target, color: '#10b981' },
          { label: 'Quizzes Taken', value: '47', icon: CheckCircle, color: '#f59e0b' },
          { label: 'Best Streak', value: '14d', icon: Flame, color: '#f97316' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">{s.label}</p>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Study hours chart */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <p className="text-sm font-semibold text-gray-300 mb-4">Study Hours Over Time</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={PROGRESS_DATA}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                <XAxis dataKey="week" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Week ', 'W')} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="studyHours" name="Study Hours" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Subject breakdown */}
        <div>
          <Card className="p-5">
            <p className="text-sm font-semibold text-gray-300 mb-4">Hours by Subject</p>
            <div className="space-y-3">
              {SUBJECT_DATA.map(s => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 truncate mr-2">{s.subject}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono text-gray-400">{s.accuracy}%</span>
                      <span className="text-xs text-gray-700">{s.hours}h</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.hours / 18) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full" style={{ background: s.fill }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Streak Heatmap */}
      <Card className="p-5 mb-6">
        <p className="text-sm font-semibold text-gray-300 mb-4">Activity Heatmap — Last 13 Weeks</p>
        <div className="grid grid-cols-13 gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
          {/* Build 13×7 grid */}
          {Array.from({ length: 13 }, (_, week) => (
            <div key={week} className="space-y-1">
              {Array.from({ length: 7 }, (_, day) => {
                const idx = week * 7 + day;
                const count = HEATMAP_DATA[idx]?.count ?? 0;
                const intensities = ['bg-white/4', 'bg-indigo-900/60', 'bg-indigo-600/70', 'bg-indigo-400/80', 'bg-indigo-300'];
                return <div key={day} className={cn('w-full aspect-square rounded-sm', intensities[Math.min(count, 4)])} title={`${count} study sessions`} />;
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-700">
          <span>Less</span>
          {['bg-white/4', 'bg-indigo-900/60', 'bg-indigo-600/70', 'bg-indigo-400/80', 'bg-indigo-300'].map((c, i) => <div key={i} className={cn('w-3 h-3 rounded-sm', c)} />)}
          <span>More</span>
        </div>
      </Card>

      {/* Weak topics */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-semibold text-gray-300">Topics Needing Review</p>
          <Badge color="amber">AI Detected</Badge>
        </div>
        <div className="space-y-3">
          {WEAK_TOPICS.map(t => (
            <div key={t.topic} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 truncate">{t.topic}</p>
                <div className="h-1.5 bg-white/6 rounded-full mt-1.5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${t.accuracy}%` }} transition={{ duration: 0.8 }}
                    className="h-full rounded-full" style={{ background: t.color }} />
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="text-sm font-bold font-mono" style={{ color: t.color }}>{t.accuracy}%</span>
              </div>
              <PrimaryButton size="sm" variant="secondary">Review</PrimaryButton>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────

function SettingsPage({
  user, theme, setTheme, onTrackChange,
  isEmptyState = false, setIsEmptyState,
  isLoadingState = false, setIsLoadingState
}: {
  user: UserProfile; theme: Theme; setTheme: (t: Theme) => void; onTrackChange: (t: Track) => void;
  isEmptyState?: boolean; setIsEmptyState?: (v: boolean) => void;
  isLoadingState?: boolean; setIsLoadingState?: (v: boolean) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ dailyReminder: true, weeklyReport: true, streakAlert: true, achievements: true });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile, track, and preferences.</p>
      </motion.div>

      <div className="space-y-5">
        {/* Profile */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><User className="w-4 h-4" />Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-black text-white flex-shrink-0">
              {user.name[0]}
            </div>
            <div>
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge color="indigo">Lv.3 Practitioner</Badge>
                <Badge color="amber"><Zap className="w-3 h-3" />{user.xp} XP</Badge>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <InputField label="Full Name" icon={User} value={name} onChange={setName} />
            <InputField label="Email" icon={Mail} type="email" value={email} onChange={setEmail} />
          </div>
          <div className="mt-3">
            <PrimaryButton onClick={handleSave} loading={saved}>
              {saved ? <><Check className="w-4 h-4" />Saved!</> : 'Save Changes'}
            </PrimaryButton>
          </div>
        </Card>

        {/* Learning Track */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4" />Learning Track</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {TRACKS.map(track => (
              <button key={track.id} onClick={() => onTrackChange(track.id as Track)}
                className={cn('flex items-center gap-2.5 p-3 border rounded-xl text-left transition-all', user.track === track.id ? 'border-indigo-500/40 bg-indigo-600/12' : 'border-white/7 hover:border-white/15 hover:bg-white/4')}>
                <track.icon className="w-4 h-4 flex-shrink-0" style={{ color: track.color }} />
                <span className="text-sm font-medium text-gray-300">{track.label}</span>
                {user.track === track.id && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
              </button>
            ))}
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">{theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Theme</p>
              <p className="text-xs text-gray-600">Choose your preferred color scheme</p>
            </div>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium capitalize transition-all', theme === t ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : 'border-white/8 text-gray-600 hover:text-gray-300')}>
                  {t === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}{t}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><Bell className="w-4 h-4" />Notifications</h2>
          <div className="space-y-3">
            {Object.entries(notifs).map(([key, val]) => {
              const labels: Record<string, { label: string; desc: string }> = {
                dailyReminder: { label: 'Daily Study Reminder', desc: 'Get reminded to study at your preferred time' },
                weeklyReport: { label: 'Weekly Progress Report', desc: 'Summary of your week sent every Sunday' },
                streakAlert: { label: 'Streak Risk Alert', desc: 'Alert if your streak is about to break' },
                achievements: { label: 'Achievement Unlocks', desc: 'Celebrate when you hit milestones' },
              };
              return (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{labels[key].label}</p>
                    <p className="text-xs text-gray-600">{labels[key].desc}</p>
                  </div>
                  <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                    className={cn('w-11 h-6 rounded-full transition-all relative', val ? 'bg-indigo-600' : 'bg-white/12')}>
                    <motion.div animate={{ x: val ? 22 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="p-5 border-red-500/15">
          <h2 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Reset All Progress</p>
              <p className="text-xs text-gray-600">This will delete all your study data and XP</p>
            </div>
            <PrimaryButton variant="danger" size="sm">Reset Data</PrimaryButton>
          </div>
        </Card>

        {/* Developer Sandbox Controls */}
        <Card className="p-5 border-indigo-500/20">
          <h2 className="text-sm font-semibold text-indigo-400 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" />Developer Sandbox Controls</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Force Empty State</p>
                <p className="text-xs text-gray-605">Simulate dashboard when first onboarded without files</p>
              </div>
              <button onClick={() => setIsEmptyState?.(!isEmptyState)}
                className={cn('w-11 h-6 rounded-full transition-all relative', isEmptyState ? 'bg-indigo-600' : 'bg-white/12')}>
                <motion.div animate={{ x: isEmptyState ? 22 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Force Skeleton Loading</p>
                <p className="text-xs text-gray-605">Simulate slow loading API response dashboard skeleton layout</p>
              </div>
              <button onClick={() => setIsLoadingState?.(!isLoadingState)}
                className={cn('w-11 h-6 rounded-full transition-all relative', isLoadingState ? 'bg-indigo-600' : 'bg-white/12')}>
                <motion.div animate={{ x: isLoadingState ? 22 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const DEFAULT_USER: UserProfile = {
  name: 'Prashanth',
  email: 'prashanth@example.com',
  track: 'cybersecurity',
  weeklyGoalHours: 10,
  avatar: 'P',
  joinedAt: new Date(),
  streak: 8,
  totalStudyHours: 47,
  xp: 1840,
};

type AppFlowPage = 'landing' | 'auth' | 'onboarding' | 'app';

function AppContent({ user, setUser, userId, theme, setTheme, onLogout }: {
  user: UserProfile; setUser: (u: UserProfile) => void; userId: string;
  theme: Theme; setTheme: (t: Theme) => void; onLogout: () => void;
}) {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCtx, setChatCtx] = useState('Network Security Fundamentals');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(false);

  // Check API health once on mount
  useEffect(() => {
    apiFetch('/health').then(({ data }) => setApiOnline(!!data)).catch(() => setApiOnline(false));
  }, []);

  const openChat = (ctx?: string) => { if (ctx) setChatCtx(ctx); setChatOpen(true); };
  const chatContext = (ctx: string) => setChatCtx(ctx);
  const sidebarW = sidebarCollapsed ? 68 : 236;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage user={user} setPage={setPage} chatContext={openChat} userId={userId} isEmptyState={isEmptyState} isLoadingState={isLoadingState} />;
      case 'pdf': return <PDFPage chatContext={chatContext} userId={userId} />;
      case 'image': return <ImageAnalyzerPage />;
      case 'youtube': return <YouTubePage chatContext={chatContext} />;
      case 'roadmap': return <RoadmapPage defaultTrack={user.track} userId={userId} />;
      case 'progress': return <ProgressPage user={user} userId={userId} />;
      case 'settings': return <SettingsPage user={user} theme={theme} setTheme={setTheme} onTrackChange={t => setUser({ ...user, track: t })} isEmptyState={isEmptyState} setIsEmptyState={setIsEmptyState} isLoadingState={isLoadingState} setIsLoadingState={setIsLoadingState} />;
      default: return <DashboardPage user={user} setPage={setPage} chatContext={openChat} userId={userId} isEmptyState={isEmptyState} isLoadingState={isLoadingState} />;
    }
  };

  return (
    <div className={cn('min-h-screen', theme === 'light' ? 'light bg-[#F8F9FC] text-[#1E1E2E]' : 'bg-[#08090D] text-white')}>
      {/* Sidebar */}
      <div className="hidden md:block">
        <AppSidebar page={page} setPage={setPage} user={user} onLogout={onLogout} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Main */}
      <div className="transition-all duration-300" style={{ marginLeft: sidebarW, paddingRight: chatOpen ? 384 : 0 }}>
        <TopBar page={page} user={user} onOpenChat={() => setChatOpen(true)} apiOnline={apiOnline} />
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#08090D]/95 backdrop-blur-xl border-t border-white/7 flex items-center justify-around px-2 py-2 z-40">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'pdf', icon: FileText },
          { id: 'youtube', icon: Youtube },
          { id: 'roadmap', icon: Map },
          { id: 'progress', icon: BarChart2 },
        ].map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => setPage(id as Page)}
            className={cn('p-3 rounded-xl transition-all', page === id ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-700 hover:text-gray-400')}>
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* App-Wide Floating Chat Tutor FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_8px_32px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.6)] flex items-center justify-center border border-indigo-400/30 transition-all focus:outline-none"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* AI Chat Tutor */}
      <AIChatTutor open={chatOpen} onClose={() => setChatOpen(false)} context={chatCtx} userId={userId} />
    </div>
  );
}

export default function App() {
  const [flow, setFlow] = useState<AppFlowPage>(() => {
    try { return localStorage.getItem('studyos-flow') as AppFlowPage || 'landing'; } catch { return 'landing'; }
  });
  const [authView, setAuthView] = useState<AuthView>('login');
  const [userId, setUserId] = useState<string>(() => {
    try { return localStorage.getItem('studyos-userid') || 'demo'; } catch { return 'demo'; }
  });
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('studyos-user');
      return saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER;
    } catch { return DEFAULT_USER; }
  });
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    try { localStorage.setItem('studyos-flow', flow); } catch {}
  }, [flow]);

  useEffect(() => {
    try { localStorage.setItem('studyos-user', JSON.stringify(user)); } catch {}
  }, [user]);

  const handleAuthSuccess = (name: string, email: string, uid?: string) => {
    const resolvedId = uid || `user_${email.replace(/[^a-z0-9]/gi, '_')}`;
    setUserId(resolvedId);
    setUser(u => ({ ...u, name, email }));
    try { localStorage.setItem('studyos-userid', resolvedId); } catch {}
    setFlow('onboarding');
  };

  const handleOnboardingComplete = (track: Track, hours: number) => {
    setUser(u => ({ ...u, track, weeklyGoalHours: hours }));
    // Persist track to backend
    api.updateUser(userId, { track, weeklyGoalHours: hours }).catch(() => {});
    setFlow('app');
  };

  const handleLogout = () => {
    setFlow('landing');
    try { localStorage.removeItem('studyos-flow'); localStorage.removeItem('studyos-userid'); } catch {}
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
      <AnimatePresence mode="wait">
        {flow === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onGetStarted={() => setFlow('auth')} />
          </motion.div>
        )}
        {flow === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthPage view={authView} setView={setAuthView} onSuccess={handleAuthSuccess} />
          </motion.div>
        )}
        {flow === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OnboardingPage step={1} name={user.name} onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
        {flow === 'app' && (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AppContent user={user} setUser={setUser} userId={userId} theme={theme} setTheme={setTheme} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
