import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Tv, Mail, Phone, Lock, User } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;


const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [otpShake, setOtpShake] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [focusedOtpIdx, setFocusedOtpIdx] = useState(-1);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const storeAuthAndNavigate = (data) => {
    localStorage.setItem('fantasy_token', data.token);
    localStorage.setItem('fantasy_user', JSON.stringify(data.user));
    setToken(data.token);
    navigate('/');
  };

  const startResendTimer = () => setResendTimer(RESEND_COOLDOWN);

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          setMaskedEmail(data.maskedEmail || '');
          setMaskedPhone(data.maskedPhone || '');
          setStep(2);
          setOtp(Array(OTP_LENGTH).fill(''));
          startResendTimer();
          setTimeout(() => otpRefs.current[0]?.focus(), 120);
        } else {
          setError(data.error || 'Failed to send OTP');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, email, phone })
        });
        const data = await res.json();
        if (data.token) {
          storeAuthAndNavigate(data);
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otpValue) => {
    const code = otpValue || otp.join('');
    if (code.length !== OTP_LENGTH) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp: code })
      });
      const data = await res.json();
      if (data.token) {
        storeAuthAndNavigate(data);
      } else {
        setError(data.error || 'Invalid OTP');
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setOtp(Array(OTP_LENGTH).fill(''));
        startResendTimer();
        otpRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setOtpShake(true);
    setTimeout(() => setOtpShake(false), 500);
  };

  const handleOtpChange = useCallback((idx, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp(prev => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (digit && idx === OTP_LENGTH - 1) {
      setOtp(prev => {
        const next = [...prev];
        next[idx] = digit;
        const full = next.join('');
        if (full.length === OTP_LENGTH) {
          setTimeout(() => handleOtpSubmit(full), 80);
        }
        return next;
      });
    }
  }, []);

  const handleOtpKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace') {
      if (!otp[idx] && idx > 0) {
        otpRefs.current[idx - 1]?.focus();
        setOtp(prev => {
          const next = [...prev];
          next[idx - 1] = '';
          return next;
        });
      } else {
        setOtp(prev => {
          const next = [...prev];
          next[idx] = '';
          return next;
        });
      }
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  }, [otp]);

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const digits = pasted.split('');
    setOtp(prev => {
      const next = [...prev];
      digits.forEach((d, i) => { next[i] = d; });
      return next;
    });
    const focusIdx = Math.min(digits.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
    if (digits.length === OTP_LENGTH) {
      setTimeout(() => handleOtpSubmit(digits.join('')), 80);
    }
  }, []);

  const handleBackToLogin = () => {
    setStep(1);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResendTimer(0);
  };

  return (
    <div className="auth-container">
      {/* Background Star Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at center, #071630 0%, #020712 100%)',
        zIndex: 1
      }} />

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '420px',
        animation: 'slideInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) both'
      }}>
        <div className="auth-card" style={{ padding: '40px 32px' }}>
          {/* Logo Title Section */}
          <div className="auth-logo">
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(255,255,255,0.05)'
            }}>
              <BrandLogo size={52} />
            </div>
            <h2>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>FOFA</span>{' '}
              <span style={{ color: '#ff4b44', fontWeight: 300 }}>ARENA</span>
            </h2>
            <p>Premium Sports Stream &amp; Fantasy Portal</p>
          </div>

          {/* Form Step Indicator */}
          {isLogin && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                background: step >= 1 ? '#ff4b44' : 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                boxShadow: step >= 1 ? '0 0 10px rgba(31, 128, 224, 0.4)' : 'none',
                transition: 'all 0.3s ease',
              }}>1</div>
              <div style={{
                width: '40px', height: '1px',
                background: step >= 2 ? '#ff4b44' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s ease',
              }} />
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                background: step >= 2 ? '#ff4b44' : 'rgba(255,255,255,0.06)',
                color: step >= 2 ? '#ffffff' : '#8f98a9',
                boxShadow: step >= 2 ? '0 0 10px rgba(31, 128, 224, 0.4)' : 'none',
                transition: 'all 0.3s ease',
              }}>2</div>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255, 46, 85, 0.1)',
              border: '1px solid rgba(255, 46, 85, 0.3)',
              color: '#ff2e55',
              borderRadius: '6px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '0.85rem',
            }}>{error}</div>
          )}

          {/* Step 1: Submit Credentials */}
          {step === 1 && (
            <div style={{ animation: 'fadeInStep 0.4s ease both' }}>
              {/* Tab Selector */}
              <div style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                padding: '3px',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <button 
                  onClick={() => { setIsLogin(true); setError(''); }} 
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '4px',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: isLogin ? '#ff4b44' : 'transparent',
                    color: isLogin ? '#ffffff' : '#8f98a9',
                    transition: 'all 0.2s'
                  }}
                >
                  LOGIN
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setError(''); }} 
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '4px',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: !isLogin ? '#ff4b44' : 'transparent',
                    color: !isLogin ? '#ffffff' : '#8f98a9',
                    transition: 'all 0.2s'
                  }}
                >
                  REGISTER
                </button>
              </div>

              <form onSubmit={handleCredentialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Username</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8f98a9' }} />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      placeholder="Enter username"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="form-group">
                      <label>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8f98a9' }} />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          placeholder="Enter your email"
                          className="form-input"
                          style={{ paddingLeft: '38px' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Mobile Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8f98a9' }} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          required
                          placeholder="Enter mobile number"
                          className="form-input"
                          style={{ paddingLeft: '38px' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8f98a9' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Processing...' : isLogin ? 'Send Verification OTP' : 'Create Premium Account'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Verify OTP Screen */}
          {step === 2 && (
            <div style={{ animation: 'fadeInStep 0.4s ease both' }} className={otpShake ? 'shake-element' : ''}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <ShieldCheck size={40} style={{ color: '#ff4b44', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0' }}>Security verification</h3>
                <p style={{ fontSize: '0.82rem', color: '#8f98a9', margin: 0 }}>Please enter the 6-digit code logged in your server console.</p>
              </div>

              {/* Masked destination feedback */}
              {(maskedEmail || maskedPhone) && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: '#8f98a9',
                  lineHeight: '1.5',
                  marginBottom: '20px'
                }}>
                  {maskedEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={12} /> OTP sent to: <span style={{ color: '#ff4b44', fontWeight: 600 }}>{maskedEmail}</span>
                    </div>
                  )}
                  {maskedPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: maskedEmail ? '6px' : 0 }}>
                      <Phone size={12} /> OTP sent to: <span style={{ color: '#27d06d', fontWeight: 600 }}>{maskedPhone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Digit Boxes Row */}
              <div className="otp-inputs-row">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    onFocus={() => setFocusedOtpIdx(idx)}
                    onBlur={() => setFocusedOtpIdx(-1)}
                    autoComplete="one-time-code"
                    className="otp-input-box"
                    style={{
                      borderColor: digit 
                        ? '#f3c623' 
                        : focusedOtpIdx === idx 
                          ? '#ff4b44' 
                          : 'rgba(255,255,255,0.08)'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => handleOtpSubmit()}
                disabled={loading || otp.join('').length !== OTP_LENGTH}
                className="submit-btn"
                style={{
                  opacity: (loading || otp.join('').length !== OTP_LENGTH) ? 0.5 : 1,
                  cursor: (loading || otp.join('').length !== OTP_LENGTH) ? 'not-allowed' : 'pointer',
                  marginBottom: '20px'
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>

              {/* Action back and resend links */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span
                  onClick={handleBackToLogin}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#8f98a9',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={14} /> Back to login
                </span>

                <span
                  onClick={handleResendOtp}
                  style={{
                    color: resendTimer > 0 ? '#8f98a9' : '#ff4b44',
                    fontSize: '0.8rem',
                    cursor: resendTimer > 0 ? 'default' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInStep {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shake-element {
          animation: otpShake 0.4s ease;
        }
        @keyframes otpShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default Auth;
