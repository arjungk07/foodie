export const createPaymentIntent = async (amount, currency = 'usd') => {
  // Since we are running in demo mode by default, we simulate the Stripe Payment Intent response.
  // If the user replaces the STRIPE_SECRET_KEY with a real one, they can install the 'stripe' package and hook it up.
  const amountInCents = Math.round(amount * 100);
  
  return {
    clientSecret: `pi_mock_secret_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    id: `ch_mock_${Date.now()}`,
    amount: amountInCents,
    currency
  };
};
