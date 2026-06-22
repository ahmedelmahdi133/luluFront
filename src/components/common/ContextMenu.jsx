import { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, actions, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        // Delay attaching to prevent immediate close if triggered via click
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEsc);
        }, 10);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Adjust position if it goes off-screen
    const style = {
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
    };

    return (
        <div 
            ref={menuRef}
            className="bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden min-w-[180px] animate-in fade-in zoom-in-95 duration-150"
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="py-1">
                {actions.map((action, index) => {
                    const isDanger = action.danger;
                    const Icon = action.icon;
                    return (
                        <button
                            key={index}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-left ${
                                isDanger 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-indigo-600'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                                onClose();
                            }}
                        >
                            {Icon && <Icon size={14} className={isDanger ? "text-red-500" : "text-slate-400"} />}
                            {action.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ContextMenu;
