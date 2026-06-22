const StatCard = ({ label, value, icon: Icon, color = '#4f46e5', bgColor, trend, trendLabel, index = 0 }) => {
    return (
        <div
            className="group relative bg-white rounded-2xl p-6 transition-all duration-300 flex flex-col hover:-translate-y-1 animate-in"
            style={{
                animationDelay: `${index * 60}ms`,
                opacity: 0,
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05), 0 0 3px rgba(0,0,0,0.02)',
            }}
            id={`stat-${label?.toLowerCase().replace(/\s+/g, '-') || index}`}
        >
            {/* Subtle Gradient Glow Effect behind the card */}
            <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${color}40, transparent)` }}
            />
            
            <div className="flex items-center gap-5 relative z-10">
                {Icon && (
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 rtl:ml-4 rtl:mr-0"
                        style={{ 
                            background: bgColor || `linear-gradient(135deg, ${color}15, ${color}05)`,
                            color: color,
                            border: `1px solid ${color}20`
                        }}
                    >
                        <Icon size={24} />
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm text-slate-500 font-semibold mb-1 tracking-wide uppercase text-[11px]">{label}</div>
                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{value}</div>
                    {trend !== undefined && (
                        <div className={`text-xs font-bold mt-2 flex items-center gap-1.5 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            <span className={`flex items-center justify-center w-4 h-4 rounded-full ${trend >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {trend >= 0 ? '↑' : '↓'}
                            </span>
                            {Math.abs(trend)}%
                            {trendLabel && (
                                <span className="text-slate-400 font-medium ml-1">
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
