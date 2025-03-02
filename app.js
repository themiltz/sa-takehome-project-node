const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var app = express();

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));

/**
 * Home route
 */
app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Async function calling Stripe SDK to create payment intent and return it
 */
async function createPaymentIntent(amount) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;

  } catch (error) {
    // In a real app, persist to logger
    console.error('Error fetching data:', error);
    throw error;
  }

}

/**
 * Checkout route
 */
app.get('/checkout', function(req, res) {
  // Just hardcoding amounts here to avoid using a database
  const item = req.query.item;
  let title, amount, error;

  switch (item) {
    case '1':
      title = "The Art of Doing Science and Engineering"
      amount = 2300      
      break;
    case '2':
      title = "The Making of Prince of Persia: Journals 1985-1993"
      amount = 2500
      break;     
    case '3':
      title = "Working in Public: The Making and Maintenance of Open Source"
      amount = 2800  
      break;     
    default:
      // Included in layout view, feel free to assign error
      error = "No item selected"      
      break;
  }

  // Create the payment intent and pass the client_secret to the checkout view
  createPaymentIntent(amount)
    .then(intent => {
      res.render('checkout', {
        title: title,
        amount: amount,
        error: error,
        client_secret: intent.client_secret,
        checkoutPage: true,
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      });
    })
    .catch(error => console.error('Failed to create payment intent'));
});

/**
 * Success route
 */
app.get('/success', function(req, res) {
  res.render('success', {
    successPage: true,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
