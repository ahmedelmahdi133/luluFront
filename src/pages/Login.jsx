import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { COLORS, PHARMACY_NAME, APP_VERSION } from '../utils/constants';
import { FaPills, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}`);
            if (user.role === 'customer') {
                navigate('/');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            fontFamily: 'var(--font-family)',
        }}>
            {/* Left Panel - Branding */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-8)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
                    top: '20%',
                    left: '30%',
                }} />
                <div style={{
                    position: 'absolute',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
                    bottom: '10%',
                    right: '20%',
                }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-6)',
                        boxShadow: '0 20px 40px rgba(37,99,235,0.3)',
                    }}>
                        <FaPills size={36} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: 'var(--font-size-3xl)',
                        fontWeight: 'var(--font-weight-extrabold)',
                        color: 'white',
                        marginBottom: 'var(--space-3)',
                    }}>
                        {PHARMACY_NAME}
                    </h1>
                    <p style={{
                        fontSize: 'var(--font-size-lg)',
                        color: 'var(--color-text-muted)',
                        maxWidth: 360,
                        lineHeight: 'var(--line-height-relaxed)',
                    }}>
                        Complete pharmacy management system for inventory, sales, and operations
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div style={{
                width: 480,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 'var(--space-12) var(--space-10)',
                backgroundColor: 'var(--color-bg-card)',
            }}>
                <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <h2 style={{
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--space-2)',
                        }}>
                            Welcome back
                        </h2>
                        <p style={{
                            fontSize: 'var(--font-size-md)',
                            color: 'var(--color-text-secondary)',
                        }}>
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="form-input"
                                autoFocus
                                style={{ padding: '12px 16px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="form-input"
                                    style={{ padding: '12px 16px', paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)',
                                        padding: 4,
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: 'var(--space-6)',
                        }}>
                            <button
                                type="button"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-primary)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    cursor: 'pointer',
                                }}
                                onClick={() => toast('Contact your administrator to reset your password', { icon: 'ℹ️' })}
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg"
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: 'var(--font-size-lg)',
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <span style={{
                                        width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white', borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite', display: 'inline-block',
                                    }} />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p style={{
                        textAlign: 'center',
                        marginTop: 'var(--space-6)',
                        fontSize: 'var(--font-size-md)',
                        color: 'var(--color-text-secondary)',
                    }}>
                        New customer?{' '}
                        <Link to="/register" style={{
                            color: 'var(--color-primary)',
                            fontWeight: 'var(--font-weight-semibold)',
                        }}>
                            Create an account
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 'auto',
                    paddingTop: 'var(--space-8)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                }}>
                    © {new Date().getFullYear()} {PHARMACY_NAME}. All rights reserved. v{APP_VERSION}
                </div>
            </div>
        </div>
    );
};

export default Login;
