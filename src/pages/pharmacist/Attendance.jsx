import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { FaSignInAlt, FaSignOutAlt, FaClock, FaCalendarAlt, FaUserClock, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Attendance = () => {
    const { user } = useAuth();
    const [todayStatus, setTodayStatus] = useState(null);
    const [myRecords, setMyRecords] = useState([]);
    const [allRecords, setAllRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showManual, setShowManual] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');
    const [manualForm, setManualForm] = useState({ employeeId: '', date: '', checkIn: '', checkOut: '', status: 'present', notes: '' });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    const fetchTodayStatus = async () => { try { const res = await api.get('/attendance/today'); setTodayStatus(res.data.data); } catch {} };
    const fetchMyRecords = async () => { try { const res = await api.get('/attendance/my'); setMyRecords(res.data.data); } catch {} };
    const fetchAllRecords = async () => {
        if (!isAdmin) return;
        try {
            const params = new URLSearchParams();
            if (filterEmployee) params.append('employeeId', filterEmployee);
            if (filterStart) params.append('startDate', filterStart);
            if (filterEnd) params.append('endDate', filterEnd);
            const res = await api.get(`/attendance?${params}`);
            setAllRecords(res.data.data);
        } catch {}
    };
    const fetchEmployees = async () => { if (!isAdmin) return; try { const res = await api.get('/payroll/employees'); setEmployees(res.data.data); } catch {} };

    useEffect(() => { Promise.all([fetchTodayStatus(), fetchMyRecords(), fetchAllRecords(), fetchEmployees()]).finally(() => setLoading(false)); }, []);
    useEffect(() => { if (isAdmin) fetchAllRecords(); }, [filterEmployee, filterStart, filterEnd]);

    const handleCheckIn = async () => {
        try { await api.post('/attendance/check-in'); toast.success('Checked in!'); fetchTodayStatus(); fetchMyRecords(); if (isAdmin) fetchAllRecords(); }
        catch (err) { toast.error(err.response?.data?.message || 'Check-in failed'); }
    };
    const handleCheckOut = async () => {
        try { await api.post('/attendance/check-out'); toast.success('Checked out!'); fetchTodayStatus(); fetchMyRecords(); if (isAdmin) fetchAllRecords(); }
        catch (err) { toast.error(err.response?.data?.message || 'Check-out failed'); }
    };
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/attendance/manual', manualForm); toast.success('Attendance record saved');
            setShowManual(false); setManualForm({ employeeId: '', date: '', checkIn: '', checkOut: '', status: 'present', notes: '' }); fetchAllRecords();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving record'); }
    };

    const formatTime = (dateStr) => !dateStr ? '—' : new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (dateStr) => !dateStr ? '—' : new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const getStatusBadge = (status) => {
        const map = { present: 'badge-success', late: 'badge-warning', absent: 'badge-danger', half_day: 'badge-info' };
        const labels = { present: 'Present', late: 'Late', absent: 'Absent', half_day: 'Half Day' };
        return <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] badge-dot ${map[status] || 'badge-success'}`}>{labels[status] || 'Present'}</span>;
    };

    if (loading) return <div className="page-wrapper"><LoadingSkeleton type="page" columns={5} /></div>;

    const checkedIn = todayStatus && !todayStatus.checkOut;
    const checkedOut = todayStatus && todayStatus.checkOut;

    const myColumns = [
        { key: 'date', label: 'Date', render: (val) => formatDate(val) },
        { key: 'checkIn', label: 'Check In', render: (val) => <span className="cell-success">{formatTime(val)}</span> },
        { key: 'checkOut', label: 'Check Out', render: (val) => <span style={{ color: val ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{formatTime(val)}</span> },
        { key: 'totalHours', label: 'Total Hours', render: (val) => <span className="cell-bold">{val?.toFixed(2) || '0.00'} hrs</span> },
        { key: 'status', label: 'Status', render: (val) => getStatusBadge(val) },
    ];

    const allColumns = [
        {
            key: 'employeeId', label: 'Employee', render: (val) => (
                <div>
                    <div className="cell-bold">{val?.name}</div>
                    <div className="text-xs text-muted">{val?.role}</div>
                </div>
            )
        },
        { key: 'date', label: 'Date', render: (val) => formatDate(val) },
        { key: 'checkIn', label: 'Check In', render: (val) => <span className="cell-success">{formatTime(val)}</span> },
        { key: 'checkOut', label: 'Check Out', render: (val) => <span style={{ color: val ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{formatTime(val)}</span> },
        { key: 'totalHours', label: 'Total Hours', render: (val) => <span className="cell-bold">{val?.toFixed(2) || '0.00'} hrs</span> },
        { key: 'status', label: 'Status', render: (val) => getStatusBadge(val) },
        { key: 'notes', label: 'Notes', render: (val) => <span className="text-muted text-sm">{val || '—'}</span> },
    ];

    return (
        <div className="page-wrapper" id="attendance-page">
            <PageHeader
                title="Attendance"
                subtitle="Track check-in/out and attendance records"
                breadcrumbs={[{ label: 'HR', to: '/attendance' }, { label: 'Attendance' }]}
            />

            {/* Check In/Out Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }} id="attendance-status">
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="text-sm text-muted" style={{ marginBottom: 'var(--space-1)' }}>Today's Status</div>
                    {!todayStatus ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)' }}>
                            <FaTimesCircle /> Not checked in yet
                        </div>
                    ) : checkedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                            <FaCheckCircle /> Checked in at {formatTime(todayStatus.checkIn)}
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-info)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                <FaCheckCircle /> Day complete
                            </div>
                            <div className="text-sm text-muted" style={{ marginTop: 4 }}>
                                {formatTime(todayStatus.checkIn)} — {formatTime(todayStatus.checkOut)} ({todayStatus.totalHours?.toFixed(2)} hrs)
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Button variant="success" size="lg" onClick={handleCheckIn} disabled={!!todayStatus} id="btn-check-in">
                        <FaSignInAlt size={16} /> Check In
                    </Button>
                    <Button variant="danger" size="lg" onClick={handleCheckOut} disabled={!checkedIn} id="btn-check-out">
                        <FaSignOutAlt size={16} /> Check Out
                    </Button>
                </div>
            </div>

            {/* My Attendance History */}
            <div style={{ marginBottom: 'var(--space-6)' }} id="my-attendance">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ marginBottom: 'var(--space-4)' }}>
                    <FaClock color="var(--color-primary)" /> My Attendance History
                </h3>
                <DataTable
                    columns={myColumns}
                    data={myRecords}
                    loading={false}
                    emptyTitle="No attendance records"
                    emptyDescription="Your records will appear here after you check in."
                    emptyIcon={FaClock}
                    compact
                />
            </div>

            {/* Admin: All Attendance */}
            {isAdmin && (
                <div id="admin-attendance">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ margin: 0 }}>
                            <FaCalendarAlt color="var(--color-primary)" /> All Employees Attendance
                        </h3>
                        <Button variant={showManual ? 'ghost' : 'primary'} size="sm" onClick={() => setShowManual(!showManual)} id="btn-manual-entry">
                            {showManual ? 'Cancel' : <><FaPlus size={11} /> Manual Entry</>}
                        </Button>
                    </div>

                    {showManual && (
                        <form onSubmit={handleManualSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ marginBottom: 'var(--space-5)', borderLeft: '4px solid var(--color-primary)', animation: 'fadeInDown var(--transition-slow) ease' }} id="manual-attendance-form">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                                <InputField 
                                    type="select" 
                                    label="Employee" 
                                    value={manualForm.employeeId} 
                                    onChange={e => setManualForm(prev => ({ ...prev, employeeId: e.target.value }))} 
                                    required
                                    options={[{ value: '', label: 'Select Employee' }, ...employees.map(emp => ({ value: getId(emp), label: emp.name }))]}
                                />
                                <InputField type="date" label="Date" value={manualForm.date} onChange={e => setManualForm(prev => ({ ...prev, date: e.target.value }))} required />
                                <InputField type="datetime-local" label="Check In" value={manualForm.checkIn} onChange={e => setManualForm(prev => ({ ...prev, checkIn: e.target.value }))} required />
                                <InputField type="datetime-local" label="Check Out" value={manualForm.checkOut} onChange={e => setManualForm(prev => ({ ...prev, checkOut: e.target.value }))} />
                                <InputField 
                                    type="select" 
                                    label="Status" 
                                    value={manualForm.status} 
                                    onChange={e => setManualForm(prev => ({ ...prev, status: e.target.value }))} 
                                    options={[
                                        { value: 'present', label: 'Present' },
                                        { value: 'late', label: 'Late' },
                                        { value: 'absent', label: 'Absent' },
                                        { value: 'half_day', label: 'Half Day' }
                                    ]}
                                />
                                <InputField label="Notes" value={manualForm.notes} onChange={e => setManualForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" />
                            </div>
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                <Button type="submit">Save Record</Button>
                            </div>
                        </form>
                    )}

                    {/* Filters */}
                    <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }} id="attendance-filters">
                        <InputField 
                            type="select" 
                            value={filterEmployee} 
                            onChange={e => setFilterEmployee(e.target.value)} 
                            style={{ width: 180 }}
                            options={[{ value: '', label: 'All Employees' }, ...employees.map(emp => ({ value: getId(emp), label: emp.name }))]}
                        />
                        <InputField type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} style={{ width: 160 }} placeholder="From" />
                        <InputField type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} style={{ width: 160 }} placeholder="To" />
                        {(filterEmployee || filterStart || filterEnd) && (
                            <Button variant="ghost" size="sm" onClick={() => { setFilterEmployee(''); setFilterStart(''); setFilterEnd(''); }} style={{ color: 'var(--color-danger)' }}>
                                Clear
                            </Button>
                        )}
                    </div>

                    <DataTable
                        columns={allColumns}
                        data={allRecords}
                        loading={false}
                        emptyTitle="No records found"
                        emptyDescription="Try adjusting your filters."
                        emptyIcon={FaCalendarAlt}
                        compact
                        exportFilename="attendance.csv"
                    />
                </div>
            )}
        </div>
    );
};

export default Attendance;
