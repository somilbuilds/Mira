# Mira — Dream Tracking Agent

Mira is an intelligent dream journaling and analysis application. It allows you to log your dreams throughout the day, providing structured fields for deeper tracking. The integrated AI analyzes your entries, extracts vivid summaries, and identifies key sentiments. All data is securely stored and embedded into a vector database, enabling a powerful RAG (Retrieval-Augmented Generation) chat interface where you can explore the recurring themes and hidden depths of your past dreams.

---

## 🌟 Features

- **Detailed Dream Logging**: Log your dreams using a combination of free-text and structured data (Number of people, Names, Roles, Location, Lucidity Level, Nightmare toggle).
- **AI-Powered Analysis**: The Gemini AI analyzes each entry, generating a beautifully rephrased, vivid summary and extracting exactly 3 dominant sentiments.
- **Global RAG Chat Room**: A dedicated chat interface to converse with Mira about all your past dreams. The RAG system dynamically pulls relevant past dream contexts based on your conversation.
- **Chat Tab Management**: Create, delete, and switch between different chat sessions. Mark specific conversations as "Important" (★) to commit them back into the RAG memory layer, teaching the AI based on your past conversations.
- **Sentiment Calendar**: Visual calendar representation showing the days you logged dreams, augmented with colored dots representing the specific sentiments identified by the AI.

---

## 🛠️ Technology Stack

- **Next.js** — Frontend framework and API routes.
- **Firebase** — Authentication (Google Sign-in) and potentially structured data storage.
- **Pinecone** — Vector database for embedding storage and similarity search (RAG).
- **Google Gemini API** — Powers the generative AI features, dream analysis, chat responses, and text embeddings (`gemini-2.5-flash`, `gemini-embedding-001`).
- **React** — UI component building.

---

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Mira
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and populate it with the necessary API keys and configuration:

```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name

# Firebase (Client & Admin)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

```
mira/
├── app/
│   ├── api/            # Next.js API routes (chat, entries, insights)
│   ├── app/            # Main application pages and routing
│   ├── globals.css     # Global styles and CSS variables
│   └── layout.js       # Root layout component
├── components/         # Reusable React components
│   ├── Calendar.js     # Sentiment visualization calendar
│   ├── ChatPanel.js    # Entry-specific chat (legacy/fallback)
│   ├── EntryHistory.js # List of past entries
│   ├── GlobalChat.js   # Main RAG chat interface
│   ├── JournalWriter.js# Dream entry creation form
│   └── MoodInsights.js # Analytics and insights
├── lib/                # Core logic and integrations
│   ├── auth-context.js # Firebase auth provider context
│   ├── firebase.js     # Firebase client initialization
│   ├── firebase-admin.js # Firebase admin initialization
│   ├── gemini.js       # Gemini API wrappers for chat, analysis, embeddings
│   └── pinecone.js     # Pinecone vector DB operations
└── ...
```