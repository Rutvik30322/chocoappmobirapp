import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { adminLogin } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login with mobile number only
      const credentials = { mobile, password };

      // Dispatch the admin login action
      const result = await dispatch(adminLogin(credentials));
      
      if (result.meta.requestStatus === 'fulfilled') {
        // Login successful, navigate to dashboard
        navigate('/dashboard');
      } else {
        // Login failed
        setError(result.payload || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <div className={styles.loginLogoIcon}>🍫</div>
          <h2 className={styles.loginTitle}>Admin Portal</h2>
          <p className={styles.loginSubtitle}>Sign in to manage your chocolate shop</p>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              placeholder="Enter your 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').substring(0, 10))}
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b46c1',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;