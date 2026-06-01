import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';

import { useAuth } from './context/AuthContext';
import './index.css';

function App() {
  const { token, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            token && user ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/signup"
          element={
            token && user ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          }
        />

        <Route
          path="/"
          element={
            token && user ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={token && user ? '/' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;