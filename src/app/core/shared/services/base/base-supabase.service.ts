import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../loading/loading.service';
import { InsertOptions } from '@shared/interfaces/insert-options/insert-options';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseSupabaseService {
  public loadingService = inject(LoadingService);
  public toastr = inject(ToastrService);
  public supabaseService = inject(SupabaseService);

  async getAll<T>(table: string, selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase.from(table).select(selectFields);
    if (error) {
      this.toastr.error(`Erro ao buscar registros da tabela ${table}:`, error.message);
      throw new Error(error.message);
    }
    return data as T[];
  }

  // Método para obter um único registro pelo ID
  async getById<T>(table: string, id: number | string | null, selectFields: string = '*'): Promise<T | null> {
    const { data, error } = await this.supabaseService.supabase.from(table).select(selectFields).eq('id', id).single();
    if (error) {
      this.toastr.error(`Erro ao buscar item na tabela ${table} com ID ${id}:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  async getAllByField<T>(table: string, field: string, value: string | number | number[], selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase
    .from(table)
    .select(selectFields)
    .eq(field, value);

    if (error) {
      this.toastr.error(`Erro ao buscar registros na tabela ${table} com ${field} = ${value}:`, error.message);
      throw new Error(error.message);
    }

    return data as T[];
  }

  async getByField<T>(table: string, field: string, value: string | number, selectFields: string = '*'): Promise<T> {
    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields)
      .eq(field, value).single();

    if (error) {
      this.toastr.error(`Erro`, error.message);
      throw new Error(error.message);
    }

    return data as T;
  }

  async getAllByFieldIn<T>(table: string, field: string, values: number[] | string[], selectFields: string = '*'): Promise<T[]> {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields)
      .in(field, values);

    if (error) {
      this.toastr.error(`Erro ao buscar registros na tabela ${table} onde ${field} está em [${values.join(', ')}]:`, error.message);
      throw new Error(error.message);
    }

    return data as T[];
  }

  // Método para inserir um novo registro
  async insert<T>(table: string, item: Partial<T>, options: InsertOptions = {}): Promise<T> {
    const { wrapInArray = true } = options; // Valor padrão para wrapInArray é true

    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .insert(wrapInArray ? [item] : item) // Envolve o item em um array se wrapInArray for true
      .select()
      .single();

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
  async delete(table: string, id: number | string): Promise<null> {
    const { error } = await this.supabaseService.supabase.from(table).delete().eq('id', id);
    if (error) {
      this.toastr.error(`Erro ao excluir o item ${id} na tabela ${table}:`, error.message);
      throw new Error(error.message);
    }

    return error;
  }

  async deleteByFilter(table: string, filter: Record<string, any>): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from(table)
      .delete()
      .match(filter);

    if (error) {
      this.toastr.error(`Erro ao excluir o item na tabela ${table}:`, error.message);
      throw new Error(error.message);
    }
  }
}
