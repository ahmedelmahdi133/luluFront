import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { FaTruck, FaFileInvoiceDollar, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';

const Purchases = () => {
    const [activeTab, setActiveTab] = useState('invoice');
    const [suppliers, setSuppliers] = useState([]);
    const [supplierForm, setSupplierForm] = useState({ name: '', company: '', phone: '' });
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [paidAmount, setPaidAmount] = useState('');

    useEffect(() => {
        if (!keyword) { setProducts([]); return; }
        const t = setTimeout(async () => {
            try { const res = await api.get(`/products?keyword=${keyword}`); setProducts(res.data.data); } catch {}
        }, 300);
        return () => clearTimeout(t);
    }, [keyword]);

    const fetchSuppliers = async () => {
        try { const res = await api.get('/purchases/suppliers'); setSuppliers(res.data.data); } catch {}
    };

    useEffect(() => { fetchSuppliers(); }, []);

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try { await api.post('/purchases/suppliers', supplierForm); toast.success('Supplier added'); setSupplierForm({ name: '', company: '', phone: '' }); fetchSuppliers(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const addItemToInvoice = (product) => {
        if (invoiceItems.find(i => i.productId === getId(product))) { toast.error('Item already in invoice'); return; }
        setInvoiceItems([...invoiceItems, { productId: getId(product), name: product.name, purchasePrice: product.purchasingPrice, quantity: 1 }]);
        setKeyword(''); setProducts([]);
    };

    const updateItem = (id, field, value) => setInvoiceItems(invoiceItems.map(i => i.productId === id ? { ...i, [field]: Number(value) } : i));
    const total = invoiceItems.reduce((t, i) => t + i.purchasePrice * i.quantity, 0);
    const remaining = total - (Number(paidAmount) || 0);

    const handleSave = async () => {
        if (!selectedSupplier) { toast.error('Select a supplier'); return; }
        if (invoiceItems.length === 0) { toast.error('Invoice is empty'); return; }
        try {
            await api.post('/purchases', { supplierId: selectedSupplier, items: invoiceItems.map(i => ({ productId: i.productId, quantity: i.quantity, purchasePrice: i.purchasePrice })), paidAmount: Number(paidAmount) || 0 });
            toast.success('Invoice saved and stock updated'); setInvoiceItems([]); setSelectedSupplier(''); setPaidAmount('');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const supplierColumns = [
        { key: 'company', label: 'Company', render: (val) => <span className="cell-bold">{val}</span> },
        { key: 'name', label: 'Representative' },
        { key: 'phone', label: 'Phone' },
        {
            key: 'dues', label: 'Outstanding', width: 130,
            render: (val) => <span style={{ fontWeight: 700, color: val > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatCurrency(val)}</span>
        },
    ];

    return (
        <div className="page-wrapper" id="purchases-page">
            <PageHeader
                title="Purchases"
                subtitle="Manage suppliers and purchase invoices"
                breadcrumbs={[{ label: 'Inventory', to: '/purchases' }, { label: 'Purchases' }]}
            />

            {/* Tabs */}
            <div className="tabs" id="purchases-tabs">
                <button onClick={() => setActiveTab('invoice')} className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}>
                    <FaFileInvoiceDollar /> Purchase Invoice
                </button>
                <button onClick={() => setActiveTab('suppliers')} className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}>
                    <FaTruck /> Suppliers
                </button>
            </div>

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
                <div id="suppliers-section">
                    <div className="card card-body" style={{ marginBottom: 'var(--space-5)', borderLeft: '4px solid var(--color-primary)' }}>
                        <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Add Supplier</h3>
                        <form onSubmit={handleAddSupplier} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: '1 1 180px' }}>
                                <label className="form-label">Representative Name</label>
                                <input placeholder="Name" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required className="form-input" />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 180px' }}>
                                <label className="form-label">Company</label>
                                <input placeholder="Company" value={supplierForm.company} onChange={e => setSupplierForm({ ...supplierForm, company: e.target.value })} required className="form-input" />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 140px' }}>
                                <label className="form-label">Phone</label>
                                <input placeholder="Phone" value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} required className="form-input" />
                            </div>
                            <button type="submit" className="btn btn-success">Save</button>
                        </form>
                    </div>
                    <DataTable
                        columns={supplierColumns}
                        data={suppliers}
                        loading={false}
                        emptyTitle="No suppliers"
                        emptyDescription="Add your first supplier above."
                        emptyIcon={FaTruck}
                        compact
                    />
                </div>
            )}

            {/* Invoice Tab */}
            {activeTab === 'invoice' && (
                <div style={{ display: 'flex', gap: 'var(--space-5)' }} id="invoice-section">
                    {/* Product Search */}
                    <div className="card card-body" style={{ flex: '0 0 300px' }}>
                        <h3 className="section-title"><FaSearch size={14} /> Search Products</h3>
                        <div className="search-input-wrapper" style={{ marginBottom: 'var(--space-3)' }}>
                            <FaSearch className="search-icon" />
                            <input placeholder="Product name..." value={keyword} onChange={e => setKeyword(e.target.value)} className="form-input" style={{ paddingLeft: 40 }} />
                        </div>
                        {products.map(p => (
                            <div key={getId(p)} style={{
                                padding: 'var(--space-3)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                fontSize: 'var(--font-size-base)', transition: 'all var(--transition-fast)',
                            }}>
                                <span>{p.name}</span>
                                <button onClick={() => addItemToInvoice(p)} className="btn btn-primary btn-sm"><FaPlus size={10} /></button>
                            </div>
                        ))}
                    </div>

                    {/* Invoice */}
                    <div className="card card-body" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>Purchase Invoice</h3>
                            <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: 200 }}>
                                <option value="">— Select Supplier —</option>
                                {suppliers.map(s => <option key={getId(s)} value={getId(s)}>{s.company} - {s.name}</option>)}
                            </select>
                        </div>

                        {/* Invoice Items Table (editing table — not DataTable) */}
                        <table className="data-table" style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>
                            <thead>
                                <tr>
                                    <th>Item</th><th>Qty</th><th>Purchase Price</th><th>Total</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceItems.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>Add products to the invoice</td></tr>
                                ) : invoiceItems.map(item => (
                                    <tr key={item.productId}>
                                        <td className="cell-bold">{item.name}</td>
                                        <td><input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.productId, 'quantity', e.target.value)} className="form-input" style={{ width: 60, padding: '4px 8px', textAlign: 'center' }} /></td>
                                        <td><input type="number" min="0" value={item.purchasePrice} onChange={e => updateItem(item.productId, 'purchasePrice', e.target.value)} className="form-input" style={{ width: 80, padding: '4px 8px', textAlign: 'center' }} /></td>
                                        <td className="cell-bold">{(item.quantity * item.purchasePrice).toFixed(2)}</td>
                                        <td><button onClick={() => setInvoiceItems(invoiceItems.filter(i => i.productId !== item.productId))} className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--color-danger)' }}><FaTrash size={11} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ background: 'var(--color-bg-muted)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>
                                <span>Invoice Total:</span><span style={{ fontWeight: 700 }}>{formatCurrency(total)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>
                                <span>Paid:</span>
                                <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0" className="form-input" style={{ width: 140, textAlign: 'center' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: remaining > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                <span>Remaining:</span><span>{remaining > 0 ? formatCurrency(remaining) : '0.00'}</span>
                            </div>
                            <button onClick={handleSave} className="btn btn-success btn-lg w-full" style={{ marginTop: 'var(--space-4)' }} id="btn-save-invoice">
                                Save Invoice & Update Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
