import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { COLORS } from '../../utils/constants';
import { FaFileMedical, FaPaperPlane, FaImage, FaClock, FaCheck, FaTimes, FaQuoteRight, FaSpinner } from 'react-icons/fa';

const SubmitPrescription = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const C = COLORS.customerPrimary;

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('/prescriptions/my');
            setPrescriptions(res.data.data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPrescriptions(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl.trim()) return toast.error('Please provide a prescription image URL');
        setSubmitting(true);
        try {
            await api.post('/prescriptions', { imageUrl: imageUrl.trim(), notes: notes.trim() });
            toast.success('Prescription submitted successfully!');
            setImageUrl('');
            setNotes('');
            setShowForm(false);
            fetchPrescriptions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error submitting prescription');
        }
        finally { setSubmitting(false); }
    };

    const handleRespond = async (id, response) => {
        try {
            await api.put(`/prescriptions/${id}/respond`, { response });
            toast.success(response === 'accepted' ? 'Quote accepted! Your order is being prepared.' : 'Quote rejected.');
            fetchPrescriptions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error responding to quote');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending Review', icon: FaClock },
            reviewed: { bg: '#dbeafe', color: '#1e40af', label: 'Reviewed', icon: FaCheck },
            quoted: { bg: '#e0e7ff', color: '#3730a3', label: 'Quote Ready', icon: FaQuoteRight },
            preparing: { bg: '#fef3c7', color: '#92400e', label: 'Preparing', icon: FaSpinner },
            ready: { bg: '#dcfce7', color: '#166534', label: 'Ready for Pickup', icon: FaCheck },
            completed: { bg: '#dcfce7', color: '#166534', label: 'Completed', icon: FaCheck },
            rejected: { bg: '#fef2f2', color: '#991b1b', label: 'Rejected', icon: FaTimes }
        };
        const s = map[status] || map.pending;
        const Icon = s.icon;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 12px', borderRadius: 20,
                fontSize: 12, fontWeight: 600,
                backgroundColor: s.bg, color: s.color
            }}>
                <Icon size={10} /> {s.label}
            </span>
        );
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FaFileMedical color={C} /> My Prescriptions
                </h2>
                <button onClick={() => setShowForm(!showForm)} style={{
                    padding: '10px 22px', backgroundColor: showForm ? '#64748b' : C, color: 'white',
                    border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6
                }}>
                    {showForm ? 'Cancel' : <><FaPaperPlane size={12} /> Submit Prescription</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    backgroundColor: 'white', borderRadius: 14, padding: 24,
                    marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginTop: 0, marginBottom: 16 }}>
                        Submit a New Prescription
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
                        Upload your prescription image to a hosting service (e.g. Imgur, Cloudinary) and paste the URL below. Our pharmacists will review it and send you a quote.
                    </p>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <FaImage size={12} /> Prescription Image URL *
                        </label>
                        <input
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            placeholder="https://example.com/prescription-image.jpg"
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 10,
                                border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    {imageUrl && (
                        <div style={{
                            marginBottom: 16, borderRadius: 10, overflow: 'hidden',
                            border: '1px solid #e2e8f0', maxHeight: 200,
                            display: 'flex', justifyContent: 'center', backgroundColor: '#f8fafc'
                        }}>
                            <img src={imageUrl} alt="Preview" style={{ maxHeight: 200, objectFit: 'contain' }}
                                onError={e => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any additional notes for the pharmacist..."
                            rows={3}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 10,
                                border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
                                resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button type="submit" disabled={submitting} style={{
                        padding: '12px 28px', backgroundColor: C, color: 'white',
                        border: 'none', borderRadius: 10, cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: 15, fontWeight: 700, opacity: submitting ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <FaPaperPlane size={13} /> {submitting ? 'Submitting...' : 'Submit Prescription'}
                    </button>
                </form>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
            ) : prescriptions.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, backgroundColor: 'white',
                    borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}>
                    <FaFileMedical size={48} color="#cbd5e1" />
                    <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 15 }}>No prescriptions submitted yet</p>
                    <p style={{ color: '#cbd5e1', fontSize: 13 }}>Click "Submit Prescription" to get started</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {prescriptions.map(rx => (
                        <div key={rx._id} style={{
                            backgroundColor: 'white', borderRadius: 14, overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: rx.status === 'quoted' ? '2px solid #6366f1' : '2px solid transparent'
                        }}>
                            <div style={{ display: 'flex', gap: 16, padding: 20, flexWrap: 'wrap' }}>
                                <div style={{
                                    width: 120, height: 120, borderRadius: 10, overflow: 'hidden',
                                    backgroundColor: '#f1f5f9', flexShrink: 0, display: 'flex',
                                    justifyContent: 'center', alignItems: 'center'
                                }}>
                                    <img src={rx.imageUrl} alt="Prescription" style={{
                                        width: '100%', height: '100%', objectFit: 'cover'
                                    }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                                </div>

                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 4 }}>
                                                {rx.prescriptionNumber}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                {new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {getStatusBadge(rx.status)}
                                    </div>

                                    {rx.notes && (
                                        <p style={{ fontSize: 13, color: '#64748b', margin: '8px 0', lineHeight: 1.5 }}>
                                            <strong>Your notes:</strong> {rx.notes}
                                        </p>
                                    )}

                                    {rx.pharmacistNotes && (
                                        <p style={{ fontSize: 13, color: '#1e40af', margin: '8px 0', lineHeight: 1.5, backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: 8 }}>
                                            <strong>Pharmacist notes:</strong> {rx.pharmacistNotes}
                                        </p>
                                    )}

                                    {rx.rejectionReason && (
                                        <p style={{ fontSize: 13, color: '#991b1b', margin: '8px 0', lineHeight: 1.5, backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: 8 }}>
                                            <strong>Reason:</strong> {rx.rejectionReason}
                                        </p>
                                    )}

                                    {rx.status === 'quoted' && rx.quotedPrice && (
                                        <div style={{
                                            marginTop: 12, padding: 16, backgroundColor: '#f0f9ff',
                                            borderRadius: 10, border: '1px solid #bae6fd'
                                        }}>
                                            <div style={{ fontSize: 13, color: '#0369a1', marginBottom: 8, fontWeight: 600 }}>Quote Details:</div>
                                            {rx.items?.length > 0 && (
                                                <div style={{ marginBottom: 10 }}>
                                                    {rx.items.map((item, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '2px 0' }}>
                                                            <span>{item.productName} x{item.quantity}</span>
                                                            <span>{item.price?.toFixed(2)} AED</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: '#0c4a6e', borderTop: '1px solid #bae6fd', paddingTop: 8 }}>
                                                <span>Total</span>
                                                <span>{rx.quotedPrice?.toFixed(2)} AED</span>
                                            </div>

                                            {!rx.customerResponse && (
                                                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                                    <button onClick={() => handleRespond(rx._id, 'accepted')} style={{
                                                        flex: 1, padding: '10px 16px', backgroundColor: '#16a34a', color: 'white',
                                                        border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                                    }}>
                                                        <FaCheck size={12} /> Accept Quote
                                                    </button>
                                                    <button onClick={() => handleRespond(rx._id, 'rejected')} style={{
                                                        flex: 1, padding: '10px 16px', backgroundColor: '#dc2626', color: 'white',
                                                        border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                                    }}>
                                                        <FaTimes size={12} /> Reject Quote
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubmitPrescription;
