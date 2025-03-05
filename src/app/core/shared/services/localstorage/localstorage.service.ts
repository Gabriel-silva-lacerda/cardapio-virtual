import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private storageSignals = new Map<string, any>();

  constructor() {}

  // Método genérico para obter um Signal de um item armazenado no localStorage
  public getSignal<T>(key: string, defaultValue: T): () => T {
    if (!this.storageSignals.has(key)) {
      const storedValue = this.getItem<T>(key) ?? defaultValue;
      this.storageSignals.set(key, signal<T>(storedValue));
    }
    return this.storageSignals.get(key);
  }

  // Método genérico para obter um item do localStorage
  public getItem<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  // Método genérico para salvar um item no localStorage e atualizar o signal
  public setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));

    if (this.storageSignals.has(key)) {
      this.storageSignals.get(key).set(value);
    } else {
      this.storageSignals.set(key, signal<T>(value));
    }
  }

  // Método genérico para remover um item do localStorage e atualizar o signal
  public removeItem(key: string): void {
    localStorage.removeItem(key);
    if (this.storageSignals.has(key)) {
      this.storageSignals.get(key).set(null);
    }
  }

  // Método genérico para limpar todo o localStorage
  public clear(): void {
    localStorage.clear();
    this.storageSignals.forEach((sig) => sig.set(null));
  }
}
