# HealthWell Frontend

Welcome to the HealthWell Frontend project! This application provides a comprehensive health management solution, including document analysis, a health assistant chat, and IoT health monitoring integration.

## Features

- **Document Analysis**: Upload and analyze medical documents (PDF, DOCX, TXT, JPG, PNG) to get comprehensive health reports.
- **Health Assistant Chat**: Interact with an AI-powered health assistant for personalized advice and information.
- **IoT Health Monitoring**: (Future Perk) Integrate with IoT devices to track vital health metrics.
- **Multi-language Support**: Seamlessly switch between different languages for a localized experience.

## Tech Stack

- **Frontend**: React.js
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)
- **Styling**: CSS
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version recommended)
- npm (Node Package Manager)

## Environment Variables

This project requires the following environment variables to be set. Create a `.env` file in the `Frontend` directory and add the following:

- `VITE_GOOGLE_AI_API_KEY`: Your primary Google AI API key. Obtain it from [Google AI Studio](https://makersuite.google.com/app/apikey).
- `VITE_GOOGLE_AI_API_KEY_2`: Your secondary Google AI API key. This will be used if the primary key reaches its daily limit. Obtain it from [Google AI Studio](https://makersuite.google.com/app/apikey).

**Important**: Do not commit your `.env` file to version control. Use `.env.example` as a reference.

## Installation

1. **Clone the repository (if you haven't already):**

   ```bash
   git clone <your-repository-url>
   cd HealthWell/Frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in your browser. The page will reload when you make changes.
- `npm run build`: Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
- `npm run lint`: Lints the project files.
- `npm run preview`: Serves the `dist` folder locally for previewing the production build.

## Deployment

### Vercel Deployment

1. **Push your code to a GitHub repository.**
2. **Import your project into Vercel.**
3. **Configure Environment Variables in Vercel:**
   - Go to your project settings in the Vercel dashboard.
   - Navigate to "Environment Variables."
   - Add `VITE_GOOGLE_AI_API_KEY` and `VITE_GOOGLE_AI_API_KEY_2` with their respective values.
4. **Deploy:** Vercel will automatically build and deploy your application.

### Manual Build and Serve

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Serve the built application:**

   You can use a simple static file server like `serve`:

   ```bash
   npm install -g serve
   serve -s dist
   ```

## Project Structure

```
Frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, icons, etc.
│   ├── components/         # Reusable React components
│   ├── contexts/           # React Context API for global state
│   ├── hooks/              # Custom React hooks
│   ├── api/                # API service integrations
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Entry point of the React application
│   └── index.css           # Global styles
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project README
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'feat: Add new feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
