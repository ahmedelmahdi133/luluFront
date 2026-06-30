import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { FaPlus, FaTrash, FaCalendarAlt, FaWhatsapp } from 'react-icons/fa';

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        customerId: '',
        productId: '',
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subsRes, custRes, prodRes] = await Promise.all([
                api.get('/subscriptions'),
                api.get('/subscriptions/customers'),
                api.get('/products')
            ]);
            setSubscriptions(subsRes.data.data);
            setCustomers(custRes.data.data);
            setProducts(prodRes.data.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subscriptions', form);
            toast.success('Subscription added successfully');
            setIsModalOpen(false);
            setForm({ customerId: '', productId: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add subscription');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subscription?')) return;
        try {
            await api.delete(`/subscriptions/${id}`);
            toast.success('Subscription deleted');
            setSubscriptions(subscriptions.filter(s => s.id !== id));
        } catch (error) {
            toast.error('Failed to delete subscription');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/subscriptions/${id}`, { isActive: !currentStatus });
            setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="page-wrapper animate-in">
            <PageHeader
                title="أدوية شهرية (WhatsApp Reminders)"
                subtitle="Manage monthly medication subscriptions for customers"
                action={<Button onClick={() => setIsModalOpen(true)}><FaPlus /> Add Subscription</Button>}
            />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading subscriptions...</div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <FaWhatsapp size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No active subscriptions found.</p>
                        <p className="text-sm mt-2">Click "Add Subscription" to start sending WhatsApp reminders.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-3 px-4 font-semibold text-slate-600">Customer</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600">Medication</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600">Start Date</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600">Next Reminder</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600">Status</th>
                                    <th className="py-3 px-4 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map(sub => (
                                    <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-900">{sub.customer?.name}</div>
                                            <div className="text-xs text-slate-500">{sub.customer?.phone}</div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-700">{sub.product?.name}</td>
                                        <td className="py-3 px-4 text-slate-600">{new Date(sub.startDate).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                                                <FaCalendarAlt size={12} />
                                                {new Date(sub.nextDueDate).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button 
                                                onClick={() => toggleStatus(sub.id, sub.isActive)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${sub.isActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
                                            >
                                                {sub.isActive ? 'Active' : 'Paused'}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)}>
                                                <FaTrash className="text-red-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="m-0 text-lg font-bold">Add Monthly Subscription</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <InputField
                                    type="select"
                                    label="Customer"
                                    required
                                    value={form.customerId}
                                    onChange={e => setForm({ ...form, customerId: e.target.value })}
                                    options={[
                                        { value: '', label: 'Select Customer' },
                                        ...customers.map(c => ({ value: c.id, label: `${c.name} (${c.phone || 'No phone'})` }))
                                    ]}
                                />
                                <InputField
                                    type="select"
                                    label="Medication (Product)"
                                    required
                                    value={form.productId}
                                    onChange={e => setForm({ ...form, productId: e.target.value })}
                                    options={[
                                        { value: '', label: 'Select Medication' },
                                        ...products.map(p => ({ value: p.id, label: p.name }))
                                    ]}
                                />
                                <InputField
                                    type="date"
                                    label="Start Date"
                                    required
                                    value={form.startDate}
                                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                                />
                                <InputField
                                    label="Notes (Optional)"
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    placeholder="e.g. Needs 2 packs every month"
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" variant="primary">Save Subscription</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
