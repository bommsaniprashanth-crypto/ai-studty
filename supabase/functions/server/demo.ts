/** Offline demo payloads used when GEMINI_API_KEY is missing or invalid. */

export const DEMO_PDF_CHAPTERS = [
  {
    id: "ch1",
    title: "Chapter 1: Security Fundamentals",
    concepts: ["CIA Triad", "Threat Modeling", "Defense-in-Depth", "Attack Surface"],
    content:
      "Introduces the CIA triad (Confidentiality, Integrity, Availability), common threat vectors, and layered security controls used to protect systems.",
  },
  {
    id: "ch2",
    title: "Chapter 2: Cryptography Basics",
    concepts: ["Symmetric Encryption", "Asymmetric Encryption", "Hash Functions", "Digital Signatures"],
    content:
      "Covers symmetric vs asymmetric encryption, hashing (SHA-256), and how digital signatures provide authenticity and integrity.",
  },
  {
    id: "ch3",
    title: "Chapter 3: Network Security",
    concepts: ["Firewalls", "IDS/IPS", "VPN", "Zero Trust"],
    content:
      "Explains perimeter defenses, intrusion detection/prevention, secure remote access, and the shift toward zero-trust architectures.",
  },
];

export const DEMO_FLASHCARDS = [
  { id: "1", front: "What does CIA stand for in cybersecurity?", back: "Confidentiality, Integrity, and Availability — the three core principles of information security." },
  { id: "2", front: "What is a Man-in-the-Middle (MitM) attack?", back: "An attack where the adversary secretly intercepts and potentially alters communication between two parties." },
  { id: "3", front: "Difference between symmetric and asymmetric encryption?", back: "Symmetric uses the same key (AES). Asymmetric uses a public/private key pair (RSA, ECC)." },
  { id: "4", front: "What is SQL Injection?", back: "A code injection technique where malicious SQL is inserted into input fields to manipulate a backend database." },
  { id: "5", front: "Define Zero Trust Architecture", back: "A model requiring strict identity verification for every access attempt — never trust, always verify." },
];

export const DEMO_QUIZ = [
  {
    id: "1",
    question: "Which component of the CIA triad ensures data is only accessible to authorized parties?",
    options: ["Integrity", "Availability", "Confidentiality", "Authentication"],
    correctIndex: 2,
    explanation: "Confidentiality prevents unauthorized disclosure of sensitive information.",
  },
  {
    id: "2",
    question: "Which algorithm is symmetric?",
    options: ["RSA", "AES", "ECC", "Diffie-Hellman"],
    correctIndex: 1,
    explanation: "AES uses the same secret key for encryption and decryption.",
  },
  {
    id: "3",
    question: "What is the primary role of an IDS?",
    options: ["Block traffic", "Monitor and alert", "Encrypt packets", "Issue certificates"],
    correctIndex: 1,
    explanation: "An IDS detects suspicious activity and generates alerts.",
  },
  {
    id: "4",
    question: "Zero Trust default policy is:",
    options: ["Trust internal traffic", "Never trust, always verify", "Allow once authenticated", "Block all external traffic"],
    correctIndex: 1,
    explanation: "Zero Trust assumes no implicit trust based on network location.",
  },
  {
    id: "5",
    question: "Which phase follows Detection in NIST IR?",
    options: ["Recovery", "Preparation", "Eradication", "Containment"],
    correctIndex: 3,
    explanation: "NIST IR: Preparation → Detection → Containment → Eradication → Recovery.",
  },
];

export const DEMO_INTERVIEW = [
  { id: "iq1", question: "Explain the difference between IDS and IPS.", answer: "An IDS monitors and alerts on suspicious activity. An IPS can actively block malicious traffic inline." },
  { id: "iq2", question: "How does TLS provide secure communication?", answer: "TLS authenticates the server via certificates, negotiates session keys, and encrypts data in transit." },
  { id: "iq3", question: "What is defense-in-depth?", answer: "Layering multiple security controls so that if one fails, others still protect critical assets." },
  { id: "iq4", question: "Describe SQL injection mitigation.", answer: "Use parameterized queries/prepared statements, input validation, least-privilege DB accounts, and WAF rules." },
  { id: "iq5", question: "Why is network segmentation important?", answer: "It limits lateral movement and reduces blast radius if one segment is compromised." },
];

