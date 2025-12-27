# cc - AI-Powered Design Canvas

A modern web application combining a node-based canvas interface with AI chat capabilities to generate and manage design artifacts. Built with React 19, Convex, and TanStack Router.

## Features

*   **Infinite Canvas**: Interactive node-based interface powered by [xyflow](https://xyflow.com/).
*   **AI Assistant**: Integrated chat interface for generating designs, code, and artifacts.
*   **Real-time Collaboration**: Backend and real-time data powered by [Convex](https://convex.dev/).
*   **Secure Authentication**: User management via [Clerk](https://clerk.com/).
*   **Modern Stack**: Built with Vite, Tailwind CSS 4, and TanStack Router for performance and developer experience.

## Tech Stack

*   **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion
*   **Routing**: TanStack Router
*   **State & Data**: TanStack Query, Zustand, Convex
*   **Backend**: Convex (Backend-as-a-Service)
*   **Auth**: Clerk
*   **AI**: OpenAI Integration

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   [Bun](https://bun.sh/) (v1.0 or later)
*   Node.js (v20 or later recommended)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd cc
    ```

2.  **Install dependencies**
    ```bash
    bun install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```

    Fill in the required variables in `.env`:

    *   **Convex Configuration**:
        *   `CONVEX_DEPLOYMENT`: Your Convex deployment URL (generated in step 4).
        *   `VITE_CONVEX_URL`: Your Convex public URL (generated in step 4).
    *   **Authentication**:
        *   `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key.
    *   **AI Integration**:
        *   `VITE_MEGALLM_API_KEY`: API Key for MegaLLM (if used).
        *   `VITE_OPENAI_API_KEY`: OpenAI API Key.

4.  **Start the Backend (Convex)**
    Open a new terminal window and run:
    ```bash
    bunx convex dev
    ```
    This command will:
    *   Log you in to Convex.
    *   Create a new deployment (if one doesn't exist).
    *   Sync your schema and functions.
    *   Provide the values for `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` if they are missing.

5.  **Start the Frontend**
    In your main terminal, run:
    ```bash
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.

## Scripts

*   `bun run dev`: Start the development server.
*   `bun run build`: Build the application for production.
*   `bun run serve`: Preview the production build locally.
*   `bun run test`: Run the test suite using Vitest.
