const fs = require('fs');

const esPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/es.json';
const enPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/en.json';

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Update DashboardAppointments
if (!esData.DashboardAppointments.view_mode) {
  esData.DashboardAppointments.view_mode = {
    list: "Lista",
    kanban: "Tablero Kanban",
    calendar: "Calendario"
  };
  enData.DashboardAppointments.view_mode = {
    list: "List",
    kanban: "Kanban Board",
    calendar: "Calendar"
  };
}

if (!esData.DashboardAppointments.kanban_columns) {
  esData.DashboardAppointments.kanban_columns = {
    scheduled: "Agendados",
    waiting_room: "En Espera",
    in_progress: "En Consulta",
    completed: "Finalizados"
  };
  enData.DashboardAppointments.kanban_columns = {
    scheduled: "Scheduled",
    waiting_room: "Waiting Room",
    in_progress: "In Consultation",
    completed: "Completed"
  };
}

if (!esData.DashboardAppointments.medical_appointment) {
  esData.DashboardAppointments.medical_appointment = "Cita Médica";
  enData.DashboardAppointments.medical_appointment = "Medical Appointment";
}

if (!esData.DashboardAppointments.drag_here) {
  esData.DashboardAppointments.drag_here = "Arrastra citas aquí";
  enData.DashboardAppointments.drag_here = "Drag appointments here";
}

if (!esData.DashboardAppointments.no_appointments_filter) {
  esData.DashboardAppointments.no_appointments_filter = "No hay citas que coincidan con este filtro.";
  enData.DashboardAppointments.no_appointments_filter = "No appointments match this filter.";
}

if (!esData.DashboardAppointments.actions.open_monitor) {
  esData.DashboardAppointments.actions.open_monitor = "Abrir Monitor Clínico";
  enData.DashboardAppointments.actions.open_monitor = "Open Clinical Monitor";
}

// Update EHR
if (!esData.EHR.loading_environment) {
  esData.EHR.loading_environment = "Preparando entorno clínico...";
  enData.EHR.loading_environment = "Preparing clinical environment...";
}

if (!esData.EHR.consultation_in_progress) {
  esData.EHR.consultation_in_progress = "Consulta en Curso";
  enData.EHR.consultation_in_progress = "Consultation in Progress";
}

if (!esData.EHR.local_catalog) {
  esData.EHR.local_catalog = "Catálogo Local";
  enData.EHR.local_catalog = "Local Catalog";
}

if (!esData.EHR.save_draft) {
  esData.EHR.save_draft = "Guardar Borrador";
  enData.EHR.save_draft = "Save Draft";
}

if (!esData.EHR.finish_and_charge) {
  esData.EHR.finish_and_charge = "Finalizar y Cobrar";
  enData.EHR.finish_and_charge = "Finish and Charge";
}

if (!esData.EHR.step_clinical_context) {
  esData.EHR.step_clinical_context = "1. Contexto Clínico";
  enData.EHR.step_clinical_context = "1. Clinical Context";
}

if (!esData.EHR.step_evaluation) {
  esData.EHR.step_evaluation = "2. Evaluación (SOAP)";
  enData.EHR.step_evaluation = "2. Evaluation (SOAP)";
}

if (!esData.EHR.step_prescription) {
  esData.EHR.step_prescription = "3. Receta y Cierre";
  enData.EHR.step_prescription = "3. Prescription and Closure";
}

if (!esData.EHR.loading_step) {
  esData.EHR.loading_step = "Cargando Paso {step}...";
  enData.EHR.loading_step = "Loading Step {step}...";
}

if (!esData.EHR.patient_placeholder) {
  esData.EHR.patient_placeholder = "Paciente";
  enData.EHR.patient_placeholder = "Patient";
}
if (!esData.EHR.patient_directory_placeholder) {
  esData.EHR.patient_directory_placeholder = "Paciente de Directorio";
  enData.EHR.patient_directory_placeholder = "Directory Patient";
}
if (!esData.EHR.appointment_id) {
  esData.EHR.appointment_id = "Cita #{id}";
  enData.EHR.appointment_id = "Appointment #{id}";
}

fs.writeFileSync(esPath, JSON.stringify(esData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('Successfully updated i18n dictionaries');
