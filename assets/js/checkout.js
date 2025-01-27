   // Fetch cart from localStorage
   const cart = JSON.parse(localStorage.getItem('cart')) || [];

   // Display cart summary
   const cartSummaryContainer = document.getElementById('checkout-cart-summary');
   if (cart.length > 0) {
       cart.forEach((item) => {
           const itemDiv = document.createElement('div');
           itemDiv.innerHTML = `
               <h2>${item.name}</h2>
               <p>Price: ${item.price}</p>
               <p>${item.description}</p>
               <hr>
           `;
           cartSummaryContainer.appendChild(itemDiv);
       });
   } else {
       cartSummaryContainer.innerHTML = '<p>Your cart is empty.</p>';
   }

   // Handle form submission
   document.getElementById('checkout-form').addEventListener('submit', (e) => {
       e.preventDefault();
       alert('Thank you for your purchase!');
       
       // Clear cart after purchase
       localStorage.removeItem('cart');
       window.location.href = 'product.html'; // Redirect back to products or homepage
   });