# NirvachanMitra — Indian Election Education Assistant


# 📖 About The Project
NirvachanMitra (निर्वाचन मित्र — meaning Election Friend) is a full-stack civic education platform designed to demystify the Indian election process for first-time and existing voters.
Millions of eligible voters in India lack awareness about how to register, how EVMs work, what the Model Code of Conduct means, and what happens on polling day. NirvachanMitra solves this with an interactive, bilingual, AI-powered experience — making civic education accessible to every Indian citizen.

Built for: Hack2Skill — Prompt War Hackathon
Core Challenge: Leverage prompt engineering to build a meaningful AI-powered application.


# ✨ Features
FeatureDescription🤖 AI ChatbotGoogle Gemini-powered assistant that answers any election-related query in a friendly Hindi-English tone🗺️ Electoral RoadmapStep-by-step interactive visual journey through the full Indian election cycle📚 Deep Dive ModulesDetailed explainers on EVM & VVPAT, SVEEP initiative, and Model Code of Conduct🎯 Civic QuizRandomized bilingual quiz to test your knowledge of Indian democracy🌐 Bilingual SupportFull English + Hindi (हिन्दी) language toggle🎨 Premium UIGlassmorphism dark mode design with smooth animations📱 ResponsiveWorks seamlessly on mobile, tablet, and desktop

# 🛠️ Tech Stack
# Frontend

HTML5, CSS3, Vanilla JavaScript
Glassmorphism UI Design System
Vite (build tool)

# Backend

Node.js
Express.js
Google Generative AI SDK (@google/generative-ai)

# AI

Google Gemini 2.0 Flash
Custom system prompt engineering for domain-specific persona

📂 Project Structure
nirvachanmitra/
├── src/
│   ├── main.js          # Frontend logic (Chat, Quiz, Language toggle)
│   └── style.css        # Design system & animations
├── .env                 # Environment variables (API keys) — DO NOT COMMIT
├── index.html           # Main application UI
├── server.js            # Express server & Gemini AI integration
├── vite.config.js       # Vite configuration & API proxy
└── package.json         # Dependencies and scripts

