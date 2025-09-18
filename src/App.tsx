import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Live from './pages/Live';
import MatchDetailsPage from './pages/MatchDetails';
import LeagueOverview from './pages/LeagueOverview';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPost';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/live" element={<Live />} />
              <Route path="/match/:matchId" element={<MatchDetailsPage />} />
              <Route path="/leagues" element={<LeagueOverview />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
