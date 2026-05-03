const fs = require('fs');

const esPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/es.json';
const enPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/en.json';

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

if (!esData.EHR.ai_scribe_success) {
  esData.EHR.ai_scribe_success = "¡Notas clínicas generadas exitosamente con el Copiloto IA!";
}

if (!enData.EHR.ai_scribe_success) {
  enData.EHR.ai_scribe_success = "Clinical notes successfully generated with AI Copilot!";
}

fs.writeFileSync(esPath, JSON.stringify(esData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('Successfully added ai_scribe_success to i18n dictionaries');
