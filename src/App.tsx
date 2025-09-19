import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Live from './pages/Live';
import MatchDetailsPage from './pages/MatchDetails';
import LeagueOverview from './pages/LeagueOverview';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <Header />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/live" element={<Live />} />
              <Route path="/match/:matchId" element={<MatchDetailsPage />} />
              <Route path="/leagues" element={<LeagueOverview />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
