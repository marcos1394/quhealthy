const axios = require('axios');
axios.get('https://appointment-service-263kjqprkq-uc.a.run.app/api/appointments/clinical-templates?providerId=30')
  .then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.error(err.message));
