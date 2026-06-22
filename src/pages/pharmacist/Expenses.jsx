import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatDateTime, formatCurrency, getExpenseCategoryLabel } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { FaPlus, FaTrash, FaTimes, FaMoneyBillWave } from 'react-icons/fa';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ description: '', amount: '', category: 'other', date: new Date().toISOString().substring(0, 10) });
    const [filter, setFilter] = useState({ startDate: '', endDate: '', category: '' });
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.startDate) params.append('startDate', filter.startDate);
            if (filter.endDate) params.append('endDate', filter.endDate);
            if (filter.category) params.append('category', filter.category);
            const res = await api.get(`/expenses?${params}`);
            setExpenses(res.data.data);
            setTotalAmount(res.data.totalAmount);
        } catch { toast.error('Error fetching expenses'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchExpenses(); }, [filter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', form);
            toast.success('Expense recorded');
            setForm({ description: '', amount: '', category: 'other', date: new Date().toISOString().substring(0, 10) });
            setShowForm(false);
            fetchExpenses();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/expenses/${deleteTarget}`);
            toast.success('Expense deleted');
            setDeleteTarget(null);
            fetchExpenses();
        } catch { toast.error('Error deleting expense'); setDeleteTarget(null); }
    };

    const columns = [
        { key: 'description', label: 'Description', minWidth: 180, render: (val) => <span className="cell-bold">{val}</span> },
        { key: 'amount', label: 'Amount', width: 120, render: (val) => <span className="cell-danger">{formatCurrency(val)}</span> },
        {
            key: 'category', label: 'Category', width: 130,
            render: (val) => <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-slate-200 text-slate-600">{getExpenseCategoryLabel(val)}</span>
        },
        { key: 'date', label: 'Date', width: 160, render: (val) => formatDateTime(val) },
        { key: 'pharmacistId', label: 'Recorded By', width: 130, render: (val) => val?.name || '—' },
        {
            key: 'actions', label: '', width: 60, sortable: false, noExport: true,
            render: (_, row) => (
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(getId(row)); }} title="Delete">
                    <FaTrash size={12} color="var(--color-danger)" />
                </Button>
            )
        },
    ];

    return (
        <div className="page-wrapper" id="expenses-page">
            <PageHeader
                title="Expenses"
                subtitle={`Total: ${formatCurrency(totalAmount)}`}
                breadcrumbs={[{ label: 'Finance', to: '/expenses' }, { label: 'Expenses' }]}
                actions={
                    <Button variant={showForm ? 'ghost' : 'primary'} onClick={() => setShowForm(!showForm)} id="btn-add-expense">
                        {showForm ? <><FaTimes size={13} /> Cancel</> : <><FaPlus size={13} /> Record Expense</>}
                    </Button>
                }
            />

            {/* Add Expense Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md" style={{
                    marginBottom: 'var(--space-5)',
                    borderLeft: '4px solid var(--color-primary)',
                    animation: 'fadeInDown var(--transition-slow) ease',
                }} id="expense-form">
                    <div className="p-6">
                        <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                            Record New Expense
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                                <InputField label="Description" required placeholder="e.g. Electricity bill" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} id="expense-description" wrapperStyle={{ gridColumn: 'span 2' }} />
                                <InputField label="Amount" type="number" required min="0" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} id="expense-amount" />
                                <InputField 
                                    type="select" 
                                    label="Category" 
                                    value={form.category} 
                                    onChange={e => setForm({ ...form, category: e.target.value })} 
                                    id="expense-category"
                                    options={EXPENSE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                                />
                                <InputField type="date" label="Date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} id="expense-date" />
                            </div>
                            <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)' }}>
                                <Button type="submit" id="btn-save-expense">
                                    <FaPlus size={12} /> Record Expense
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }} id="expenses-filters">
                <InputField type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} style={{ width: 160 }} />
                <InputField type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} style={{ width: 160 }} />
                <InputField 
                    type="select" 
                    value={filter.category} 
                    onChange={e => setFilter({ ...filter, category: e.target.value })} 
                    style={{ width: 160 }}
                    options={[{ value: '', label: 'All Categories' }, ...EXPENSE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))]}
                />
                <div style={{ marginLeft: 'auto' }}>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-red-100 text-red-800" style={{ fontSize: 'var(--font-size-md)', padding: '6px 14px' }}>
                        <FaMoneyBillWave size={13} /> Total: {formatCurrency(totalAmount)}
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <DataTable
                columns={columns}
                data={expenses}
                loading={loading}
                emptyTitle="No expenses found"
                emptyDescription="Try adjusting your filters or record a new expense."
                emptyIcon={FaMoneyBillWave}
                exportFilename="expenses.csv"
            />

            <ConfirmDialog isOpen={!!deleteTarget} title="Delete Expense" message="Are you sure you want to delete this expense?"
                onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
        </div>
    );
};

export default Expenses;
