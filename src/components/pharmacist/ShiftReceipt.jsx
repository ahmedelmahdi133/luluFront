import React from 'react';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const ShiftReceipt = React.forwardRef(({ shift }, ref) => {
    if (!shift) return null;

    const cashDiff = (shift.endingCash || 0) - (shift.expectedCash || 0);
    const visaDiff = (shift.endingVisa || 0) - (shift.expectedVisa || 0);
    const totalDiff = cashDiff + visaDiff;

    return (
        <div ref={ref} style={{
            padding: '20px',
            fontFamily: 'monospace',
            width: '100%',
            maxWidth: '80mm', /* Standard thermal printer width */
            margin: '0 auto',
            color: '#000',
            backgroundColor: '#fff',
            direction: 'rtl'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '5px', fontSize: '18px' }}>Index Pharmacy</h2>
            <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', fontSize: '14px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>تقرير تقفيل وردية</h3>
            
            <div style={{ fontSize: '12px', lineHeight: '1.6', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الصيدلي:</span>
                    <strong>{shift.pharmacist?.name || 'غير معروف'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>البداية:</span>
                    <span>{formatDateTime(shift.startTime)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>النهاية:</span>
                    <span>{shift.endTime ? formatDateTime(shift.endTime) : formatDateTime(new Date())}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>عدد الفواتير:</span>
                    <span>{shift.totalOrders || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span>إجمالي المبيعات:</span>
                    <strong style={{ fontSize: '14px' }}>{formatCurrency(shift.totalSales || 0)}</strong>
                </div>
            </div>

            <h4 style={{ margin: '10px 0 5px 0', fontSize: '13px' }}>تفاصيل الكاش</h4>
            <div style={{ fontSize: '12px', lineHeight: '1.6', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الكاش المتوقع:</span>
                    <span>{formatCurrency(shift.expectedCash || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الكاش الفعلي:</span>
                    <span>{formatCurrency(shift.endingCash || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span>الفرق (كاش):</span>
                    <strong>{cashDiff > 0 ? '+' : ''}{cashDiff.toFixed(2)}</strong>
                </div>
            </div>

            <h4 style={{ margin: '10px 0 5px 0', fontSize: '13px' }}>تفاصيل الفيزا</h4>
            <div style={{ fontSize: '12px', lineHeight: '1.6', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الفيزا المتوقعة:</span>
                    <span>{formatCurrency(shift.expectedVisa || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الفيزا الفعلية:</span>
                    <span>{formatCurrency(shift.endingVisa || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span>الفرق (فيزا):</span>
                    <strong>{visaDiff > 0 ? '+' : ''}{visaDiff.toFixed(2)}</strong>
                </div>
            </div>

            <div style={{ fontSize: '14px', lineHeight: '1.6', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>إجمالي العجز/الزيادة:</span>
                    <span>{totalDiff > 0 ? '+' : ''}{totalDiff.toFixed(2)}</span>
                </div>
            </div>

            {shift.notes && (
                <div style={{ fontSize: '12px', marginBottom: '10px' }}>
                    <strong>ملاحظات:</strong>
                    <p style={{ margin: '5px 0 0 0' }}>{shift.notes}</p>
                </div>
            )}

            <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '20px' }}>
                <p>تمت طباعة التقرير من النظام</p>
            </div>
        </div>
    );
});

export default ShiftReceipt;
