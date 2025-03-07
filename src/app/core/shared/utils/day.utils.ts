import { DayOfWeek } from "@shared/enums/day-of-week.enum";

export function translateDayOfWeek(dayOfWeek: string | undefined): string {
  if (!dayOfWeek) {
    return 'Dia não especificado';
  }

  const daysMap: { [key: string]: string } = {
    sunday: 'Domingos',
    monday: 'Segundas-feiras',
    tuesday: 'Terças-feiras',
    wednesday: 'Quartas-feiras',
    thursday: 'Quintas-feiras',
    friday: 'Sextas-feiras',
    saturday: 'Sábados',
  };

  return daysMap[dayOfWeek.toLowerCase()] || 'Dia inválido';
}

export function getCurrentDayOfWeek(): DayOfWeek {
    return [
      DayOfWeek.Sunday,
      DayOfWeek.Monday,
      DayOfWeek.Tuesday,
      DayOfWeek.Wednesday,
      DayOfWeek.Thursday,
      DayOfWeek.Friday,
      DayOfWeek.Saturday,
    ][new Date().getDay()];
}

export function getUnavailableItemMessage(dayOfWeek: string | undefined): string {
  if (!dayOfWeek) return '';

  const dayTranslated = translateDayOfWeek(dayOfWeek);
  const preposition = getPreposition(dayOfWeek);

  return `Esse item só está disponível ${preposition} ${dayTranslated}`;
}

export function getPreposition(dayOfWeek: string): string {
  return dayOfWeek === 'saturday' || dayOfWeek === 'sunday' ? 'nos' : 'nas';
}
