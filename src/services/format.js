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

export function formatPhone(value) {
  // Remove tudo que não é número
  value = value.replace(/\D/g, "");

  // Aplica a máscara
  const match = value.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  if(value === '') return '';
  if (value.length <= 2) return `(${value}`;
  if (value.length <= 7) return `(${value.slice(0,2)}) ${value.slice(2)}`;
  if (value.length <= 11) return `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
  return value;
}

