import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseSupabaseService {
  protected supabaseService = inject(SupabaseService);
  protected table!: string;
  public toastr = inject(ToastrService);
  
  async getAll<T>(table: string, selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase.from(table).select(selectFields);
    if (error) {
      this.toastr.error(`Erro ao buscar registros da tabela ${table}:`, error.message);
      throw new Error(error.message);
    }
    return data as T[];
  }

  // Método para obter um único registro pelo ID
  async getById<T>(table: string, id: number | string, selectFields: string = '*'): Promise<T | null> {
    const { data, error } = await this.supabaseService.supabase.from(table).select(selectFields).eq('id', id).single();
    if (error) {
      this.toastr.error(`Erro ao buscar item na tabela ${table} com ID ${id}:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  async getByField<T>(table: string, field: string, value: string | number, selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields)
      .eq(field, value); // Filtra pela chave e valor fornecidos

    if (error) {
      this.toastr.error(`Erro ao buscar registros na tabela ${table} com ${field} = ${value}:`, error.message);
      throw new Error(error.message);
    }

    return data as T[];
  }

  // Método para inserir um novo registro
  async insert<T>(table: string, item: Partial<T>): Promise<T> {
    const { data, error } = await this.supabaseService.supabase.from(this.table).insert([item]).single();
    if (error) {
      this.toastr.error(`Erro ao inserir na tabela ${table}:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  // Método para atualizar um registro pelo ID
  async update<T>(table: string, id: number | string, updates: Partial<T>): Promise<T> {
    const { data, error } = await this.supabaseService.supabase.from(table).update(updates).eq('id', id).single();
    if (error) {
      this.toastr.error(`Erro ao atualizar o item ${id} na tabela ${table}:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  // Método para deletar um registro pelo ID
  async delete(table: string, id: number | string): Promise<void> {
    const { error } = await this.supabaseService.supabase.from(table).delete().eq('id', id);
    if (error) {
      this.toastr.error(`Erro ao excluir o item ${id} na tabela ${table}:`, error.message);
      throw new Error(error.message);
    }
  }
}
