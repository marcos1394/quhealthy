const fs = require('fs');

const esPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/es.json';
const enPath = '/Users/marcossandovalruiz/Documents/quhealthy/messages/en.json';

const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const EHR_NEW_KEYS_ES = {
  clinical_copilot: "Copiloto Clínico",
  copilot_desc: "Inicia la escucha. La IA extraerá los síntomas, signos vitales y el diagnóstico para rellenar tus notas automáticamente.",
  processing_audio: "Procesando audio...",
  stop_listening: "Detener Escucha",
  start_ai_scribe: "Iniciar Escriba IA",
  patient_camera: "Cámara del Paciente",
  soap_documentation: "Documentación SOAP",
  soap_subjective_placeholder: "Lo que el paciente refiere...",
  soap_objective_placeholder: "Exploración física y signos...",
  soap_assessment_placeholder: "Diagnóstico clínico presuntivo o definitivo...",
  soap_plan_placeholder: "Plan de acción, estudios solicitados, etc. (La receta se genera en el siguiente paso)",
  btn_back: "Regresar",
  btn_back_to_evaluation: "Regresar a Evaluación",
  btn_continue_treatment: "Continuar a Tratamiento",
  digital_prescription_closure: "Receta Digital y Cierre",
  prescription_desc: "Agrega los medicamentos. Al finalizar, la receta se firmará digitalmente con tu cédula y se enviará al paciente.",
  medication: "Medicamento",
  dosage: "Dosis",
  frequency: "Frecuencia",
  duration: "Duración",
  extra_instructions: "Instrucciones extra",
  rx_empty_state: "La receta está vacía.",
  take_medication: "Tomar {frequency} durante {duration}.",
  note: "Nota: {instructions}",
  use_finish_button: "Utiliza el botón",
  finish_and_charge_btn: "Finalizar y Cobrar",
  of_top_bar: "de la barra superior."
};

const EHR_NEW_KEYS_EN = {
  clinical_copilot: "Clinical Copilot",
  copilot_desc: "Start listening. The AI will extract symptoms, vital signs, and diagnosis to automatically fill out your notes.",
  processing_audio: "Processing audio...",
  stop_listening: "Stop Listening",
  start_ai_scribe: "Start AI Scribe",
  patient_camera: "Patient Camera",
  soap_documentation: "SOAP Documentation",
  soap_subjective_placeholder: "What the patient reports...",
  soap_objective_placeholder: "Physical examination and signs...",
  soap_assessment_placeholder: "Presumptive or definitive clinical diagnosis...",
  soap_plan_placeholder: "Action plan, requested studies, etc. (Prescription is generated in the next step)",
  btn_back: "Back",
  btn_back_to_evaluation: "Back to Evaluation",
  btn_continue_treatment: "Continue to Treatment",
  digital_prescription_closure: "Digital Prescription and Closure",
  prescription_desc: "Add medications. Once finished, the prescription will be digitally signed with your medical license and sent to the patient.",
  medication: "Medication",
  dosage: "Dosage",
  frequency: "Frequency",
  duration: "Duration",
  extra_instructions: "Extra instructions",
  rx_empty_state: "The prescription is empty.",
  take_medication: "Take {frequency} for {duration}.",
  note: "Note: {instructions}",
  use_finish_button: "Use the button",
  finish_and_charge_btn: "Finish and Charge",
  of_top_bar: "from the top bar."
};

for (const [key, value] of Object.entries(EHR_NEW_KEYS_ES)) {
  if (!esData.EHR[key]) esData.EHR[key] = value;
}

for (const [key, value] of Object.entries(EHR_NEW_KEYS_EN)) {
  if (!enData.EHR[key]) enData.EHR[key] = value;
}

fs.writeFileSync(esPath, JSON.stringify(esData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('Successfully added new EHR keys to i18n dictionaries');
