import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SwingTrading } from './pages/SwingTrading';
import { ScalpTrading } from './pages/ScalpTrading';
import { Journal } from './pages/Journal';
import { Analysis } from './pages/Analysis';
import { Analytics } from './pages/Analytics';
import { TradeHistory } from './pages/TradeHistory';
import { Learning } from './pages/Learning';
import { Plans } from './pages/Plans';
import { Settings } from './pages/Settings';
import { Support } from './pages/Support';
import { Market } from './pages/Market';
import { AIInsights } from './pages/AIInsights';
import { Strategies } from './pages/Strategies';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/swing-trading" element={<SwingTrading />} />
              <Route path="/scalp-trading" element={<ScalpTrading />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<TradeHistory />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/market" element={<Market />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/strategies" element={<Strategies />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
