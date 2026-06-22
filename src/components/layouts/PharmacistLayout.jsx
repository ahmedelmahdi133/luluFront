import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShortcuts } from '../../hooks/useShortcuts';
import { PHARMACY_NAME, APP_VERSION } from '../../utils/constants';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import {
    FaTachometerAlt, FaCashRegister, FaBoxes, FaHistory, FaTruck, FaUndo,
    FaClock, FaChartBar, FaMoneyBillWave, FaCog, FaSignOutAlt, FaFileMedical,
    FaUserClock, FaMoneyCheckAlt, FaBars, FaTimes, FaBell, FaUser,
    FaChevronDown, FaSearch, FaPills, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';

const ICON_MAP = {
    '/dashboard': FaTachometerAlt,
    '/pos': FaCashRegister,
    '/products': FaBoxes,
    '/shortages': FaExclamationTriangle,
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
    const { t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const searchRef = useRef(null);
    useShortcuts(searchRef);

    useEffect(() => {
        if (user) {
            api.get('/notifications').then(res => setNotifications(res.data.data)).catch(() => {});
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {}
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setNotificationsOpen(false);
        } catch (e) {}
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (location.pathname === '/pos') {
        return children;
    }

    // Filter items based on user permissions
    const canView = (permission) => {
        if (user?.role === 'superadmin') return true;
        return user?.permissions?.[permission] !== false; // Default to true if not explicitly set to false, or maybe default to false?
        // Wait, the default when we register should be considered. Let's say if it's undefined, we default to false or true. 
        // Let's default to true for backward compatibility or false for strictness. I'll default to true unless explicitly false. 
    };

    const strictCanView = (permission) => {
        if (user?.role === 'superadmin' || user?.role === 'admin') return true;
        return user?.permissions?.[permission] === true;
    };

    const hasPermission = (permission) => {
        if (user?.role === 'superadmin') return true;
        return user?.permissions?.[permission] === true;
    };

    const MENU_GROUPS = [
        {
            label: t.nav.main,
            items: [
                { path: '/dashboard', label: t.nav.dashboard },
                { path: '/pos', label: t.nav.pos },
            ]
        },
        {
            label: t.nav.inventory,
            items: [
                { path: '/products', label: t.nav.products },
                { path: '/shortages', label: 'Shortages' },
                { path: '/purchases', label: t.nav.purchases },
            ]
        },
        {
            label: t.nav.sales,
            items: [
                { path: '/orders', label: t.nav.ordersHistory },
                hasPermission('viewReturns') ? { path: '/returns', label: t.nav.returns } : null,
                hasPermission('viewPrescriptions') ? { path: '/prescriptions-manage', label: t.nav.prescriptions } : null,
            ].filter(Boolean)
        },
        {
            label: t.nav.finance,
            items: [
                { path: '/shifts', label: t.nav.shifts },
                hasPermission('viewReports') ? { path: '/reports', label: t.nav.reports } : null,
                { path: '/expenses', label: t.nav.expenses },
                { path: '/attendance', label: t.nav.attendance },
                { path: '/payroll', label: t.nav.payroll },
            ].filter(Boolean)
        },
        {
            label: t.nav.system,
            items: [
                { path: '/settings', label: t.nav.settings },
            ]
        }
    ];

    const getPageTitle = () => {
        for (const group of MENU_GROUPS) {
            for (const item of group.items) {
                if (location.pathname === item.path) return item.label;
            }
        }
        return t.nav.dashboard;
    };

    return (
        <div id="app-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
            {/* ========== SIDEBAR ========== */}
            <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`} id="sidebar-main">
                {/* Sidebar Header / Logo */}
                <div className="p-5 border-b border-white/10 flex items-center gap-3 min-h-[64px]">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                        <FaPills size={16} color="white" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex flex-col overflow-hidden whitespace-nowrap">
                            <div className="text-white font-bold text-base tracking-wide">{PHARMACY_NAME}</div>
                            <div className="text-slate-400 text-xs">Management System</div>
                        </div>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700" id="sidebar-nav">
                    {MENU_GROUPS.map((group, gi) => (
                        <div key={gi} className="mb-4">
                            {!sidebarCollapsed && (
                                <div className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.label}</div>
                            )}
                            {sidebarCollapsed && gi > 0 && <div className="h-px bg-white/5 mx-6 my-2" />}
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
                                        <span className="shrink-0">
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
                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    {!sidebarCollapsed && (
                        <div className="flex flex-col mb-3 px-2">
                            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                            <div className="text-xs text-slate-400">
                                {user?.role === 'admin' ? t.common.systemAdmin : t.common.pharmacist}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title={sidebarCollapsed ? t.common.logout : undefined}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors border-none cursor-pointer"
                        id="btn-logout-sidebar"
                    >
                        <FaSignOutAlt size={14} />
                        {!sidebarCollapsed && <span>{t.common.logout}</span>}
                    </button>
                </div>

                {/* Version */}
                {!sidebarCollapsed && (
                    <div className="text-center text-[10px] text-slate-600 pb-2">v{APP_VERSION}</div>
                )}
            </aside>

            {/* ========== MAIN CONTENT ========== */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* ========== TOP HEADER ========== */}
                <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-5 z-[100] shrink-0" id="app-header">
                    {/* Left: Toggle + Page Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarCollapsed(prev => !prev)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border-none cursor-pointer transition-all leading-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:hover:bg-transparent p-2"
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            id="btn-sidebar-toggle"
                        >
                            {sidebarCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 m-0">{getPageTitle()}</h1>
                    </div>

                    {/* Right: Search, Notifications, User */}
                    <div className="flex items-center gap-3 relative">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border-none cursor-pointer transition-all leading-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:hover:bg-transparent p-2 relative hover:text-slate-800 transition-colors" 
                                id="btn-notifications"
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                            >
                                <FaBell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-[199]" onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-[200] flex flex-col max-h-[400px]">
                                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                            <h3 className="m-0 text-sm font-bold text-slate-800">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border-none bg-transparent cursor-pointer">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-2">
                                            {notifications.length === 0 ? (
                                                <div className="text-center py-6 text-slate-400 text-sm">No notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div 
                                                        key={n.id} 
                                                        className={`p-3 rounded-lg mb-1 flex items-start gap-3 transition-colors ${n.isRead ? 'opacity-70' : 'bg-indigo-50/50'}`}
                                                    >
                                                        <div className={`mt-1 rounded-full p-2 ${n.type === 'shortage_alert' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                            <FaCalendarAlt size={12} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-slate-800">{n.title}</div>
                                                            <div className="text-xs text-slate-600 mt-1">{n.message}</div>
                                                            {n.dueDate && <div className="text-xs text-indigo-600 font-semibold mt-1.5">Due: {formatDate(n.dueDate)}</div>}
                                                        </div>
                                                        {!n.isRead && (
                                                            <button onClick={() => markAsRead(n.id)} className="text-indigo-600 hover:text-indigo-800 bg-transparent border-none cursor-pointer p-1" title="Mark as read">
                                                                <FaCheckCircle size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                id="btn-user-dropdown"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name?.split(' ')[0]}</span>
                                <FaChevronDown size={12} className={`text-slate-400 transition-transform ${userDropdownOpen ? 'open' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-[199]" onClick={() => setUserDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-[200]">
                                        <div className="px-4 py-2 flex flex-col">
                                            <strong>{user?.name}</strong>
                                            <span>{user?.email}</span>
                                        </div>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-none bg-transparent cursor-pointer">
                                            <FaUser size={14} /> Profile
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-none bg-transparent cursor-pointer" onClick={() => { navigate('/settings'); setUserDropdownOpen(false); }}>
                                            <FaCog size={14} /> Settings
                                        </button>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-none bg-transparent cursor-pointer text-danger" onClick={handleLogout} id="btn-logout-dropdown">
                                            <FaSignOutAlt size={14} /> {t.common.logout}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ========== PAGE CONTENT ========== */}
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50" id="app-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PharmacistLayout;
