import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor } from '../../utils/formatters';
import { FaClipboardList, FaBox } from 'react-icons/fa';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/store/orders/my')
            .then(r => setOrders(r.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-5" dir="rtl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">طلباتي</h2>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <FaClipboardList size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold text-lg m-0">لا توجد طلبات حتى الآن</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const sc = getStatusColor(order.status);
                        return (
                            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-md">
                                <div 
                                    className="absolute top-0 right-0 bottom-0 w-1.5" 
                                    style={{ backgroundColor: sc.text }}
                                ></div>
                                
                                <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row mb-4 gap-3">
                                    <div>
                                        <span className="font-bold text-slate-800 text-base ml-3">{order.orderNumber}</span>
                                        <span className="text-xs font-semibold text-slate-400">{formatDateTime(order.createdAt)}</span>
                                    </div>
                                    <span 
                                        className="px-4 py-1.5 rounded-full text-xs font-bold"
                                        style={{ backgroundColor: sc.bg, color: sc.text }}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>

                                <div className="mb-4 bg-slate-50 rounded-xl p-4">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className={`flex justify-between items-center py-2 text-sm ${i < order.items.length - 1 ? 'border-b border-slate-200/60' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <FaBox size={12} className="text-slate-400" />
                                                <span className="text-slate-700 font-medium">{item.productName || 'منتج'}</span>
                                                <span className="text-slate-400 text-xs font-semibold">x{item.quantity}</span>
                                            </div>
                                            <span className="font-bold text-slate-800">{(item.priceAtPurchase * item.quantity).toFixed(2)} ج.م</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-100 flex-wrap gap-4">
                                    <span className="text-sm font-medium text-slate-500 max-w-[250px] truncate" title={order.deliveryAddress}>
                                        {order.deliveryAddress && `العنوان: ${order.deliveryAddress}`}
                                    </span>
                                    <span className="text-xl font-black text-teal-600">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
