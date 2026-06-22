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
        <div className="min-h-screen font-sans bg-slate-50/50">
            <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-[100] border-b border-slate-200/50">
                <div className="max-w-[1200px] mx-auto px-5 flex justify-between items-center h-[72px]">
                    <Link to="/" className="flex items-center gap-3 no-underline group">
                        <div className="w-10 h-10 rounded-2xl flex justify-center items-center text-white font-extrabold text-lg shadow-md shadow-teal-600/20 bg-gradient-to-br from-teal-500 to-teal-700 transition-transform group-hover:scale-105">
                            L
                        </div>
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">{PHARMACY_NAME}</span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <NavItem to="/" icon={FaHome} label="Home" color="#0f766e" />
                        <NavItem to="/store" icon={FaStore} label="Store" color="#0f766e" />
                        
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>

                        <button
                            onClick={handleOpenDesktopApp}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-none font-bold text-[13px] cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm text-teal-700 bg-teal-50 hover:bg-teal-100 hover:shadow-teal-100"
                            title="Open Desktop App"
                        >
                            <FaDesktop size={15} />
                            <span>Desktop App</span>
                        </button>

                        {user && (
                            <NavItem to="/prescriptions" icon={FaFileMedical} label="Prescriptions" color="#0f766e" />
                        )}

                        <Link to="/cart" className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 text-[13px] font-bold transition-all hover:bg-slate-100 hover:text-slate-900 no-underline ml-1">
                            <FaShoppingCart size={16} />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-[10px] font-black shadow-sm shadow-red-500/30 border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                                <NavItem to="/my-orders" icon={FaClipboardList} label="My Orders" color="#0f766e" />
                                <NavItem to="/profile" icon={FaUser} label={user.name?.split(' ')[0]} color="#0f766e" />
                                <button onClick={handleLogout} className="w-10 h-10 flex justify-center items-center bg-white text-red-500 border border-slate-200 rounded-xl cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all ml-1">
                                    <FaSignOutAlt size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3 ml-4 pl-4 border-l border-slate-200">
                                <Link to="/login" className="px-5 py-2.5 text-white no-underline rounded-xl text-[14px] font-bold transition-all shadow-md shadow-teal-600/20 bg-gradient-to-r from-teal-600 to-teal-500 hover:shadow-lg hover:-translate-y-0.5">
                                    Login
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 bg-white no-underline rounded-xl text-[14px] font-bold transition-all hover:bg-slate-50 text-teal-700 border border-teal-200 hover:border-teal-300">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="min-h-[calc(100vh-136px)]">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200 text-slate-500 font-medium text-center py-6 px-5 text-[13px]">
                {PHARMACY_NAME} &copy; {new Date().getFullYear()} - All Rights Reserved
            </footer>
        </div>
    );
};

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink 
        to={to} 
        end 
        className={({ isActive }) => `flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline text-[13px] transition-all ${isActive ? 'font-bold bg-teal-50 text-teal-700' : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'}`}
    >
        <Icon size={16} />
        <span>{label}</span>
    </NavLink>
);

export default CustomerLayout;
