const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('Razorpay keys:', {
    id: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
    secret: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
});

console.log('paymentLink exists:', !!razorpay.paymentLink);
console.log('paymentLinks exists:', !!razorpay.paymentLinks);

if (razorpay.paymentLink) {
    console.log('paymentLink methods:', Object.keys(razorpay.paymentLink));
}
