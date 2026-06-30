import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions, children, id }) => {
    const headerId = id || `page-header-${title?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" id={headerId}>
            <div className="flex flex-col">
                {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2" aria-label="Breadcrumb" id={`${headerId}-breadcrumbs`}>
                        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors no-underline">Home</Link>
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-2">
                                <FaChevronRight className="opacity-50" size={9} />
                                {crumb.to ? (
                                    <Link to={crumb.to} className="hover:text-indigo-600 transition-colors no-underline">{crumb.label}</Link>
                                ) : (
                                    <span className="text-slate-700 font-medium">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                <h1 className="text-2xl font-bold text-slate-900 m-0 leading-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 m-0 mt-1">{subtitle}</p>}
                {children}
            </div>
            {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
    );
};

export default PageHeader;