export const DEMO_IMAGE = {
  annotations: [
    { id: 1, x: 22, y: 18, label: "Client", color: "#4F46E5" },
    { id: 2, x: 50, y: 18, label: "Firewall", color: "#f59e0b" },
    { id: 3, x: 78, y: 18, label: "Web Server", color: "#10b981" },
    { id: 4, x: 50, y: 65, label: "IDS/IPS", color: "#ec4899" },
    { id: 5, x: 22, y: 65, label: "Internet", color: "#06b6d4" },
    { id: 6, x: 78, y: 65, label: "DB Server", color: "#8b5cf6" },
  ],
  explanations: [
    { id: 1, label: "Client", color: "#4F46E5", text: "End-user device initiating requests from outside the trusted network." },
    { id: 2, label: "Firewall", color: "#f59e0b", text: "Filters traffic using ACL rules — the first perimeter checkpoint." },
    { id: 3, label: "Web Server", color: "#10b981", text: "Hosts the application in the DMZ, separated from internal systems." },
    { id: 4, label: "IDS/IPS", color: "#ec4899", text: "Monitors traffic for attacks; IPS can block malicious packets inline." },
    { id: 5, label: "Internet", color: "#06b6d4", text: "Untrusted external network boundary." },
    { id: 6, label: "DB Server", color: "#8b5cf6", text: "Internal database reachable only from trusted application tiers." },
  ],
  notes:
    "**Defense-in-Depth Architecture**\n- **Perimeter Layer:** Firewall with stateful inspection\n- **Detection Layer:** IDS/IPS for anomaly and signature detection\n- **Application Layer:** Web server in DMZ\n- **Data Layer:** Segmented database tier",
  concepts: ["Defense-in-Depth", "Network Segmentation", "DMZ", "Stateful Inspection", "IDS vs IPS", "ACL", "Zero Trust", "Blast Radius"],
  quiz: [
    { id: "iq1", question: "Which component sits between the Internet and the Web Server?", options: ["IDS/IPS", "Database", "Firewall", "Client"], correctIndex: 2, explanation: "The firewall is the first security checkpoint for inbound traffic." },
    { id: "iq2", question: "What pattern does this diagram represent?", options: ["Flat network", "Defense-in-depth", "Air-gapped network", "Peer-to-peer"], correctIndex: 1, explanation: "Multiple layered controls protect critical assets." },
    { id: "iq3", question: "Why is the DB Server segmented?", options: ["Performance", "Reduce blast radius", "HTTP requirement", "Reduce latency"], correctIndex: 1, explanation: "Segmentation limits exposure if the web tier is compromised." },
  ],
};

export const DEMO_YOUTUBE = {
  title: "Asymmetric Cryptography Explained — RSA, ECC, TLS",
  channel: "CS Simplified",
  duration: "34:22",
  timestamps: [
    { time: "0:45", topic: "Introduction to Asymmetric Cryptography", note: "Overview of public/private key infrastructure and RSA concepts." },
    { time: "3:20", topic: "RSA Key Generation", note: "Choose primes p and q, compute n = p×q, select e, compute d." },
    { time: "7:15", topic: "Diffie-Hellman Key Exchange", note: "Parties agree on prime p and base g, then derive a shared secret." },
    { time: "12:40", topic: "Elliptic Curve Cryptography (ECC)", note: "Smaller keys with equivalent security to large RSA keys." },
    { time: "18:05", topic: "Digital Signatures", note: "Hash message, sign with private key, verify with public key." },
    { time: "24:30", topic: "PKI and Certificate Authorities", note: "Certificate chains bind identities to public keys." },
  ],
  summary:
    "## Asymmetric Cryptography: From RSA to TLS\n\nThis lecture covers public-key cryptography foundations and practical TLS usage.\n\n### Main Topics Covered\n- **RSA Algorithm** — Key generation and trapdoor functions\n- **Diffie-Hellman Exchange** — Shared secrets over insecure channels\n- **Elliptic Curve Cryptography** — Efficient modern alternative\n- **Digital Signatures** — Authenticity and non-repudiation\n- **PKI & TLS** — Certificate chains and secure handshakes\n\n### Key Insight\nSecurity relies on trapdoor functions that are easy one way but hard to reverse without secret information.",
  quiz: [
    { id: "yt1", question: "Which trapdoor function does RSA rely on?", options: ["Multiplying large numbers", "Factoring the product of two large primes", "Computing discrete logarithms", "Solving elliptic curve equations"], correctIndex: 1, explanation: "RSA security depends on the difficulty of factoring n = p×q." },
    { id: "yt2", question: "Diffie-Hellman requires agreement on which public values?", options: ["Private keys p and q", "Public prime p and generator g", "Shared secret and salt", "Certificate and CA signature"], correctIndex: 1, explanation: "Both parties publicly agree on prime p and base g." },
    { id: "yt3", question: "Why prefer ECC for mobile/IoT?", options: ["Easier to implement", "Same security with smaller keys", "Faster on high-end hardware", "Open source only"], correctIndex: 1, explanation: "256-bit ECC ≈ 3072-bit RSA security with less overhead." },
  ],
};

export const DEMO_PDF_TEXT =
  "Network Security Fundamentals — CIA triad, cryptography, firewalls, IDS/IPS, zero trust, and incident response.";
