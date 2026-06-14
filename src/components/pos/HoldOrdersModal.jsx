import { FaTimes, FaPlay, FaTrash } from 'react-icons/fa';
import { COLORS } from '../../utils/constants';

const HoldOrdersModal = ({ isOpen, heldOrders, onRecall, onDelete, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white', borderRadius: 16, width: 500, maxHeight: '80vh',
                overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    padding: '18px 24px', backgroundColor: '#7c3aed', color: 'white',
                    borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>Held Orders ({heldOrders.length})</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <FaTimes size={18} />
                    </button>
                </div>

                <div style={{ padding: 20 }}>
                    {heldOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                            <p style={{ fontSize: 16 }}>No held orders</p>
                        </div>
                    ) : (
                        heldOrders.map((held, index) => (
                            <div key={index} style={{
                                padding: 16, border: '1px solid #e2e8f0', borderRadius: 12,
                                marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                                        Order #{index + 1} - {held.items.length} items
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b' }}>
                                        {held.items.map(i => i.name).join(', ').substring(0, 60)}...
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, marginTop: 4 }}>
                                        {held.total.toFixed(2)} AED
                                    </div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                        {new Date(held.timestamp).toLocaleTimeString('en-US')}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => onRecall(index)} style={{
                                        padding: '8px 14px', backgroundColor: '#16a34a', color: 'white',
                                        border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13
                                    }}>
                                        <FaPlay size={10} /> Recall
                                    </button>
                                    <button onClick={() => onDelete(index)} style={{
                                        padding: '8px 10px', backgroundColor: '#fee2e2', color: '#dc2626',
                                        border: 'none', borderRadius: 8, cursor: 'pointer'
                                    }}>
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HoldOrdersModal;
