import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { showToast } from '@shared/components/toast/ToastManager';
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(_) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        // Логирование ошибки
        console.error('Uncaught error:', error, errorInfo);
        showToast.error('Произошла ошибка. Пожалуйста, перезагрузите страницу.');
    }
    render() {
        if (this.state.hasError) {
            // Можно отобразить запасной UI
            return _jsx("h1", { children: "\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A." });
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
