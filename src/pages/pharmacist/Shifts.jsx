import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { FaClock, FaPlay, FaStop } from 'react-icons/fa';

const Shifts = () => {
    const [currentShift, setCurrentShift] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startingCash, setStartingCash] = useState('');
    const [endingCash, setEndingCash] = useState('');
    const [closeNotes, setCloseNotes] = useState('');

    const fetchData = async () => {
        try {
            const [curr, all] = await Promise.all([
                api.get('/shifts/current'),
                api.get('/shifts')
            ]);
            setCurrentShift(curr.data.data);
            setShifts(all.data.data);
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openShift = async () => {
        if (!startingCash && startingCash !== '0') { toast.error('Enter starting cash amount'); return; }
        try {
            await api.post('/shifts/open', { startingCash: Number(startingCash) });
            toast.success('Shift opened');
            setStartingCash('');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const closeShift = async () => {
        if (!endingCash && endingCash !== '0') { toast.error('Enter actual cash in drawer'); return; }
        try {
            const res = await api.put('/shifts/close', { endingCash: Number(endingCash), notes: closeNotes });
            const diff = res.data.data.cashDifference;
            if (diff === 0) toast.success('Shift closed — cash matches exactly');
            else if (diff > 0) toast.success(`Shift closed — surplus: ${diff.toFixed(2)}`);
            else toast.error(`Shift closed — deficit: ${Math.abs(diff).toFixed(2)}`);
            setEndingCash(''); setCloseNotes('');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    if (loading) return <div className="page-wrapper"><LoadingSkeleton type="page" columns={8} /></div>;

    const checkedIn = currentShift && !currentShift.endTime;

    const columns = [
        { key: 'pharmacistId', label: 'Pharmacist', render: (val) => val?.name || '—' },
        { key: 'startTime', label: 'Start', render: (val) => formatDateTime(val), width: 150 },
        { key: 'endTime', label: 'End', render: (val) => val ? formatDateTime(val) : '—', width: 150 },
        { key: 'totalSales', label: 'Sales', render: (val) => <span className="cell-bold">{formatCurrency(val)}</span>, width: 110 },
        { key: 'totalOrders', label: 'Invoices', width: 80 },
        { key: 'startingCash', label: 'Starting', width: 90 },
        { key: 'endingCash', label: 'Actual', width: 90, render: (val) => val ?? '—' },
        { key: 'expectedCash', label: 'Expected', width: 90, render: (val) => val?.toFixed(2) ?? '—' },
        {
            key: 'cashDifference', label: 'Difference', width: 100, sortable: false,
            render: (_, row) => {
                if (row.status !== 'closed') return '—';
                const diff = (row.endingCash || 0) - (row.expectedCash || 0);
                return (
                    <span style={{ fontWeight: 700, color: diff >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                    </span>
                );
            }
        },
        {
            key: 'status', label: 'Status', width: 100,
            render: (val) => {
                const sc = getStatusColor(val);
                return <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${sc.cls}`}>{getStatusLabel(val)}</span>;
            }
        },
    ];

    return (
        <div className="page-wrapper" id="shifts-page">
            <PageHeader
                title="Shift Management"
                subtitle="Open, close and track cash register shifts"
                breadcrumbs={[{ label: 'Finance', to: '/shifts' }, { label: 'Shifts' }]}
            />

            {/* Shift Control Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: currentShift ? '1fr 1fr' : '1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }} id="shift-controls">
                {!currentShift ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ borderLeft: '4px solid var(--color-success)' }} id="shift-open-card">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                            <FaPlay size={14} /> Open New Shift
                        </h3>
                        <InputField label="Starting Cash in Drawer" type="number" min="0" value={startingCash} onChange={e => setStartingCash(e.target.value)} placeholder="0" style={{ fontSize: 'var(--font-size-xl)', textAlign: 'center', fontWeight: 700 }} id="shift-starting-cash" wrapperStyle={{ marginBottom: 'var(--space-4)' }} />
                        <Button variant="success" size="lg" onClick={openShift} style={{ width: '100%' }} id="btn-open-shift">
                            <FaPlay size={14} /> Open Shift
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ borderLeft: '4px solid var(--color-success)' }} id="shift-current-card">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                                <FaClock /> Current Shift
                            </h3>
                            <div style={{ fontSize: 'var(--font-size-md)', lineHeight: 2.4 }}>
                                <div><strong>Started:</strong> {formatDateTime(currentShift.startTime)}</div>
                                <div><strong>Starting Cash:</strong> {formatCurrency(currentShift.startingCash)}</div>
                                <div><strong>Total Sales:</strong> {formatCurrency(currentShift.totalSales || 0)}</div>
                                <div><strong>Invoices:</strong> {currentShift.totalOrders || 0}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ borderLeft: '4px solid var(--color-danger)' }} id="shift-close-card">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ color: 'var(--color-danger)' }}>
                                <FaStop /> Close Shift
                            </h3>
                            <InputField label="Actual Cash in Drawer" type="number" min="0" value={endingCash} onChange={e => setEndingCash(e.target.value)} placeholder="0" style={{ fontSize: 'var(--font-size-xl)', textAlign: 'center', fontWeight: 700 }} id="shift-ending-cash" wrapperStyle={{ marginBottom: 'var(--space-3)' }} />
                            <InputField label="Notes (optional)" value={closeNotes} onChange={e => setCloseNotes(e.target.value)} placeholder="Shift notes..." id="shift-close-notes" wrapperStyle={{ marginBottom: 'var(--space-4)' }} />
                            <Button variant="danger" size="lg" onClick={closeShift} style={{ width: '100%' }} id="btn-close-shift">
                                <FaStop size={14} /> Close Shift
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Shifts History Table */}
            <DataTable
                columns={columns}
                data={shifts}
                loading={false}
                emptyTitle="No shift records"
                emptyDescription="Open your first shift to start tracking."
                emptyIcon={FaClock}
                compact
                exportFilename="shifts.csv"
            />
        </div>
    );
};

export default Shifts;
