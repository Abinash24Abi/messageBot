import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const {
    register,
    loading,
    error,
    success,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('Profile picture must be under 1.5 MB');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      return alert('Phone number must be exactly 10 digits');
    }

    await register({
      name,
      email,
      password,
      phone,
      photo,
    });
  };

  return (
    <div className="glass-panel auth-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          className="title-glow"
          style={{
            fontSize: '2.2rem',
            marginBottom: '0.5rem',
          }}
        >
          WhatsApp Mini
        </h1>

        <p
          style={{
            color: '#64748b',
            fontSize: '0.95rem',
          }}
        >
          Async Message Delivery Automation Platform
        </p>
      </div>

      <div className="auth-tabs">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `auth-tab ${isActive ? 'active' : ''}`
          }
        >
          Login
        </NavLink>

        <NavLink
          to="/signup"
          className={({ isActive }) =>
            `auth-tab ${isActive ? 'active' : ''}`
          }
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
            Full Name
          </label>

          <input
            type="text"
            className="form-input"
            placeholder="John Doe"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Phone Number (Mandatory - 10 digits)
          </label>

          <input
            type="text"
            className="form-input"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 10)
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Profile Photo (Optional)
          </label>

          <input
            type="file"
            className="form-input"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ padding: '0.45rem' }}
          />

          {photo && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '0.5rem',
              }}
            >
              <img
                src={photo}
                alt="Preview"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #25d366',
                }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Email Address
          </label>

          <input
            type="email"
            className="form-input"
            placeholder="johndoe@example.com"
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
            placeholder="••••••••"
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
          style={{ marginTop: '1rem' }}
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default Signup;