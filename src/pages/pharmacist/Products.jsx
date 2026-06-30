import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ContextMenu from '../../components/common/ContextMenu';
import ReminderModal from '../../components/common/ReminderModal';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import SearchInput from '../../components/common/SearchInput';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaTimes, FaBoxes, FaEye, FaCalendarPlus, FaArrowDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
const emptyForm = { name: '', scientificName: '', barcode: '', description: '', purchasingPrice: '', sellingPrice: '', stockQuantity: '', expiryDate: '', unit: 'Piece', isAvailableOnline: false, requiresPrescription: false, minStockAlert: 10, image: '' };

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [lowStock, setLowStock] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [reminderModal, setReminderModal] = useState({ isOpen: false, product: null });
    const location = useLocation();
    const navigate = useNavigate();

    // Check if navigated here with an intent to edit a product
    useEffect(() => {
        if (location.state?.editProduct) {
            const p = location.state.editProduct;
            // Delay slightly to ensure form is ready and scrolling works
            setTimeout(() => {
                handleEdit(p);
                // Clear the state so it doesn't trigger again on refresh
                navigate('/products', { replace: true, state: {} });
            }, 100);
        }
    }, [location.state, navigate]);

    const handleContextMenu = (e, product) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            product
        });
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products?keyword=${keyword}&lowStock=${lowStock}`);
            setProducts(res.data.data);
        } catch { toast.error('Error fetching products'); }
        finally { setLoading(false); }
    }, [keyword, lowStock]);

    useEffect(() => {
        const t = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(t);
    }, [fetchProducts]);

    useEffect(() => {

    }, []);

    const resetForm = () => { setShowForm(false); setIsEditing(false); setEditId(null); setForm(emptyForm); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/products/${editId}`, form);
                toast.success('Product updated');
            } else {
                await api.post('/products', form);
                toast.success('Product added');
            }
            resetForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'An error occurred');
        }
    };

    const handleEdit = (p) => {
        setIsEditing(true); setEditId(getId(p));
        setForm({
            name: p.name, scientificName: p.scientificName || '', barcode: p.barcode,
            description: p.description || '', purchasingPrice: p.purchasingPrice, sellingPrice: p.sellingPrice,
            stockQuantity: p.stockQuantity, expiryDate: p.expiryDate?.substring(0, 10) || '',
            unit: p.unit || 'Piece',
            isAvailableOnline: p.isAvailableOnline || false, requiresPrescription: p.requiresPrescription || false,
            minStockAlert: p.minStockAlert || 10, image: p.image || ''
        });
        setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/products/${deleteTarget}`);
            toast.success('Product deleted');
            setDeleteTarget(null);
            fetchProducts();
        } catch (err) {
            if (err.response?.status === 403) toast.error('You do not have permission to delete this product');
            else toast.error(err.response?.data?.message || 'Delete error');
            setDeleteTarget(null);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const data = new FormData();
        data.append('image', file);
        setUploadingImage(true);
        try {
            const res = await api.post('/products/upload-image', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(prev => ({ ...prev, image: res.data.data.image }));
            toast.success('Image uploaded');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Image upload failed');
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const handleCreateReminder = async (date, notes) => {
        try {
            await api.post('/notifications', {
                title: `Reminder: ${reminderModal.product.name}`,
                message: notes,
                type: 'reminder',
                productId: getId(reminderModal.product),
                dueDate: date
            });
            toast.success('Reminder set successfully!');
            setReminderModal({ isOpen: false, product: null });
        } catch (error) {
            toast.error('Failed to set reminder');
        }
    };

    const handleMarkAsShortage = async (product) => {
        try {
            const newAlert = product.stockQuantity + 10;
            await api.put(`/products/${getId(product)}`, { minStockAlert: newAlert });
            toast.success(`${product.name} has been marked as a shortage!`);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to mark as shortage');
        }
    };

    const columns = [
        { key: 'name', label: 'Name', render: (val, row) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {row.image ? <img src={row.image} alt={val} style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} /> : <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--color-text-muted)' }}>No Img</div>}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="cell-bold">{val}</span>
                    {row.scientificName && <span className="cell-muted" style={{ fontSize: '0.8em' }}>{row.scientificName}</span>}
                </div>
            </div>
        ) },
        { key: 'purchasingPrice', label: 'Cost', width: 80 },
        { key: 'sellingPrice', label: 'Price', width: 80, render: (val) => <span className="cell-success">{val}</span> },
        {
            key: 'stockQuantity', label: 'Stock', width: 80,
            render: (val, row) => (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${val < (row.minStockAlert || 10) ? 'badge-danger' : 'badge-success'}`}>
                    {val}
                </span>
            )
        },
        { key: 'expiryDate', label: 'Expiry', render: (val) => formatDate(val), width: 120 },
        { key: 'isAvailableOnline', label: 'Online', width: 70, render: (val) => val ? '✓' : '—', sortable: false },
        ...((user?.role === 'admin' || user?.role === 'superadmin' || user?.permissions?.editPrice) ? [{
            key: 'actions', label: 'Actions', width: 90, sortable: false, noExport: true,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Edit" id={`btn-edit-product-${getId(row)}`}>
                        <FaEdit size={13} color="var(--color-primary)" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(getId(row)); }} title="Delete" id={`btn-delete-product-${getId(row)}`}>
                        <FaTrash size={13} color="var(--color-danger)" />
                    </Button>
                </div>
            )
        }] : []),
    ];

    return (
        <div className="page-wrapper" id="products-page">
            <PageHeader
                title={`Products (Debug Role: ${user?.role})`}
                subtitle={`${products.length} products in inventory`}
                breadcrumbs={[{ label: 'Inventory', to: '/products' }, { label: 'Products' }]}
                actions={
                    (user?.role === 'admin' || user?.role === 'superadmin' || user?.permissions?.editPrice) && (
                        <Button variant={showForm ? 'ghost' : 'primary'} onClick={() => showForm ? resetForm() : setShowForm(true)} id="btn-add-product">
                            {showForm ? <><FaTimes size={13} /> Cancel</> : <><FaPlus size={13} /> Add Product</>}
                        </Button>
                    )
                }
            />

            {/* Add / Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" style={{
                    marginBottom: 'var(--space-5)',
                    borderLeft: `4px solid ${isEditing ? 'var(--color-warning)' : 'var(--color-primary)'}`,
                    animation: 'fadeInDown var(--transition-slow) ease',
                }}>
                    <div className="p-6">
                        <h3 style={{
                            margin: '0 0 var(--space-4)',
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: isEditing ? 'var(--color-warning-dark)' : 'var(--color-text-primary)',
                        }}>
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                                <InputField label="Product Name" name="name" value={form.name} onChange={handleChange} required />
                                <InputField label="Scientific Name" name="scientificName" value={form.scientificName} onChange={handleChange} />
                                <InputField label="Barcode" name="barcode" value={form.barcode} onChange={handleChange} required />
                                <InputField label="Purchase Price" name="purchasingPrice" type="number" value={form.purchasingPrice} onChange={handleChange} required />
                                <InputField label="Selling Price" name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} required />
                                <InputField label="Quantity" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} required />
                                <InputField label="Alert Threshold" name="minStockAlert" type="number" value={form.minStockAlert} onChange={handleChange} />
                                <InputField label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} required />
                                <InputField label="Unit" name="unit" value={form.unit} onChange={handleChange} />
                                <div className="flex flex-col gap-1">
                                    <InputField label="Image URL" name="image" value={form.image} onChange={handleChange} />
                                    <InputField type="file" accept="image/*" label="Or Upload From Device" onChange={handleImageUpload} style={{ marginTop: 'var(--space-2)' }} />
                                    {uploadingImage && <div className="text-xs text-slate-400">Uploading image...</div>}
                                    {form.image && (
                                        <img src={form.image} alt="preview" style={{ marginTop: 8, width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                                    )}
                                </div>
                                <InputField label="Description" name="description" value={form.description} onChange={handleChange} />
                                <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', paddingTop: 22 }}>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="isAvailableOnline" checked={form.isAvailableOnline} onChange={handleChange} /> Available Online
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="requiresPrescription" checked={form.requiresPrescription} onChange={handleChange} /> Requires Prescription
                                    </label>
                                </div>
                            </div>
                            <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)' }}>
                                <Button type="submit" variant={isEditing ? 'warning' : 'primary'}>
                                    {isEditing ? 'Save Changes' : 'Add Product'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
                <SearchInput
                    placeholder="Search by name or barcode..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    wrapperStyle={{ flex: 1 }}
                />
                <label className="checkbox-label" style={{
                    padding: '0 var(--space-4)',
                    height: 42,
                    background: lowStock ? 'var(--color-warning-light)' : 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                }}>
                    <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)} />
                    <FaExclamationTriangle color="var(--color-warning)" size={13} /> Low Stock Only
                </label>
            </div>

            {/* Products Table */}
            <DataTable
                columns={columns}
                data={products}
                loading={loading}
                emptyTitle="No products found"
                emptyDescription="Try adjusting your search or add a new product."
                emptyIcon={FaBoxes}
                exportFilename="products.csv"
                onRowContextMenu={handleContextMenu}
            />

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    actions={[
                        (user?.role === 'admin' || user?.role === 'superadmin' || user?.permissions?.editPrice) ? {
                            label: 'Edit Product',
                            icon: FaEdit,
                            onClick: () => handleEdit(contextMenu.product)
                        } : null,
                        {
                            label: 'Set Reminder',
                            icon: FaCalendarPlus,
                            onClick: () => setReminderModal({ isOpen: true, product: contextMenu.product })
                        },
                        {
                            label: 'Mark as Shortage',
                            icon: FaArrowDown,
                            onClick: () => handleMarkAsShortage(contextMenu.product)
                        },
                        (user?.role === 'admin' || user?.role === 'superadmin') ? {
                            label: 'Delete Product',
                            icon: FaTrash,
                            danger: true,
                            onClick: () => setDeleteTarget(getId(contextMenu.product))
                        } : null
                    ].filter(Boolean)}
                />
            )}

            <ReminderModal 
                isOpen={reminderModal.isOpen} 
                onClose={() => setReminderModal({ isOpen: false, product: null })}
                product={reminderModal.product}
                onSubmit={handleCreateReminder}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget} title="Delete Product"
                message="Are you sure you want to permanently delete this product? This action cannot be undone."
                onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger
            />
        </div>
    );
};

export default Products;
