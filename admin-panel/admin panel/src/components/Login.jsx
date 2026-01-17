import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { adminLogin } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
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
      // Dispatch the admin login action
      const result = await dispatch(adminLogin({ email, password }));
      
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
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
      </div>
    </div>
  );
};

export default Login;