import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatCurrency, formatDate, getReturnReasonLabel } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import InputField from '../../components/common/InputField';
import { FaSearch, FaUndo, FaShoppingCart, FaTruck } from 'react-icons/fa';

const RETURN_REASONS_SALES = [
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'wrong_item', label: 'Wrong Item' },
    { value: 'expired', label: 'Expired' },
    { value: 'other', label: 'Other' },
];

const RETURN_REASONS_PURCHASE = [
    { value: 'defective', label: 'Defective' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'expired', label: 'Expired' },
    { value: 'wrong_item', label: 'Wrong Item' },
    { value: 'overstock', label: 'Overstock' },
    { value: 'other', label: 'Other' },
];

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sales');
    const [filterType, setFilterType] = useState('');

    // Sales return state
    const [orderNumber, setOrderNumber] = useState('');
    const [foundOrder, setFoundOrder] = useState(null);
    const [salesReturnItems, setSalesReturnItems] = useState([]);
    const [salesRefundMethod, setSalesRefundMethod] = useState('cash');
    const [salesNotes, setSalesNotes] = useState('');

    // Purchase return state
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [foundPurchase, setFoundPurchase] = useState(null);
    const [purchaseReturnItems, setPurchaseReturnItems] = useState([]);
    const [purchaseNotes, setPurchaseNotes] = useState('');

    const fetchReturns = async () => {
        try {
            const params = filterType ? `?type=${filterType}` : '';
            const res = await api.get(`/returns${params}`);
            setReturns(res.data.data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReturns(); }, [filterType]);

    // ============ SALES RETURN ============
    const searchSalesOrder = async () => {
        if (!orderNumber.trim()) return;
        try {
            const res = await api.get(`/returns/search-order?q=${orderNumber.trim()}`);
            setFoundOrder(res.data.data);
            setSalesReturnItems([]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Order not found');
            setFoundOrder(null);
        }
    };

    const toggleSalesItem = (item) => {
        const pid = item.productId?._id || item.productId;
        const exists = salesReturnItems.find(r => r.productId === pid);
        if (exists) {
            setSalesReturnItems(salesReturnItems.filter(r => r.productId !== pid));
        } else {
            setSalesReturnItems([...salesReturnItems, {
                productId: pid,
                name: item.productName || item.productId?.name || 'Product',
                quantity: item.quantity,
                maxQuantity: item.quantity,
                priceAtReturn: item.priceAtPurchase,
                reason: 'customer_request'
            }]);
        }
    };

    const updateSalesItem = (productId, field, value) => {
        setSalesReturnItems(salesReturnItems.map(r => {
            if (r.productId === productId) {
                if (field === 'quantity') value = Math.min(Math.max(1, Number(value)), r.maxQuantity);
                return { ...r, [field]: value };
            }
            return r;
        }));
    };

    const submitSalesReturn = async () => {
        if (salesReturnItems.length === 0) { toast.error('Select items to return'); return; }
        try {
            await api.post('/returns/sales', {
                orderId: foundOrder._id,
                items: salesReturnItems.map(r => ({ productId: r.productId, quantity: r.quantity, reason: r.reason })),
                refundMethod: salesRefundMethod,
                notes: salesNotes
            });
            toast.success('Sales return completed - stock updated');
            setFoundOrder(null); setSalesReturnItems([]); setOrderNumber(''); setSalesNotes('');
            fetchReturns();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const salesTotalRefund = salesReturnItems.reduce((t, i) => t + i.priceAtReturn * i.quantity, 0);

    // ============ PURCHASE RETURN ============
    const searchPurchaseInvoice = async () => {
        if (!invoiceNumber.trim()) return;
        try {
            const res = await api.get(`/returns/search-purchase?q=${invoiceNumber.trim()}`);
            setFoundPurchase(res.data.data);
            setPurchaseReturnItems([]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invoice not found');
            setFoundPurchase(null);
        }
    };

    const togglePurchaseItem = (item) => {
        const pid = item.productId?._id || item.productId;
        const exists = purchaseReturnItems.find(r => r.productId === pid);
        if (exists) {
            setPurchaseReturnItems(purchaseReturnItems.filter(r => r.productId !== pid));
        } else {
            setPurchaseReturnItems([...purchaseReturnItems, {
                productId: pid,
                name: item.productId?.name || 'Product',
                quantity: item.quantity,
                maxQuantity: item.quantity,
                priceAtReturn: item.purchasePrice,
                reason: 'defective'
            }]);
        }
    };

    const updatePurchaseItem = (productId, field, value) => {
        setPurchaseReturnItems(purchaseReturnItems.map(r => {
            if (r.productId === productId) {
                if (field === 'quantity') value = Math.min(Math.max(1, Number(value)), r.maxQuantity);
                return { ...r, [field]: value };
            }
            return r;
        }));
    };

    const submitPurchaseReturn = async () => {
        if (purchaseReturnItems.length === 0) { toast.error('Select items to return'); return; }
        try {
            await api.post('/returns/purchase', {
                purchaseId: foundPurchase._id,
                items: purchaseReturnItems.map(r => ({ productId: r.productId, quantity: r.quantity, reason: r.reason })),
                notes: purchaseNotes
            });
            toast.success('Purchase return completed - stock deducted');
            setFoundPurchase(null); setPurchaseReturnItems([]); setInvoiceNumber(''); setPurchaseNotes('');
            fetchReturns();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const purchaseTotalRefund = purchaseReturnItems.reduce((t, i) => t + i.priceAtReturn * i.quantity, 0);

    // ============ HISTORY TABLE COLUMNS ============
    const historyColumns = [
        {
            key: 'returnNumber', label: 'Return #', width: 130,
            render: (val) => <span className="cell-mono cell-bold">{val}</span>
        },
        {
            key: 'returnType', label: 'Type', width: 100,
            render: (val) => (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${val === 'sales' ? 'badge-success' : 'badge-primary'}`}>
                    {val === 'sales' ? 'Sales' : 'Purchase'}
                </span>
            )
        },
        {
            key: 'orderId', label: 'Reference', width: 150, sortable: false,
            render: (val, row) => (
                <span className="cell-mono">{val?.orderNumber || row.purchaseId?.invoiceNumber || '—'}</span>
            )
        },
        {
            key: 'items', label: 'Items', sortable: false,
            render: (val) => (
                <span className="text-sm">
                    {val?.map(i => i.productName || '').filter(Boolean).join(', ').substring(0, 40) || `${val?.length || 0} items`}
                </span>
            )
        },
        {
            key: 'totalRefund', label: 'Refund', width: 130,
            render: (val, row) => (
                <span style={{ fontWeight: 700, color: row.returnType === 'sales' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                    {formatCurrency(val)}
                </span>
            )
        },
        {
            key: 'refundMethod', label: 'Method', width: 100,
            render: (val) => <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-slate-200 text-slate-600">{val === 'cash' ? 'Cash' : val === 'exchange' ? 'Exchange' : 'Credit'}</span>
        },
        {
            key: 'createdAt', label: 'Date', width: 120,
            render: (val) => <span className="text-muted">{formatDate(val)}</span>
        },
    ];

    if (loading) return <div className="page-wrapper"><LoadingSkeleton type="page" columns={7} /></div>;

    return (
        <div className="page-wrapper" id="returns-page">
            <PageHeader
                title="Returns Management"
                subtitle="Process sales returns and purchase returns"
                breadcrumbs={[{ label: 'Sales', to: '/returns' }, { label: 'Returns' }]}
            />

            {/* Tab Buttons */}
            <div className="tabs" id="returns-tabs">
                <button onClick={() => setActiveTab('sales')} className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`} id="tab-sales-return">
                    <FaShoppingCart size={14} /> Sales Return
                </button>
                <button onClick={() => setActiveTab('purchase')} className={`tab-btn ${activeTab === 'purchase' ? 'active' : ''}`} id="tab-purchase-return">
                    <FaTruck size={14} /> Purchase Return
                </button>
            </div>

            {/* ============ SALES RETURN TAB ============ */}
            {activeTab === 'sales' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-success)' }} id="sales-return-card">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ color: 'var(--color-success)', marginBottom: 'var(--space-2)' }}>
                        <FaUndo size={14} /> New Sales Return
                    </h3>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                        Return items from a sales invoice back to stock. Customer gets a refund.
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        <SearchInput
                            placeholder="Enter order number (e.g. ORD-17...)"
                            value={orderNumber}
                            onChange={e => setOrderNumber(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchSalesOrder()}
                            wrapperStyle={{ flex: 1 }}
                            id="input-search-order"
                        />
                        <Button variant="success" onClick={searchSalesOrder} id="btn-search-order">
                            <FaSearch size={12} /> Search
                        </Button>
                    </div>

                    {foundOrder && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" style={{ border: '1px solid var(--color-border)' }} id="found-order-details">
                            <div className="p-6">
                                <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }}>
                                    <span className="text-sm text-muted">Order: <strong className="text-primary">{foundOrder.orderNumber}</strong></span>
                                    <span className="text-sm text-muted">Total: <strong className="text-primary">{foundOrder.totalAmount?.toFixed(2)} EGP</strong></span>
                                    <span className="text-sm text-muted">Payment: <strong className="text-primary">{foundOrder.paymentMethod}</strong></span>
                                </div>

                                <div className="text-sm font-semibold" style={{ marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Select items to return:</div>
                                {foundOrder.items?.map((item, i) => {
                                    const pid = item.productId?._id || item.productId;
                                    const selected = salesReturnItems.find(r => r.productId === pid);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => toggleSalesItem(item)}
                                            className={`return-item-row ${selected ? 'selected' : ''}`}
                                            style={{
                                                display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                                                padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)',
                                                border: selected ? '1px solid var(--color-success-light)' : '1px solid var(--color-border-light)',
                                                background: selected ? 'var(--color-success-light)' : 'var(--color-bg-muted)',
                                                cursor: 'pointer', transition: 'all var(--transition-fast)',
                                            }}
                                        >
                                            <input type="checkbox" checked={!!selected} readOnly />
                                            <span style={{ flex: 1, fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>
                                                {item.productName || item.productId?.name || 'Product'}
                                            </span>
                                            <span className="text-sm text-muted">x{item.quantity}</span>
                                            <span className="text-sm font-semibold">{item.priceAtPurchase?.toFixed(2)} EGP</span>
                                        </div>
                                    );
                                })}

                                {salesReturnItems.length > 0 && (
                                    <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)' }}>
                                        <div className="text-sm font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>Return Details:</div>
                                        {salesReturnItems.map(r => (
                                            <div key={r.productId} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-base)' }}>
                                                <span style={{ flex: 1, fontWeight: 'var(--font-weight-medium)' }}>{r.name}</span>
                                                <label className="text-xs text-muted">Qty:</label>
                                                <InputField
                                                    type="number" min="1" max={r.maxQuantity} value={r.quantity}
                                                    onChange={e => updateSalesItem(r.productId, 'quantity', e.target.value)}
                                                    style={{ width: 60, padding: '4px 8px', textAlign: 'center' }}
                                                />
                                                <InputField 
                                                    type="select" 
                                                    value={r.reason} 
                                                    onChange={e => updateSalesItem(r.productId, 'reason', e.target.value)} 
                                                    style={{ width: 'auto' }}
                                                    options={RETURN_REASONS_SALES.map(rr => ({ value: rr.value, label: rr.label }))}
                                                />
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', alignItems: 'center' }}>
                                            <InputField 
                                                type="select" 
                                                value={salesRefundMethod} 
                                                onChange={e => setSalesRefundMethod(e.target.value)} 
                                                style={{ width: 'auto' }} 
                                                id="select-refund-method"
                                                options={[
                                                    { value: 'cash', label: 'Cash Refund' },
                                                    { value: 'exchange', label: 'Exchange' }
                                                ]}
                                            />
                                            <InputField placeholder="Notes (optional)" value={salesNotes} onChange={e => setSalesNotes(e.target.value)} style={{ flex: 1 }} id="input-sales-notes" />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--color-danger)' }}>
                                                Refund Total: {formatCurrency(salesTotalRefund)}
                                            </span>
                                            <Button variant="success" size="lg" onClick={submitSalesReturn} id="btn-confirm-sales-return">
                                                <FaUndo size={14} /> Confirm Return
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============ PURCHASE RETURN TAB ============ */}
            {activeTab === 'purchase' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-primary)' }} id="purchase-return-card">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                        <FaUndo size={14} /> New Purchase Return
                    </h3>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                        Return items from a purchase invoice back to the supplier. Stock will be deducted.
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        <SearchInput
                            placeholder="Enter purchase invoice number..."
                            value={invoiceNumber}
                            onChange={e => setInvoiceNumber(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchPurchaseInvoice()}
                            wrapperStyle={{ flex: 1 }}
                            id="input-search-purchase"
                        />
                        <Button onClick={searchPurchaseInvoice} id="btn-search-purchase">
                            <FaSearch size={12} /> Search
                        </Button>
                    </div>

                    {foundPurchase && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" style={{ border: '1px solid var(--color-border)' }} id="found-purchase-details">
                            <div className="p-6">
                                <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }}>
                                    <span className="text-sm text-muted">Invoice: <strong className="text-primary">{foundPurchase.invoiceNumber}</strong></span>
                                    <span className="text-sm text-muted">Total: <strong className="text-primary">{foundPurchase.totalAmount?.toFixed(2)} EGP</strong></span>
                                    <span className="text-sm text-muted">Status: <strong className="text-primary">{foundPurchase.status}</strong></span>
                                </div>

                                <div className="text-sm font-semibold" style={{ marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>Select items to return to supplier:</div>
                                {foundPurchase.items?.map((item, i) => {
                                    const pid = item.productId?._id || item.productId;
                                    const selected = purchaseReturnItems.find(r => r.productId === pid);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => togglePurchaseItem(item)}
                                            style={{
                                                display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                                                padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)',
                                                border: selected ? '1px solid var(--color-primary-light)' : '1px solid var(--color-border-light)',
                                                background: selected ? 'var(--color-primary-lighter)' : 'var(--color-bg-muted)',
                                                cursor: 'pointer', transition: 'all var(--transition-fast)',
                                            }}
                                        >
                                            <input type="checkbox" checked={!!selected} readOnly />
                                            <span style={{ flex: 1, fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>
                                                {item.productId?.name || 'Product'}
                                            </span>
                                            <span className="text-sm text-muted">x{item.quantity}</span>
                                            <span className="text-sm font-semibold">{item.purchasePrice?.toFixed(2)} EGP</span>
                                        </div>
                                    );
                                })}

                                {purchaseReturnItems.length > 0 && (
                                    <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)' }}>
                                        <div className="text-sm font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>Return Details:</div>
                                        {purchaseReturnItems.map(r => (
                                            <div key={r.productId} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-base)' }}>
                                                <span style={{ flex: 1, fontWeight: 'var(--font-weight-medium)' }}>{r.name}</span>
                                                <label className="text-xs text-muted">Qty:</label>
                                                <InputField
                                                    type="number" min="1" max={r.maxQuantity} value={r.quantity}
                                                    onChange={e => updatePurchaseItem(r.productId, 'quantity', e.target.value)}
                                                    style={{ width: 60, padding: '4px 8px', textAlign: 'center' }}
                                                />
                                                <InputField 
                                                    type="select" 
                                                    value={r.reason} 
                                                    onChange={e => updatePurchaseItem(r.productId, 'reason', e.target.value)} 
                                                    style={{ width: 'auto' }}
                                                    options={RETURN_REASONS_PURCHASE.map(rr => ({ value: rr.value, label: rr.label }))}
                                                />
                                            </div>
                                        ))}
                                        <div style={{ marginTop: 'var(--space-3)' }}>
                                            <InputField placeholder="Notes (optional)" value={purchaseNotes} onChange={e => setPurchaseNotes(e.target.value)} id="input-purchase-notes" />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--color-primary)' }}>
                                                Credit Total: {formatCurrency(purchaseTotalRefund)}
                                            </span>
                                            <Button size="lg" onClick={submitPurchaseReturn} id="btn-confirm-purchase-return">
                                                <FaUndo size={14} /> Confirm Return to Supplier
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============ RETURNS HISTORY ============ */}
            <div id="returns-history">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ margin: 0 }}>
                        <FaUndo color="var(--color-primary)" size={14} /> Returns History
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        {[{ v: '', l: 'All' }, { v: 'sales', l: 'Sales' }, { v: 'purchase', l: 'Purchase' }].map(f => (
                            <Button
                                key={f.v}
                                size="sm"
                                variant={filterType === f.v ? 'primary' : 'ghost'}
                                onClick={() => setFilterType(f.v)}
                                id={`btn-filter-${f.v || 'all'}`}
                            >
                                {f.l}
                            </Button>
                        ))}
                    </div>
                </div>

                <DataTable
                    columns={historyColumns}
                    data={returns}
                    loading={false}
                    emptyTitle="No returns found"
                    emptyDescription="Process a return above to see history here."
                    emptyIcon={FaUndo}
                    exportFilename="returns.csv"
                    compact
                />
            </div>
        </div>
    );
};

export default Returns;
