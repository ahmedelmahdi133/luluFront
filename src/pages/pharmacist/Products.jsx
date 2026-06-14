import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaTimes, FaBoxes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
const emptyForm = { name: '', scientificName: '', barcode: '', description: '', purchasingPrice: '', sellingPrice: '', stockQuantity: '', expiryDate: '', categoryId: '', unit: 'Piece', isAvailableOnline: false, requiresPrescription: false, minStockAlert: 10, image: '' };

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [lowStock, setLowStock] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

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
        api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
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
            categoryId: p.categoryId?.id || p.categoryId?._id || p.categoryId || '', unit: p.unit || 'Piece',
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

    const columns = [
        {
            key: 'name', label: 'Product', minWidth: 180,
            render: (val, row) => (
                <div>
                    <div className="cell-bold">{row.name}</div>
                    {row.scientificName && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 1 }}>{row.scientificName}</div>}
                </div>
            )
        },
        { key: 'barcode', label: 'Barcode', render: (val) => <span className="cell-mono">{val}</span> },
        { key: 'purchasingPrice', label: 'Cost', width: 80 },
        { key: 'sellingPrice', label: 'Price', width: 80, render: (val) => <span className="cell-success">{val}</span> },
        {
            key: 'stockQuantity', label: 'Stock', width: 80,
            render: (val, row) => (
                <span className={`badge ${val < (row.minStockAlert || 10) ? 'badge-danger' : 'badge-success'}`}>
                    {val}
                </span>
            )
        },
        { key: 'expiryDate', label: 'Expiry', render: (val) => formatDate(val), width: 120 },
        { key: 'isAvailableOnline', label: 'Online', width: 70, render: (val) => val ? '✓' : '—', sortable: false },
        ...(user?.role === 'admin' ? [{
            key: 'actions', label: 'Actions', width: 90, sortable: false, noExport: true,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="btn btn-ghost btn-icon-sm" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Edit" id={`btn-edit-product-${getId(row)}`}>
                        <FaEdit size={13} color="var(--color-primary)" />
                    </button>
                    <button className="btn btn-ghost btn-icon-sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(getId(row)); }} title="Delete" id={`btn-delete-product-${getId(row)}`}>
                        <FaTrash size={13} color="var(--color-danger)" />
                    </button>
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
                    user?.role === 'admin' && (
                        <button className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`} onClick={() => showForm ? resetForm() : setShowForm(true)} id="btn-add-product">
                            {showForm ? <><FaTimes size={13} /> Cancel</> : <><FaPlus size={13} /> Add Product</>}
                        </button>
                    )
                }
            />

            {/* Add / Edit Form */}
            {showForm && (
                <div className="card" style={{
                    marginBottom: 'var(--space-5)',
                    borderLeft: `4px solid ${isEditing ? 'var(--color-warning)' : 'var(--color-primary)'}`,
                    animation: 'fadeInDown var(--transition-slow) ease',
                }}>
                    <div className="card-body">
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
                                <Field label="Product Name" name="name" value={form.name} onChange={handleChange} required />
                                <Field label="Scientific Name" name="scientificName" value={form.scientificName} onChange={handleChange} />
                                <Field label="Barcode" name="barcode" value={form.barcode} onChange={handleChange} required />
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select name="categoryId" value={form.categoryId} onChange={handleChange} className="form-select">
                                        <option value="">No Category</option>
                                        {categories.map(c => <option key={getId(c)} value={getId(c)}>{c.name}</option>)}
                                    </select>
                                </div>
                                <Field label="Purchase Price" name="purchasingPrice" type="number" value={form.purchasingPrice} onChange={handleChange} required />
                                <Field label="Selling Price" name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} required />
                                <Field label="Quantity" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} required />
                                <Field label="Alert Threshold" name="minStockAlert" type="number" value={form.minStockAlert} onChange={handleChange} />
                                <Field label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} required />
                                <Field label="Unit" name="unit" value={form.unit} onChange={handleChange} />
                                <div className="form-group">
                                    <Field label="Image URL" name="image" value={form.image} onChange={handleChange} />
                                    <label className="form-label" style={{ marginTop: 'var(--space-2)' }}>Or Upload From Device</label>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="form-input" />
                                    {uploadingImage && <div className="form-hint">Uploading image...</div>}
                                    {form.image && (
                                        <img src={form.image} alt="preview" style={{ marginTop: 8, width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                                    )}
                                </div>
                                <Field label="Description" name="description" value={form.description} onChange={handleChange} />
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
                                <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'}`}>
                                    {isEditing ? 'Save Changes' : 'Add Product'}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="search-input-wrapper" style={{ flex: 1 }}>
                    <FaSearch className="search-icon" />
                    <input
                        placeholder="Search by name or barcode..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: 40 }}
                    />
                </div>
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
            />

            <ConfirmDialog
                isOpen={!!deleteTarget} title="Delete Product"
                message="Are you sure you want to permanently delete this product? This action cannot be undone."
                onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger
            />
        </div>
    );
};

const Field = ({ label, name, value, onChange, type = 'text', required }) => (
    <div className="form-group">
        <label className="form-label">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} required={required} className="form-input" />
    </div>
);

export default Products;
