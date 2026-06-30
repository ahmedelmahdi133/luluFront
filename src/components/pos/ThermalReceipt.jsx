import { forwardRef } from 'react';
import Barcode from 'react-barcode';
import { PHARMACY_NAME, PHARMACY_ADDRESS, PHARMACY_PHONE } from '../../utils/constants';

const ThermalReceipt = forwardRef(({ order, pharmacistName }, ref) => {
    if (!order) return null;

    const s = {
        receipt: { width: 280, padding: '10px 5px', fontFamily: 'monospace', fontSize: 12, color: '#000', direction: 'rtl' },
        center: { textAlign: 'center' },
        line: { borderBottom: '1px dashed #000', margin: '6px 0' },
        row: { display: 'flex', justifyContent: 'space-between', padding: '2px 0' },
        bold: { fontWeight: 'bold' },
        total: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold', fontSize: 14 },
    };

    return (
        <div ref={ref} style={s.receipt}>
            <div style={s.center}>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{PHARMACY_NAME}</div>
                {PHARMACY_ADDRESS && <div style={{ fontSize: 10 }}>{PHARMACY_ADDRESS}</div>}
                {PHARMACY_PHONE && <div style={{ fontSize: 10 }}>هاتف: {PHARMACY_PHONE}</div>}
            </div>

            <div style={s.line} />

            <div style={s.row}>
                <span>رقم الفاتورة:</span>
                <span style={s.bold}>{order.orderNumber}</span>
            </div>
            <div style={s.row}>
                <span>التاريخ:</span>
                <span>{new Date(order.createdAt || Date.now()).toLocaleString('ar-EG')}</span>
            </div>
            {pharmacistName && (
                <div style={s.row}>
                    <span>الكاشير:</span>
                    <span>{pharmacistName}</span>
                </div>
            )}

            <div style={s.line} />

            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'right', padding: 2 }}>الصنف</th>
                        <th style={{ textAlign: 'center', padding: 2 }}>كمية</th>
                        <th style={{ textAlign: 'center', padding: 2 }}>سعر</th>
                        <th style={{ textAlign: 'left', padding: 2 }}>إجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '3px 2px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.productName || item.name}
                            </td>
                            <td style={{ textAlign: 'center', padding: 2 }}>{item.quantity}</td>
                            <td style={{ textAlign: 'center', padding: 2 }}>{item.priceAtPurchase?.toFixed(2)}</td>
                            <td style={{ textAlign: 'left', padding: 2 }}>{(item.quantity * item.priceAtPurchase).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={s.line} />

            <div style={s.row}>
                <span>المجموع:</span>
                <span>{order.subtotal?.toFixed(2)}</span>
            </div>
            {order.discount?.value > 0 && (
                <div style={{ ...s.row, color: '#c00' }}>
                    <span>الخصم {order.discount.type === 'percentage' ? `(${order.discount.value}%)` : ''}:</span>
                    <span>-{(order.subtotal - order.totalAmount).toFixed(2)}</span>
                </div>
            )}
            <div style={s.total}>
                <span>الإجمالي:</span>
                <span>{order.totalAmount?.toFixed(2)} ج.م</span>
            </div>
            <div style={s.row}>
                <span>المدفوع:</span>
                <span>{order.paidAmount?.toFixed(2)}</span>
            </div>
            {order.changeAmount > 0 && (
                <div style={{ ...s.row, ...s.bold }}>
                    <span>الباقي (الفكة):</span>
                    <span>{order.changeAmount?.toFixed(2)}</span>
                </div>
            )}
            <div style={s.row}>
                <span>طريقة الدفع:</span>
                <span>
                    {order.paymentMethod === 'cash'
                        ? 'نقدي'
                        : (order.paymentMethod === 'visa' || order.paymentMethod === 'card')
                            ? 'فيزا'
                            : order.paymentMethod === 'pending'
                                ? 'معلقة'
                                : 'تقسيم'}
                </span>
            </div>
            {order.paymentMethod === 'pending' && (
                <div style={{ ...s.row, ...s.bold, color: '#c00' }}>
                    <span>المتبقي:</span>
                    <span>{(order.dueAmount ?? order.totalAmount)?.toFixed(2)}</span>
                </div>
            )}

            <div style={s.line} />

            <div style={{ ...s.center, margin: '8px 0' }}>
                <Barcode value={order.orderNumber || 'ORD-0'} width={1.2} height={35} fontSize={10} displayValue={false} />
            </div>

            <div style={{ ...s.center, fontSize: 11, marginTop: 4 }}>
                شكراً لزيارتكم
            </div>
            <div style={{ ...s.center, fontSize: 9, color: '#666', marginTop: 2 }}>
                {PHARMACY_NAME}
            </div>
        </div>
    );
});

ThermalReceipt.displayName = 'ThermalReceipt';

export default ThermalReceipt;
