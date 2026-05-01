const fs = require('fs');

const esPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/es.json';
const enPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/en.json';

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const EHR_NEW_KEYS_ES = {
  local_directory_patient: "Paciente de Directorio Local",
  qu_score: "QuScore",
  no_allergies_registered: "No hay alergias registradas.",
  no_chronic_conditions: "Sin condiciones crónicas registradas.",
  local_consultation_history: "Historial de Consultas Locales",
  internal_record: "Expediente Interno",
  view_full_history: "Ver Historial Completo",
  medical_consultation: "Consulta Médica",
  continue_to_evaluation: "Continuar a Evaluación Clínica",
  blood_type_na: "Sangre N/D",
  not_available: "N/D",
  view_btn: "Ver",
  no_history: "Sin historial",
  no_past_consultations_local: "No tienes consultas pasadas registradas con este paciente en tu directorio local."
};

const EHR_NEW_KEYS_EN = {
  local_directory_patient: "Local Directory Patient",
  qu_score: "QuScore",
  no_allergies_registered: "No allergies registered.",
  no_chronic_conditions: "No chronic conditions registered.",
  local_consultation_history: "Local Consultation History",
  internal_record: "Internal Record",
  view_full_history: "View Full History",
  medical_consultation: "Medical Consultation",
  continue_to_evaluation: "Continue to Clinical Evaluation",
  blood_type_na: "Blood Type N/A",
  not_available: "N/A",
  view_btn: "View",
  no_history: "No history",
  no_past_consultations_local: "You have no past consultations registered with this patient in your local directory."
};

for (const [key, value] of Object.entries(EHR_NEW_KEYS_ES)) {
  if (!esData.EHR[key]) esData.EHR[key] = value;
}

for (const [key, value] of Object.entries(EHR_NEW_KEYS_EN)) {
  if (!enData.EHR[key]) enData.EHR[key] = value;
}

fs.writeFileSync(esPath, JSON.stringify(esData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('Successfully added more EHR keys to i18n dictionaries');
