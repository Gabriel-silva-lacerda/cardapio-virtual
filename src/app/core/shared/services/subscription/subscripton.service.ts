import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptonService {
  private supabaseService = inject(SupabaseService);
  private emailService = inject(EmailService);

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-10); // Gera uma senha de 10 caracteres
  }

  // Criar empresa, usuário e assinatura em um único método
 async registerCompanyWithSubscription(companyData: any) {
  try {

    const company = await this.createCompany(companyData);

    const user = await this.createAdminUser(companyData.email, company.fullName, company.unique_url);

    await this.linkUserToCompany(user.userId, company.id);

    await this.createSubscription(company.id, companyData.plan_id);

    await this.sendWelcomeEmail(companyData, company, user.password);

    return { success: true, message: 'Plano comprado com sucesso!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Cria a empresa
private async createCompany(companyData: any) {
  const uniqueUrl = this.generateUniqueUrl(companyData.name);

  const { data, error } = await this.supabaseService.supabase
    .from('companies')
    .insert([
      {
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
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar empresa: ${error.message}`);
  return data;
}

// Cria o usuário administrad
private async createAdminUser(email: string, fullName: string, companyName: string): Promise<{ userId: string, password: string }> {
  const password = this.generateRandomPassword(); // Gera a senha manualmente

  if (!this.validateEmail(email)) {
    throw new Error('Endereço de e-mail inválido');
  }

  const { data, error } = await this.supabaseService.supabase.auth.signUp({
    email,
    password, // Passa a senha gerada manualmente
    options: {
      data: {
        full_name: fullName,
        first_login: true,
      },
    emailRedirectTo: `http://localhost:4200/auth?empresa=${companyName}`
    },
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      throw new Error('E-mail já cadastrado. Tente outro.');
    } else {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  if (!data?.user) throw new Error('Usuário não retornado pelo Supabase.');

  // Atualizar informações na tabela "users" ao invés de inserir
  const { error: updateError } = await this.supabaseService.supabase
    .from('users')
    .update({
      full_name: fullName,
    })
    .eq('id', data?.user.id); // Atualiza apenas o usuário correto

  if (updateError) {
    throw new Error(`Erro ao atualizar usuário na tabela users: ${updateError.message}`);
  }


  return { userId: data.user.id, password }; // Retorna o ID do usuário e a senha
}

// Vincula o usuário à empresa
private async linkUserToCompany(userId: string, companyId: number) {
  const { error } = await this.supabaseService.supabase
    .from('user_companies')
    .insert([{ user_id: userId, company_id: companyId, role: 'admin' }]);

  if (error) throw new Error(`Erro ao vincular usuário à empresa: ${error.message}`);
}

// Cria a assinatura do plano
private async createSubscription(companyId: number, planId: number) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(startDate.getMonth() + 1); // 1 mês de duração

  const { error } = await this.supabaseService.supabase
    .from('subscriptions')
    .insert([
      {
        company_id: companyId,
        plan_id: planId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
      },
    ]);

  if (error) throw new Error(`Erro ao criar assinatura: ${error.message}`);
}


// Envia e-mail de boas-vindas
public async sendWelcomeEmail(companyData: any, company: any, password: string) {
  const companyUrl = `http://localhost:4200/auth?empresa=${company.unique_url}`;
  const emailMessage = `
    <h2>Bem-vindo ao nosso sistema!</h2>
    <p>Olá, ${companyData.name}!</p>
    <p>Seu plano foi ativado com sucesso.</p>
    <p>Aqui estão os detalhes do seu login:</p>
    <ul>
      <li><strong>Email:</strong> ${companyData.email}</li>
      <li><strong>Senha:</strong> ${password}</li> <!-- Inclui a senha no e-mail -->
      <li><strong>Link de acesso:</strong> <a href="${companyUrl}">${companyUrl}</a></li>
    </ul>
    <p>Faça login diretamente no seu painel!</p>
  `;

  try {
    await this.emailService.sendEmail(
      companyData,
      company,
      password
    );
    console.log('E-mail de boas-vindas enviado com sucesso.');
  } catch (error) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
    throw new Error('Erro ao enviar e-mail de boas-vindas.');
  }
}

  generateUniqueUrl(companyName: string): string {
    return companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}
