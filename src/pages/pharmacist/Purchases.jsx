import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import BarcodePrinterModal from '../../components/pharmacist/BarcodePrinterModal';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import InputField from '../../components/common/InputField';
import { FaTruck, FaFileInvoiceDollar, FaPlus, FaTrash, FaSearch, FaBarcode } from 'react-icons/fa';

const Purchases = () => {
    const [activeTab, setActiveTab] = useState('invoice');
    const [suppliers, setSuppliers] = useState([]);
    const [supplierForm, setSupplierForm] = useState({ name: '', company: '', phone: '' });
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [paidAmount, setPaidAmount] = useState('');
    const [companyInvoiceNumber, setCompanyInvoiceNumber] = useState('');
    const [recentPurchaseItems, setRecentPurchaseItems] = useState([]);
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

    useEffect(() => {
        if (!keyword) { setProducts([]); return; }
        const t = setTimeout(async () => {
            try { const res = await api.get(`/products?keyword=${keyword}`); setProducts(res.data.data); } catch {}
        }, 300);
        return () => clearTimeout(t);
    }, [keyword]);

    const handleSearchKeyDown = async (e) => {
        const val = e.target.value;
        if (e.key === 'Enter' && val) {
            e.preventDefault();
            try {
                const res = await api.get(`/products?keyword=${val}`);
                const found = res.data.data;
                if (found.length === 1) {
                    addItemToInvoice(found[0]);
                } else if (found.length > 1) {
                    const exactMatch = found.find(p => p.barcode === val);
                    if (exactMatch) addItemToInvoice(exactMatch);
                    else toast.error('Multiple products found. Please click to add.');
                } else {
                    toast.error('Product not found');
                }
            } catch (err) {
                toast.error('Error searching product');
            }
        }
    };

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
        setInvoiceItems([...invoiceItems, { 
            productId: getId(product), 
            name: product.name, 
            purchasePrice: product.purchasingPrice, 
            sellingPrice: product.sellingPrice,
            barcode: product.barcode,
            expiryDate: product.expiryDate,
            image: product.image || '',
            quantity: 1 
        }]);
        setKeyword(''); setProducts([]);
    };

    const updateItem = (id, field, value) => setInvoiceItems(invoiceItems.map(i => i.productId === id ? { ...i, [field]: (field === 'image' || field === 'name') ? value : Number(value) } : i));
    const total = invoiceItems.reduce((t, i) => t + i.purchasePrice * i.quantity, 0);
    const remaining = total - (Number(paidAmount) || 0);

    const handleSave = async () => {
        if (!selectedSupplier) { toast.error('Select a supplier'); return; }
        if (invoiceItems.length === 0) { toast.error('Invoice is empty'); return; }
        try {
            const payload = { 
                supplierId: selectedSupplier, 
                items: invoiceItems.map(i => ({ productId: i.productId, quantity: i.quantity, purchasePrice: i.purchasePrice, image: i.image })), 
                paidAmount: Number(paidAmount) || 0,
                companyInvoiceNumber: companyInvoiceNumber || undefined
            };
            const response = await api.post('/purchases', payload);
            const sysNum = response.data.data.systemInvoiceNumber;
            toast.success(`Invoice saved! System # ${sysNum}`); 
            
            // Save current items for barcode printing before clearing
            setRecentPurchaseItems(invoiceItems);
            
            setInvoiceItems([]); 
            setSelectedSupplier(''); 
            setPaidAmount('');
            setCompanyInvoiceNumber('');
            
            // Open barcode modal automatically
            setIsBarcodeModalOpen(true);
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
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ marginBottom: 'var(--space-5)', borderLeft: '4px solid var(--color-primary)' }}>
                        <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Add Supplier</h3>
                        <form onSubmit={handleAddSupplier} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <InputField label="Representative Name" placeholder="Name" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required wrapperStyle={{ flex: '1 1 180px' }} />
                            <InputField label="Company" placeholder="Company" value={supplierForm.company} onChange={e => setSupplierForm({ ...supplierForm, company: e.target.value })} required wrapperStyle={{ flex: '1 1 180px' }} />
                            <InputField label="Phone" placeholder="Phone" value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} required wrapperStyle={{ flex: '1 1 140px' }} />
                            <Button type="submit" variant="success">Save</Button>
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
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ flex: '0 0 300px' }}>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FaSearch size={14} /> Search Products</h3>
                        <SearchInput placeholder="Product name or barcode..." value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={handleSearchKeyDown} wrapperStyle={{ marginBottom: 'var(--space-3)' }} />
                        {products.map(p => (
                            <div 
                                key={getId(p)} 
                                onClick={() => addItemToInvoice(p)}
                                className="hover:bg-slate-50 cursor-pointer"
                                style={{
                                    padding: 'var(--space-3)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    fontSize: 'var(--font-size-base)', transition: 'all var(--transition-fast)',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>{p.name}</span>
                                    <span style={{ fontSize: '0.8em', color: 'var(--color-text-muted)' }}>{p.barcode}</span>
                                </div>
                                <Button size="sm" onClick={(e) => { e.stopPropagation(); addItemToInvoice(p); }}><FaPlus size={10} /></Button>
                            </div>
                        ))}
                        {keyword && products.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                                <p style={{ marginBottom: 'var(--space-2)' }}>Product not found</p>
                                <Button size="sm" variant="outline" onClick={() => window.open('/products', '_blank')}>
                                    <FaPlus size={10} /> Add New Product
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Invoice */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">Purchase Invoice</h3>
                                {recentPurchaseItems.length > 0 && (
                                    <button 
                                        onClick={() => setIsBarcodeModalOpen(true)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md border-none cursor-pointer transition-colors flex items-center gap-1.5"
                                    >
                                        <FaBarcode /> Print Last Invoice Barcodes
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <InputField 
                                    type="text" 
                                    placeholder="Company Invoice #" 
                                    value={companyInvoiceNumber} 
                                    onChange={e => setCompanyInvoiceNumber(e.target.value)} 
                                    style={{ width: '150px' }}
                                />
                                <InputField 
                                    type="select" 
                                    value={selectedSupplier} 
                                    onChange={e => setSelectedSupplier(e.target.value)} 
                                    style={{ width: 'auto', minWidth: 200 }}
                                    options={[
                                        { value: '', label: '— Select Supplier —' },
                                        ...suppliers.map(s => ({ value: getId(s), label: `${s.company} - ${s.name}` }))
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Invoice Items Table (editing table — not DataTable) */}
                        <div style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
                            <table className="w-full border-collapse text-sm" style={{ fontSize: 'var(--font-size-base)', margin: 0 }}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-bg-muted)' }}>
                                    <tr>
                                        <th style={{ padding: '10px' }}>Item</th>
                                        <th style={{ padding: '10px' }}>Qty</th>
                                        <th style={{ padding: '10px' }}>Purchase Price</th>
                                        <th style={{ padding: '10px' }}>Image URL</th>
                                        <th style={{ padding: '10px' }}>Total</th>
                                        <th style={{ padding: '10px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>Add products to the invoice</td></tr>
                                    ) : invoiceItems.map(item => (
                                        <tr key={item.productId}>
                                            <td className="cell-bold" style={{ padding: '10px' }}>{item.name}</td>
                                            <td style={{ padding: '10px' }}><InputField type="number" min="1" value={item.quantity} onChange={e => updateItem(item.productId, 'quantity', e.target.value)} style={{ width: 60, padding: '4px 8px', textAlign: 'center' }} /></td>
                                            <td style={{ padding: '10px' }}><InputField type="number" min="0" value={item.purchasePrice} onChange={e => updateItem(item.productId, 'purchasePrice', e.target.value)} style={{ width: 80, padding: '4px 8px', textAlign: 'center' }} /></td>
                                            <td style={{ padding: '10px' }}><InputField type="text" placeholder="https://..." value={item.image || ''} onChange={e => updateItem(item.productId, 'image', e.target.value)} style={{ minWidth: 120, padding: '4px 8px' }} /></td>
                                            <td className="cell-bold" style={{ padding: '10px' }}>{(item.quantity * item.purchasePrice).toFixed(2)}</td>
                                            <td style={{ padding: '10px' }}><Button variant="ghost" size="icon" onClick={() => setInvoiceItems(invoiceItems.filter(i => i.productId !== item.productId))} style={{ color: 'var(--color-danger)' }}><FaTrash size={11} /></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div style={{ background: 'var(--color-bg-muted)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>
                                <span>Invoice Total:</span><span style={{ fontWeight: 700 }}>{formatCurrency(total)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>
                                <span>Paid:</span>
                                <InputField type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0" style={{ width: 140, textAlign: 'center' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: remaining > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                <span>Remaining:</span><span>{remaining > 0 ? formatCurrency(remaining) : '0.00'}</span>
                            </div>
                            <Button variant="success" size="lg" onClick={handleSave} style={{ marginTop: 'var(--space-4)', width: '100%', background: 'var(--color-success)', color: '#ffffff' }} id="btn-save-invoice">
                                Save Invoice & Update Stock
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <BarcodePrinterModal 
                isOpen={isBarcodeModalOpen} 
                onClose={() => setIsBarcodeModalOpen(false)} 
                items={recentPurchaseItems} 
            />
        </div>
    );
};

export default Purchases;
