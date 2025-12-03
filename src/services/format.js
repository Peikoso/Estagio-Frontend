export function formatPriority (priority) {
  if(priority === 'HIGH') return 'Alta';
  if(priority === 'MEDIUM') return 'Média';
  if(priority === 'LOW') return 'Baixa';
  return '-';
}

export function formatDate(isoString) {
  if (!isoString) return '-';

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return 'Data inválida';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(date);
};
