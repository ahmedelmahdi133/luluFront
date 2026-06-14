import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import { FaTags, FaPlus, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [editingCat, setEditingCat] = useState(null);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', phone: '', role: 'pharmacist' });

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
    }, []);

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCat) {
                await api.put(`/categories/${editingCat}`, catForm);
                toast.success('Category updated');
            } else {
                await api.post('/categories', catForm);
                toast.success('Category added');
            }
            setCatForm({ name: '', description: '' }); setEditingCat(null);
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const deleteCat = async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted');
            setCategories(categories.filter(c => getId(c) !== id));
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-staff', staffForm);
            toast.success('Staff member added');
            setStaffForm({ name: '', email: '', password: '', phone: '', role: 'pharmacist' });
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="page-wrapper" id="settings-page">
            <PageHeader
                title="Settings"
                subtitle="Manage categories, staff, and system preferences"
                breadcrumbs={[{ label: 'System', to: '/settings' }, { label: 'Settings' }]}
            />

            {/* Tabs */}
            <div className="tabs" id="settings-tabs">
                <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                    <FaTags size={14} /> Categories
                </button>
                {user?.role === 'admin' && (
                    <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
                        <FaUserPlus size={14} /> Add Staff
                    </button>
                )}
            </div>

            {activeTab === 'categories' && (
                <div className="card card-body">
                    <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Manage Categories</h3>
                    <form onSubmit={handleSaveCategory} className="flex gap-3" style={{ marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                        <input required placeholder="Category name" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 180 }} />
                        <input placeholder="Description (optional)" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 180 }} />
                        <button type="submit" className={`btn ${editingCat ? 'btn-warning' : 'btn-primary'}`}>
                            {editingCat ? 'Save' : <><FaPlus size={12} /> Add</>}
                        </button>
                        {editingCat && (
                            <button type="button" className="btn btn-ghost" onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '' }); }}>Cancel</button>
                        )}
                    </form>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                        {categories.map(c => (
                            <div key={getId(c)} style={{
                                padding: 'var(--space-4)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all var(--transition-fast)',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary-light)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                                <div>
                                    <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-md)' }}>{c.name}</div>
                                    {c.description && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{c.description}</div>}
                                </div>
                                <div className="flex gap-1">
                                    <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditingCat(getId(c)); setCatForm({ name: c.name, description: c.description || '' }); }} id={`btn-edit-cat-${getId(c)}`}>
                                        <FaEdit size={13} color="var(--color-primary)" />
                                    </button>
                                    <button className="btn btn-ghost btn-icon-sm" onClick={() => deleteCat(getId(c))} id={`btn-delete-cat-${getId(c)}`}>
                                        <FaTrash size={13} color="var(--color-danger)" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'staff' && user?.role === 'admin' && (
                <div className="card card-body">
                    <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Add New Staff Member</h3>
                    <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                        <div className="form-group"><label className="form-label">Full Name</label><input required value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className="form-input" /></div>
                        <div className="form-group"><label className="form-label">Email</label><input type="email" required value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="form-input" /></div>
                        <div className="form-group"><label className="form-label">Password</label><input type="password" required minLength={8} value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} className="form-input" /></div>
                        <div className="form-group"><label className="form-label">Phone</label><input value={staffForm.phone} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} className="form-input" /></div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className="form-select">
                                <option value="pharmacist">Pharmacist</option>
                                <option value="admin">System Admin</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn btn-success">Create Account</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;
