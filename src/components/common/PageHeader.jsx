import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions, children, id }) => {
    const headerId = id || `page-header-${title?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;

    return (
        <div className="page-header" id={headerId}>
            <div className="page-header-info">
                {breadcrumbs.length > 0 && (
                    <nav className="breadcrumbs" aria-label="Breadcrumb" id={`${headerId}-breadcrumbs`}>
                        <Link to="/dashboard">Home</Link>
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FaChevronRight className="separator" size={9} />
                                {crumb.to ? (
                                    <Link to={crumb.to}>{crumb.label}</Link>
                                ) : (
                                    <span className="current">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
                {children}
            </div>
            {actions && <div className="page-header-actions">{actions}</div>}
        </div>
    );
};

export default PageHeader;
