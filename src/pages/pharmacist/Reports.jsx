import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency, getExpenseCategoryLabel, formatDate } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { FaCalendarDay, FaCalendarAlt, FaExclamationTriangle, FaClock, FaMoneyBillWave, FaShoppingCart, FaReceipt, FaCreditCard, FaBoxOpen, FaEdit, FaEye } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ContextMenu from '../../components/common/ContextMenu';
import InputField from '../../components/common/InputField';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Reports = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [dailyDate, setDailyDate] = useState(new Date().toISOString().substring(0, 10));
    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [shortagesData, setShortagesData] = useState([]);
    const [expiryData, setExpiryData] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState(null);
    const navigate = useNavigate();

    const handleContextMenu = (e, product) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, product });
    };

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'daily') {
            api.get(`/reports/daily?date=${dailyDate}`).then(r => { setDailyData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
        } else if (activeTab === 'monthly') {
            Promise.all([
                api.get(`/reports/monthly?year=${year}&month=${month}`),
                api.get('/reports/top-products?days=30')
            ]).then(([r1, r2]) => {
                setMonthlyData(r1.data.data);
                setTopProducts(r2.data.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        } else if (activeTab === 'inventory') {
            Promise.all([
                api.get('/reports/shortages-analysis'),
                api.get('/reports/expiry-alerts?days=90')
            ]).then(([r1, r2]) => {
                setShortagesData(r1.data.data);
                setExpiryData(r2.data.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [activeTab, dailyDate, month, year]);

    return (
        <div className="page-wrapper" id="reports-page">
            <PageHeader
                title="Pharmacy Reports"
                subtitle="Financial analytics, sales insights, and inventory health"
                breadcrumbs={[{ label: 'Finance', to: '/reports' }, { label: 'Reports' }]}
            />

            {/* Premium Tabs Navigation */}
            <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-slate-200/60 shadow-sm w-max">
                {[
                    { id: 'daily', label: 'Daily Sales', icon: FaCalendarDay },
                    { id: 'monthly', label: 'Monthly Analytics', icon: FaCalendarAlt },
                    { id: 'inventory', label: 'Shortages & Alerts', icon: FaExclamationTriangle },
                ].map(t => (
                    <button 
                        key={t.id} 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                            activeTab === t.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            {loading ? <LoadingSkeleton type="dashboard" /> : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* DAILY REPORT */}
                    {activeTab === 'daily' && (
                        <div>
                            <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-max">
                                <label className="text-sm font-semibold text-slate-600">Select Date:</label>
                                <InputField 
                                    type="date" 
                                    value={dailyDate} 
                                    onChange={e => setDailyDate(e.target.value)} 
                                />
                            </div>
                            
                            {dailyData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <StatCard label="Total Sales" value={formatCurrency(dailyData.totalSales)} icon={FaMoneyBillWave} color="#10b981" index={0} />
                                    <StatCard label="Net Revenue" value={formatCurrency(dailyData.netRevenue)} icon={FaMoneyBillWave} color={dailyData.netRevenue >= 0 ? '#10b981' : '#ef4444'} index={1} />
                                    <StatCard label="Total Invoices" value={dailyData.totalOrders} icon={FaReceipt} color="#4f46e5" index={2} />
                                    <StatCard label="Total Expenses" value={formatCurrency(dailyData.totalExpenses)} icon={FaShoppingCart} color="#f59e0b" index={3} />
                                    
                                    <StatCard label="Cash Sales" value={formatCurrency(dailyData.cashSales)} icon={FaMoneyBillWave} color="#10b981" index={4} bgColor="#ecfdf5" />
                                    <StatCard label="Card Sales" value={formatCurrency(dailyData.cardSales)} icon={FaCreditCard} color="#8b5cf6" index={5} bgColor="#f5f3ff" />
                                    <StatCard label="POS Orders" value={dailyData.posOrders} icon={FaShoppingCart} color="#06b6d4" index={6} bgColor="#ecfeff" />
                                    <StatCard label="Returns" value={formatCurrency(dailyData.totalReturns)} icon={FaExclamationTriangle} color="#ef4444" index={7} bgColor="#fef2f2" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* MONTHLY REPORT */}
                    {activeTab === 'monthly' && (
                        <div>
                            <div className="flex gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-max">
                                <InputField 
                                    type="select" 
                                    value={month} 
                                    onChange={e => setMonth(Number(e.target.value))} 
                                    style={{ width: 160 }}
                                    options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i).toLocaleDateString('en-US', { month: 'long' }) }))}
                                />
                                <InputField 
                                    type="number" 
                                    value={year} 
                                    onChange={e => setYear(Number(e.target.value))} 
                                    style={{ width: 112 }} 
                                />
                            </div>

                            {monthlyData && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                        <StatCard label="Monthly Sales" value={formatCurrency(monthlyData.totalSales)} icon={FaMoneyBillWave} color="#10b981" index={0} />
                                        <StatCard label="Net Revenue" value={formatCurrency(monthlyData.netRevenue)} icon={FaMoneyBillWave} color={monthlyData.netRevenue >= 0 ? '#10b981' : '#ef4444'} index={1} />
                                        <StatCard label="Total Invoices" value={monthlyData.totalOrders} icon={FaReceipt} color="#4f46e5" index={2} />
                                        <StatCard label="Expenses" value={formatCurrency(monthlyData.totalExpenses)} icon={FaShoppingCart} color="#f59e0b" index={3} />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                        {/* Sales Chart */}
                                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md">
                                            <h3 className="text-lg font-bold text-slate-800 mb-6">Daily Revenue Trend</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={monthlyData.dailyBreakdown}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `EGP ${v}`} />
                                                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                                    <Area type="monotone" dataKey="totalSales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Expenses Pie Chart */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md">
                                            <h3 className="text-lg font-bold text-slate-800 mb-6">Expenses Breakdown</h3>
                                            {monthlyData.expenseBreakdown?.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={280}>
                                                    <PieChart>
                                                        <Pie 
                                                            data={monthlyData.expenseBreakdown.map(e => ({ name: getExpenseCategoryLabel(e._id), value: e.total }))}
                                                            cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none"
                                                        >
                                                            {monthlyData.expenseBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                                        </Pie>
                                                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-[280px] flex items-center justify-center text-slate-400 flex-col gap-2">
                                                    <FaBoxOpen size={40} className="opacity-20" />
                                                    <p>No expenses recorded</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Products Table */}
                                    {topProducts.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md">
                                            <h3 className="text-lg font-bold text-slate-800 mb-6">Top Selling Products (Last 30 Days)</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                                        <tr>
                                                            <th className="px-6 py-4 rounded-tl-lg">#</th>
                                                            <th className="px-6 py-4">Product Name</th>
                                                            <th className="px-6 py-4">Quantity Sold</th>
                                                            <th className="px-6 py-4 rounded-tr-lg">Revenue Generated</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {topProducts.map((p, i) => (
                                                            <tr key={p._id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-6 py-4 font-medium text-slate-500">{i + 1}</td>
                                                                <td className="px-6 py-4 font-bold text-slate-800">{p.productName || 'Product'}</td>
                                                                <td className="px-6 py-4 text-slate-600">
                                                                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">{p.totalQuantity} units</span>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(p.totalRevenue)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* INVENTORY & SHORTAGES REPORT */}
                    {activeTab === 'inventory' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Shortages Analysis */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl"><FaExclamationTriangle size={20} /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Critical Shortages Analysis</h3>
                                        <p className="text-sm text-slate-500">Products sold recently that are low in stock</p>
                                    </div>
                                </div>
                                
                                {shortagesData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-lg">Product</th>
                                                    <th className="px-4 py-3">Sold (30d)</th>
                                                    <th className="px-4 py-3">Stock Left</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shortagesData.map((p) => (
                                                    <tr 
                                                        key={p.id} 
                                                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer"
                                                        onContextMenu={(e) => handleContextMenu(e, p)}
                                                    >
                                                        <td className="px-4 py-3 font-bold text-slate-800">{p.name}</td>
                                                        <td className="px-4 py-3 text-slate-600">{p.soldThisMonth}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md font-bold border border-red-100">
                                                                {p.stockQuantity}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No critical shortages detected.</p>
                                )}
                            </div>

                            {/* Expiry Alerts */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FaClock size={20} /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Expiry Alerts</h3>
                                        <p className="text-sm text-slate-500">Products expiring within 90 days</p>
                                    </div>
                                </div>
                                
                                {expiryData?.expiringSoon?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-lg">Product</th>
                                                    <th className="px-4 py-3">Expiry Date</th>
                                                    <th className="px-4 py-3">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expiryData.expiringSoon.map((p) => (
                                                    <tr 
                                                        key={p.id} 
                                                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer"
                                                        onContextMenu={(e) => handleContextMenu(e, p)}
                                                    >
                                                        <td className="px-4 py-3 font-bold text-slate-800">{p.name}</td>
                                                        <td className="px-4 py-3 text-amber-600 font-medium">{formatDate(p.expiryDate)}</td>
                                                        <td className="px-4 py-3 text-slate-600">{p.stockQuantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No products expiring soon.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    actions={[
                        {
                            label: 'Manage & Edit Price',
                            icon: FaEdit,
                            onClick: () => navigate('/products', { state: { editProduct: contextMenu.product } })
                        },
                        {
                            label: 'Sell in POS',
                            icon: FaShoppingCart,
                            onClick: () => navigate('/pos')
                        }
                    ]}
                />
            )}
        </div>
    );
};

export default Reports;
