const Stripe = require('stripe');

const args = process.argv.slice(2);
const apiKey = args[0];

if (!apiKey) {
  console.error('Error: Debes proporcionar tu Secret Key de Stripe como argumento.');
  console.log('Uso: node verify_stripe.js sk_test_XXXXX o sk_live_XXXXX');
  process.exit(1);
}

const stripe = Stripe(apiKey);

async function checkStripe() {
  console.log('Conectando a Stripe para verificar datos...');
  
  try {
    // 1. Obtener Suscripciones Activas
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 10
    });
    console.log(`\n=== SUSCRIPCIONES ACTIVAS ===`);
    console.log(`Encontradas: ${subscriptions.data.length} (mostrando máximo 10)`);
    subscriptions.data.forEach(sub => {
      console.log(`- ID: ${sub.id} | Cliente: ${sub.customer} | Estatus: ${sub.status}`);
    });

    // 2. Obtener Balance Transactions de los últimos 30 días
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const transactions = await stripe.balanceTransactions.list({
      created: { gte: thirtyDaysAgo },
      limit: 50
    });

    console.log(`\n=== TRANSACCIONES DE BALANCE (ÚLTIMOS 30 DÍAS) ===`);
    console.log(`Encontradas: ${transactions.data.length}`);
    
    let totalCharge = 0;
    let totalAppFee = 0;
    let totalPayment = 0;
    let totalOther = 0;

    const typesCount = {};

    transactions.data.forEach(bt => {
      const netAmount = bt.net / 100;
      typesCount[bt.type] = (typesCount[bt.type] || 0) + 1;
      
      console.log(`- Tipo: ${bt.type.padEnd(16)} | Neto: $${netAmount.toFixed(2).padStart(8)} | Desc: ${bt.description || 'N/A'}`);
      
      if (bt.type === 'charge') totalCharge += netAmount;
      else if (bt.type === 'application_fee') totalAppFee += netAmount;
      else if (bt.type === 'payment') totalPayment += netAmount;
      else totalOther += netAmount;
    });

    console.log(`\n=== RESUMEN DE TIPOS DE TRANSACCIÓN ===`);
    console.log(typesCount);

    console.log(`\n=== RESUMEN DE INGRESOS NETOS ===`);
    console.log(`Ingresos por 'charge':          $${totalCharge.toFixed(2)}`);
    console.log(`Ingresos por 'application_fee': $${totalAppFee.toFixed(2)}`);
    console.log(`Ingresos por 'payment':         $${totalPayment.toFixed(2)}`);
    console.log(`Otros ingresos/egresos:         $${totalOther.toFixed(2)}`);

    // 3. Verificar PaymentIntents no capturados (citas reservadas pero no finalizadas)
    const uncapturedIntents = await stripe.paymentIntents.list({
      limit: 10,
    });
    
    const requiresCapture = uncapturedIntents.data.filter(pi => pi.status === 'requires_capture');
    console.log(`\n=== FONDOS RETENIDOS (CITAS NO FINALIZADAS) ===`);
    console.log(`Encontrados: ${requiresCapture.length} PaymentIntents esperando captura`);
    requiresCapture.forEach(pi => {
      console.log(`- ID: ${pi.id} | Monto total: $${(pi.amount/100).toFixed(2)} | Comisión retenida: $${pi.application_fee_amount ? (pi.application_fee_amount/100).toFixed(2) : '0.00'}`);
    });

  } catch (error) {
    console.error('Error al conectarse a Stripe:', error.message);
  }
}

checkStripe();
