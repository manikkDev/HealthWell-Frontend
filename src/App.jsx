import './App.css';
import BackgroundEffects from './components/BackgroundEffects/BackgroundEffects.jsx';
// Cursor animation removed for better mobile performance
import Hero from './components/Hero/Hero.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { UserProvider } from './contexts/UserContext.jsx';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <div className="App">
            {/* Cursor animation removed for better mobile performance */}
            <BackgroundEffects />
            <div className="content-wrapper">
              <Navbar />
              <Hero />
            </div>
          </div>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
