import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { FaFileMedical, FaCheck, FaTimes, FaQuoteRight, FaEye, FaPlus, FaTrash } from 'react-icons/fa';

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [reviewData, setReviewData] = useState({ pharmacistNotes: '', quotedPrice: '', items: [], status: '', rejectionReason: '' });
    const [saving, setSaving] = useState(false);

    const fetchPrescriptions = async () => {
        try {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const res = await api.get(`/prescriptions${params}`);
            setPrescriptions(res.data.data);
        } catch {}
        finally { setLoading(false); }
    };

    useEffect(() => { setLoading(true); fetchPrescriptions(); }, [statusFilter]);

    const openReview = (rx) => {
        setSelected(rx);
        setReviewData({
            pharmacistNotes: rx.pharmacistNotes || '',
            quotedPrice: rx.quotedPrice || '',
            items: rx.items?.length > 0 ? rx.items : [{ productName: '', quantity: 1, price: 0 }],
            status: rx.status,
            rejectionReason: rx.rejectionReason || ''
        });
    };

    const handleSave = async (newStatus) => {
        setSaving(true);
        try {
            const payload = { status: newStatus || reviewData.status, pharmacistNotes: reviewData.pharmacistNotes, rejectionReason: reviewData.rejectionReason };
            if (newStatus === 'quoted' || reviewData.status === 'quoted') {
                const validItems = reviewData.items.filter(i => i.productName?.trim());
                payload.items = validItems;
                payload.quotedPrice = validItems.reduce((sum, i) => sum + (i.price * i.quantity), 0) || Number(reviewData.quotedPrice) || 0;
            }
            await api.put(`/prescriptions/${getId(selected)}/review`, payload);
            toast.success('Prescription updated'); setSelected(null); fetchPrescriptions();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const addItem = () => setReviewData(prev => ({ ...prev, items: [...prev.items, { productName: '', quantity: 1, price: 0 }] }));
    const removeItem = (idx) => setReviewData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    const updateItem = (idx, field, value) => {
        setReviewData(prev => {
            const items = [...prev.items];
            items[idx] = { ...items[idx], [field]: field === 'productName' ? value : Number(value) || 0 };
            return { ...prev, items };
        });
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'badge-warning', reviewed: 'badge-info', quoted: 'badge-primary',
            preparing: 'badge-warning', ready: 'badge-success', completed: 'badge-success', rejected: 'badge-danger'
        };
        const labels = {
            pending: 'Pending', reviewed: 'Reviewed', quoted: 'Quoted',
            preparing: 'Preparing', ready: 'Ready', completed: 'Completed', rejected: 'Rejected'
        };
        return <span className={`badge badge-dot ${map[status] || 'badge-warning'}`}>{labels[status] || status}</span>;
    };

    const totalQuote = reviewData.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    const statuses = [
        { value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'quoted', label: 'Quoted' },
        { value: 'preparing', label: 'Preparing' }, { value: 'ready', label: 'Ready' },
        { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' }
    ];

    const columns = [
        { key: 'prescriptionNumber', label: 'RX #', width: 100, render: (val) => <span className="cell-mono cell-bold">{val}</span> },
        {
            key: 'customerId', label: 'Customer',
            render: (val) => (
                <div>
                    <div className="cell-bold">{val?.name}</div>
                    <div className="text-xs text-muted">{val?.phone || val?.email}</div>
                </div>
            )
        },
        { key: 'status', label: 'Status', width: 110, render: (val) => getStatusBadge(val) },
        {
            key: 'customerResponse', label: 'Response', width: 100,
            render: (val) => val === 'accepted' ? <span className="cell-success">Accepted</span>
                         : val === 'rejected' ? <span className="cell-danger">Rejected</span>
                         : <span className="text-muted">—</span>
        },
        {
            key: 'createdAt', label: 'Date', width: 100,
            render: (val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        },
        {
            key: 'actions', label: 'Actions', sortable: false, noExport: true, width: 100,
            render: (_, row) => (
                <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); openReview(row); }}>
                    <FaEye size={10} /> Review
                </button>
            )
        },
    ];

    return (
        <div className="page-wrapper" id="prescriptions-page">
            <PageHeader
                title="Prescription Management"
                subtitle={`${prescriptions.length} prescription(s)`}
                breadcrumbs={[{ label: 'Orders', to: '/prescriptions-manage' }, { label: 'Prescriptions' }]}
            />

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }} id="rx-status-tabs">
                {statuses.map(s => (
                    <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`btn btn-sm ${statusFilter === s.value ? 'btn-primary' : 'btn-ghost'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={prescriptions}
                loading={loading}
                emptyTitle="No prescriptions found"
                emptyDescription="Prescriptions submitted by customers will appear here."
                emptyIcon={FaFileMedical}
                exportFilename="prescriptions.csv"
            />

            {/* Review Modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Review: {selected.prescriptionNumber}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}><FaTimes size={16} /></button>
                        </div>
                        <div className="modal-body">
                            {/* Prescription Info */}
                            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                                <div style={{ width: 200, borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-bg-muted)', flexShrink: 0 }}>
                                    <a href={selected.imageUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={selected.imageUrl} alt="Prescription" style={{ width: '100%', display: 'block', cursor: 'zoom-in' }} onError={e => { e.currentTarget.src = ''; }} />
                                    </a>
                                </div>
                                <div style={{ flex: 1, minWidth: 200, fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', lineHeight: 2 }}>
                                    <div><strong>Customer:</strong> {selected.customerId?.name}</div>
                                    <div><strong>Phone:</strong> {selected.customerId?.phone || 'N/A'}</div>
                                    <div><strong>Email:</strong> {selected.customerId?.email || 'N/A'}</div>
                                    <div><strong>Date:</strong> {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                    {selected.notes && (
                                        <div className="alert-banner alert-banner-info" style={{ marginTop: 'var(--space-2)' }}>
                                            <strong>Patient Notes:</strong> {selected.notes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pharmacist Notes */}
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="form-label">Pharmacist Notes</label>
                                <textarea value={reviewData.pharmacistNotes} onChange={e => setReviewData(prev => ({ ...prev, pharmacistNotes: e.target.value }))}
                                    placeholder="Add your notes..." rows={3} className="form-textarea" />
                            </div>

                            {/* Quote Items */}
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Quote Items</label>
                                    <button onClick={addItem} className="btn btn-success btn-sm"><FaPlus size={10} /> Add Item</button>
                                </div>
                                {reviewData.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                                        <input value={item.productName} onChange={e => updateItem(i, 'productName', e.target.value)} placeholder="Product name" className="form-input" style={{ flex: 2 }} />
                                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" className="form-input" style={{ width: 60, textAlign: 'center' }} />
                                        <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} placeholder="Price" className="form-input" style={{ width: 90, textAlign: 'center' }} />
                                        <button onClick={() => removeItem(i)} className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--color-danger)' }}><FaTrash size={10} /></button>
                                    </div>
                                ))}
                                {reviewData.items.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                                        <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Total: {totalQuote.toFixed(2)} AED</span>
                                    </div>
                                )}
                            </div>

                            {/* Rejection Reason */}
                            {selected.status !== 'completed' && selected.status !== 'rejected' && (
                                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="form-label">Rejection Reason (if rejecting)</label>
                                    <input value={reviewData.rejectionReason} onChange={e => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))} placeholder="Reason..." className="form-input" />
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', paddingTop: 'var(--space-2)' }}>
                                {selected.status === 'pending' && (
                                    <>
                                        <button className="btn btn-primary" onClick={() => handleSave('quoted')} disabled={saving}><FaQuoteRight size={12} /> Send Quote</button>
                                        <button className="btn btn-danger" onClick={() => handleSave('rejected')} disabled={saving}><FaTimes size={12} /> Reject</button>
                                    </>
                                )}
                                {selected.status === 'quoted' && selected.customerResponse === 'accepted' && (
                                    <button className="btn btn-success" onClick={() => handleSave('ready')} disabled={saving}><FaCheck size={12} /> Mark Ready</button>
                                )}
                                {selected.status === 'preparing' && (
                                    <button className="btn btn-success" onClick={() => handleSave('ready')} disabled={saving}><FaCheck size={12} /> Mark Ready</button>
                                )}
                                {selected.status === 'ready' && (
                                    <button className="btn btn-success" onClick={() => handleSave('completed')} disabled={saving}><FaCheck size={12} /> Complete</button>
                                )}
                                <button className="btn btn-ghost" onClick={() => handleSave(selected.status)} disabled={saving}><FaCheck size={12} /> Save Notes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Prescriptions;
