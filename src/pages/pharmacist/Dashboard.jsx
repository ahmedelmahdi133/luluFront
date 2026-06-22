import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    FaShoppingCart, FaBoxes, FaExclamationTriangle, FaMoneyBillWave,
    FaClock, FaCashRegister, FaPlus, FaChartBar
} from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const Dashboard = () => {
    const { user } = useAuth();
    const [dailyReport, setDailyReport] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [expiryAlerts, setExpiryAlerts] = useState({ expired: [], expiringSoon: [] });
    const [onlineOrders, setOnlineOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [daily, monthly, low, expiry, orders] = await Promise.all([
                    api.get('/reports/daily'),
                    api.get('/reports/monthly'),
                    api.get('/reports/low-stock'),
                    api.get('/reports/expiry-alerts?days=60'),
                    api.get('/orders?orderType=ONLINE&status=pending&limit=10')
                ]);
                setDailyReport(daily.data.data);
                setMonthlyReport(monthly.data.data);
                setLowStock(low.data.data);
                setExpiryAlerts(expiry.data.data);
                setOnlineOrders(orders.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return (
        <div className="page-wrapper">
            <LoadingSkeleton type="dashboard" />
        </div>
    );

    const cards = [
        { label: 'Today\'s Sales', value: formatCurrency(dailyReport?.totalSales || 0), icon: FaMoneyBillWave, color: '#059669' },
        { label: 'Today\'s Invoices', value: dailyReport?.totalOrders || 0, icon: FaShoppingCart, color: '#4f46e5' },
        { label: 'Net Revenue', value: formatCurrency(dailyReport?.netRevenue || 0), icon: FaMoneyBillWave, color: '#7c3aed' },
        { label: 'Low Stock Items', value: lowStock.length, icon: FaExclamationTriangle, color: lowStock.length > 0 ? '#dc2626' : '#059669' },
    ];

    const chartData = monthlyReport?.dailyBreakdown?.map(d => ({
        day: d._id,
        sales: d.totalSales,
        orders: d.orderCount
    })) || [];

    return (
        <div className="page-wrapper" id="dashboard-page">
            <PageHeader
                title={`Welcome back, ${user?.name?.split(' ')[0] || 'Pharmacist'} 👋`}
                subtitle="Here's what's happening in your pharmacy today."
                breadcrumbs={[{ label: 'Dashboard' }]}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5" style={{ marginBottom: 'var(--space-6)' }} id="dashboard-stats">
                {cards.map((c, i) => (
                    <StatCard key={i} {...c} index={i} />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8" id="dashboard-quick-actions">
                <Link to="/pos" className="group relative overflow-hidden flex items-center gap-5 p-5 bg-white border border-slate-100/50 rounded-2xl no-underline text-slate-900 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(79,70,229,0.15)] hover:-translate-y-1 hover:border-indigo-200" id="qa-new-sale">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-indigo-100/60 pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 rtl:ml-3 rtl:mr-0 relative z-10" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
                        <FaCashRegister size={22} className="text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="font-bold text-lg text-slate-800 mb-0.5 group-hover:text-indigo-700 transition-colors">New Sale</div>
                        <div className="text-sm text-slate-500 font-medium">Open POS Terminal</div>
                    </div>
                </Link>
                <Link to="/products" className="group relative overflow-hidden flex items-center gap-5 p-5 bg-white border border-slate-100/50 rounded-2xl no-underline text-slate-900 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] hover:-translate-y-1 hover:border-emerald-200" id="qa-add-product">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-emerald-100/60 pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 rtl:ml-3 rtl:mr-0 relative z-10" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                        <FaPlus size={22} className="text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="font-bold text-lg text-slate-800 mb-0.5 group-hover:text-emerald-700 transition-colors">Add Product</div>
                        <div className="text-sm text-slate-500 font-medium">Manage Inventory</div>
                    </div>
                </Link>
                <Link to="/reports" className="group relative overflow-hidden flex items-center gap-5 p-5 bg-white border border-slate-100/50 rounded-2xl no-underline text-slate-900 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.15)] hover:-translate-y-1 hover:border-amber-200" id="qa-reports">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-amber-100/60 pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 rtl:ml-3 rtl:mr-0 relative z-10" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
                        <FaChartBar size={22} className="text-amber-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="font-bold text-lg text-slate-800 mb-0.5 group-hover:text-amber-600 transition-colors">Reports</div>
                        <div className="text-sm text-slate-500 font-medium">View Analytics</div>
                    </div>
                </Link>
            </div>

            {/* Chart + Online Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5" style={{ marginBottom: 'var(--space-6)' }}>
                {/* Monthly Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" id="dashboard-chart">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ margin: 0 }}>Monthly Sales</h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-slate-200 text-slate-600">{chartData.length} days</span>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                                <Tooltip
                                    formatter={(v) => formatCurrency(v)}
                                    contentStyle={{
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        boxShadow: 'var(--shadow-md)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                />
                                <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Sales" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Online Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" id="dashboard-pending-orders">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ margin: 0 }}>
                            <FaClock color="var(--color-warning)" size={16} /> Pending Orders
                        </h3>
                        {onlineOrders.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-amber-100 text-amber-900">{onlineOrders.length}</span>
                        )}
                    </div>
                    <div className="p-6">
                        {onlineOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center text-slate-400 p-12" style={{ padding: 'var(--space-8) 0' }}>
                                <FaShoppingCart size={32} className="text-slate-200 mb-3 opacity-50" />
                                <p className="text-base font-semibold text-slate-600 mb-1">No pending orders</p>
                                <p className="text-sm max-w-[250px]">All online orders have been processed.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {onlineOrders.map(order => {
                                    const sc = getStatusColor(order.status);
                                    return (
                                        <div key={getId(order)} style={{
                                            padding: 'var(--space-3) var(--space-4)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border-light)',
                                            transition: 'all var(--transition-fast)',
                                            cursor: 'pointer',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary-light)'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                                                    {order.orderNumber}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${sc.cls}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                {formatCurrency(order.totalAmount)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Low Stock + Expiry Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5" id="dashboard-alerts">
                {/* Low Stock */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" id="dashboard-low-stock">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{
                            margin: 0,
                            color: lowStock.length > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)',
                        }}>
                            <FaExclamationTriangle size={16} /> Low Stock
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${lowStock.length > 0 ? 'badge-danger' : 'badge-success'}`}>
                            {lowStock.length}
                        </span>
                    </div>
                    <div className="p-6">
                        {lowStock.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
                                All products are well stocked ✓
                            </p>
                        ) : (
                            lowStock.slice(0, 8).map(p => (
                                <div key={getId(p)} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-2) 0',
                                    borderBottom: '1px solid var(--color-border-light)',
                                    fontSize: 'var(--font-size-base)',
                                }}>
                                    <span style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-red-100 text-red-800">{p.stockQuantity} left</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Expiry Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" id="dashboard-expiry-alerts">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ margin: 0, color: 'var(--color-warning)' }}>
                            <FaClock size={16} /> Expiring Soon
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-amber-100 text-amber-900">{expiryAlerts.expiringSoon?.length || 0}</span>
                    </div>
                    <div className="p-6">
                        {expiryAlerts.expired?.length > 0 && (
                            <div className="p-3 px-4 rounded-md text-sm font-semibold flex items-center gap-2 bg-red-50 text-red-800" style={{ marginBottom: 'var(--space-3)' }}>
                                ⚠ Warning: {expiryAlerts.expired.length} product(s) already expired!
                            </div>
                        )}
                        {expiryAlerts.expiringSoon?.slice(0, 8).map(p => (
                            <div key={getId(p)} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--space-2) 0',
                                borderBottom: '1px solid var(--color-border-light)',
                                fontSize: 'var(--font-size-base)',
                            }}>
                                <span style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-amber-100 text-amber-900">{formatDate(p.expiryDate)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
