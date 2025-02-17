'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
const ToastContainer = dynamic(() => import('react-toastify').then((mod) => mod.ToastContainer), {
    ssr: false,
});
export const ToastManager = ({ position = 'top-right', autoClose = 5000, hideProgressBar = false, closeOnClick = true, pauseOnHover = true, draggable = true, theme = 'light', }) => {
    return (_jsx(ToastContainer, { position: position, autoClose: autoClose, hideProgressBar: hideProgressBar, closeOnClick: closeOnClick, pauseOnHover: pauseOnHover, draggable: draggable, theme: theme }));
};
export const showToast = {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    info: (message, options) => toast.info(message, options),
    warn: (message, options) => toast.warn(message, options),
};
