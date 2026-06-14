const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://payment-service-263kjqprkq-uc.a.run.app/api/appointments/64', {
      headers: {
        Authorization: 'Bearer ...' // wait, I don't have the token.
      }
    });
  } catch (e) {
  }
}
test();
