// Fetch cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Display cart items
const cartItemsContainer = document.getElementById('cart-items');
let total = 0;

const renderCart = () => {
    cartItemsContainer.innerHTML = ''; // Clear the container for re-rendering
    total = 0; // Reset total

    if (cart.length > 0) {
        cart.forEach((item, index) => {
            const itemTotal = parseFloat(item.price.replace('$', '')) * parseInt(item.quantity, 10); // Calculate total for each item
            total += itemTotal; // Add to overall total
            
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <h2>${item.name}</h2>
                <p>Price: ${item.price}</p>
                <p>Quantity: 
                    <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
                </p>
                <hr>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        // Display overall total
        const totalDiv = document.createElement('div');
        totalDiv.innerHTML = `
            <h3>Total: $${total.toFixed(2)}</h3>
        `;
        cartItemsContainer.appendChild(totalDiv);
    } else {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    }
};

// Update cart quantity
const updateQuantity = (index, action) => {
    if (action === 'increase') {
        cart[index].quantity = parseInt(cart[index].quantity, 10) + 1;
    } else if (action === 'decrease' && cart[index].quantity > 1) {
        cart[index].quantity = parseInt(cart[index].quantity, 10) - 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};

// Remove item from cart
const removeItem = (index) => {
    cart.splice(index, 1); // Remove the item at the specified index
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};

// Event listeners for quantity buttons and remove buttons
cartItemsContainer.addEventListener('click', (event) => {
    const target = event.target;
    const index = target.dataset.index;

    if (target.classList.contains('qty-btn')) {
        updateQuantity(index, target.dataset.action);
    }

    if (target.classList.contains('remove-btn')) {
        removeItem(index);
    }
});

// Clear cart
document.getElementById('clear-cart').addEventListener('click', () => {
    localStorage.removeItem('cart');
    cart = [];
    renderCart();
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

// Initial render
renderCart();
