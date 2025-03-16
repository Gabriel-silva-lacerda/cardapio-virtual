import { Injectable } from '@angular/core';
import { Resend } from 'resend';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  sendEmail(company: any, password: string, companyUrl: string | undefined) {
    // const companyUrl = `https://meusistema.com/empresa/${company.unique_url}`;

    const templateParams = {
      company_name: company.name,
      company_email: company.email,
      password: password,
      company_url: companyUrl,
    };


  }
}
