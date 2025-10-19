import { format } from 'date-fns';

/**
 * Formata uma data para envio ao backend, evitando problemas de timezone
 * Ajusta a data para meio-dia no horário local antes de formatar
 */
export function formatDateForBackend(date: Date): string {
  const adjustedDate = new Date(date);
  adjustedDate.setHours(12, 0, 0, 0);
  return format(adjustedDate, 'yyyy-MM-dd');
}

/**
 * Cria uma data a partir de uma string de data vinda do backend
 * Adiciona horário de meio-dia para evitar problemas de timezone
 */
export function parseDateFromBackend(dateString: string): Date {
  // Adiciona T12:00:00 para garantir que a data seja interpretada corretamente
  const dateWithTime = `${dateString}T12:00:00`;
  return new Date(dateWithTime);
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}