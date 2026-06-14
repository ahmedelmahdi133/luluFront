import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
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
                title="Dashboard"
                subtitle="Overview of your pharmacy's performance"
                breadcrumbs={[{ label: 'Dashboard' }]}
            />

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }} id="dashboard-stats">
                {cards.map((c, i) => (
                    <StatCard key={i} {...c} index={i} />
                ))}
            </div>

            {/* Quick Actions */}
            <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}
                id="dashboard-quick-actions"
            >
                <Link to="/pos" className="quick-action" id="qa-new-sale">
                    <div className="quick-action-icon" style={{ background: 'var(--color-primary-light)' }}>
                        <FaCashRegister size={18} color="var(--color-primary)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-md)' }}>New Sale</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Open POS Terminal</div>
                    </div>
                </Link>
                <Link to="/products" className="quick-action" id="qa-add-product">
                    <div className="quick-action-icon" style={{ background: 'var(--color-success-light)' }}>
                        <FaPlus size={18} color="var(--color-success)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-md)' }}>Add Product</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Manage Inventory</div>
                    </div>
                </Link>
                <Link to="/reports" className="quick-action" id="qa-reports">
                    <div className="quick-action-icon" style={{ background: 'var(--color-warning-light)' }}>
                        <FaChartBar size={18} color="var(--color-warning)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-md)' }}>Reports</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>View Analytics</div>
                    </div>
                </Link>
            </div>

            {/* Chart + Online Orders */}
            <div className="grid-2-1" style={{ marginBottom: 'var(--space-6)' }}>
                {/* Monthly Chart */}
                <div className="card" id="dashboard-chart">
                    <div className="card-header">
                        <h3 className="section-title" style={{ margin: 0 }}>Monthly Sales</h3>
                        <span className="badge badge-neutral">{chartData.length} days</span>
                    </div>
                    <div className="card-body">
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
                <div className="card" id="dashboard-pending-orders">
                    <div className="card-header">
                        <h3 className="section-title" style={{ margin: 0 }}>
                            <FaClock color="var(--color-warning)" size={16} /> Pending Orders
                        </h3>
                        {onlineOrders.length > 0 && (
                            <span className="badge badge-warning">{onlineOrders.length}</span>
                        )}
                    </div>
                    <div className="card-body">
                        {onlineOrders.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                                <FaShoppingCart size={32} className="empty-state-icon" />
                                <p className="empty-state-title">No pending orders</p>
                                <p className="empty-state-desc">All online orders have been processed.</p>
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
                                                <span className={`badge ${sc.cls}`}>
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
            <div className="grid-1-1" id="dashboard-alerts">
                {/* Low Stock */}
                <div className="card" id="dashboard-low-stock">
                    <div className="card-header">
                        <h3 className="section-title" style={{
                            margin: 0,
                            color: lowStock.length > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)',
                        }}>
                            <FaExclamationTriangle size={16} /> Low Stock
                        </h3>
                        <span className={`badge ${lowStock.length > 0 ? 'badge-danger' : 'badge-success'}`}>
                            {lowStock.length}
                        </span>
                    </div>
                    <div className="card-body">
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
                                    <span className="badge badge-danger">{p.stockQuantity} left</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Expiry Alerts */}
                <div className="card" id="dashboard-expiry-alerts">
                    <div className="card-header">
                        <h3 className="section-title" style={{ margin: 0, color: 'var(--color-warning)' }}>
                            <FaClock size={16} /> Expiring Soon
                        </h3>
                        <span className="badge badge-warning">{expiryAlerts.expiringSoon?.length || 0}</span>
                    </div>
                    <div className="card-body">
                        {expiryAlerts.expired?.length > 0 && (
                            <div className="alert-banner alert-banner-danger" style={{ marginBottom: 'var(--space-3)' }}>
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
                                <span className="badge badge-warning">{formatDate(p.expiryDate)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
