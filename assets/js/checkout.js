// Fetch cart from localStorage
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const checkoutItemsContainer = document.getElementById('checkout-items');
const checkoutItemsInput = document.querySelector('input[name="check-out-items"]');

if (cart.length > 0) {
    let itemsData = [];
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <h2>${item.name}</h2>
            <p>Price: ${item.price}</p>
            <p>${item.description}</p>
            <hr>
        `;
        checkoutItemsContainer.appendChild(itemDiv);

        // Collect items for the hidden input field
        itemsData.push(`${item.name} - ${item.price} (${item.description})`);
    });

    // Update the hidden input field with cart data
    checkoutItemsInput.value = itemsData.join('\n');
} else {
    checkoutItemsContainer.innerHTML = '<p>No items in the cart.</p>';
    checkoutItemsInput.value = 'No items in the cart.';
}
