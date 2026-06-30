import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getId } from '../../utils/getId';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { FaMoneyCheckAlt, FaUsers, FaCalculator, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const Payroll = () => {
    const [employees, setEmployees] = useState([]);
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [rateValue, setRateValue] = useState('');
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const fetchEmployees = async () => {
        try { const res = await api.get('/payroll/employees'); setEmployees(res.data.data); }
        catch { toast.error('Error loading employees'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            const res = await api.get(`/payroll/calculate?month=${month}&year=${year}`);
            setPayroll(res.data);
            toast.success('Payroll calculated');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setCalculating(false); }
    };

    const startEditRate = (emp) => { setEditingRate(getId(emp)); setRateValue(emp.monthlyHourlyRate || 0); };
    const saveRate = async (empId) => {
        try {
            await api.put(`/payroll/employees/${empId}/rate`, { monthlyHourlyRate: Number(rateValue) });
            toast.success('Rate updated'); setEditingRate(null); fetchEmployees();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (loading) return <div className="page-wrapper"><LoadingSkeleton type="page" columns={5} /></div>;

    const empColumns = [
        { key: 'name', label: 'Employee', render: (val) => <span className="cell-bold">{val}</span> },
        {
            key: 'role', label: 'Role', width: 120,
            render: (val) => <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${val === 'superadmin' ? 'badge-danger' : val === 'admin' ? 'badge-primary' : 'badge-success'}`}>{val === 'superadmin' ? 'Super Admin' : val === 'admin' ? 'Admin' : 'Pharmacist'}</span>
        },
        { key: 'email', label: 'Email', render: (val) => <span className="text-muted">{val}</span> },
        {
            key: 'monthlyHourlyRate', label: 'Hourly Rate (EGP)', width: 180,
            render: (val, row) => {
                const id = getId(row);
                if (editingRate === id) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="number" min="0" step="0.01" value={rateValue} onChange={e => setRateValue(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-md outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/15" style={{ width: 100, padding: '6px 8px' }} autoFocus />
                            <span className="text-sm text-muted">EGP</span>
                        </div>
                    );
                }
                return <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 'var(--font-size-lg)' }}>{(val || 0).toFixed(2)} EGP</span>;
            }
        },
        {
            key: 'actions', label: 'Actions', sortable: false, noExport: true, width: 100,
            render: (_, row) => {
                const id = getId(row);
                if (editingRate === id) {
                    return (
                        <div style={{ display: 'flex', gap: 4 }}>
                            <Button variant="success" size="icon" onClick={() => saveRate(id)}><FaSave size={11} /></Button>
                            <Button variant="danger" size="icon" onClick={() => setEditingRate(null)}><FaTimes size={11} /></Button>
                        </div>
                    );
                }
                return <Button variant="ghost" size="icon" onClick={() => startEditRate(row)}><FaEdit size={11} /></Button>;
            }
        },
    ];

    const payrollColumns = [
        { key: 'name', label: 'Employee', render: (val) => <span className="cell-bold">{val}</span> },
        {
            key: 'role', label: 'Role', width: 120,
            render: (val) => <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] ${val === 'superadmin' ? 'badge-danger' : val === 'admin' ? 'badge-primary' : 'badge-success'}`}>{val === 'superadmin' ? 'Super Admin' : val === 'admin' ? 'Admin' : 'Pharmacist'}</span>
        },
        { key: 'workingDays', label: 'Working Days', width: 120, render: (val) => <span className="cell-bold">{val} days</span> },
        { key: 'totalHours', label: 'Total Hours', width: 120, render: (val) => <span className="cell-bold">{val.toFixed(2)} hrs</span> },
        { key: 'monthlyHourlyRate', label: 'Rate', width: 100, render: (val) => <span className="text-muted">{val.toFixed(2)} EGP</span> },
        {
            key: 'formula', label: 'Formula', width: 180, sortable: false, noExport: true,
            render: (_, row) => <span className="cell-mono">({row.totalHours.toFixed(1)} / 26) × {row.monthlyHourlyRate.toFixed(0)}</span>
        },
        {
            key: 'calculatedSalary', label: 'Salary (EGP)', width: 140,
            render: (val) => <span style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>{val.toFixed(2)}</span>
        },
    ];

    return (
        <div className="page-wrapper" id="payroll-page">
            <PageHeader
                title="Payroll Management"
                subtitle="Set hourly rates and calculate monthly payroll"
                breadcrumbs={[{ label: 'HR', to: '/payroll' }, { label: 'Payroll' }]}
            />

            {/* Employee Rates */}
            <div style={{ marginBottom: 'var(--space-6)' }} id="employee-rates">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
                    <FaUsers color="var(--color-primary)" /> Employee Hourly Rates
                </h3>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                    Set the monthly hourly rate for each employee. Salary = (Total Working Hours ÷ 26) × Monthly Hourly Rate
                </p>
                <DataTable
                    columns={empColumns}
                    data={employees}
                    loading={false}
                    emptyTitle="No employees found"
                    emptyIcon={FaUsers}
                    compact
                />
            </div>

            {/* Payroll Calculation */}
            <div id="payroll-calculation">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ marginBottom: 'var(--space-4)' }}>
                    <FaCalculator color="var(--color-primary)" /> Calculate Payroll
                </h3>

                <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
                    <InputField 
                        type="select" 
                        label="Month" 
                        value={month} 
                        onChange={e => setMonth(Number(e.target.value))} 
                        style={{ width: 160 }}
                        options={monthNames.map((name, i) => ({ value: i + 1, label: name }))}
                    />
                    <InputField 
                        type="select" 
                        label="Year" 
                        value={year} 
                        onChange={e => setYear(Number(e.target.value))} 
                        style={{ width: 100 }}
                        options={[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => ({ value: y, label: y }))}
                    />
                    <Button onClick={handleCalculate} disabled={calculating} style={{ alignSelf: 'flex-end' }} id="btn-calculate-payroll">
                        <FaCalculator size={13} /> {calculating ? 'Calculating...' : 'Calculate'}
                    </Button>
                </div>

                {payroll && (
                    <>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4] bg-cyan-100 text-cyan-800" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-md)', padding: '8px 16px' }}>
                            Payroll for {monthNames[payroll.month - 1]} {payroll.year}
                        </div>
                        <DataTable
                            columns={payrollColumns}
                            data={payroll.data}
                            loading={false}
                            emptyTitle="No payroll data"
                            emptyIcon={FaMoneyCheckAlt}
                            compact
                            exportFilename={`payroll_${payroll.year}_${payroll.month}.csv`}
                        />
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{
                            marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between',
                            background: 'var(--color-primary-lighter)', borderLeft: '4px solid var(--color-primary)',
                        }}>
                            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary-dark)' }}>Total Payroll</span>
                            <span style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)', color: 'var(--color-primary-dark)' }}>{payroll.totalPayroll.toFixed(2)} EGP</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Payroll;
