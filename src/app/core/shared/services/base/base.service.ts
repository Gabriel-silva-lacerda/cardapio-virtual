import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {
  protected supabaseService = inject(SupabaseService);
  protected table!: string;
  public toastr = inject(ToastrService);

  constructor(protected tableName: string) {
    this.table = tableName;
  }

  async getAll<T>(selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase.from(this.table).select(selectFields);
    if (error) {
      this.toastr.error(`Erro ao buscar registros da tabela ${this.table}:`, error.message);
      throw new Error(error.message);
    }
    return data as T[];
  }

  // Método para obter um único registro pelo ID
  async getById<T>(id: number | string, selectFields: string = '*'): Promise<T | null> {
    const { data, error } = await this.supabaseService.supabase.from(this.table).select(selectFields).eq('id', id).single();
    if (error) {
      this.toastr.error(`Erro ao buscar item na tabela ${this.table} com ID ${id}:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  async getByField<T>(field: string, value: string | number, selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .select(selectFields)
      .eq(field, value); // Filtra pela chave e valor fornecidos

    if (error) {
      this.toastr.error(`Erro ao buscar registros na tabela ${this.table} com ${field} = ${value}:`, error.message);
      throw new Error(error.message);
    }

    return data as T[];
  }

  // Método para inserir um novo registro
  async insert<T>(item: Partial<T>): Promise<T> {
    const { data, error } = await this.supabaseService.supabase.from(this.table).insert([item]).single();
    if (error) {
      this.toastr.error(`Erro ao inserir na tabela ${this.table}:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  // Método para atualizar um registro pelo ID
  async update<T>(id: number | string, updates: Partial<T>): Promise<T> {
    const { data, error } = await this.supabaseService.supabase.from(this.table).update(updates).eq('id', id).single();
    if (error) {
      this.toastr.error(`Erro ao atualizar o item ${id} na tabela ${this.table}:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  // Método para deletar um registro pelo ID
  async delete(id: number | string): Promise<void> {
    const { error } = await this.supabaseService.supabase.from(this.table).delete().eq('id', id);
    if (error) {
      this.toastr.error(`Erro ao excluir o item ${id} na tabela ${this.table}:`, error.message);
      throw new Error(error.message);
    }
  }
}
