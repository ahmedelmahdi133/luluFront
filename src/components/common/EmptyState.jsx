import { FaInbox } from 'react-icons/fa';

const EmptyState = ({ icon: Icon = FaInbox, title = 'No data', description, action }) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon size={48} />
            </div>
            <div className="empty-state-title">{title}</div>
            {description && <div className="empty-state-desc">{description}</div>}
            {action && <div style={{ marginTop: 'var(--space-5)' }}>{action}</div>}
        </div>
    );
};

export default EmptyState;
