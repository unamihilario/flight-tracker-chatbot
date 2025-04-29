# TeoBot - Flight Assistant Chatbot

TeoBot is a web-based chatbot that helps users track flights and engage in conversations. It features a modern dark-themed UI with interactive features similar to popular messaging applications.

## Features

- **Flight Tracking**: Track domestic and international flights
- **AI-Powered Chat**: Engage in conversations using Google's Gemini AI
- **Interactive UI**: Modern dark theme with message bubbles and typing indicators
- **Real-time Updates**: Simulated flight status information

## Project Structure

- `/src`: Frontend React code
  - `/components`: UI components
  - `/context`: React context for state management
  - `/services`: API service layer
- `/server`: Backend Node.js server
  - `server.js`: Express server with API endpoints
  - `.env.example`: Example environment variables

## Setup Instructions

### Frontend Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## API Keys

The application requires two API keys:

1. **Google Gemini API Key**: For the AI chat functionality
2. **Aerodatabox API Key**: For flight tracking

Find these keys two int the `.env` file in the server directory.

## Development Notes

- The frontend is built with HTML/React and styled with CSS/Tailwind CSS
- The application uses a context-based state management system
- The backend API is built with Express
- Both real APIs and mock data are supported for development

## Production Deployment

For production deployment:

1. Build the frontend:
   ```
   npm run build
   ```
2. Set NODE_ENV to "production" in your server's .env file
3. Deploy the static build files and the Express server
