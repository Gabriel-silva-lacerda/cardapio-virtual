import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../loading/loading.service';
import { InsertOptions } from '@shared/interfaces/insert-options/insert-options';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseSupabaseService {
  public loadingService = inject(LoadingService);
  public toastr = inject(ToastrService);
  public supabaseService = inject(SupabaseService);

  async getAll<T>(table: string, selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields);

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registros da tabela ${table}.`);
    }
    return data as T[];
  }

  async getById<T>(
    table: string,
    id: number | string | null,
    selectFields: string = '*'
  ): Promise<T | null> {
    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields)
      .eq('id', id)
      .single();

    if (error) {
      this.throwHandledError(error,`Erro ao buscar item na tabela ${table} com ID ${id}.`);
    }
    return data as T;
  }

  async getAllByField<T>(
    table: string,
    field: string,
    value: string | number | number[],
    selectFields: string = '*'
  ): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields)
      .eq(field, value);

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registros na tabela ${table} com ${field} = ${value}.`);
    }

    return data as T[];
  }

  async getByField<T>(
    table: string,
    field: string,
    value: string | number | boolean,
    selectFields: string = '*'
  ): Promise<T> {
    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields)
      .eq(field, value)
      .single();

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registro na tabela ${table}.`);
    }

    return data as T;
  }

  async getAllByFieldIn<T>(
    table: string,
    field: string,
    values: number[] | string[],
    selectFields: string = '*'
  ): Promise<T[]> {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .select(selectFields)
      .in(field, values);

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registros na tabela ${table} onde ${field} está em [${values.join(
          ', '
        )}]:`);
    }

    return data as T[];
  }

  async insert<T>(
    table: string,
    item: Partial<T>,
    options: InsertOptions = {}
  ): Promise<T> {
    const { wrapInArray = true } = options;

    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .insert(wrapInArray ? [item] : item)
      .select()
      .single();

    if (error) {
      this.handleError(error, `Erro ao inserir na tabela ${table}.`);
      throw new Error(error.message);
    }

    return data as T;
  }

  async update<T>(
    table: string,
    id: number | string,
    updates: Partial<T>
  ): Promise<T> {
    const { data, error } = await this.supabaseService.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .single();
    if (error) {
      this.handleError(error, `Erro ao atualizar o item ${id} na tabela ${table}.`);
      throw new Error(error.message);
    }
    return data as T;
  }

  async delete(table: string, id: number | string): Promise<null> {
    const { error } = await this.supabaseService.supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      this.handleError(error, `Erro ao excluir o item ${id} na tabela ${table}.`);
      throw new Error(error.message);
    }

    return error;
  }

  async deleteByFilter(
    table: string,
    filter: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from(table)
      .delete()
      .match(filter);

    if (error) {
      this.throwHandledError(error, `Erro ao excluir o item na tabela ${table}.`);
    }
  }

  private throwHandledError(error: any, defaultMessage: string): never {
    this.handleError(error, defaultMessage);
    throw new Error(error.message);
  }

  private handleError(error: any, defaultMessage: string): void {
    if (error?.code && !error?.status) {
      const supabaseErrors: Record<string, string> = {
        PGRST116: 'Nenhum resultado encontrado.',
        PGRST123: 'Erro ao acessar os dados. Verifique os filtros ou permissões.',
        '42P01': 'Tabela ou relação não encontrada no banco de dados.',
      };

      const message = supabaseErrors[error.code] || error.message || defaultMessage;
      this.toastr.error(message, `Erro Supabase: ${error.code}`);
    }
  }
}
