import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { Company } from '@shared/interfaces/company/company';

@Injectable({
  providedIn: 'root',
})
export class SubscriptonService extends BaseSupabaseService {
  // private emailService = inject(EmailService);
  // validateEmail(email: string): boolean {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // }
  // async registerCompanyWithSubscription(companyData: any) {
  //   try {
  //     const company = await this.createCompany(companyData);
  //     const user = await this.createAdminUser(
  //       companyData.email,
  //       companyData.fullName,
  //       company.unique_url
  //     );
  //     await this.linkUserToCompany(user.userId, company.id);
  //     await this.createSubscription(company.id, companyData.plan_id);
  //     return {
  //       success: true,
  //       message: 'Empresa criada com sucesso!',
  //       data: {
  //         company,
  //         password: user.password,
  //       },
  //     };
  //   } catch (error: any) {
  //     return { success: false, message: error.message };
  //   }
  // }
  // private async createCompany(companyData: any) {
  //   const uniqueUrl = this.generateUniqueUrl(companyData.name);
  //   const company = await this.insert<Company>('companies', {
  //     name: companyData.name,
  //     email: companyData.email,
  //     unique_url: uniqueUrl,
  //     cep: companyData.cep,
  //     street: companyData.street,
  //     number: companyData.number,
  //     neighborhood: companyData.neighborhood,
  //     complement: companyData.complement || null,
  //     city: companyData.city,
  //     state: companyData.state,
  //     plan_id: companyData.plan_id,
  //   });
  //   return company;
  // }
  // private async createAdminUser(
  //   email: string,
  //   fullName: string,
  //   companyName: string
  // ): Promise<{ userId: string; password: string }> {
  //   const password = this.generateRandomPassword();
  //   const { data, error } = await this.supabaseService.supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       data: {
  //         full_name: fullName,
  //         first_login: true,
  //       },
  //       emailRedirectTo: `http://localhost:4200/auth?empresa=${companyName}`,
  //     },
  //   });
  //   if (error) {
  //     if (error.message.includes('User already registered'))
  //       this.toastr.error('E-mail já cadastrado', 'Tente outro!');
  //   }
  //   if (!data?.user) throw new Error('Usuário não retornado pelo Supabase.');
  //   const userId = data.user.id;
  //   return { userId, password };
  // }
  // private async linkUserToCompany(userId: string, companyId: number) {
  //   const data = {
  //     user_id: userId,
  //     company_id: companyId,
  //     role: 'admin',
  //   };
  //   await this.insert('user_companies', data);
  // }
  // private async createSubscription(companyId: number, planId: number) {
  //   const startDate = new Date();
  //   const endDate = new Date();
  //   endDate.setMonth(startDate.getMonth() + 1);
  //   const data = {
  //     company_id: companyId,
  //     plan_id: planId,
  //     start_date: startDate.toISOString(),
  //     end_date: endDate.toISOString(),
  //     status: 'active',
  //   };
  //   await this.insert('subscriptions', data);
  // }
  // private generateRandomPassword(): string {
  //   return Math.random().toString(36).slice(-10);
  // }
  // private generateUniqueUrl(companyName: string): string {
  //   return companyName
  //     .toLowerCase()
  //     .replace(/\s+/g, '-')
  //     .replace(/[^a-z0-9-]/g, '');
  // }
}
