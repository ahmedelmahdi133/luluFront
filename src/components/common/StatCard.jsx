const StatCard = ({ label, value, icon: Icon, color = 'var(--color-primary)', bgColor, trend, trendLabel, index = 0 }) => {
    const bg = bgColor || `${color}12`;

    return (
        <div
            className="stat-card animate-in"
            style={{
                animationDelay: `${index * 60}ms`,
                opacity: 0,
                '--stat-accent-color': color,
            }}
            id={`stat-${label?.toLowerCase().replace(/\s+/g, '-') || index}`}
        >
            <div className="flex items-center gap-4">
                {Icon && (
                    <div
                        className="stat-card-icon"
                        style={{ background: bg }}
                    >
                        <Icon size={20} color={color} />
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="stat-card-label">{label}</div>
                    <div className="stat-card-value">{value}</div>
                    {trend !== undefined && (
                        <div className={`stat-card-trend ${trend >= 0 ? 'up' : 'down'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            {trendLabel && (
                                <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-normal)' }}>
                                    {trendLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
