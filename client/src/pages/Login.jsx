import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const {
    login,
    loading,
    error,
    success,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(email, password);
  };

  return (
    <div className="glass-panel auth-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="title-glow">
          WhatsApp Mini
        </h1>
      </div>

      <div className="auth-tabs">
        <NavLink
          to="/login"
          className="auth-tab active"
        >
          Login
        </NavLink>

        <NavLink
          to="/signup"
          className="auth-tab"
        >
          Signup
        </NavLink>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Email Address
          </label>

          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;