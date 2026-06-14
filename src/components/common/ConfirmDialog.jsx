import { FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) => {
    if (!isOpen) return null;

    const Icon = danger ? FaExclamationTriangle : FaInfoCircle;
    const iconColor = danger ? 'var(--color-danger)' : 'var(--color-primary)';
    const iconBg = danger ? 'var(--color-danger-light)' : 'var(--color-primary-light)';

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content modal-sm" onClick={e => e.stopPropagation()} style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-full)',
                            background: iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Icon size={20} color={iconColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--space-2)',
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            fontSize: 'var(--font-size-md)',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 'var(--line-height-relaxed)',
                            marginBottom: 'var(--space-6)',
                        }}>
                            {message}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={onCancel}>
                                {cancelText}
                            </button>
                            <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
