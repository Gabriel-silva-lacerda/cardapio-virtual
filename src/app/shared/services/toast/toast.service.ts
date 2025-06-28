import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
  visible: boolean;
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
      visible: true
    };

    this.messagesSignal.update((prev) => [...prev, toast]);

    setTimeout(() => this.hide(id), duration);
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
    // Marca como invisível (ativa a animação)
    this.messagesSignal.update((list) =>
      list.map((m) => (m.id === id ? { ...m, visible: false } : m))
    );

    // Aguarda o tempo da animação antes de remover
    setTimeout(() => this.dismiss(id), 400);
  }

  dismiss(id: string) {
    this.messagesSignal.update((list) => list.filter((m) => m.id !== id));
  }
}
