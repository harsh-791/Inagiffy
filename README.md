# Inagiffy - AI-Powered Interactive Learning Maps

Inagiffy is a full-stack web application that generates beautiful, interactive learning roadmaps for any topic using AI. Simply enter a topic, and watch as AI breaks it down into structured branches, subtopics, and learning resources.

![Inagiffy](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [JSON Schema Reference](#json-schema-reference)
- [Deployment](#deployment)
- [Example Usage](#example-usage)

---

## Features

- **AI-Powered Generation**: Uses Google Gemini API to generate structured learning roadmaps
- **Interactive Visualization**: Beautiful, expandable node-based maps using React Flow
- **Learning Levels**: Support for Beginner, Intermediate, and Advanced levels
- **Resource Links**: Each subtopic includes curated learning resources (articles, videos, books)
- **Export Functionality**: Download your roadmap as JSON
- **Responsive Design**: Modern UI with TailwindCSS
- **Type-Safe**: Full TypeScript implementation for both frontend and backend

---

## Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Flow** - Interactive node-based visualization
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Google Gemini API** - AI integration
- **Zod** - Schema validation

---

## Project Structure

```
Inagiffy/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── TopicInput.tsx
│   │   │   └── LearningMap.tsx
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/               # Express backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   │   └── generateMap.ts
│   │   ├── services/      # Business logic
│   │   │   └── llmService.ts
│   │   └── index.ts       # Express server setup
│   ├── package.json
│   └── tsconfig.json
│
├── package.json           # Root workspace config
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Inagiffy
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

Or install manually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run the Application

#### Option A: Run Both Frontend and Backend Together

```bash
npm run dev
```

#### Option B: Run Separately

**Terminal 1 - Backend:**

```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**

```bash
npm run dev:frontend
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## Running Locally

### Development Mode

```bash
npm run dev
```

This starts both the frontend (Vite dev server) and backend (Express with tsx watch) concurrently.

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start backend (after build)
cd backend && npm start
```

---

## API Documentation

### Base URL

```
http://localhost:3001 (development)
https://your-backend-url.com (production)
```

### Endpoints

#### `POST /api/generate-map`

Generates a learning roadmap for the given topic.

**Request Body:**

```json
{
  "topic": "Web Development",
  "level": "intermediate"
}
```

**Parameters:**

- `topic` (string, required): The subject to generate a roadmap for
- `level` (string, optional): Learning level - `"beginner"`, `"intermediate"`, or `"advanced"`. Defaults to `"intermediate"`.

**Response:**

```json
{
  "success": true,
  "data": {
    "topic": "Web Development",
    "branches": [
      {
        "name": "Frontend",
        "description": "Building the client-facing part of web apps.",
        "subtopics": [
          {
            "name": "HTML",
            "description": "Markup for web pages.",
            "resources": [
              {
                "type": "Article",
                "title": "MDN HTML Guide",
                "url": "https://developer.mozilla.org/en-US/docs/Web/HTML"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Error Response:**

```json
{
  "error": "Invalid request",
  "details": [...]
}
```

#### `GET /health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "message": "Inagiffy API is running"
}
```

---

## JSON Schema Reference

The learning roadmap follows this structure:

```typescript
interface LearningRoadmap {
  topic: string;
  branches: Branch[];
}

interface Branch {
  name: string;
  description: string;
  subtopics: Subtopic[];
}

interface Subtopic {
  name: string;
  description: string;
  resources: LearningResource[];
}

interface LearningResource {
  type: "Article" | "Video" | "Book" | "Course";
  title: string;
  url: string;
}
```

---

## Example Usage

### Example 1: Generate a Roadmap

```bash
curl -X POST http://localhost:3001/api/generate-map \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Machine Learning",
    "level": "beginner"
  }'
```

### Example 2: Prompt Engineering

The system uses a two-prompt approach:

**System Prompt:**

> You are an expert educational content planner and topic mapper. Given a subject, you generate a structured, hierarchical roadmap breaking it into subtopics, with short descriptions and 1–2 recommended resources per subtopic.

**User Prompt:**

> Generate a learning roadmap for: `{topic}`. Tailor it for `{level}` learners. Include 3–6 main branches, each with 3–5 subtopics and 1–2 learning resources (article/video/book). Respond only with valid JSON.

---

## UI Features

- **Interactive Node Map**: Drag, zoom, and explore the learning roadmap
- **Resource Links**: Click on resource links to open learning materials
- **Export JSON**: Download your roadmap for offline use or sharing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during roadmap generation
- **Error Handling**: Clear error messages for troubleshooting