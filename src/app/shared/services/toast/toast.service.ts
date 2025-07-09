import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
  visible: boolean;
  timeoutId?: any;
  paused?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messagesSignal = signal<ToastMessage[]>([]);
  public messages = this.messagesSignal.asReadonly();

  show(message: string, type: ToastMessage['type'], duration = 3000) {
    const id = crypto.randomUUID();

    const toast: ToastMessage = {
      id,
      message,
      type,
      duration,
      visible: true,
    };

    this.messagesSignal.update((prev) => [...prev, toast]);

    const timeoutId = setTimeout(() => this.hide(id), duration);
    this.setTimeoutId(id, timeoutId);
  }

  success(msg: string, duration = 3000) {
    this.show(msg, 'success', duration);
  }

  error(msg: string, duration = 3000) {
    this.show(msg, 'error', duration);
  }

  warning(msg: string, duration = 3000) {
    this.show(msg, 'warning', duration);
  }

  private hide(id: string) {
    this.messagesSignal.update((list) =>
      list.map((m) => (m.id === id ? { ...m, visible: false } : m))
    );

    setTimeout(() => this.dismiss(id), 400);
  }

  dismiss(id: string) {
    this.clearTimeout(id);
    this.messagesSignal.update((list) => list.filter((m) => m.id !== id));
  }

  pause(id: string) {
    const toast = this.messagesSignal().find((m) => m.id === id);
    if (toast?.timeoutId) {
      clearTimeout(toast.timeoutId);
      this.messagesSignal.update((list) =>
        list.map((m) => m.id === id ? { ...m, timeoutId: undefined, paused: true } : m)
      );
    }
  }

  resume(id: string) {
    const toast = this.messagesSignal().find((m) => m.id === id);
    if (toast && toast.paused && toast.duration) {
      const timeoutId = setTimeout(() => this.hide(id), toast.duration);
      this.messagesSignal.update((list) =>
        list.map((m) => m.id === id ? { ...m, timeoutId, paused: false } : m)
      );
    }
  }

  private setTimeoutId(id: string, timeoutId: any) {
    this.messagesSignal.update((list) =>
      list.map((m) => (m.id === id ? { ...m, timeoutId } : m))
    );
  }

  private clearTimeout(id: string) {
    const toast = this.messagesSignal().find((m) => m.id === id);
    if (toast?.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
  }
}
