 // Fetch cart from localStorage
 const cart = JSON.parse(localStorage.getItem('cart')) || [];
 const checkoutItemsContainer = document.getElementById('checkout-items');

 if (cart.length > 0) {
     cart.forEach(item => {
         const itemDiv = document.createElement('div');
         itemDiv.innerHTML = `
             <h2>${item.name}</h2>
             <p>Price: ${item.price}</p>
             <p>${item.description}</p>
             <hr>
         `;
         checkoutItemsContainer.appendChild(itemDiv);
     });
 } else {
     checkoutItemsContainer.innerHTML = '<p>No items in the cart.</p>';
 }

