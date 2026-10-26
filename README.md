StudyOS: Agentic AI Academic Assistant

StudyOS is a full-stack web application that brings a student's scattered study material into one personalized learning workflow. It combines PDF analysis, diagram understanding, YouTube lecture summarization, an AI tutor, flashcards, and roadmap generation, and it tracks progress so later recommendations adapt to the learner.

Table of Contents
Overview
Features
Architecture
Tech Stack
Getting Started
Environment Variables
Project Structure
Usage
Roadmap
Contributing
License
Author
Overview

Students study from many places: lecture PDFs, handwritten diagrams, recorded videos, and online references. Most AI tools answer isolated questions but do not follow a student's progress or plan their study.

StudyOS addresses this with an agentic loop. The agent interprets the student's goal, selects the right tool, executes it, observes the result, and records the outcome in a progress-tracking module. That history then personalizes future recommendations, deadlines, and study goals.

Features
Module	What it does
Dashboard	Shows level and XP, course completion, daily goal, study streak, weekly goal, progress chart, upcoming deadlines, and AI recommendations.
PDF Learning Engine	Upload lecture notes, textbooks, or papers (text-based or scanned, up to 50 MB) and turn them into a study toolkit. A library tracks how much of each file has been studied.
Image & Diagram Analyzer	Upload diagrams, flowcharts, UML, or handwritten notes. The AI labels each component and explains it.
YouTube Analyzer + Tutor	Paste a lecture URL to get timestamped notes, a full summary, and an AI-generated quiz.
AI Roadmap Generator	Pick a track (Cybersecurity, Full Stack Dev, AI Engineering, Data Science, Cloud & DevOps) and get a milestone-based path with topics and resources.
AI Tutor	A chat tutor available from every page through the top bar and a floating button.
Flashcards	Generated from study material for quick revision.
Progress Tracking	Records studied topics, quiz performance, and goal completion to personalize later recommendations.
Architecture
Student request
      |
      v
+-------------+     +-------------------------------+
|  React UI   | --> |  Node.js / Express API        |
+-------------+     |                               |
                    |  Agentic loop                 |
                    |  1. Interpret goal            |
                    |  2. Select tool               |
                    |  3. Execute tool (Gemini)     |
                    |  4. Observe result            |
                    |  5. Record outcome            |
                    +---------------+---------------+
                                    |
              +---------------------+---------------------+
              |                                           |
      Tools (PDF, image, YouTube,                  MongoDB
      tutor, flashcards, roadmap)           (users, progress, library)

The agent chooses among these tools: PDF analysis, image and diagram analysis, YouTube lecture summarization, AI chat tutor, flashcard generation, and roadmap generation. Each outcome is saved so the progress module can personalize what comes next.

Tech Stack
Frontend: React, Vite
Backend: Node.js, Express
Database: MongoDB
AI: Google Gemini API (text and vision)
Getting Started
Prerequisites
Node.js 18 or later
MongoDB (local instance or MongoDB Atlas)
A Google Gemini API key
Installation
bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
Run the app
bash
# Terminal 1: start the backend
cd server
npm run dev

# Terminal 2: start the frontend
cd client
npm run dev

The frontend runs at http://localhost:5173 by default.

Environment Variables

Create a .env file inside the server/ folder:

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studyos
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret

Never commit your .env file. Make sure it is listed in .gitignore.

Project Structure

Adjust this to match your actual folders.

.
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Dashboard, PDF, Image, YouTube, Roadmap, Progress, Settings
│       ├── components/
│       └── ...
├── server/                 # Express backend
│   ├── routes/
│   ├── controllers/
│   ├── agent/              # Agentic loop and tool definitions
│   ├── models/             # MongoDB schemas
│   └── ...
└── README.md
Usage
Open the app and sign in.
Upload a PDF in PDF Learning, or paste a lecture link in YouTube + Tutor.
Use Image Analyzer for diagrams and handwritten notes.
Ask the AI Tutor questions from any page.
Pick a track in Roadmap to plan your study path.
Check Progress to see your streak, goals, and recommendations.
Roadmap
 User study to evaluate learning outcomes
 Spaced-repetition scheduling for flashcards
 Support for more video and document sources
 Exportable study reports
Contributing
