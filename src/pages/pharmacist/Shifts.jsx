import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor } from '../../utils/formatters';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import ShiftReceipt from '../../components/pharmacist/ShiftReceipt';
import { FaClock, FaPlay, FaStop } from 'react-icons/fa';

const Shifts = () => {
    const [currentShift, setCurrentShift] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startingCash, setStartingCash] = useState('');
    const [endingCash, setEndingCash] = useState('');
    const [endingVisa, setEndingVisa] = useState('');
    const [closeNotes, setCloseNotes] = useState('');
    
    const [printingShift, setPrintingShift] = useState(null);
    const printRef = useRef();
    const handlePrint = useReactToPrint({ content: () => printRef.current });

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
        if (!endingVisa && endingVisa !== '0') { toast.error('Enter actual visa receipts'); return; }
        try {
            const res = await api.put('/shifts/close', { endingCash: Number(endingCash), endingVisa: Number(endingVisa), notes: closeNotes });
            
            setPrintingShift(res.data.data);
            setTimeout(() => handlePrint(), 300);

            const cashDiff = res.data.data.cashDifference;
            const visaDiff = res.data.data.visaDifference;
            const totalDiff = cashDiff + visaDiff;
            if (totalDiff === 0) toast.success('Shift closed successfully — balances match');
            else if (totalDiff > 0) toast.success(`Shift closed — total surplus: ${totalDiff.toFixed(2)}`);
            else toast.error(`Shift closed — total deficit: ${Math.abs(totalDiff).toFixed(2)}`);
            setEndingCash(''); setEndingVisa(''); setCloseNotes('');
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
        { key: 'startingCash', label: 'Starting', width: 80 },
        { key: 'expectedCash', label: 'Exp. Cash', width: 80, render: (val) => val?.toFixed(2) ?? '—' },
        { key: 'endingCash', label: 'Act. Cash', width: 80, render: (val) => val ?? '—' },
        { key: 'expectedVisa', label: 'Exp. Visa', width: 80, render: (val) => val?.toFixed(2) ?? '—' },
        { key: 'endingVisa', label: 'Act. Visa', width: 80, render: (val) => val ?? '—' },
        {
            key: 'difference', label: 'Differences', width: 120, sortable: false,
            render: (_, row) => {
                if (row.status !== 'closed') return '—';
                const cashDiff = (row.endingCash || 0) - (row.expectedCash || 0);
                const visaDiff = (row.endingVisa || 0) - (row.expectedVisa || 0);
                const diff = cashDiff + visaDiff;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
                        <span style={{ color: cashDiff >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>Cash: {cashDiff >= 0 ? `+${cashDiff.toFixed(2)}` : cashDiff.toFixed(2)}</span>
                        <span style={{ color: visaDiff >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>Visa: {visaDiff >= 0 ? `+${visaDiff.toFixed(2)}` : visaDiff.toFixed(2)}</span>
                        <span style={{ fontWeight: 700, color: diff >= 0 ? 'var(--color-success)' : 'var(--color-danger)', borderTop: '1px solid #eee', paddingTop: '2px', marginTop: '2px' }}>Total: {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}</span>
                    </div>
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
                                <div><strong>Cash Sales:</strong> {formatCurrency(currentShift.cashSales || 0)}</div>
                                <div><strong>Visa Sales:</strong> {formatCurrency(currentShift.visaSales || 0)}</div>
                                <div><strong>Total Sales:</strong> {formatCurrency(currentShift.totalSales || 0)}</div>
                                <div><strong>Invoices:</strong> {currentShift.totalOrders || 0}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ borderLeft: '4px solid var(--color-danger)' }} id="shift-close-card">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ color: 'var(--color-danger)' }}>
                                <FaStop /> Close Shift
                            </h3>
                            <InputField label="Actual Cash in Drawer" type="number" min="0" value={endingCash} onChange={e => setEndingCash(e.target.value)} placeholder="0" style={{ fontSize: 'var(--font-size-xl)', textAlign: 'center', fontWeight: 700 }} id="shift-ending-cash" wrapperStyle={{ marginBottom: 'var(--space-3)' }} />
                            <InputField label="Actual Visa Receipts" type="number" min="0" value={endingVisa} onChange={e => setEndingVisa(e.target.value)} placeholder="0" style={{ fontSize: 'var(--font-size-xl)', textAlign: 'center', fontWeight: 700 }} id="shift-ending-visa" wrapperStyle={{ marginBottom: 'var(--space-3)' }} />
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
            
            <div style={{ display: 'none' }}>
                <ShiftReceipt ref={printRef} shift={printingShift} />
            </div>
        </div>
    );
};

export default Shifts;
