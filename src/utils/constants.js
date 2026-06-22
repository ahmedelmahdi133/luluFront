export const PHARMACY_NAME = 'Lulu Pharma';
export const PHARMACY_ADDRESS = '';
export const PHARMACY_PHONE = '';
export const APP_VERSION = '1.0.0';

export const COLORS = {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    primaryLighter: '#eff6ff',
    primaryDark: '#1e40af',

    secondary: '#64748b',
    secondaryHover: '#475569',

    success: '#059669',
    successLight: '#d1fae5',
    successDark: '#065f46',

    warning: '#d97706',
    warningLight: '#fef3c7',
    warningDark: '#92400e',

    danger: '#dc2626',
    dangerLight: '#fee2e2',
    dangerDark: '#991b1b',

    info: '#0891b2',
    infoLight: '#cffafe',
    infoDark: '#155e75',

    dark: '#0f172a',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    white: '#ffffff',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    bgBody: '#f1f5f9',
    bgCard: '#ffffff',
    bgMuted: '#f8fafc',

    sidebar: '#0f172a',
    sidebarHover: '#1e293b',
    sidebarActive: 'rgba(37, 99, 235, 0.15)',
    sidebarText: '#94a3b8',
    sidebarTextActive: '#ffffff',
    sidebarAccent: '#2563eb',
    bgMain: '#f1f5f9',

    customerPrimary: '#0d9488',
    customerPrimaryDark: '#0f766e',
};

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 72;
export const HEADER_HEIGHT = 64;

export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card (Visa/Mastercard)' },
    { value: 'split', label: 'Split Payment' }
];

export const EXPENSE_CATEGORIES = [
    { value: 'rent', label: 'Rent' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' },
    { value: 'salaries', label: 'Salaries' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'other', label: 'Other' }
];

export const RETURN_REASONS = [
    { value: 'damaged', label: 'Damaged' },
    { value: 'wrong_item', label: 'Wrong Item' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'expired', label: 'Expired' },
    { value: 'defective', label: 'Defective' },
    { value: 'overstock', label: 'Overstock' },
    { value: 'other', label: 'Other' }
];

export const MENU_GROUPS = [
    {
        label: 'Main',
        items: [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/pos', label: 'POS / Cashier' },
        ]
    },
    {
        label: 'Inventory',
        items: [
            { path: '/products', label: 'Products' },
            { path: '/purchases', label: 'Purchases' },
        ]
    },
    {
        label: 'Sales',
        items: [
            { path: '/orders', label: 'Sales History' },
            { path: '/returns', label: 'Returns' },
            { path: '/prescriptions-manage', label: 'Prescriptions' },
        ]
    },
    {
        label: 'Finance',
        items: [
            { path: '/shifts', label: 'Shifts' },
            { path: '/reports', label: 'Reports' },
            { path: '/expenses', label: 'Expenses' },
        ]
    },
    {
        label: 'Human Resources',
        items: [
            { path: '/attendance', label: 'Attendance' },
            { path: '/payroll', label: 'Payroll' },
        ]
    },
    {
        label: 'System',
        items: [
            { path: '/settings', label: 'Settings' },
        ]
    }
];
