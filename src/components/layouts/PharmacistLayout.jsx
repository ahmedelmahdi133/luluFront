import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PHARMACY_NAME, APP_VERSION, MENU_GROUPS } from '../../utils/constants';
import {
    FaTachometerAlt, FaCashRegister, FaBoxes, FaHistory, FaTruck, FaUndo,
    FaClock, FaChartBar, FaMoneyBillWave, FaCog, FaSignOutAlt, FaFileMedical,
    FaUserClock, FaMoneyCheckAlt, FaBars, FaTimes, FaBell, FaUser,
    FaChevronDown, FaSearch, FaPills
} from 'react-icons/fa';

const ICON_MAP = {
    '/dashboard': FaTachometerAlt,
    '/pos': FaCashRegister,
    '/products': FaBoxes,
    '/orders': FaHistory,
    '/purchases': FaTruck,
    '/returns': FaUndo,
    '/prescriptions-manage': FaFileMedical,
    '/attendance': FaUserClock,
    '/payroll': FaMoneyCheckAlt,
    '/shifts': FaClock,
    '/reports': FaChartBar,
    '/expenses': FaMoneyBillWave,
    '/settings': FaCog,
};

const PharmacistLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // POS gets full screen - no sidebar/header
    if (location.pathname === '/pos') {
        return children;
    }

    // Get page title from current route
    const getPageTitle = () => {
        for (const group of MENU_GROUPS) {
            for (const item of group.items) {
                if (location.pathname === item.path) return item.label;
            }
        }
        return 'Dashboard';
    };

    return (
        <div id="app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* ========== SIDEBAR ========== */}
            <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`} id="sidebar-main">
                {/* Sidebar Header / Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <FaPills size={16} color="white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="sidebar-logo-text">
                            <div className="sidebar-logo-name">{PHARMACY_NAME}</div>
                            <div className="sidebar-logo-sub">Management System</div>
                        </div>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <nav className="sidebar-nav" id="sidebar-nav">
                    {MENU_GROUPS.map((group, gi) => (
                        <div key={gi} className="sidebar-group">
                            {!sidebarCollapsed && (
                                <div className="sidebar-group-label">{group.label}</div>
                            )}
                            {sidebarCollapsed && gi > 0 && <div className="sidebar-divider" />}
                            {group.items.map(item => {
                                const isActive = location.pathname === item.path;
                                const Icon = ICON_MAP[item.path] || FaCog;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        id={`nav-${item.path.replace('/', '')}`}
                                        title={sidebarCollapsed ? item.label : undefined}
                                        className={`sidebar-item${isActive ? ' active' : ''}`}
                                    >
                                        <span className="sidebar-item-icon">
                                            <Icon size={16} />
                                        </span>
                                        {!sidebarCollapsed && <span>{item.label}</span>}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer - User */}
                <div className="sidebar-footer">
                    {!sidebarCollapsed && (
                        <div className="sidebar-user-card">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">
                                {user?.role === 'admin' ? 'System Admin' : 'Pharmacist'}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                        className="sidebar-logout"
                        id="btn-logout-sidebar"
                    >
                        <FaSignOutAlt size={14} />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>

                {/* Version */}
                {!sidebarCollapsed && (
                    <div className="sidebar-version">v{APP_VERSION}</div>
                )}
            </aside>

            {/* ========== MAIN CONTENT ========== */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* ========== TOP HEADER ========== */}
                <header className="app-header" id="app-header">
                    {/* Left: Toggle + Page Title */}
                    <div className="header-left">
                        <button
                            onClick={() => setSidebarCollapsed(prev => !prev)}
                            className="btn btn-ghost btn-icon"
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            id="btn-sidebar-toggle"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <FaBars size={16} />
                        </button>
                        <h2 className="header-title">{getPageTitle()}</h2>
                    </div>

                    {/* Right: Notifications + User */}
                    <div className="header-right">
                        <button
                            className="btn btn-ghost btn-icon header-notification"
                            title="Notifications"
                            id="btn-notifications"
                        >
                            <FaBell size={16} />
                            <span className="header-notification-dot" />
                        </button>

                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-ghost header-user-btn"
                                onClick={() => setUserDropdownOpen(prev => !prev)}
                                id="btn-user-menu"
                            >
                                <div
                                    className="avatar avatar-sm"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                                        color: 'white',
                                    }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="header-user-name">{user?.name}</span>
                                <FaChevronDown size={10} style={{ color: 'var(--color-text-muted)' }} />
                            </button>

                            {/* Dropdown */}
                            {userDropdownOpen && (
                                <>
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-dropdown)' }}
                                        onClick={() => setUserDropdownOpen(false)}
                                    />
                                    <div className="header-dropdown" id="user-dropdown">
                                        <div className="header-dropdown-info">
                                            <div className="header-dropdown-name">{user?.name}</div>
                                            <div className="header-dropdown-email">{user?.email}</div>
                                        </div>
                                        <button
                                            className="header-dropdown-item"
                                            onClick={() => { setUserDropdownOpen(false); navigate('/settings'); }}
                                            id="dropdown-settings"
                                        >
                                            <FaCog size={13} /> Settings
                                        </button>
                                        <button
                                            className="header-dropdown-item danger"
                                            onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                                            id="dropdown-logout"
                                        >
                                            <FaSignOutAlt size={13} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ========== PAGE CONTENT ========== */}
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: 'var(--color-bg-body)',
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PharmacistLayout;
