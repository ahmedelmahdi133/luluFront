import React, { useState } from 'react';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';

const ReminderModal = ({ isOpen, onClose, onSubmit, product }) => {
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(date, notes);
        setDate('');
        setNotes('');
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9998]" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-[9999] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 m-0">
                        <FaCalendarAlt className="text-indigo-600" /> Set Reminder
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {product && (
                        <div className="mb-5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <p className="text-sm text-indigo-900 m-0">
                                Setting reminder for: <strong>{product.name}</strong>
                            </p>
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reminder Date</label>
                        <input 
                            type="date" 
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Check stock and re-order..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all border-none cursor-pointer"
                        >
                            Save Reminder
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ReminderModal;
