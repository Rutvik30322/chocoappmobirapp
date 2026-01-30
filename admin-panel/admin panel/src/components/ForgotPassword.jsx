import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendAdminOtp, verifyAdminOtp, resetAdminPassword } from '../services/authService';
import styles from './Login.module.css';

const ForgotPassword = () => {
  const [step, setStep] = useState('mobile'); // 'mobile', 'otp', 'reset'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  // Timer for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendAdminOtp(mobile);
      setSuccess('OTP sent successfully. Please check your mobile.');
      setStep('otp');
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await handleSendOtp({ preventDefault: () => {} });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await verifyAdminOtp(mobile, otp);
      setSuccess('OTP verified successfully');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetAdminPassword(mobile, otp, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMobileStep = () => (
    <form className={styles.loginForm} onSubmit={handleSendOtp}>
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
      <button type="submit" disabled={loading}>
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  );

  const renderOtpStep = () => (
    <form className={styles.loginForm} onSubmit={handleVerifyOtp}>
      <div className={styles.formGroup}>
        <label htmlFor="otp">Enter OTP</label>
        <input
          type="text"
          id="otp"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
          maxLength={6}
          style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
          required
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem' }}>
          OTP sent to {mobile.substring(0, 3)}***{mobile.substring(6)}
        </p>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        {resendTimer > 0 ? (
          <span style={{ fontSize: '14px', color: '#666' }}>
            Resend OTP in {resendTimer}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b46c1',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
          >
            Resend OTP
          </button>
        )}
      </div>
    </form>
  );

  const renderResetStep = () => (
    <form className={styles.loginForm} onSubmit={handleResetPassword}>
      <div className={styles.formGroup}>
        <label htmlFor="newPassword">New Password</label>
        <input
          type="password"
          id="newPassword"
          placeholder="Enter new password (min 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <div className={styles.loginLogoIcon}>🔒</div>
          <h2 className={styles.loginTitle}>
            {step === 'mobile' && 'Forgot Password'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'reset' && 'Reset Password'}
          </h2>
          <p className={styles.loginSubtitle}>
            {step === 'mobile' && 'Enter your mobile number to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your mobile'}
            {step === 'reset' && 'Enter your new password'}
          </p>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        
        {step === 'mobile' && renderMobileStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'reset' && renderResetStep()}

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (step === 'mobile') {
                navigate('/login');
              } else {
                setStep('mobile');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b46c1',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
          >
            {step === 'mobile' ? 'Back to Login' : 'Change Mobile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
