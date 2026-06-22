import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { FaExclamationTriangle, FaArrowUp, FaArrowDown, FaSort, FaShoppingCart } from 'react-icons/fa';

const Shortages = () => {
    const [shortages, setShortages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'stockQuantity', direction: 'asc' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShortages = async () => {
            try {
                const res = await api.get('/products/shortages-insights');
                setShortages(res.data.data);
            } catch (err) {
                toast.error('Error fetching shortages insights');
            } finally {
                setLoading(false);
            }
        };
        fetchShortages();
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedShortages = [...shortages].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return <FaSort className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
        }
        return sortConfig.direction === 'asc' ? <FaArrowUp className="text-indigo-500" /> : <FaArrowDown className="text-indigo-500" />;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <PageHeader 
                title="Shortages Insights" 
                subtitle="Review low stock items and their monthly sales rate to prioritize restocking"
                icon={<FaExclamationTriangle className="text-orange-500" />}
            />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading insights...</div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-sm font-semibold text-slate-600">
                                    <th className="p-4">Product Name</th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                        onClick={() => handleSort('stockQuantity')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Current Stock {getSortIcon('stockQuantity')}
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                        onClick={() => handleSort('monthlySalesRate')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Monthly Sales {getSortIcon('monthlySalesRate')}
                                        </div>
                                    </th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedShortages.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500">
                                            No critical shortages found (Stock &le; 10).
                                        </td>
                                    </tr>
                                ) : (
                                    sortedShortages.map((item) => {
                                        const isCritical = item.stockQuantity === 0;
                                        return (
                                            <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover border border-slate-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">No Img</div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-slate-800">{item.name}</div>
                                                            <div className="text-xs text-slate-500">Min Alert: {item.minStockAlert || 10}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full ${isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {item.stockQuantity}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-700">{item.monthlySalesRate}</span>
                                                        <span className="text-xs text-slate-400">units/mo</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {item.monthlySalesRate > 20 && item.stockQuantity < 5 ? (
                                                        <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                                            <FaExclamationTriangle /> Urgent
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-orange-600">Low Stock</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => navigate('/purchases')}
                                                        style={{ background: 'var(--color-info-light)', color: 'var(--color-info-dark)', borderColor: 'transparent' }}
                                                    >
                                                        <FaShoppingCart /> Restock
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shortages;
