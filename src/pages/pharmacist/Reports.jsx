import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency, getExpenseCategoryLabel } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaCalendarDay, FaCalendarAlt } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { FaMoneyBillWave, FaShoppingCart, FaReceipt, FaCreditCard } from 'react-icons/fa';

const CHART_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];

const Reports = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [dailyDate, setDailyDate] = useState(new Date().toISOString().substring(0, 10));
    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'daily') {
            api.get(`/reports/daily?date=${dailyDate}`).then(r => { setDailyData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
        }
        if (activeTab === 'monthly') {
            Promise.all([
                api.get(`/reports/monthly?year=${year}&month=${month}`),
                api.get('/reports/top-products?days=30')
            ]).then(([r1, r2]) => {
                setMonthlyData(r1.data.data);
                setTopProducts(r2.data.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [activeTab, dailyDate, month, year]);

    return (
        <div className="page-wrapper" id="reports-page">
            <PageHeader
                title="Reports"
                subtitle="Financial analytics and performance insights"
                breadcrumbs={[{ label: 'Finance', to: '/reports' }, { label: 'Reports' }]}
            />

            {/* Tabs */}
            <div className="tabs" id="reports-tabs">
                {[
                    { id: 'daily', label: 'Daily Report', icon: FaCalendarDay },
                    { id: 'monthly', label: 'Monthly Report', icon: FaCalendarAlt },
                ].map(t => (
                    <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            {loading ? <LoadingSkeleton type="dashboard" /> : (
                <>
                    {activeTab === 'daily' && (
                        <div>
                            <div style={{ marginBottom: 'var(--space-5)' }}>
                                <input type="date" value={dailyDate} onChange={e => setDailyDate(e.target.value)} className="form-input" style={{ width: 200 }} id="input-daily-date" />
                            </div>
                            {dailyData && (
                                <div className="stats-grid" id="daily-stats">
                                    <StatCard label="Total Sales" value={formatCurrency(dailyData.totalSales)} icon={FaMoneyBillWave} color="#059669" index={0} />
                                    <StatCard label="Total Invoices" value={dailyData.totalOrders} icon={FaShoppingCart} color="#2563eb" index={1} />
                                    <StatCard label="Cash Sales" value={formatCurrency(dailyData.cashSales)} icon={FaMoneyBillWave} color="#059669" index={2} />
                                    <StatCard label="Card Sales" value={formatCurrency(dailyData.cardSales)} icon={FaCreditCard} color="#7c3aed" index={3} />
                                    <StatCard label="POS Orders" value={dailyData.posOrders} icon={FaReceipt} color="#0891b2" index={4} />
                                    <StatCard label="Online Orders" value={dailyData.onlineOrders} icon={FaShoppingCart} color="#db2777" index={5} />
                                    <StatCard label="Returns" value={formatCurrency(dailyData.totalReturns)} icon={FaMoneyBillWave} color="#dc2626" index={6} />
                                    <StatCard label="Expenses" value={formatCurrency(dailyData.totalExpenses)} icon={FaMoneyBillWave} color="#d97706" index={7} />
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <StatCard label="Net Revenue" value={formatCurrency(dailyData.netRevenue)} icon={FaMoneyBillWave} color={dailyData.netRevenue >= 0 ? '#059669' : '#dc2626'} index={8} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'monthly' && (
                        <div>
                            <div className="flex gap-3" style={{ marginBottom: 'var(--space-5)' }}>
                                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="form-select" style={{ width: 160 }}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleDateString('en-US', { month: 'long' })}</option>
                                    ))}
                                </select>
                                <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="form-input" style={{ width: 100 }} />
                            </div>

                            {monthlyData && (
                                <>
                                    <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                                        <StatCard label="Monthly Sales" value={formatCurrency(monthlyData.totalSales)} icon={FaMoneyBillWave} color="#059669" index={0} />
                                        <StatCard label="Total Invoices" value={monthlyData.totalOrders} icon={FaShoppingCart} color="#2563eb" index={1} />
                                        <StatCard label="Expenses" value={formatCurrency(monthlyData.totalExpenses)} icon={FaMoneyBillWave} color="#d97706" index={2} />
                                        <StatCard label="Net Revenue" value={formatCurrency(monthlyData.netRevenue)} icon={FaMoneyBillWave} color={monthlyData.netRevenue >= 0 ? '#059669' : '#dc2626'} index={3} />
                                    </div>

                                    <div className="grid-2-1" style={{ marginBottom: 'var(--space-6)' }}>
                                        <div className="card card-body">
                                            <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Daily Sales</h3>
                                            <ResponsiveContainer width="100%" height={280}>
                                                <BarChart data={monthlyData.dailyBreakdown}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                                                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                                                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                                                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }} />
                                                    <Bar dataKey="totalSales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Sales" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="card card-body">
                                            <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Expenses by Category</h3>
                                            {monthlyData.expenseBreakdown?.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={280}>
                                                    <PieChart>
                                                        <Pie data={monthlyData.expenseBreakdown.map(e => ({ name: getExpenseCategoryLabel(e._id), value: e.total }))}
                                                            cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                            labelLine={false}>
                                                            {monthlyData.expenseBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                                        </Pie>
                                                        <Tooltip formatter={(v) => formatCurrency(v)} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 'var(--space-10)' }}>No expenses recorded</p>}
                                        </div>
                                    </div>

                                    {topProducts.length > 0 && (
                                        <div className="card card-body">
                                            <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Top Selling Products (Last 30 Days)</h3>
                                            <table className="data-table">
                                                <thead>
                                                    <tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr>
                                                </thead>
                                                <tbody>
                                                    {topProducts.map((p, i) => (
                                                        <tr key={p._id || i}>
                                                            <td>{i + 1}</td>
                                                            <td className="cell-bold">{p.productName || 'Product'}</td>
                                                            <td>{p.totalQuantity}</td>
                                                            <td className="cell-success">{formatCurrency(p.totalRevenue)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Reports;
