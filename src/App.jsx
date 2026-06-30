import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import PharmacistLayout from './components/layouts/PharmacistLayout';
import CustomerLayout from './components/layouts/CustomerLayout';

import Login from './pages/Login';

import Dashboard from './pages/pharmacist/Dashboard';
import POS from './pages/pharmacist/POS';
import Products from './pages/pharmacist/Products';
import OrdersHistory from './pages/pharmacist/OrdersHistory';
import Purchases from './pages/pharmacist/Purchases';
import Returns from './pages/pharmacist/Returns';
import Shifts from './pages/pharmacist/Shifts';
import Reports from './pages/pharmacist/Reports';
import Expenses from './pages/pharmacist/Expenses';
import Settings from './pages/pharmacist/Settings';
import PharmacistPrescriptions from './pages/pharmacist/Prescriptions';
import AttendancePage from './pages/pharmacist/Attendance';
import PayrollPage from './pages/pharmacist/Payroll';
import ManageUsers from './pages/pharmacist/ManageUsers';
import Shortages from './pages/pharmacist/Shortages';
import Subscriptions from './pages/pharmacist/Subscriptions';

import Home from './pages/customer/Home';
import Store from './pages/customer/Store';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';
import Register from './pages/customer/Register';
import SubmitPrescription from './pages/customer/SubmitPrescription';

const PharmacistRoute = ({ children }) => (
    <ProtectedRoute roles={['superadmin', 'admin', 'pharmacist']}>
        <PharmacistLayout>{children}</PharmacistLayout>
    </ProtectedRoute>
);

const CustomerRoute = ({ children, requireAuth }) => {
    if (requireAuth) {
        return (
            <ProtectedRoute roles={['customer']}>
                <CustomerLayout>{children}</CustomerLayout>
            </ProtectedRoute>
        );
    }
    return <CustomerLayout>{children}</CustomerLayout>;
};

const RootRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user && ['superadmin', 'admin', 'pharmacist'].includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }
    return <CustomerLayout><Home /></CustomerLayout>;
};

function App() {
    return (
        <ErrorBoundary>
            <LanguageProvider>
                <AuthProvider>
                    <CartProvider>
                        <Router>
                            <Toaster position="top-center" toastOptions={{
                                duration: 3000,
                                style: {
                                    fontFamily: 'var(--font-family)',
                                    fontSize: 14,
                                    borderRadius: 10,
                                    boxShadow: 'var(--shadow-lg)',
                                }
                            }} />
                            <Routes>
                                {/* Auth */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<CustomerLayout><Register /></CustomerLayout>} />

                                {/* Pharmacist Routes */}
                                <Route path="/dashboard" element={<PharmacistRoute><Dashboard /></PharmacistRoute>} />
                                <Route path="/pos" element={<PharmacistRoute><POS /></PharmacistRoute>} />
                                <Route path="/products" element={<PharmacistRoute><Products /></PharmacistRoute>} />
                                <Route path="/shortages" element={<PharmacistRoute><Shortages /></PharmacistRoute>} />
                                <Route path="/orders" element={<PharmacistRoute><OrdersHistory /></PharmacistRoute>} />
                                <Route path="/purchases" element={<PharmacistRoute><Purchases /></PharmacistRoute>} />
                                <Route path="/returns" element={<PharmacistRoute><Returns /></PharmacistRoute>} />
                                <Route path="/shifts" element={<PharmacistRoute><Shifts /></PharmacistRoute>} />
                                <Route path="/reports" element={<PharmacistRoute><Reports /></PharmacistRoute>} />
                                <Route path="/expenses" element={<PharmacistRoute><Expenses /></PharmacistRoute>} />
                                <Route path="/settings" element={<PharmacistRoute><Settings /></PharmacistRoute>} />
                                <Route path="/prescriptions-manage" element={<PharmacistRoute><PharmacistPrescriptions /></PharmacistRoute>} />
                                <Route path="/attendance" element={<PharmacistRoute><AttendancePage /></PharmacistRoute>} />
                                <Route path="/payroll" element={<PharmacistRoute><PayrollPage /></PharmacistRoute>} />
                                <Route path="/users" element={<PharmacistRoute><ManageUsers /></PharmacistRoute>} />
                                <Route path="/subscriptions" element={<PharmacistRoute><Subscriptions /></PharmacistRoute>} />

                                {/* Customer Routes */}
                                <Route path="/" element={<RootRedirect />} />
                                <Route path="/store" element={<CustomerRoute><Store /></CustomerRoute>} />
                                <Route path="/store/:id" element={<CustomerRoute><ProductDetail /></CustomerRoute>} />
                                <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
                                <Route path="/checkout" element={<CustomerRoute requireAuth><Checkout /></CustomerRoute>} />
                                <Route path="/my-orders" element={<CustomerRoute requireAuth><MyOrders /></CustomerRoute>} />
                                <Route path="/profile" element={<CustomerRoute requireAuth><Profile /></CustomerRoute>} />
                                <Route path="/prescriptions" element={<CustomerRoute requireAuth><SubmitPrescription /></CustomerRoute>} />

                                {/* 404 */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Router>
                    </CartProvider>
                </AuthProvider>
            </LanguageProvider>
        </ErrorBoundary>
    );
}

export default App;
