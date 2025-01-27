document.querySelector('.btn').addEventListener('click', function() {
    // Product details
    const product = {
        name: document.querySelector('.left:nth-of-type(1)').textContent,
        price: document.querySelector('.left:nth-of-type(2)').textContent,
        description: document.querySelector('.left:nth-of-type(3)').textContent
    };

    // Check if there's already a cart in localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add product to cart
    cart.push(product);

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Redirect to cart.html
    window.location.href = 'cart.html';
});