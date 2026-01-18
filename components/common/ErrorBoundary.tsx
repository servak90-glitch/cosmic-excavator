import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch React render errors
 * and display a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReload = (): void => {
        window.location.reload();
    };

    private handleReset = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[9999]">
                    <div className="max-w-lg w-full bg-zinc-950 border-2 border-red-600 p-6 shadow-[0_0_50px_rgba(255,0,0,0.3)]">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">⚠️</span>
                            <h1 className="text-red-500 font-black pixel-text text-xl">КРИТИЧЕСКАЯ ОШИБКА</h1>
                        </div>

                        <p className="text-zinc-300 text-sm mb-4 font-mono">
                            Произошла непредвиденная ошибка в игре. Ваш прогресс сохранён автоматически.
                        </p>

                        {this.state.error && (
                            <div className="bg-black border border-zinc-800 p-3 mb-4 max-h-32 overflow-auto">
                                <code className="text-red-400 text-xs font-mono break-all">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-black font-black pixel-text text-sm transition-colors"
                            >
                                ПЕРЕЗАГРУЗИТЬ
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold pixel-text text-sm border border-zinc-600 transition-colors"
                            >
                                ПОПРОБОВАТЬ СНОВА
                            </button>
                        </div>

                        <p className="text-zinc-500 text-[10px] mt-4 text-center font-mono">
                            Если ошибка повторяется, попробуйте очистить кэш браузера.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
