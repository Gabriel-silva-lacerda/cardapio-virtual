import { Injectable } from '@angular/core';
import { Resend } from 'resend';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  sendWelcomeEmail(companyData: any, company: any, password: string) {
    const companyUrl = `https://meusistema.com/empresa/${company.unique_url}`;

    const templateParams = {
      company_name: companyData.name,
      company_email: companyData.email,
      password: password,
      company_url: companyUrl,
    };

    // Substitua pelos seus IDs do serviço e template
    emailjs
      .send('service_ywi4056', 'template_so11dky', templateParams, 'VTt5YwaVT9XHZwD7s')
      .then(
        (response) => {
          console.log('E-mail enviado com sucesso!', response);
        },
        (error) => {
          console.error('Erro ao enviar e-mail:', error);
        }
      );
  }
}
