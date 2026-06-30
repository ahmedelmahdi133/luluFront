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
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', phone: '', role: 'pharmacist' });
    const [generalSettings, setGeneralSettings] = useState({ owner_email: '' });

    useEffect(() => {
        api.get('/settings').then(r => setGeneralSettings(prev => ({ ...prev, ...r.data.data }))).catch(() => {});
    }, []);


    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-staff', staffForm);
            toast.success(t.settings.staffAdded);
            setStaffForm({ name: '', email: '', password: '', phone: '', role: 'pharmacist' });
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleSaveGeneralSettings = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings', { settings: generalSettings });
            toast.success('General settings saved successfully');
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving settings'); }
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
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <>
                        <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
                            <FaUserPlus size={14} /> {t.settings.addStaff}
                        </button>
                        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                            <FaGlobe size={14} /> General
                        </button>
                    </>
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


            {activeTab === 'staff' && (user?.role === 'admin' || user?.role === 'superadmin') && (
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

            {activeTab === 'general' && (user?.role === 'admin' || user?.role === 'superadmin') && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6 animate-in">
                    <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>General Settings</h3>
                    <form onSubmit={handleSaveGeneralSettings} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '400px' }}>
                        <InputField 
                            label="Owner Email (For Shift Reports)" 
                            type="email" 
                            placeholder="owner@example.com"
                            value={generalSettings.owner_email || ''} 
                            onChange={e => setGeneralSettings({ ...generalSettings, owner_email: e.target.value })} 
                        />
                        <InputField 
                            label="WhatsApp Instance ID (UltraMsg)" 
                            type="text" 
                            placeholder="e.g. instance12345"
                            value={generalSettings.whatsapp_instance_id || ''} 
                            onChange={e => setGeneralSettings({ ...generalSettings, whatsapp_instance_id: e.target.value })} 
                        />
                        <InputField 
                            label="WhatsApp Token (UltraMsg)" 
                            type="text" 
                            placeholder="e.g. 1a2b3c4d5e6f"
                            value={generalSettings.whatsapp_token || ''} 
                            onChange={e => setGeneralSettings({ ...generalSettings, whatsapp_token: e.target.value })} 
                        />
                        <Button type="submit" variant="primary">Save Settings</Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;
