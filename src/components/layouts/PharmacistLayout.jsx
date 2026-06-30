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
    FaUserClock, FaMoneyCheckAlt, FaBell, FaUser, FaChevronDown, 
    FaPills, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaWhatsapp
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
    '/subscriptions': FaWhatsapp,
};

const PharmacistLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
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

    const hasPermission = (permission) => {
        if (user?.role === 'superadmin') return true;
        return user?.permissions?.[permission] === true;
    };

    const TOP_MENU = [
        { path: '/dashboard', label: t.nav.dashboard },
        { path: '/pos', label: t.nav.pos },
        { path: '/settings', label: t.nav.settings },
    ];

    const RIGHT_MENU = [
        { path: '/products', label: t.nav.products },
        { path: '/shortages', label: 'Shortages' },
        { path: '/purchases', label: t.nav.purchases },
        { path: '/orders', label: t.nav.ordersHistory },
        hasPermission('viewReturns') ? { path: '/returns', label: t.nav.returns } : null,
        hasPermission('viewPrescriptions') ? { path: '/prescriptions-manage', label: t.nav.prescriptions } : null,
        { path: '/subscriptions', label: 'أدوية شهرية' },
    ].filter(Boolean);

    const LEFT_MENU = [
        { path: '/shifts', label: t.nav.shifts },
        hasPermission('viewReports') ? { path: '/reports', label: t.nav.reports } : null,
        { path: '/expenses', label: t.nav.expenses },
        { path: '/attendance', label: t.nav.attendance },
        { path: '/payroll', label: t.nav.payroll },
    ].filter(Boolean);

    const getPageTitle = () => {
        const allMenus = [...TOP_MENU, ...RIGHT_MENU, ...LEFT_MENU];
        for (const item of allMenus) {
            if (location.pathname === item.path) return item.label;
        }
        return t.nav.dashboard;
    };

    const TopNavButton = ({ item }) => {
        const isActive = location.pathname === item.path;
        const Icon = ICON_MAP[item.path] || FaCog;
        return (
            <NavLink
                to={item.path}
                className={`h-20 w-24 flex flex-col items-center justify-center gap-1.5 text-center no-underline transition-all duration-300 ${isActive ? 'bg-teal-700 text-white shadow-inner' : 'text-teal-50 hover:bg-teal-600 hover:text-white'}`}
            >
                <Icon size={24} />
                <span className="text-[11px] font-bold leading-tight px-1">{item.label}</span>
            </NavLink>
        );
    };

    const SideNavButton = ({ item }) => {
        const isActive = location.pathname === item.path;
        const Icon = ICON_MAP[item.path] || FaCog;
        return (
            <NavLink
                to={item.path}
                className={`w-[85px] h-20 mb-2 mx-auto flex flex-col items-center justify-center gap-1.5 rounded-2xl text-center no-underline transition-all duration-300 ${isActive ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200'}`}
            >
                <Icon size={22} />
                <span className="text-[11px] font-bold leading-tight px-1.5">{item.label}</span>
            </NavLink>
        );
    };

    const firstSidebarMenu = isRTL ? RIGHT_MENU : LEFT_MENU;
    const secondSidebarMenu = isRTL ? LEFT_MENU : RIGHT_MENU;

    return (
        <div id="app-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            
            {/* ========== TOP HEADER ========== */}
            <header className="h-20 bg-teal-800 text-white flex items-center justify-between px-6 z-[100] shrink-0 shadow-md">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/30 shadow-sm">
                        <FaPills size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col hidden sm:flex">
                        <div className="text-white font-black text-lg tracking-wide">{PHARMACY_NAME}</div>
                        <div className="text-teal-200 text-xs font-semibold">Management System</div>
                    </div>
                </div>

                {/* Top Navigation */}
                <nav className="flex h-full">
                    {TOP_MENU.map(item => <TopNavButton key={item.path} item={item} />)}
                </nav>

                {/* User / Notifications */}
                <div className="flex items-center gap-4 relative">
                    {/* Notifications */}
                    <div className="relative">
                        <button 
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer transition-all bg-white/10 text-white hover:bg-white/20"
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                        >
                            <FaBell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-teal-800"></span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <>
                                <div className="fixed inset-0 z-[199]" onClick={() => setNotificationsOpen(false)} />
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-[200] flex flex-col max-h-[400px]">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="m-0 text-sm font-bold text-slate-800">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllAsRead} className="text-xs text-teal-600 hover:text-teal-800 font-bold border-none bg-transparent cursor-pointer">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2 scrollbar-thin">
                                        {notifications.length === 0 ? (
                                            <div className="text-center py-6 text-slate-400 text-sm">No notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-3 rounded-lg mb-1 flex items-start gap-3 transition-colors ${n.isRead ? 'opacity-70' : 'bg-teal-50'}`}>
                                                    <div className={`mt-1 rounded-full p-2 ${n.type === 'shortage_alert' ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>
                                                        <FaCalendarAlt size={12} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-slate-800">{n.title}</div>
                                                        <div className="text-xs text-slate-600 mt-1">{n.message}</div>
                                                        {n.dueDate && <div className="text-xs text-teal-600 font-semibold mt-1.5">Due: {formatDate(n.dueDate)}</div>}
                                                    </div>
                                                    {!n.isRead && (
                                                        <button onClick={() => markAsRead(n.id)} className="text-teal-600 hover:text-teal-800 bg-transparent border-none cursor-pointer p-1" title="Mark as read">
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

                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer text-white"
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        >
                            <div className="w-7 h-7 rounded-full bg-white text-teal-800 flex items-center justify-center font-bold text-sm shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-bold hidden sm:block">{user?.name?.split(' ')[0]}</span>
                            <FaChevronDown size={12} className={`text-teal-200 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {userDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-[199]" onClick={() => setUserDropdownOpen(false)} />
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-[200]">
                                    <div className="px-4 py-3 flex flex-col bg-slate-50 border-b border-slate-100 mb-2">
                                        <strong className="text-slate-800">{user?.name}</strong>
                                        <span className="text-xs text-slate-500 mt-0.5">{user?.email}</span>
                                    </div>
                                    <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors border-none bg-transparent cursor-pointer font-medium">
                                        <FaUser size={14} /> Profile
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors border-none bg-transparent cursor-pointer font-medium" onClick={() => { navigate('/settings'); setUserDropdownOpen(false); }}>
                                        <FaCog size={14} /> Settings
                                    </button>
                                    <div className="h-px bg-slate-100 my-2" />
                                    <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer font-bold" onClick={handleLogout}>
                                        <FaSignOutAlt size={14} /> {t.common.logout}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ========== MIDDLE SECTION (Sidebars + Main) ========== */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                
                {/* FIRST SIDEBAR */}
                <aside className="w-[100px] bg-white border-r border-slate-200 flex flex-col items-center py-4 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-50 overflow-y-auto scrollbar-none" style={{ borderRightColor: isRTL ? 'transparent' : 'var(--slate-200)', borderLeftColor: isRTL ? 'var(--slate-200)' : 'transparent', borderLeftWidth: isRTL ? '1px' : '0' }}>
                    {firstSidebarMenu.map(item => <SideNavButton key={item.path} item={item} />)}
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative" id="app-main">
                    <div className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-sm sticky top-0 z-40">
                        <h1 className="text-2xl font-black text-slate-800 m-0 tracking-tight">{getPageTitle()}</h1>
                    </div>
                    <div className="p-8 flex-1">
                        {children}
                    </div>
                </main>

                {/* SECOND SIDEBAR */}
                <aside className="w-[100px] bg-white border-l border-slate-200 flex flex-col items-center py-4 shrink-0 shadow-[-2px_0_10px_rgba(0,0,0,0.02)] z-50 overflow-y-auto scrollbar-none" style={{ borderLeftColor: isRTL ? 'transparent' : 'var(--slate-200)', borderRightColor: isRTL ? 'var(--slate-200)' : 'transparent', borderRightWidth: isRTL ? '1px' : '0' }}>
                    {secondSidebarMenu.map(item => <SideNavButton key={item.path} item={item} />)}
                </aside>
                
            </div>
        </div>
    );
};

export default PharmacistLayout;
