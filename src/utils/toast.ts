import type { ToastType } from '../components/ui/Toast';

let toastId = 0;
const listeners = new Set<(toasts: Array<{ id: string; message: string; type: ToastType }>) => void>();
const toasts: Array<{ id: string; message: string; type: ToastType }> = [];

export const toast = {
  subscribe: (listener: (toasts: Array<{ id: string; message: string; type: ToastType }>) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  show: (message: string, type: ToastType = 'info') => {
    const id = `toast-${toastId++}`;
    toasts.push({ id, message, type });
    listeners.forEach((listener) => listener([...toasts]));
  },

  remove: (id: string) => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach((listener) => listener([...toasts]));
    }
  },

  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  info: (message: string) => toast.show(message, 'info'),
};

