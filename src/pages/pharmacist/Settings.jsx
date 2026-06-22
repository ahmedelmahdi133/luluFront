import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { FaTags, FaPlus, FaEdit, FaTrash, FaUserPlus, FaGlobe } from 'react-icons/fa';

const Settings = () => {
    const { user } = useAuth();
    const { lang, changeLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('language');
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
                toast.success(t.settings.categoryUpdated);
            } else {
                await api.post('/categories', catForm);
                toast.success(t.settings.categoryAdded);
            }
            setCatForm({ name: '', description: '' }); setEditingCat(null);
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const deleteCat = async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            toast.success(t.settings.categoryDeleted);
            setCategories(categories.filter(c => getId(c) !== id));
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-staff', staffForm);
            toast.success(t.settings.staffAdded);
            setStaffForm({ name: '', email: '', password: '', phone: '', role: 'pharmacist' });
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="page-wrapper" id="settings-page">
            <PageHeader
                title={t.settings.title}
                subtitle={t.settings.subtitle}
                breadcrumbs={[{ label: t.nav.system, to: '/settings' }, { label: t.settings.title }]}
            />

            {/* Tabs */}
            <div className="tabs" id="settings-tabs">
                <button className={`tab-btn ${activeTab === 'language' ? 'active' : ''}`} onClick={() => setActiveTab('language')}>
                    <FaGlobe size={14} /> {t.settings.language}
                </button>
                <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                    <FaTags size={14} /> {t.settings.categories}
                </button>
                {user?.role === 'admin' && (
                    <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
                        <FaUserPlus size={14} /> {t.settings.addStaff}
                    </button>
                )}
            </div>

            {activeTab === 'language' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6 animate-in">
                    <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>{t.settings.selectLanguage}</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        {/* English Card */}
                        <div 
                            onClick={() => { changeLanguage('en'); toast.success('Language updated successfully'); }}
                            style={{
                                padding: 'var(--space-5)', border: `2px solid ${lang === 'en' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                borderRadius: 'var(--radius-xl)', cursor: 'pointer', flex: 1, maxWidth: 300,
                                background: lang === 'en' ? 'var(--color-primary-light)' : 'transparent',
                                transition: 'all 0.3s ease', textAlign: 'center'
                            }}
                        >
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🇺🇸</span>
                            <strong style={{ fontSize: 'var(--font-size-lg)' }}>English</strong>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>LTR Layout</p>
                        </div>
                        {/* Arabic Card */}
                        <div 
                            onClick={() => { changeLanguage('ar'); toast.success('تم تحديث اللغة بنجاح'); }}
                            style={{
                                padding: 'var(--space-5)', border: `2px solid ${lang === 'ar' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                borderRadius: 'var(--radius-xl)', cursor: 'pointer', flex: 1, maxWidth: 300,
                                background: lang === 'ar' ? 'var(--color-primary-light)' : 'transparent',
                                transition: 'all 0.3s ease', textAlign: 'center'
                            }}
                        >
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🇸🇦</span>
                            <strong style={{ fontSize: 'var(--font-size-lg)' }}>العربية</strong>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>RTL Layout</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6 animate-in">
                    <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>{t.settings.manageCategories}</h3>
                    <form onSubmit={handleSaveCategory} className="flex gap-3" style={{ marginBottom: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <InputField required placeholder={t.settings.categoryName} value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} style={{ flex: 1, minWidth: 180 }} />
                        <InputField placeholder={t.settings.categoryDesc} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} style={{ flex: 1, minWidth: 180 }} />
                        <Button type="submit" variant={editingCat ? 'warning' : 'primary'}>
                            {editingCat ? t.common.save : <><FaPlus size={12} /> {t.common.add}</>}
                        </Button>
                        {editingCat && (
                            <Button type="button" variant="ghost" onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '' }); }}>{t.common.cancel}</Button>
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
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingCat(getId(c)); setCatForm({ name: c.name, description: c.description || '' }); }} id={`btn-edit-cat-${getId(c)}`}>
                                        <FaEdit size={13} color="var(--color-primary)" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteCat(getId(c))} id={`btn-delete-cat-${getId(c)}`}>
                                        <FaTrash size={13} color="var(--color-danger)" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'staff' && user?.role === 'admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6 animate-in">
                    <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>{t.settings.addStaffMember}</h3>
                    <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                        <InputField label={t.settings.fullName} required value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} />
                        <InputField label="Email" type="email" required value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} />
                        <InputField label="Password" type="password" required minLength={8} value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} />
                        <InputField label="Phone" value={staffForm.phone} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} />
                        <InputField 
                            type="select" 
                            label={t.settings.role} 
                            value={staffForm.role} 
                            onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                            options={[
                                { value: 'pharmacist', label: t.settings.pharmacistRole },
                                { value: 'admin', label: t.settings.adminRole }
                            ]}
                        />
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button type="submit" variant="success">{t.settings.createAccount}</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;
