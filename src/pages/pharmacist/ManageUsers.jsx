import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { FaTrash, FaUserPlus, FaUserShield } from 'react-icons/fa';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // حالة الفورم لإضافة مستخدم جديد
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'pharmacist' // القيمة الافتراضية
    });

    // جلب المستخدمين أول ما الصفحة تفتح
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users'); // هنحتاج نعمل الروت ده في الباك إند
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
            await api.delete(`/users/${id}`); // هنحتاج نعمل الروت ده في الباك إند
            setUsers(users.filter(user => user.id !== id));
            toast.success('تم حذف المستخدم بنجاح');
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل حذف المستخدم');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            // هنستخدم الروت اللي إنت عامله أصلاً في الباك إند
            await api.post('/auth/register-staff', formData);
            toast.success('تم إضافة الموظف بنجاح');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '', role: 'pharmacist' });
            fetchUsers(); // تحديث الجدول
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل إضافة الموظف');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>جاري التحميل...</div>;

    return (
        <div style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2><FaUserShield style={{ marginRight: '8px' }} /> إدارة المستخدمين والصلاحيات</h2>
                <button 
                    onClick={() => setShowModal(true)} 
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaUserPlus /> إضافة موظف جديد
                </button>
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
                                        backgroundColor: user.role === 'admin' ? '#fee2e2' : user.role === 'pharmacist' ? '#dbeafe' : '#f3f4f6',
                                        color: user.role === 'admin' ? '#991b1b' : user.role === 'pharmacist' ? '#1e40af' : '#374151'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="حذف المستخدم"
                                    >
                                        <FaTrash size={16} />
                                    </button>
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
                                <label className="form-label">الاسم</label>
                                <input type="text" className="form-input" required
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label className="form-label">البريد الإلكتروني</label>
                                <input type="email" className="form-input" required
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label className="form-label">كلمة المرور</label>
                                <input type="password" className="form-input" required minLength="8"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label className="form-label">رقم الهاتف</label>
                                <input type="text" className="form-input" 
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label className="form-label">الصلاحية</label>
                                <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="pharmacist">صيدلي (Pharmacist)</option>
                                    <option value="admin">مدير نظام (Admin)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>إلغاء</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>حفظ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;