import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { FaTrash, FaUserPlus, FaUserShield, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';

const ManageUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // حالة الفورم لإضافة مستخدم جديد
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'pharmacist' // القيمة الافتراضية
    });

    // حالة الصلاحيات للمستخدم المحدد
    const [permissionsForm, setPermissionsForm] = useState({
        editPrice: false,
        viewReturns: false,
        viewPrescriptions: false,
        viewReports: false
    });

    // جلب المستخدمين أول ما الصفحة تفتح
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.data);
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
        
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(user => user.id !== id));
            toast.success('تم حذف المستخدم بنجاح');
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل حذف المستخدم');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-staff', formData);
            toast.success('تم إضافة الموظف بنجاح');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '', role: 'pharmacist' });
            fetchUsers(); // تحديث الجدول
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل إضافة الموظف');
        }
    };

    const handleOpenPermissions = (user) => {
        setSelectedUser(user);
        setPermissionsForm({
            editPrice: user.permissions?.editPrice || false,
            viewReturns: user.permissions?.viewReturns || false,
            viewPrescriptions: user.permissions?.viewPrescriptions || false,
            viewReports: user.permissions?.viewReports || false
        });
        setShowPermissionsModal(true);
    };

    const handleSavePermissions = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedUser.id}/permissions`, { permissions: permissionsForm });
            toast.success('تم تحديث الصلاحيات بنجاح');
            setShowPermissionsModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل تحديث الصلاحيات');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>جاري التحميل...</div>;

    return (
        <div style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2><FaUserShield style={{ marginRight: '8px' }} /> إدارة المستخدمين والصلاحيات</h2>
                <Button onClick={() => setShowModal(true)}>
                    <FaUserPlus /> إضافة موظف جديد
                </Button>
            </div>

            {/* جدول المستخدمين */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '12px' }}>الاسم</th>
                            <th style={{ padding: '12px' }}>البريد الإلكتروني</th>
                            <th style={{ padding: '12px' }}>رقم الهاتف</th>
                            <th style={{ padding: '12px' }}>الصلاحية</th>
                            <th style={{ padding: '12px' }}>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>{user.name}</td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>{user.phone || '—'}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px', 
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        backgroundColor: user.role === 'superadmin' ? '#fce7f3' : user.role === 'admin' ? '#fee2e2' : user.role === 'pharmacist' ? '#dbeafe' : '#f3f4f6',
                                        color: user.role === 'superadmin' ? '#9d174d' : user.role === 'admin' ? '#991b1b' : user.role === 'pharmacist' ? '#1e40af' : '#374151'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                                    {currentUser?.role === 'superadmin' && user.role !== 'superadmin' && (
                                        <Button 
                                            variant="ghost" size="icon"
                                            onClick={() => handleOpenPermissions(user)}
                                            title="تعديل الصلاحيات"
                                            style={{ color: '#4f46e5' }}
                                        >
                                            <FaCog size={16} />
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" size="icon"
                                        onClick={() => handleDelete(user.id)}
                                        title="حذف المستخدم"
                                        style={{ color: '#dc2626' }}
                                    >
                                        <FaTrash size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* نافذة منبثقة (Modal) لإضافة مستخدم */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '400px' }}>
                        <h3 style={{ marginBottom: '20px' }}>إضافة موظف جديد</h3>
                        <form onSubmit={handleAddUser}>
                            <div style={{ marginBottom: '15px' }}>
                                <InputField label="الاسم" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <InputField type="email" label="البريد الإلكتروني" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <InputField type="password" label="كلمة المرور" required minLength="8" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <InputField label="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <InputField 
                                    type="select" 
                                    label="الصلاحية" 
                                    value={formData.role} 
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    options={[
                                        { value: 'pharmacist', label: 'صيدلي (Pharmacist)' },
                                        { value: 'admin', label: 'مدير نظام (Admin)' },
                                        ...(currentUser?.role === 'superadmin' ? [{ value: 'superadmin', label: 'سوبر أدمن (Super Admin)' }] : [])
                                    ]}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                                <Button type="submit">حفظ</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* نافذة الصلاحيات (Modal) للـ Super Admin */}
            {showPermissionsModal && selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '400px' }}>
                        <h3 style={{ marginBottom: '20px' }}>تعديل صلاحيات ({selectedUser.name})</h3>
                        <form onSubmit={handleSavePermissions}>
                            <div className="flex flex-col gap-3 mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={permissionsForm.editPrice}
                                        onChange={e => setPermissionsForm({...permissionsForm, editPrice: e.target.checked})}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">تعديل أسعار المنتجات</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={permissionsForm.viewReturns}
                                        onChange={e => setPermissionsForm({...permissionsForm, viewReturns: e.target.checked})}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">رؤية وإدارة المرتجعات</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={permissionsForm.viewPrescriptions}
                                        onChange={e => setPermissionsForm({...permissionsForm, viewPrescriptions: e.target.checked})}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">إدارة الروشتات</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={permissionsForm.viewReports}
                                        onChange={e => setPermissionsForm({...permissionsForm, viewReports: e.target.checked})}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">الاطلاع على التقارير</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button type="button" variant="ghost" onClick={() => setShowPermissionsModal(false)}>إلغاء</Button>
                                <Button type="submit">حفظ التعديلات</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;