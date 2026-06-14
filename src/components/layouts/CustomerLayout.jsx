import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { COLORS, PHARMACY_NAME } from '../../utils/constants';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaClipboardList, FaHome, FaStore, FaFileMedical, FaDesktop } from 'react-icons/fa';

const CustomerLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleOpenDesktopApp = () => {
        const protocolUrl = 'lulupharma://open';
        const fallbackTimer = setTimeout(() => {
            alert('Desktop app is not installed on this device yet.');
        }, 1500);

        window.location.href = protocolUrl;
        setTimeout(() => clearTimeout(fallbackTimer), 2500);
    };

    const C = COLORS.customerPrimary;

    return (
        <div style={{ minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
            <header style={{
                backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{
                    maxWidth: 1200, margin: '0 auto', padding: '0 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    height: 64
                }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, backgroundColor: C,
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: 'white', fontWeight: 800, fontSize: 16
                        }}>J</div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{PHARMACY_NAME}</span>
                    </Link>

                    <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <NavItem to="/" icon={FaHome} label="Home" color={C} />
                        <NavItem to="/store" icon={FaStore} label="Store" color={C} />
                        <button
                            onClick={handleOpenDesktopApp}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 8, border: 'none',
                                textDecoration: 'none', color: C, fontWeight: 600,
                                backgroundColor: `${C}10`, fontSize: 14, cursor: 'pointer'
                            }}
                            title="Open Desktop App"
                        >
                            <FaDesktop size={15} />
                            <span>Desktop App</span>
                        </button>

                        {user && (
                            <NavItem to="/prescriptions" icon={FaFileMedical} label="Prescriptions" color={C} />
                        )}

                        <Link to="/cart" style={{
                            position: 'relative', display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
                            color: '#64748b', fontSize: 14, transition: 'all 0.2s'
                        }}>
                            <FaShoppingCart size={16} />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: 2, right: -4,
                                    backgroundColor: '#dc2626', color: 'white',
                                    borderRadius: '50%', width: 18, height: 18,
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: 10, fontWeight: 700
                                }}>{cartCount}</span>
                            )}
                        </Link>

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                                <NavItem to="/my-orders" icon={FaClipboardList} label="My Orders" color={C} />
                                <NavItem to="/profile" icon={FaUser} label={user.name?.split(' ')[0]} color={C} />
                                <button onClick={handleLogout} style={{
                                    padding: '8px 12px', backgroundColor: 'transparent', color: '#dc2626',
                                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                                    display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                    <FaSignOutAlt size={14} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                                <Link to="/login" style={{
                                    padding: '8px 18px', backgroundColor: C, color: 'white',
                                    textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600
                                }}>
                                    Login
                                </Link>
                                <Link to="/register" style={{
                                    padding: '8px 18px', backgroundColor: 'white', color: C,
                                    textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    border: `1px solid ${C}`
                                }}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main style={{ minHeight: 'calc(100vh - 64px - 60px)' }}>
                {children}
            </main>

            <footer style={{
                backgroundColor: '#1e293b', color: '#94a3b8', textAlign: 'center',
                padding: '18px 20px', fontSize: 13
            }}>
                {PHARMACY_NAME} &copy; {new Date().getFullYear()} - All Rights Reserved
            </footer>
        </div>
    );
};

const NavItem = ({ to, icon: Icon, label, color }) => (
    <NavLink to={to} end style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
        color: isActive ? color : '#64748b', fontWeight: isActive ? 600 : 400,
        backgroundColor: isActive ? `${color}10` : 'transparent', fontSize: 14
    })}>
        <Icon size={15} />
        <span>{label}</span>
    </NavLink>
);

export default CustomerLayout;
