function updateCartSummary() {
    // Get the content from the div
    const cartSummaryContent = document.getElementById('checkout-cart-summary').innerHTML;

    // Set it to the hidden input field
    document.getElementById('checkout-cart-summary-input').value = cartSummaryContent;
  }