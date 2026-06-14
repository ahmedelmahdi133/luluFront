import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
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
    const isAdmin = user?.role === 'admin';

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
        return <span className={`badge badge-dot ${map[status] || 'badge-success'}`}>{labels[status] || 'Present'}</span>;
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
            <div className="card card-body" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }} id="attendance-status">
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
                    <button onClick={handleCheckIn} disabled={!!todayStatus} className="btn btn-success btn-lg" id="btn-check-in">
                        <FaSignInAlt size={16} /> Check In
                    </button>
                    <button onClick={handleCheckOut} disabled={!checkedIn} className="btn btn-danger btn-lg" id="btn-check-out">
                        <FaSignOutAlt size={16} /> Check Out
                    </button>
                </div>
            </div>

            {/* My Attendance History */}
            <div style={{ marginBottom: 'var(--space-6)' }} id="my-attendance">
                <h3 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
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
                        <h3 className="section-title" style={{ margin: 0 }}>
                            <FaCalendarAlt color="var(--color-primary)" /> All Employees Attendance
                        </h3>
                        <button onClick={() => setShowManual(!showManual)} className={`btn ${showManual ? 'btn-ghost' : 'btn-primary'} btn-sm`} id="btn-manual-entry">
                            {showManual ? 'Cancel' : <><FaPlus size={11} /> Manual Entry</>}
                        </button>
                    </div>

                    {showManual && (
                        <form onSubmit={handleManualSubmit} className="card card-body" style={{ marginBottom: 'var(--space-5)', borderLeft: '4px solid var(--color-primary)', animation: 'fadeInDown var(--transition-slow) ease' }} id="manual-attendance-form">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                                <div className="form-group">
                                    <label className="form-label">Employee</label>
                                    <select value={manualForm.employeeId} onChange={e => setManualForm(prev => ({ ...prev, employeeId: e.target.value }))} className="form-select" required>
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => <option key={getId(emp)} value={getId(emp)}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input type="date" value={manualForm.date} onChange={e => setManualForm(prev => ({ ...prev, date: e.target.value }))} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Check In</label>
                                    <input type="datetime-local" value={manualForm.checkIn} onChange={e => setManualForm(prev => ({ ...prev, checkIn: e.target.value }))} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Check Out</label>
                                    <input type="datetime-local" value={manualForm.checkOut} onChange={e => setManualForm(prev => ({ ...prev, checkOut: e.target.value }))} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select value={manualForm.status} onChange={e => setManualForm(prev => ({ ...prev, status: e.target.value }))} className="form-select">
                                        <option value="present">Present</option>
                                        <option value="late">Late</option>
                                        <option value="absent">Absent</option>
                                        <option value="half_day">Half Day</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <input value={manualForm.notes} onChange={e => setManualForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" className="form-input" />
                                </div>
                            </div>
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                <button type="submit" className="btn btn-primary">Save Record</button>
                            </div>
                        </form>
                    )}

                    {/* Filters */}
                    <div className="filter-bar" style={{ marginBottom: 'var(--space-4)' }} id="attendance-filters">
                        <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="form-select" style={{ width: 180 }}>
                            <option value="">All Employees</option>
                            {employees.map(emp => <option key={getId(emp)} value={getId(emp)}>{emp.name}</option>)}
                        </select>
                        <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="form-input" style={{ width: 160 }} placeholder="From" />
                        <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="form-input" style={{ width: 160 }} placeholder="To" />
                        {(filterEmployee || filterStart || filterEnd) && (
                            <button onClick={() => { setFilterEmployee(''); setFilterStart(''); setFilterEnd(''); }} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}>
                                Clear
                            </button>
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
