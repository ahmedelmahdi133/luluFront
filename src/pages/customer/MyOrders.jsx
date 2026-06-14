import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { COLORS } from '../../utils/constants';
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor } from '../../utils/formatters';
import { FaClipboardList, FaBox } from 'react-icons/fa';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const C = COLORS.customerPrimary;

    useEffect(() => {
        api.get('/store/orders/my')
            .then(r => setOrders(r.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>جاري التحميل...</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 20px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 24 }}>طلباتي</h2>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                    <FaClipboardList size={48} />
                    <p style={{ marginTop: 12 }}>لا توجد طلبات حتى الآن</p>
                </div>
            ) : (
                orders.map(order => {
                    const sc = getStatusColor(order.status);
                    return (
                        <div key={order._id} style={{
                            backgroundColor: 'white', borderRadius: 14, padding: 20,
                            marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            borderRight: `4px solid ${sc.text}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{order.orderNumber}</span>
                                    <span style={{ fontSize: 12, color: '#94a3b8', marginRight: 10 }}>{formatDateTime(order.createdAt)}</span>
                                </div>
                                <span style={{
                                    padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                    backgroundColor: sc.bg, color: sc.text
                                }}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                {order.items?.map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '6px 0', borderBottom: i < order.items.length - 1 ? '1px solid #f8fafc' : 'none',
                                        fontSize: 13
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <FaBox size={10} color="#94a3b8" />
                                            <span style={{ color: '#475569' }}>{item.productName || 'منتج'}</span>
                                            <span style={{ color: '#94a3b8' }}>x{item.quantity}</span>
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{(item.priceAtPurchase * item.quantity).toFixed(2)} ج.م</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: 13, color: '#64748b' }}>
                                    {order.deliveryAddress && `العنوان: ${order.deliveryAddress.substring(0, 50)}`}
                                </span>
                                <span style={{ fontSize: 18, fontWeight: 700, color: C }}>{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MyOrders;
