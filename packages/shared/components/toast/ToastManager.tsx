'use client';

import React from 'react';
import { toast, ToastOptions } from 'react-toastify';
import dynamic from 'next/dynamic';

const ToastContainer = dynamic(() => import('react-toastify').then((mod) => mod.ToastContainer), {
  ssr: false,
});

export interface ToastManagerProps extends ToastOptions {
  position?: ToastOptions['position'];
  autoClose?: ToastOptions['autoClose'];
  hideProgressBar?: ToastOptions['hideProgressBar'];
  closeOnClick?: ToastOptions['closeOnClick'];
  pauseOnHover?: ToastOptions['pauseOnHover'];
  draggable?: ToastOptions['draggable'];
  theme?: ToastOptions['theme'];
}

export const ToastManager: React.FC<ToastManagerProps> = ({
  position = 'top-right',
  autoClose = 5000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = true,
  draggable = true,
  theme = 'light',
}) => {
  return (
    <ToastContainer
      position={position}
      autoClose={autoClose}
      hideProgressBar={hideProgressBar}
      closeOnClick={closeOnClick}
      pauseOnHover={pauseOnHover}
      draggable={draggable}
      theme={theme}
    />
  );
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => toast.success(message, options),
  error: (message: string, options?: ToastOptions) => toast.error(message, options),
  info: (message: string, options?: ToastOptions) => toast.info(message, options),
  warn: (message: string, options?: ToastOptions) => toast.warn(message, options),
};
