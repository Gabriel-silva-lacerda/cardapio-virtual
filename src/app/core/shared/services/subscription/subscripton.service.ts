import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email.service';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { Company } from '@shared/interfaces/company';

@Injectable({
  providedIn: 'root',
})
export class SubscriptonService extends BaseSupabaseService {
  private emailService = inject(EmailService);

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async registerCompanyWithSubscription(companyData: any) {
    try {
      const company = await this.createCompany(companyData);

      const user = await this.createAdminUser(
        companyData.email,
        companyData.fullName,
        company.unique_url
      );

      await this.linkUserToCompany(user.userId, company.id);

      await this.createSubscription(company.id, companyData.plan_id);

      return {success: true, message: 'Empresa criada com sucesso!', company: company };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async createCompany(companyData: any) {
    const uniqueUrl = this.generateUniqueUrl(companyData.name);

    const company = await this.insert<Company>('companies', {
      name: companyData.name,
      email: companyData.email,
      unique_url: uniqueUrl,
      cep: companyData.cep,
      street: companyData.street,
      number: companyData.number,
      neighborhood: companyData.neighborhood,
      complement: companyData.complement || null,
      city: companyData.city,
      state: companyData.state,
      plan_id: companyData.plan_id,
    });

    return company;
  }

  private async createAdminUser(
    email: string,
    fullName: string,
    companyName: string
  ): Promise<{ userId: string; password: string }> {
    const password = this.generateRandomPassword();

    if (!this.validateEmail(email)) {
      throw new Error('Endereço de e-mail inválido');
    }

    const { data, error } = await this.supabaseService.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_login: true,
        },
        emailRedirectTo: `http://localhost:4200/auth?empresa=${companyName}`,
      },
    });

    if (error) {
      if (error.message.includes('User already registered'))
        this.toastr.error('E-mail já cadastrado', 'Tente outro!');
    }

    if (!data?.user) throw new Error('Usuário não retornado pelo Supabase.');

    const userId = data.user.id;

    return { userId, password };
  }

  private async linkUserToCompany(userId: string, companyId: number) {
    const data = {
      user_id: userId,
      company_id: companyId,
      role: 'admin',
    };

    await this.insert('user_companies', data);
  }

  private async createSubscription(companyId: number, planId: number) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1);

    const data = {
      company_id: companyId,
      plan_id: planId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
    };

    await this.insert('subscriptions', data);
  }

  // private async createCompany(companyData: any) {
  //   const uniqueUrl = this.generateUniqueUrl(companyData.name);

  //   const { data, error } = await this.supabaseService.supabase
  //     .from('companies')
  //     .insert([
  //       {
  //         name: companyData.name,
  //         email: companyData.email,
  //         unique_url: uniqueUrl,
  //         cep: companyData.cep,
  //         street: companyData.street,
  //         number: companyData.number,
  //         neighborhood: companyData.neighborhood,
  //         complement: companyData.complement || null,
  //         city: companyData.city,
  //         state: companyData.state,
  //         plan_id: companyData.plan_id,
  //       },
  //     ])
  //     .select()
  //     .single();

  //   if (error) throw new Error(`Erro ao criar empresa: ${error.message}`);
  //   return data;
  // }

  // private async createAdminUser(email: string, fullName: string, companyName: string): Promise<{ userId: string, password: string }> {
  //   const password = this.generateRandomPassword();

  //   if (!this.validateEmail(email)) {
  //     throw new Error('Endereço de e-mail inválido');
  //   }

  //   const { data, error } = await this.supabaseService.supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       data: {
  //         full_name: fullName,
  //         first_login: true,
  //       },
  //     emailRedirectTo: `http://localhost:4200/auth?empresa=${companyName}`
  //     },
  //   });

  //   if (error) {
  //     if (error.message.includes('User already registered')) {
  //       throw new Error('E-mail já cadastrado. Tente outro.');
  //     } else {
  //       throw new Error(`Erro ao criar usuário: ${error.message}`);
  //     }
  //   }

  //   if (!data?.user) throw new Error('Usuário não retornado pelo Supabase.');

  //   const { error: updateError } = await this.supabaseService.supabase
  //     .from('users')
  //     .update({
  //       full_name: fullName,
  //     })
  //     .eq('id', data?.user.id);

  //   if (updateError) {
  //     throw new Error(`Erro ao atualizar usuário na tabela users: ${updateError.message}`);
  //   }

  //   return { userId: data.user.id, password };
  // }

  // private async linkUserToCompany(userId: string, companyId: number) {
  //   const { error } = await this.supabaseService.supabase
  //     .from('user_companies')
  //     .insert([{ user_id: userId, company_id: companyId, role: 'admin' }]);

  //   if (error) throw new Error(`Erro ao vincular usuário à empresa: ${error.message}`);
  // }

  // private async createSubscription(companyId: number, planId: number) {
  //   const startDate = new Date();
  //   const endDate = new Date();
  //   endDate.setMonth(startDate.getMonth() + 1);

  //   const { error } = await this.supabaseService.supabase
  //     .from('subscriptions')
  //     .insert([
  //       {
  //         company_id: companyId,
  //         plan_id: planId,
  //         start_date: startDate.toISOString(),
  //         end_date: endDate.toISOString(),
  //         status: 'active',
  //       },
  //     ]);

  //   if (error) throw new Error(`Erro ao criar assinatura: ${error.message}`);
  // }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-10);
  }

  private generateUniqueUrl(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // public async sendWelcomeEmail(company: any, password: string) {
  //   const companyUrl = `http://localhost:4200/auth?empresa=${company.unique_url}`;
  //   const emailMessage = `
  //     <h2>Bem-vindo ao nosso sistema!</h2>
  //     <p>Olá, ${company.name}!</p>
  //     <p>Seu plano foi ativado com sucesso.</p>
  //     <p>Aqui estão os detalhes do seu login:</p>
  //     <ul>
  //       <li><strong>Email:</strong> ${company.email}</li>
  //       <li><strong>Senha:</strong> ${password}</li> <!-- Inclui a senha no e-mail -->
  //       <li><strong>Link de acesso:</strong> <a href="${companyUrl}">${companyUrl}</a></li>
  //     </ul>
  //     <p>Faça login diretamente no seu painel!</p>
  //   `;

  //   try {
  //     await this.emailService.sendEmail(
  //       company,
  //       password,
  //       companyUrl
  //     );
  //     console.log('E-mail de boas-vindas enviado com sucesso.');
  //   } catch (error) {
  //     console.error('Erro ao enviar e-mail de boas-vindas:', error);
  //     throw new Error('Erro ao enviar e-mail de boas-vindas.');
  //   }
  // }
}
