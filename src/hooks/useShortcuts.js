import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useShortcuts = (searchRef) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore shortcuts if the user is typing in an input/textarea (unless it's the global search shortcut)
            const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
            
            // Search shortcut (Ctrl+K or Cmd+K)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchRef?.current) {
                    searchRef.current.focus();
                }
                return;
            }

            // Esc to blur or close
            if (e.key === 'Escape') {
                if (isInputActive) {
                    document.activeElement.blur();
                }
                return;
            }

            // If we are typing, don't trigger F keys or other single-key shortcuts
            if (isInputActive) return;

            // F1: Dashboard
            if (e.key === 'F1') {
                e.preventDefault();
                navigate('/dashboard');
            }
            // F2: POS
            if (e.key === 'F2') {
                e.preventDefault();
                navigate('/pos');
            }
            // F3: Products
            if (e.key === 'F3') {
                e.preventDefault();
                navigate('/products');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, searchRef]);
};
