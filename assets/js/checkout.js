document.getElementById('checkout-form').addEventListener('submit', function (event) {
    const cartSummary = document.getElementById('checkout-cart-summary').innerHTML;
    document.getElementById('cart-summary').value = cartSummary;
  });