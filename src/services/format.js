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

export function formatToInput(formatedDate) {
  if (!formatedDate) return;

  const [datePart, timePart] = formatedDate.split(',').map(part => part.trim());

  const [day, month, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}
