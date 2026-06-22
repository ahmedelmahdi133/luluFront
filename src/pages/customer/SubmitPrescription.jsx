import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { FaFileMedical, FaPaperPlane, FaImage, FaClock, FaCheck, FaTimes, FaQuoteRight, FaSpinner } from 'react-icons/fa';
import { sanitizeInput, validateUrl } from '../../utils/security';

const SubmitPrescription = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

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
        const safeImageUrl = sanitizeInput(imageUrl);
        const safeNotes = sanitizeInput(notes);

        if (!safeImageUrl) return toast.error('Please provide a prescription image URL');
        if (!validateUrl(safeImageUrl)) return toast.error('Please provide a valid image URL');

        setSubmitting(true);
        try {
            await api.post('/prescriptions', { imageUrl: safeImageUrl, notes: safeNotes });
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
            pending: { classes: 'bg-amber-100 text-amber-800', label: 'Pending Review', icon: FaClock },
            reviewed: { classes: 'bg-teal-100 text-teal-800', label: 'Reviewed', icon: FaCheck },
            quoted: { classes: 'bg-teal-100 text-teal-800', label: 'Quote Ready', icon: FaQuoteRight },
            preparing: { classes: 'bg-amber-100 text-amber-800', label: 'Preparing', icon: FaSpinner },
            ready: { classes: 'bg-green-100 text-green-800', label: 'Ready for Pickup', icon: FaCheck },
            completed: { classes: 'bg-green-100 text-green-800', label: 'Completed', icon: FaCheck },
            rejected: { classes: 'bg-red-100 text-red-800', label: 'Rejected', icon: FaTimes }
        };
        const s = map[status] || map.pending;
        const Icon = s.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.classes}`}>
                <Icon size={10} /> {s.label}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-5">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 m-0 flex items-center gap-2.5">
                    <FaFileMedical className="text-teal-600" /> My Prescriptions
                </h2>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className={`px-5 py-2.5 text-white border-none rounded-xl cursor-pointer text-sm font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md ${showForm ? 'bg-slate-500 hover:bg-slate-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                    {showForm ? 'Cancel' : <><FaPaperPlane size={12} /> Submit Prescription</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mt-0 mb-3 border-b border-slate-100 pb-3">
                        Submit a New Prescription
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Upload your prescription image to a hosting service (e.g. Imgur, Cloudinary) and paste the URL below. Our pharmacists will review it and send you a quote.
                    </p>

                    <div className="mb-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                            <FaImage size={14} className="text-slate-400" /> Prescription Image URL *
                        </label>
                        <input
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            placeholder="https://example.com/prescription-image.jpg"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border"
                            required
                        />
                    </div>

                    {imageUrl && (
                        <div className="mb-5 rounded-xl overflow-hidden border border-slate-200 max-h-[200px] flex justify-center bg-slate-50 relative p-2">
                            <img 
                                src={imageUrl} 
                                alt="Preview" 
                                className="max-h-[180px] object-contain rounded-lg"
                                onError={e => { e.currentTarget.style.display = 'none'; }} 
                            />
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any additional notes for the pharmacist..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-y font-sans box-border"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className={`px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white border-none rounded-xl cursor-pointer text-base font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <FaPaperPlane size={14} /> {submitting ? 'Submitting...' : 'Submit Prescription'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <FaFileMedical size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold text-lg m-0 mb-1">No prescriptions submitted yet</p>
                    <p className="text-slate-400 text-sm m-0">Click "Submit Prescription" to get started</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {prescriptions.map(rx => (
                        <div 
                            key={rx.id} 
                            className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${rx.status === 'quoted' ? 'border-2 border-teal-500' : 'border border-slate-100'}`}
                        >
                            <div className="flex gap-5 p-5 flex-col sm:flex-row">
                                <div className="w-full sm:w-[120px] h-[160px] sm:h-[120px] rounded-xl overflow-hidden bg-slate-50 shrink-0 flex justify-center items-center">
                                    <img 
                                        src={rx.imageUrl} 
                                        alt="Prescription" 
                                        className="w-full h-full object-cover" 
                                        onError={e => { e.currentTarget.style.display = 'none'; }} 
                                    />
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                                        <div>
                                            <div className="font-bold text-slate-800 text-base mb-1">
                                                {rx.prescriptionNumber}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-400">
                                                {new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {getStatusBadge(rx.status)}
                                    </div>

                                    {rx.notes && (
                                        <p className="text-[13px] text-slate-600 my-2 leading-relaxed">
                                            <strong className="text-slate-700">Your notes:</strong> {rx.notes}
                                        </p>
                                    )}

                                    {rx.pharmacistNotes && (
                                        <p className="text-[13px] text-teal-800 my-3 leading-relaxed bg-teal-50 p-3 rounded-xl border border-teal-100">
                                            <strong className="text-teal-900">Pharmacist notes:</strong> {rx.pharmacistNotes}
                                        </p>
                                    )}

                                    {rx.rejectionReason && (
                                        <p className="text-[13px] text-red-800 my-3 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100">
                                            <strong className="text-red-900">Reason:</strong> {rx.rejectionReason}
                                        </p>
                                    )}

                                    {rx.status === 'quoted' && rx.quotedPrice && (
                                        <div className="mt-4 p-5 bg-sky-50 rounded-xl border border-sky-200 shadow-inner">
                                            <div className="text-sm text-sky-800 mb-3 font-bold flex items-center gap-2">
                                                <FaQuoteRight className="text-sky-400" /> Quote Details:
                                            </div>
                                            
                                            {rx.items?.length > 0 && (
                                                <div className="mb-4 space-y-1">
                                                    {rx.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-[13px] text-slate-600 font-medium">
                                                            <span>{item.productName} <span className="text-slate-400 text-xs mx-1">x</span>{item.quantity}</span>
                                                            <span className="font-bold text-slate-700">{item.price?.toFixed(2)} EGP</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between font-black text-lg text-sky-900 border-t-2 border-sky-200/50 pt-3">
                                                <span>Total</span>
                                                <span>{rx.quotedPrice?.toFixed(2)} <span className="text-sm font-bold text-sky-700">EGP</span></span>
                                            </div>

                                            {!rx.customerResponse && (
                                                <div className="flex gap-3 mt-5">
                                                    <button 
                                                        onClick={() => handleRespond(rx.id, 'accepted')} 
                                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded-xl cursor-pointer text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                                                    >
                                                        <FaCheck size={14} /> Accept Quote
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRespond(rx.id, 'rejected')} 
                                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white border-none rounded-xl cursor-pointer text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                                                    >
                                                        <FaTimes size={14} /> Reject Quote
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
