import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { PHARMACY_NAME } from '../../utils/constants';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaClipboardList, FaSearch, FaBars, FaTimes, FaGlobe, FaDesktop } from 'react-icons/fa';

const CustomerLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/store?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const handleOpenDesktopApp = () => {
        const protocolUrl = 'indexpharma://open';
        const fallbackTimer = setTimeout(() => {
            alert('Desktop app is not installed on this device yet.');
        }, 1500);
        window.location.href = protocolUrl;
        setTimeout(() => clearTimeout(fallbackTimer), 2500);
    };

    const PRIMARY_COLOR = '#1e3a8a';

    return (
        <div className="min-h-screen font-sans bg-[#F9FAFB] flex flex-col">
            {/* Announcement Bar */}
            <div className="text-white text-xs py-2 px-4 flex justify-between items-center" style={{ backgroundColor: PRIMARY_COLOR }}>
                <div className="container mx-auto flex justify-between items-center max-w-[1200px]">
                    <div className="hidden sm:block">
                        Free shipping on orders over 1000 EGP!
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-gray-200 transition">
                            <FaGlobe /> English
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white sticky top-0 z-[100] border-b border-gray-100 shadow-sm py-4 px-4">
                <div className="container mx-auto max-w-[1200px] flex flex-wrap gap-4 justify-between items-center">
                    
                    {/* Logo & Mobile Menu Toggle */}
                    <div className="flex items-center gap-4">
                        <button className="sm:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                        <Link to="/" className="flex items-center gap-2 no-underline group">
                            <div className="w-10 h-10 rounded-full flex justify-center items-center text-white font-extrabold text-lg shadow-md transition-transform group-hover:scale-105" style={{ backgroundColor: PRIMARY_COLOR }}>
                                {PHARMACY_NAME.charAt(0)}
                            </div>
                            <span className="text-2xl font-black tracking-tight" style={{ color: PRIMARY_COLOR }}>{PHARMACY_NAME}</span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden sm:block flex-1 max-w-[500px] mx-4">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input 
                                type="text" 
                                placeholder="Search for medications, brands, or categories..." 
                                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-1 top-1 w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors hover:bg-opacity-90" style={{ backgroundColor: PRIMARY_COLOR }}>
                                <FaSearch size={14} />
                            </button>
                        </form>
                    </div>

                    {/* Actions (User & Cart) */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {user ? (
                            <div className="group relative">
                                <button className="flex items-center gap-2 text-gray-700 hover:text-[#1e3a8a] transition-colors py-2">
                                    <FaUser size={18} />
                                    <span className="hidden sm:block font-semibold text-sm">{user.name?.split(' ')[0]}</span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="p-2 flex flex-col gap-1">
                                        <Link to="/my-orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1e3a8a] rounded-lg">
                                            <FaClipboardList /> My Orders
                                        </Link>
                                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left w-full">
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-[#1e3a8a] transition-colors font-semibold text-sm">
                                <FaUser size={18} />
                                <span className="hidden sm:block">Sign In</span>
                            </Link>
                        )}
                        
                        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

                        <Link to="/cart" className="relative flex items-center gap-2 text-gray-700 hover:text-[#1e3a8a] transition-colors p-2">
                            <FaShoppingCart size={22} />
                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-[10px] text-gray-400">Your Cart</span>
                                <span className="font-bold text-sm" style={{ color: PRIMARY_COLOR }}>{cartCount} Items</span>
                            </div>
                            {cartCount > 0 && (
                                <span className="sm:hidden absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: PRIMARY_COLOR }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Search */}
                    <div className="w-full sm:hidden mt-3">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                className="w-full pl-4 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#1e3a8a]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-1 top-1 bottom-1 w-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
                                <FaSearch size={12} />
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Navigation Menu */}
            <nav className="bg-gray-50 border-b border-gray-200 hidden sm:block">
                <div className="container mx-auto max-w-[1200px] px-4 flex items-center gap-8 h-12">
                    <NavItem to="/" label="Home" />
                    <NavItem to="/store" label="All Products" />
                    {user && <NavItem to="/prescriptions" label="My Prescriptions" />}
                    <div className="flex-1"></div>
                    <button onClick={handleOpenDesktopApp} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#1e3a8a] transition-colors">
                        <FaDesktop /> Get Desktop App
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="bg-white w-64 h-full p-4 flex flex-col gap-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-4 border-b">
                            <span className="font-bold text-[#1e3a8a]">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)}><FaTimes /></button>
                        </div>
                        <Link to="/" className="text-gray-700 font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link to="/store" className="text-gray-700 font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
                        {user && <Link to="/prescriptions" className="text-gray-700 font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>My Prescriptions</Link>}
                    </div>
                </div>
            )}

            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12 pt-12 pb-6">
                <div className="container mx-auto max-w-[1200px] px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 no-underline mb-4">
                            <div className="w-8 h-8 rounded-full flex justify-center items-center text-white font-extrabold text-sm" style={{ backgroundColor: PRIMARY_COLOR }}>
                                {PHARMACY_NAME.charAt(0)}
                            </div>
                            <span className="text-xl font-black tracking-tight" style={{ color: PRIMARY_COLOR }}>{PHARMACY_NAME}</span>
                        </Link>
                        <p className="text-sm text-gray-500 mb-4 max-w-sm">
                            Your trusted destination for health, wellness, and beauty products. We deliver genuine medications right to your doorstep with care and speed.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4">Quick Links</h4>
                        <ul className="flex flex-col gap-2 text-sm text-gray-600">
                            <li><Link to="/store" className="hover:text-[#1e3a8a]">All Products</Link></li>
                            <li><Link to="/prescriptions" className="hover:text-[#1e3a8a]">Upload Prescription</Link></li>
                            <li><Link to="/cart" className="hover:text-[#1e3a8a]">Cart</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4">Contact Us</h4>
                        <ul className="flex flex-col gap-2 text-sm text-gray-600">
                            <li>Email: support@{PHARMACY_NAME.toLowerCase().replace(/\s/g, '')}.com</li>
                            <li>Phone: 19000</li>
                            <li>Working Hours: 24/7</li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto max-w-[1200px] px-4 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>{PHARMACY_NAME} &copy; {new Date().getFullYear()} - All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const NavItem = ({ to, label }) => (
    <NavLink 
        to={to} 
        end 
        className={({ isActive }) => `text-sm font-semibold transition-colors py-3 border-b-2 ${isActive ? 'text-[#1e3a8a] border-[#1e3a8a]' : 'text-gray-600 border-transparent hover:text-[#1e3a8a]'}`}
    >
        {label}
    </NavLink>
);

export default CustomerLayout;
