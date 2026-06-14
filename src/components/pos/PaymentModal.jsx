import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaMoneyBillWave, FaCreditCard, FaRandom, FaClock } from 'react-icons/fa';
import { COLORS } from '../../utils/constants';

const PaymentModal = ({ isOpen, totalAmount, subtotal, onConfirm, onClose }) => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [discountType, setDiscountType] = useState('fixed');
    const [discountValue, setDiscountValue] = useState('');
    const [splitCash, setSplitCash] = useState('');
    const [splitCard, setSplitCard] = useState('');
    const paidRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setPaidAmount('');
            setDiscountType('fixed');
            setDiscountValue('');
            setPaymentMethod('cash');
            setSplitCash('');
            setSplitCard('');
            setTimeout(() => paidRef.current?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const dv = Number(discountValue) || 0;
    let discountAmount = 0;
    if (discountType === 'percentage') {
        discountAmount = Math.min(subtotal * dv / 100, subtotal);
    } else {
        discountAmount = Math.min(dv, subtotal);
    }
    const finalTotal = Math.round((subtotal - discountAmount) * 100) / 100;

    const paid = Number(paidAmount) || 0;
    const change = Math.max(0, paid - finalTotal);

    const handleSubmit = () => {
        const discount = dv > 0 ? { type: discountType, value: dv } : null;
        const data = {
            paymentMethod,
            paidAmount: paymentMethod === 'cash' ? (paid || finalTotal) : (paymentMethod === 'pending' ? 0 : finalTotal),
            discount,
            finalTotal
        };
        if (paymentMethod === 'split') {
            data.splitPayment = {
                cash: Number(splitCash) || 0,
                card: Number(splitCard) || 0
            };
            data.paidAmount = finalTotal;
        }
        onConfirm(data);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999
        }} onClick={onClose} onKeyDown={handleKeyDown}>
            <div style={{
                backgroundColor: 'white', borderRadius: 16, width: 460, maxHeight: '90vh',
                overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    padding: '18px 24px', backgroundColor: COLORS.primary, color: 'white',
                    borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Confirm Payment</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <FaTimes size={18} />
                    </button>
                </div>

                <div style={{ padding: 24 }}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>Discount (optional)</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <select value={discountType} onChange={e => setDiscountType(e.target.value)} style={{ ...inputStyle, flex: '0 0 120px' }}>
                                <option value="fixed">Fixed Amount</option>
                                <option value="percentage">Percentage %</option>
                            </select>
                            <input
                                type="number" min="0" placeholder="0"
                                value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        {discountAmount > 0 && (
                            <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
                                Discount: {discountAmount.toFixed(2)} AED
                            </div>
                        )}
                    </div>

                    <div style={{
                        backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12,
                        textAlign: 'center', marginBottom: 20, border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Amount Due</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a' }}>
                            {finalTotal.toFixed(2)} <span style={{ fontSize: 16 }}>AED</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>Payment Method</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[
                                { v: 'cash', l: 'Cash', i: FaMoneyBillWave, c: '#16a34a' },
                                { v: 'visa', l: 'Visa', i: FaCreditCard, c: '#2563eb' },
                                { v: 'pending', l: 'Pending', i: FaClock, c: '#f59e0b' },
                                { v: 'split', l: 'Split', i: FaRandom, c: '#7c3aed' }
                            ].map(m => (
                                <button key={m.v} onClick={() => setPaymentMethod(m.v)} style={{
                                    flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                                    border: paymentMethod === m.v ? `2px solid ${m.c}` : '2px solid #e2e8f0',
                                    backgroundColor: paymentMethod === m.v ? `${m.c}10` : 'white',
                                    color: paymentMethod === m.v ? m.c : '#64748b',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 13
                                }}>
                                    <m.i size={20} />
                                    {m.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod === 'cash' && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Amount Paid</label>
                            <input
                                ref={paidRef} type="number" min="0"
                                placeholder={finalTotal.toFixed(2)}
                                value={paidAmount}
                                onChange={e => setPaidAmount(e.target.value)}
                                style={{ ...inputStyle, fontSize: 20, textAlign: 'center', fontWeight: 700 }}
                                onKeyDown={handleKeyDown}
                            />
                            {change > 0 && (
                                <div style={{
                                    backgroundColor: '#fffbeb', padding: 12, borderRadius: 8,
                                    marginTop: 8, textAlign: 'center', border: '1px solid #fde68a'
                                }}>
                                    <span style={{ color: '#92400e', fontSize: 14 }}>Change: </span>
                                    <span style={{ color: '#92400e', fontSize: 20, fontWeight: 800 }}>{change.toFixed(2)} AED</span>
                                </div>
                            )}
                        </div>
                    )}

                    {paymentMethod === 'pending' && (
                        <div style={{
                            backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e',
                            padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14, textAlign: 'center'
                        }}>
                            This invoice will be saved as pending (unpaid).
                        </div>
                    )}

                    {paymentMethod === 'split' && (
                        <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Cash</label>
                                <input type="number" min="0" value={splitCash}
                                    onChange={e => { setSplitCash(e.target.value); setSplitCard(String(finalTotal - (Number(e.target.value) || 0))); }}
                                    style={inputStyle} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Card</label>
                                <input type="number" min="0" value={splitCard}
                                    onChange={e => { setSplitCard(e.target.value); setSplitCash(String(finalTotal - (Number(e.target.value) || 0))); }}
                                    style={inputStyle} />
                            </div>
                        </div>
                    )}

                    <button onClick={handleSubmit} style={{
                        width: '100%', padding: 16, backgroundColor: '#16a34a', color: 'white',
                        fontSize: 18, fontWeight: 700, border: 'none', borderRadius: 12,
                        cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                    }}>
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

export default PaymentModal;
