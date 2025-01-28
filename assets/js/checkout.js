// Fetch cart from localStorage
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const checkoutItemsContainer = document.getElementById('checkout-items');
const checkoutItemsInput = document.querySelector('input[name="check-out-items"]');
let total = 0; // Initialize total

if (cart.length > 0) {
    let itemsData = [];
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price.replace('$', '')) * parseInt(item.quantity, 10); // Calculate item total
        total += itemTotal; // Add to overall total

        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <h2>${item.name}</h2>
            <p>Price: ${item.price}</p>
            <p>Quantity: ${item.quantity}</p>
            <hr>
        `;
        checkoutItemsContainer.appendChild(itemDiv);

        // Collect items for the hidden input field
        itemsData.push(`${item.name} - ${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}`);
    });

    // Display overall total
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `
        <h3>Total: $${total.toFixed(2)}</h3>
    `;
    checkoutItemsContainer.appendChild(totalDiv);

    // Update the hidden input field with cart data
    checkoutItemsInput.value = `${itemsData.join('\n')}\nTotal: $${total.toFixed(2)}`;
} else {
    checkoutItemsContainer.innerHTML = '<p>No items in the cart.</p>';
    checkoutItemsInput.value = 'No items in the cart.';
}
