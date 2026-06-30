import { Component } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--color-bg-body)',
                        padding: 'var(--space-8)',
                        fontFamily: 'var(--font-family)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 480,
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 'var(--radius-xl)',
                                background: 'var(--color-danger-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto var(--space-6)',
                            }}
                        >
                            <FaExclamationTriangle size={32} color="var(--color-danger)" />
                        </div>
                        <h1
                            style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-text-primary)',
                                marginBottom: 'var(--space-3)',
                            }}
                        >
                            Something went wrong
                        </h1>
                        <p
                            style={{
                                fontSize: 'var(--font-size-md)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--space-6)',
                                lineHeight: 'var(--line-height-relaxed)',
                            }}
                        >
                            An unexpected error occurred. Please try again or return to the dashboard.
                        </p>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
                            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border-none cursor-pointer transition-all leading-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] disabled:hover:bg-indigo-600" onClick={this.handleReset}>
                                Try Again
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border-none cursor-pointer transition-all leading-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-indigo-600 border-[1.5px] border-slate-200 hover:bg-indigo-50 hover:border-indigo-600 disabled:hover:bg-transparent" onClick={this.handleGoHome}>
                                Go to Dashboard
                            </button>
                        </div>

                        {this.state.error && (
                            <details
                                style={{
                                    textAlign: 'left',
                                    background: 'var(--color-bg-muted)',
                                    padding: 'var(--space-4)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    cursor: 'pointer',
                                }}
                            >
                                <summary
                                    style={{
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: 'var(--space-2)',
                                    }}
                                >
                                    Error Details
                                </summary>
                                <pre
                                    style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-danger)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        maxHeight: 200,
                                        overflow: 'auto',
                                        marginTop: 'var(--space-2)',
                                    }}
                                >
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
