import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { InputPage } from './pages/InputPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-text selection:bg-accent/30 selection:text-accent">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/analyze" element={<InputPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<ScanHistoryPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
