const fs = require('fs');

const esPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/es.json';
const enPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/en.json';

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const EHR_NEW_KEYS_ES = {
  no_medications_registered: "Sin medicamentos registrados.",
  no_surgeries_registered: "Sin cirugías registradas.",
  no_family_history_registered: "Sin antecedentes familiares registrados.",
  current_medication: "Medicación Actual",
  surgical_history: "Historial Quirúrgico",
  family_history: "Antecedentes Familiares"
};

const EHR_NEW_KEYS_EN = {
  no_medications_registered: "No medications registered.",
  no_surgeries_registered: "No surgeries registered.",
  no_family_history_registered: "No family history registered.",
  current_medication: "Current Medication",
  surgical_history: "Surgical History",
  family_history: "Family History"
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
