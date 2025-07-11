import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { LoadingService } from '../loading/loading.service';
import { InsertOptions } from '@shared/interfaces/insert-options/insert-options';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseSupabaseService {
  protected abstract table: string;
  protected toast = inject(ToastService);

  public loadingService = inject(LoadingService);
  public supabaseService = inject(SupabaseService);

  async getAll<T>(selectFields: string = '*'): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .select(selectFields);

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registros da tabela ${this.table}.`);
    }
    return data as T[];
  }

  async getById<T>(id: number | string | null, selectFields: string = '*'): Promise<T | null> {
    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .select(selectFields)
      .eq('id', id)
      .single();

    if (error) {
      this.throwHandledError(error, `Erro ao buscar item na tabela ${this.table} com ID ${id}.`);
    }
    return data as T;
  }

  async getAllByField<T>(
    field: string,
    value: string | number | number[],
    selectFields: string = '*'
  ): Promise<T[]> {
    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .select(selectFields)
      .eq(field, value);

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registros na tabela ${this.table} com ${field} = ${value}.`);
    }

    return data as T[];
  }

  async getByField<T>(
    field: string,
    value: string | number | boolean,
    selectFields: string = '*'
  ): Promise<T> {
    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .select(selectFields)
      .eq(field, value)
      .single();

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registro na tabela ${this.table}.`);
    }

    return data as T;
  }

  async getAllByFieldIn<T>(
    field: string,
    values: number[] | string[],
    selectFields: string = '*'
  ): Promise<T[]> {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .select(selectFields)
      .in(field, values);

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registros na tabela ${this.table} onde ${field} está em [${values.join(', ')}].`);
    }

    return data as T[];
  }

  async insert<T>(
    item: Partial<T>,
    options: InsertOptions = {}
  ): Promise<T> {
    const { wrapInArray = true } = options;

    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .insert(wrapInArray ? [item] : item)
      .select()
      .single();

    if (error) {
      this.handleError(error, `Erro ao inserir na tabela ${this.table}.`);
      throw new Error(error.message);
    }

    return data as T;
  }

  async update<T>(
    id: number | string,
    updates: Partial<T>
  ): Promise<T> {

    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      this.handleError(error, `Erro ao atualizar o item ${id} na tabela ${this.table}.`);
      throw new Error(error.message);
    }
    return data as T;
  }

  async delete(id: number | string): Promise<null> {
    const { error } = await this.supabaseService.supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      this.handleError(error, `Erro ao excluir o item ${id} na tabela ${this.table}.`);
      throw new Error(error.message);
    }

    return error;
  }

  async deleteByFilter(filter: Record<string, any>): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from(this.table)
      .delete()
      .match(filter);

    if (error) {
      this.throwHandledError(error, `Erro ao excluir o item na tabela ${this.table}.`);
    }
  }

  async searchPaginated<T>(
    query: string,
    fields: string[],
    page: number = 1,
    pageSize: number = 10,
    selectFields: string = '*'
  ): Promise<T[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const filter = fields.map(field => `${field}.ilike.%${query}%`).join(',');

    const { data, error } = await this.supabaseService.supabase
      .from(this.table)
      .select(selectFields)
      .or(filter)
      .range(from, to);

    if (error) {
      this.throwHandledError(error, `Erro ao buscar registros paginados com filtro na tabela ${this.table}.`);
    }

    return data as T[];
  }

async searchPaginated2<T>(
  query: string,
  fields: string[],
  page: number = 1,
  pageSize: number = 10,
  selectFields: string = '*',
  fixedFilters: Record<string, any> = {}
): Promise<T[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const queryBuilder = this.supabaseService.supabase
    .from(this.table)
    .select(selectFields)
    .range(from, to);

  // Aplica filtro "OR" se houver busca
  if (query && fields.length > 0) {
    const orFilter = fields.map(field => `${field}.ilike.%${query}%`).join(',');
    queryBuilder.or(orFilter);
  }

  // Aplica filtros fixos (ex: company_id)
  for (const key in fixedFilters) {
    queryBuilder.eq(key, fixedFilters[key]);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    this.throwHandledError(error, `Erro ao buscar registros paginados na tabela ${this.table}.`);
  }

  return data as T[];
}



  // ==== Tratamento de Erros ====

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
      this.toast.error(message);
    }
  }
}
