import { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { exportToCSV } from '../../utils/formatters';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const DataTable = ({
    columns,
    data,
    loading = false,
    emptyTitle = 'No data found',
    emptyDescription = 'There are no records to display.',
    emptyIcon,
    onRowClick,
    onRowContextMenu,
    sortable = true,
    paginated = true,
    pageSize: defaultPageSize = 15,
    exportFilename,
    renderActions,
    stickyHeader = true,
    compact = false,
}) => {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Sorting
    const handleSort = (key) => {
        if (!sortable) return;
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setPage(1);
    };

    const sortedData = useMemo(() => {
        if (!sortKey || !data) return data || [];
        return [...data].sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];
            if (aVal === null || aVal === undefined) aVal = '';
            if (bVal === null || bVal === undefined) bVal = '';
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const strA = String(aVal).toLowerCase();
            const strB = String(bVal).toLowerCase();
            if (sortDir === 'asc') return strA.localeCompare(strB);
            return strB.localeCompare(strA);
        });
    }, [data, sortKey, sortDir]);

    // Pagination
    const totalItems = sortedData.length;
    const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
    const displayData = paginated
        ? sortedData.slice((page - 1) * pageSize, page * pageSize)
        : sortedData;

    const handleExport = () => {
        if (!exportFilename || !data?.length) return;
        const csvCols = columns.filter(c => !c.noExport).map(c => ({
            key: c.key,
            label: c.label
        }));
        exportToCSV(data, csvCols, exportFilename);
    };

    // Page number buttons
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    if (loading) {
        return <LoadingSkeleton type="table" columns={columns.length} rows={pageSize > 10 ? 10 : pageSize} />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Toolbar */}
            {(exportFilename || renderActions) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {renderActions && renderActions()}
                    </div>
                    <div className="flex items-center gap-2">
                        {exportFilename && data?.length > 0 && (
                            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border-none cursor-pointer transition-all leading-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-indigo-600 border-[1.5px] border-slate-200 hover:bg-indigo-50 hover:border-indigo-600 disabled:hover:bg-transparent px-3 py-1.5 text-xs" onClick={handleExport}>
                                <FaDownload size={11} /> Export CSV
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`${sortable && col.sortable !== false ? 'sortable' : ''} ${sortKey === col.key ? 'sorted' : ''}`}
                                    onClick={() => sortable && col.sortable !== false && handleSort(col.key)}
                                    style={{
                                        width: col.width || 'auto',
                                        minWidth: col.minWidth || 'auto',
                                        textAlign: col.align || 'left',
                                        ...(compact && { padding: '8px 12px' })
                                    }}
                                >
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        {col.label}
                                        {sortable && col.sortable !== false && (
                                            <span className="sort-icon">
                                                {sortKey === col.key
                                                    ? (sortDir === 'asc' ? <FaSortUp size={10} /> : <FaSortDown size={10} />)
                                                    : <FaSort size={10} />
                                                }
                                            </span>
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ padding: 0 }}>
                                    <EmptyState
                                        icon={emptyIcon}
                                        title={emptyTitle}
                                        description={emptyDescription}
                                    />
                                </td>
                            </tr>
                        ) : (
                            displayData.map((row, rowIdx) => (
                                <tr
                                    key={row.id || row._id || rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    onContextMenu={(e) => onRowContextMenu && onRowContextMenu(e, row)}
                                    style={{
                                        cursor: onRowClick ? 'pointer' : 'default',
                                        ...(compact && { fontSize: 'var(--font-size-sm)' })
                                    }}
                                >
                                    {columns.map(col => (
                                        <td
                                            key={col.key}
                                            className={col.className || ''}
                                            style={{
                                                textAlign: col.align || 'left',
                                                ...(compact && { padding: '8px 12px' })
                                            }}
                                        >
                                            {col.render ? col.render(row[col.key], row, rowIdx) : (row[col.key] ?? '—')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {paginated && totalItems > 0 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl text-sm text-slate-500">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span>
                            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-md outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/15"
                            style={{ width: 'auto', padding: '4px 8px', fontSize: 'var(--font-size-sm)' }}
                        >
                            {[10, 15, 25, 50, 100].map(n => (
                                <option key={n} value={n}>{n} / page</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className="flex items-center justify-center min-w-[32px] px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-500 text-sm cursor-pointer transition-all hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <FaChevronLeft size={10} />
                        </button>
                        {getPageNumbers().map(p => (
                            <button
                                key={p}
                                className={`flex items-center justify-center min-w-[32px] px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-500 text-sm cursor-pointer transition-all hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed ${p === page ? 'active' : ''}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            className="flex items-center justify-center min-w-[32px] px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-500 text-sm cursor-pointer transition-all hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <FaChevronRight size={10} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
