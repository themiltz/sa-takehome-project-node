/**
 * Clientside helper functions for the Checkout Page
 */

$(document).ready(function() {

  // Handle payment error returning from the success page, for this demo just a simple querystring param
  if ((new URL(location.href)).searchParams.get('paymenterror')) {
    $('<p>An error occurred while processing your payment, please try again.</p>').appendTo('#error-message');
  }

  // See your keys here: https://dashboard.stripe.com/apikeys
  // Initialize Stripe.js using your publishable key
  const stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);

  // Payment form
  const form = $('form[name="payment-form"]');
  
  const options = {
    clientSecret: form.data('secret'),
    // Fully customizable with appearance API.
    appearance: {/*...*/},
  };

  // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained above
  const elements = stripe.elements(options);
  
  // Create and mount the Payment Element
  const paymentElementOptions = { layout: 'accordion'};
  const paymentElement = elements.create('payment', paymentElementOptions);
  paymentElement.mount('#payment-element');

  // Handle payment form submission
  form.on('submit', async (event) => {
    event.preventDefault();
  
    // Call confirmPayment using Stripe JS library
    const {error} = await stripe.confirmPayment({
      //`Elements instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: $(location).attr('protocol') + '//' + $(location).attr('host') + '/success',
      },
    });
  
    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      $('#error-message').append(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  });

})

