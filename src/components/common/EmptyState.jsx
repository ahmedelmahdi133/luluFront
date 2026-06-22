import { FaInbox } from 'react-icons/fa';

const EmptyState = ({ icon: Icon = FaInbox, title = 'No data', description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center text-slate-400 p-12">
            <div className="text-slate-200 mb-3 opacity-50">
                <Icon size={48} />
            </div>
            <div className="text-base font-semibold text-slate-600 mb-1">{title}</div>
            {description && <div className="text-sm max-w-[250px]">{description}</div>}
            {action && <div style={{ marginTop: 'var(--space-5)' }}>{action}</div>}
        </div>
    );
};

export default EmptyState;
