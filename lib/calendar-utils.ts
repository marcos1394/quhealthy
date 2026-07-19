export function generateICS(appointment: any): string {
  // Aseguramos que la fecha es válida
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime || startTime.getTime() + 30 * 60000); // fallback 30m

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startStr = formatDate(startTime);
  const endStr = formatDate(endTime);
  const nowStr = formatDate(new Date());
  const uid = appointment.id || Math.random().toString(36).substring(2, 15);

  const serviceName = appointment.serviceNameSnapshot || appointment.serviceName || "Cita Médica";
  const providerName = appointment.providerNameSnapshot || "Especialista Asignado";
  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/patient/dashboard/appointments/${appointment.id}` : '';
  const location = appointment.modality === 'ONLINE' ? 'En línea (Teleconsulta)' : 'Clínica Presencial';
  
  const description = `Servicio: ${serviceName}\\nEspecialista: ${providerName}\\nEnlace: ${portalUrl}`;

  // vCalendar con alarma de 1 hora
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//QuHealthy//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}@quhealthy.org
DTSTAMP:${nowStr}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:QuHealthy: ${serviceName} con ${providerName}
DESCRIPTION:${description}
LOCATION:${location}
URL:${portalUrl}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Recordatorio de Cita Médica
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

export function downloadICS(appointment: any) {
  const icsContent = generateICS(appointment);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `cita-quhealthy-${appointment.id || '1'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
