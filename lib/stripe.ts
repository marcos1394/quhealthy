import { loadStripe } from '@stripe/stripe-js';

// Usamos una variable de entorno PÚBLICA para la clave de Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);