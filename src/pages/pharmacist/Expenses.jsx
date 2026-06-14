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
            render: (val) => <span className="badge badge-neutral">{getExpenseCategoryLabel(val)}</span>
        },
        { key: 'date', label: 'Date', width: 160, render: (val) => formatDateTime(val) },
        { key: 'pharmacistId', label: 'Recorded By', width: 130, render: (val) => val?.name || '—' },
        {
            key: 'actions', label: '', width: 60, sortable: false, noExport: true,
            render: (_, row) => (
                <button className="btn btn-ghost btn-icon-sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(getId(row)); }} title="Delete">
                    <FaTrash size={12} color="var(--color-danger)" />
                </button>
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
                    <button className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setShowForm(!showForm)} id="btn-add-expense">
                        {showForm ? <><FaTimes size={13} /> Cancel</> : <><FaPlus size={13} /> Record Expense</>}
                    </button>
                }
            />

            {/* Add Expense Form */}
            {showForm && (
                <div className="card" style={{
                    marginBottom: 'var(--space-5)',
                    borderLeft: '4px solid var(--color-primary)',
                    animation: 'fadeInDown var(--transition-slow) ease',
                }} id="expense-form">
                    <div className="card-body">
                        <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                            Record New Expense
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Description</label>
                                    <input required placeholder="e.g. Electricity bill" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-input" id="expense-description" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amount</label>
                                    <input type="number" required min="0" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="form-input" id="expense-amount" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-select" id="expense-category">
                                        {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="form-input" id="expense-date" />
                                </div>
                            </div>
                            <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)' }}>
                                <button type="submit" className="btn btn-primary" id="btn-save-expense">
                                    <FaPlus size={12} /> Record Expense
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }} id="expenses-filters">
                <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} className="form-input" style={{ width: 160 }} />
                <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} className="form-input" style={{ width: 160 }} />
                <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} className="form-select" style={{ width: 160 }}>
                    <option value="">All Categories</option>
                    {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <div style={{ marginLeft: 'auto' }}>
                    <div className="badge badge-danger" style={{ fontSize: 'var(--font-size-md)', padding: '6px 14px' }}>
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
