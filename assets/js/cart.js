 // Fetch cart from localStorage
 const cart = JSON.parse(localStorage.getItem('cart')) || [];

 // Display cart items
 const cartItemsContainer = document.getElementById('cart-items');

 if (cart.length > 0) {
     cart.forEach((item, index) => {
         const itemDiv = document.createElement('div');
         itemDiv.innerHTML = `
             <h2>${item.name}</h2>
             <p>Price: ${item.price}</p>
             <p>${item.description}</p>
             <hr>
         `;
         cartItemsContainer.appendChild(itemDiv);
     });
 } else {
     cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
 }

 // Clear cart
 document.getElementById('clear-cart').addEventListener('click', () => {
     localStorage.removeItem('cart');
     cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
 });

 // Proceed to Checkout
 document.getElementById('proceed-to-checkout').addEventListener('click', () => {
     if (cart.length > 0) {
         // Redirect to checkout.html
         window.location.href = 'checkout.html';
     } else {
         alert('Your cart is empty. Add items before proceeding to checkout.');
     }
 });