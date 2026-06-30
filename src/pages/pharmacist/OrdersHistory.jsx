import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor, getPaymentMethodLabel } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { FaEye, FaTimes, FaHistory } from 'react-icons/fa';

const OrdersHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ orderType: '', status: '', startDate: '', endDate: '' });
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.orderType) params.append('orderType', filter.orderType);
            if (filter.status) params.append('status', filter.status);
            if (filter.startDate) params.append('startDate', filter.startDate);
            if (filter.endDate) params.append('endDate', filter.endDate);
            const res = await api.get(`/orders?${params}`);
            setOrders(res.data.data);
        } catch { toast.error('Error fetching orders'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [filter]);

    const updateStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            toast.success('Order status updated');
            fetchOrders();
            if (selectedOrder && getId(selectedOrder) === orderId) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const settleInvoice = async (order) => {
        const due = Number(order.dueAmount || order.totalAmount || 0);
        const methodInput = window.prompt('Settlement method: cash or visa', 'cash');
        if (!methodInput) return;
        const paymentMethod = methodInput.toLowerCase() === 'visa' ? 'visa' : 'cash';

        let paidAmount = due;
        if (paymentMethod === 'cash') {
            const paidInput = window.prompt(`Remaining due: ${due.toFixed(2)}. Enter paid amount:`, due.toFixed(2));
            if (!paidInput) return;
            paidAmount = Number(paidInput);
            if (Number.isNaN(paidAmount) || paidAmount < due) {
                toast.error('Paid amount must be valid and >= remaining due');
                return;
            }
        }

        try {
            await api.put(`/orders/${getId(order)}/settle`, { paymentMethod, paidAmount });
            toast.success('Pending invoice settled successfully');
            fetchOrders();
            if (selectedOrder && getId(selectedOrder) === getId(order)) {
                setSelectedOrder(null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Settlement failed');
        }
    };

    const columns = [
        { key: 'orderNumber', label: 'Invoice #', render: (val) => <span className="cell-bold">{val}</span> },
        { key: 'createdAt', label: 'Date', render: (val) => formatDateTime(val), width: 160 },
        {
            key: 'orderType', label: 'Type', width: 100,
            render: (val) => <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${val === 'POS' ? 'badge-primary' : 'badge-success'}`}>{val === 'POS' ? 'POS' : 'Online'}</span>
        },
        {
            key: 'status', label: 'Status', width: 110,
            render: (val) => { const sc = getStatusColor(val); return <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${sc.cls}`}>{getStatusLabel(val)}</span>; }
        },
        {
            key: 'products', label: 'Products', width: 200,
            render: (_, row) => {
                if (!row.items || row.items.length === 0) return '—';
                const productNames = row.items.map(item => `${item.productName || item.product?.name || 'Unknown'} (x${item.quantity})`).join(', ');
                return <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={productNames}>{productNames}</span>;
            }
        },
        { key: 'totalAmount', label: 'Total', render: (val) => <span className="cell-bold" style={{ color: 'var(--color-primary)' }}>{formatCurrency(val)}</span>, width: 100 },
        {
            key: 'paymentMethod', label: 'Payment', width: 130,
            render: (val, row) => val === 'pending' ? <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-amber-100 text-amber-900">Pending ({(row.dueAmount ?? row.totalAmount)?.toFixed?.(2)})</span> : getPaymentMethodLabel(val)
        },
        {
            key: 'actions', label: 'Actions', sortable: false, noExport: true, width: 200,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); }}>
                        <FaEye size={12} /> Details
                    </Button>
                    {row.orderType === 'ONLINE' && row.status === 'pending' && (
                        <>
                            <Button size="sm" style={{ background: 'var(--color-info-light)', color: 'var(--color-info-dark)', borderColor: 'transparent' }} onClick={(e) => { e.stopPropagation(); updateStatus(getId(row), 'processing'); }}>Process</Button>
                            <Button size="sm" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger-dark)', borderColor: 'transparent' }} onClick={(e) => { e.stopPropagation(); updateStatus(getId(row), 'cancelled'); }}>Cancel</Button>
                        </>
                    )}
                    {row.status === 'processing' && (
                        <Button size="sm" style={{ background: 'var(--color-success-light)', color: 'var(--color-success-dark)', borderColor: 'transparent' }} onClick={(e) => { e.stopPropagation(); updateStatus(getId(row), 'delivered'); }}>Delivered</Button>
                    )}
                    {(row.paymentMethod === 'pending' || (row.dueAmount || 0) > 0) && (
                        <Button size="sm" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning-dark)', borderColor: 'transparent' }} onClick={(e) => { e.stopPropagation(); settleInvoice(row); }}>Settle</Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="page-wrapper" id="orders-history-page">
            <PageHeader
                title="Sales History"
                subtitle="View and manage all sales and orders"
                breadcrumbs={[{ label: 'Sales', to: '/orders' }, { label: 'Sales History' }]}
            />

            {/* Filters */}
            <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
                <InputField 
                    type="select" 
                    value={filter.orderType} 
                    onChange={e => setFilter({ ...filter, orderType: e.target.value })} 
                    style={{ width: 160 }}
                    options={[
                        { value: '', label: 'All Types' },
                        { value: 'POS', label: 'POS' },
                        { value: 'ONLINE', label: 'Online' }
                    ]}
                />
                <InputField 
                    type="select" 
                    value={filter.status} 
                    onChange={e => setFilter({ ...filter, status: e.target.value })} 
                    style={{ width: 160 }}
                    options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'processing', label: 'Processing' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'delivered', label: 'Delivered' },
                        { value: 'cancelled', label: 'Cancelled' }
                    ]}
                />
                <InputField type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} style={{ width: 160 }} />
                <InputField type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} style={{ width: 160 }} />
            </div>

            <DataTable
                columns={columns}
                data={orders}
                loading={loading}
                emptyTitle="No orders found"
                emptyDescription="Try adjusting your filters."
                emptyIcon={FaHistory}
                exportFilename="sales_history.csv"
            />

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Invoice {selectedOrder.orderNumber}</h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}><FaTimes size={16} /></Button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-md)' }}>
                                <div><strong>Date:</strong> {formatDateTime(selectedOrder.createdAt)}</div>
                                <div><strong>Type:</strong> {selectedOrder.orderType === 'POS' ? 'POS Sale' : 'Online'}</div>
                                <div><strong>Status:</strong> <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${getStatusColor(selectedOrder.status).cls}`}>{getStatusLabel(selectedOrder.status)}</span></div>
                                <div><strong>Cashier:</strong> {selectedOrder.pharmacistId?.name || selectedOrder.pharmacist?.name || '—'}</div>
                                {selectedOrder.customerPhone && <div><strong>Phone:</strong> {selectedOrder.customerPhone}</div>}
                                {selectedOrder.deliveryAddress && <div><strong>Address:</strong> {selectedOrder.deliveryAddress}</div>}
                                {selectedOrder.notes && <div style={{ gridColumn: 'span 2' }}><strong>Notes:</strong> {selectedOrder.notes}</div>}
                            </div>

                            <table className="w-full border-collapse text-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                <thead>
                                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, i) => (
                                        <tr key={i}>
                                            <td className="cell-bold">{item.productName || item.productId?.name || '—'}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.priceAtPurchase}</td>
                                            <td className="cell-bold">{(item.quantity * item.priceAtPurchase).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-md)', lineHeight: 2.2 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>{selectedOrder.subtotal?.toFixed(2)}</span></div>
                                {selectedOrder.discountValue > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}><span>Discount:</span><span>-{(selectedOrder.subtotal - selectedOrder.totalAmount).toFixed(2)}</span></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', borderTop: '2px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
                                    <span>Total:</span><span>{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersHistory;
