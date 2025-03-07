import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayOfWeekTranslate'
})
export class DayOfWeekTranslatePipe implements PipeTransform {
  transform(dayOfWeek: string | undefined): string {
    if (!dayOfWeek) {
      return 'Dia não especificado';
    }

    const daysMap: { [key: string]: string } = {
      sunday: 'Domingo',
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
    };

    return daysMap[dayOfWeek.toLowerCase()] || 'Dia inválido';
  }

}
