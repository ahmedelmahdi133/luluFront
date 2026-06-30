const LoadingSkeleton = ({ type = 'table', rows = 5, columns = 5, cards = 4 }) => {
    if (type === 'cards') {
        return (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                {Array.from({ length: cards }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 transition-all relative overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--stat-accent-color,#4f46e5)] before:opacity-80" style={{ opacity: 1 }}>
                        <div className="flex items-center gap-4">
                            <div className="skeleton skeleton-circle" style={{ width: 48, height: 48, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                                <div className="skeleton skeleton-text" style={{ width: '40%', height: 22 }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'dashboard') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Page header skeleton */}
                <div>
                    <div className="skeleton skeleton-text" style={{ width: '15%', height: 10, marginBottom: 8 }} />
                    <div className="skeleton skeleton-text" style={{ width: '20%', height: 24, marginBottom: 4 }} />
                    <div className="skeleton skeleton-text" style={{ width: '30%', height: 12 }} />
                </div>
                {/* Stat Cards */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 transition-all relative overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--stat-accent-color,#4f46e5)] before:opacity-80" style={{ opacity: 1 }}>
                            <div className="flex items-center gap-4">
                                <div className="skeleton skeleton-circle" style={{ width: 48, height: 48, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                                    <div className="skeleton skeleton-text" style={{ width: '45%', height: 24 }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Quick actions skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-lg)' }} />
                    ))}
                </div>
                {/* Chart area */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
                    <div className="skeleton skeleton-card" style={{ height: 340 }} />
                    <div className="skeleton skeleton-card" style={{ height: 340 }} />
                </div>
            </div>
        );
    }

    if (type === 'form') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md p-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="skeleton skeleton-text" style={{ width: '30%', height: 20 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            <div className="skeleton skeleton-text" style={{ width: '40%', height: 12, marginBottom: 6 }} />
                            <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'page') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Header */}
                <div>
                    <div className="skeleton skeleton-text" style={{ width: '15%', height: 10, marginBottom: 8 }} />
                    <div className="skeleton skeleton-text" style={{ width: '25%', height: 24, marginBottom: 4 }} />
                    <div className="skeleton skeleton-text" style={{ width: '35%', height: 12 }} />
                </div>
                {/* Filter bar */}
                <div className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-xl)' }} />
                {/* Table */}
                <LoadingSkeleton type="table" columns={columns} rows={rows} />
            </div>
        );
    }

    if (type === 'detail') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <div className="skeleton skeleton-text" style={{ width: '30%', height: 12, marginBottom: 6 }} />
                            <div className="skeleton skeleton-text" style={{ width: '60%', height: 16 }} />
                        </div>
                    ))}
                </div>
                <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
            </div>
        );
    }

    // Default: table skeleton
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}>
                                <div className="skeleton skeleton-text" style={{ width: `${60 + Math.random() * 40}%`, height: 12 }} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <tr key={rowIdx}>
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <td key={colIdx}>
                                    <div className="skeleton skeleton-text" style={{ width: `${50 + Math.random() * 50}%` }} />
                                    {colIdx === 0 && <div className="skeleton skeleton-text skeleton-text-sm" style={{ width: '40%', marginTop: 4 }} />}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LoadingSkeleton;
