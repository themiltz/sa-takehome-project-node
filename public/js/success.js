/**
 * Clientside helper functions for the Success Page
 */

$(document).ready(function() {
  
  // See your keys here: https://dashboard.stripe.com/apikeys
  // Initialize Stripe.js using your publishable key
  const stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);

  // Retrieve the "payment_intent_client_secret" query parameter appended to
  // your return_url by Stripe.js
  const clientSecret = (new URL(location.href)).searchParams.get('payment_intent_client_secret'); 

  // Retrieve the PaymentIntent
  stripe.retrievePaymentIntent(clientSecret).then(function(result) {
    if (result.error) {
      console.error(result.error.message);
      $("#message").text("Error retrieving checkout details...");
    } else {

      // Inspect the PaymentIntent `status` to indicate the status of the payment
      // to your customer.
      //
      // Some payment methods will [immediately succeed or fail][0] upon
      // confirmation, while others will first enter a `processing` state.
      //
      // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
      switch (result.paymentIntent.status) {
        case 'succeeded':
          $("#message").text("Thank you for your purchase!");
          
          // Retrieve necessary information from the paymentIntent response
          const totalAmount = result.paymentIntent.amount * .01;
          const currency = result.paymentIntent.currency;
          const paymentIntentID = result.paymentIntent.id;

          $("#totalAmount").text(totalAmount.toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
          }));
          $("#paymentIntentID").text(paymentIntentID);

          break;

        case 'processing':
          $("#message").text("Payment processing. We'll update you when payment is received.");
          break;

        case 'requires_payment_method':
          $("#message").text("Payment failed. Please try another payment method.");
          // Redirect your user back to your payment page to attempt collecting
          // payment again

          // Redirecting immediately but could also display error message here and require
          // customer interaction to return to the confirmation page.
          window.location.replace(document.referrer + "&paymenterror=true");
          break;

        default:
          $("#message").text("Something went wrong.");
          break;
      }
    }

  }).catch(function(err) {
    console.error("Error retrieving Payment Intent:", err);
    $("#message").text("Error retrieving checkout details...");
  });

})

