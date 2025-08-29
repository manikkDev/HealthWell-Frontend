# HealthWell Frontend

A modern React-based health assistance web application built with Vite, featuring AI-powered health analysis using Google's Generative AI.

## Features

- 🤖 AI-powered health document analysis
- 🎨 Modern, responsive UI with dark/light theme support
- 🌐 Multi-language support
- 📱 Mobile-friendly design
- 🔒 Secure user authentication
- 📄 Document upload and analysis
- 🎙️ Voice recognition support

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Google Generative AI** - AI-powered health analysis
- **CSS3** - Styling with modern features
- **ESLint** - Code linting

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google AI API key

## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### Getting Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HealthWell-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file with your actual API key
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_GOOGLE_AI_API_KEY`: Your Google AI API key
4. Deploy

### Manual Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Hero/           # Main hero section with AI features
│   ├── Navbar/         # Navigation component
│   ├── BackgroundEffects/ # Visual effects
│   └── ...
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
