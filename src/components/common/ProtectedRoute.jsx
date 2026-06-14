import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaPills } from 'react-icons/fa';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'var(--color-bg-body)',
                flexDirection: 'column',
                gap: 'var(--space-5)',
            }}>
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                    <FaPills size={24} color="white" />
                </div>
                <div style={{
                    fontSize: 'var(--font-size-md)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-weight-medium)',
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        if (user.role === 'customer') return <Navigate to="/" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
