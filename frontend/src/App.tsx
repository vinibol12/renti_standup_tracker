import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DailyUpdatePage } from './pages/DailyUpdate';
import { TeamViewPage } from './pages/TeamView';
import { HistoryPage } from './pages/History';
import { MainLayout } from './layouts/MainLayout';
import { AuthGuard } from './components/shared/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/daily" element={<DailyUpdatePage />} />
            <Route path="/team" element={<TeamViewPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Route>
        
        {/* Redirect root to daily page or login based on auth state */}
        <Route 
          path="*" 
          element={
            localStorage.getItem("currentUser") 
              ? <Navigate to="/daily" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
