import React, { ErrorInfo, ReactNode } from 'react';
import { showToast } from '@shared/components/toast/ToastManager';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логирование ошибки
    console.error('Uncaught error:', error, errorInfo);
    showToast.error('Произошла ошибка. Пожалуйста, перезагрузите страницу.');
  }

  render() {
    if (this.state.hasError) {
      // Можно отобразить запасной UI
      return <h1>Что-то пошло не так.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
