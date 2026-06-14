export const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' AED';
};

export const formatNumber = (num) => {
    return (Number(num) || 0).toLocaleString('en-US');
};

export const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getStatusLabel = (status) => {
    const labels = {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        open: 'Open',
        closed: 'Closed',
        paid: 'Paid',
        partial: 'Partial',
        unpaid: 'Unpaid',
        reviewed: 'Reviewed',
        quoted: 'Quoted',
        preparing: 'Preparing',
        ready: 'Ready',
        rejected: 'Rejected',
    };
    return labels[status] || status;
};

export const getStatusColor = (status) => {
    const colors = {
        pending: { bg: 'var(--color-warning-light)', text: 'var(--color-warning-dark)', cls: 'badge-warning' },
        processing: { bg: 'var(--color-info-light)', text: 'var(--color-info-dark)', cls: 'badge-info' },
        completed: { bg: 'var(--color-success-light)', text: 'var(--color-success-dark)', cls: 'badge-success' },
        delivered: { bg: 'var(--color-success-light)', text: 'var(--color-success-dark)', cls: 'badge-success' },
        cancelled: { bg: 'var(--color-danger-light)', text: 'var(--color-danger-dark)', cls: 'badge-danger' },
        open: { bg: 'var(--color-success-light)', text: 'var(--color-success-dark)', cls: 'badge-success' },
        closed: { bg: 'var(--color-bg-active, #e2e3e5)', text: 'var(--color-text-secondary)', cls: 'badge-neutral' },
        paid: { bg: 'var(--color-success-light)', text: 'var(--color-success-dark)', cls: 'badge-success' },
        partial: { bg: 'var(--color-warning-light)', text: 'var(--color-warning-dark)', cls: 'badge-warning' },
        unpaid: { bg: 'var(--color-danger-light)', text: 'var(--color-danger-dark)', cls: 'badge-danger' },
        reviewed: { bg: 'var(--color-info-light)', text: 'var(--color-info-dark)', cls: 'badge-info' },
        quoted: { bg: 'var(--color-primary-light)', text: 'var(--color-primary-dark)', cls: 'badge-primary' },
        preparing: { bg: 'var(--color-warning-light)', text: 'var(--color-warning-dark)', cls: 'badge-warning' },
        ready: { bg: 'var(--color-success-light)', text: 'var(--color-success-dark)', cls: 'badge-success' },
        rejected: { bg: 'var(--color-danger-light)', text: 'var(--color-danger-dark)', cls: 'badge-danger' },
    };
    return colors[status] || { bg: 'var(--color-bg-active, #e2e3e5)', text: 'var(--color-text-secondary)', cls: 'badge-neutral' };
};

export const getExpenseCategoryLabel = (cat) => {
    const labels = {
        rent: 'Rent', electricity: 'Electricity', water: 'Water',
        salaries: 'Salaries', maintenance: 'Maintenance', supplies: 'Supplies', other: 'Other'
    };
    return labels[cat] || cat;
};

export const getReturnReasonLabel = (reason) => {
    const labels = {
        damaged: 'Damaged', wrong_item: 'Wrong Item', customer_request: 'Customer Request',
        expired: 'Expired', defective: 'Defective', overstock: 'Overstock', other: 'Other'
    };
    return labels[reason] || reason;
};

export const getPaymentMethodLabel = (method) => {
    const labels = {
        cash: 'Cash', visa: 'Visa', card: 'Card', pending: 'Pending', split: 'Split'
    };
    return labels[method] || method;
};

/**
 * Export data array to CSV and trigger download.
 * @param {Array} data - Array of objects
 * @param {Array} columns - Array of { key, label } for column mapping
 * @param {string} filename - Download filename
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
    if (!data || data.length === 0) return;

    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
        columns.map(c => {
            let val = row[c.key];
            if (val === null || val === undefined) val = '';
            if (typeof val === 'string') val = val.replace(/"/g, '""');
            return `"${val}"`;
        }).join(',')
    );

    const csvContent = '\uFEFF' + [header, ...rows].join('\n'); // BOM for Excel Arabic support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
