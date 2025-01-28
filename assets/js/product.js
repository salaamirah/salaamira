document.addEventListener('DOMContentLoaded', async function () {
    // Get product ID from query string
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Fetch product data from JSON file
    const response = await fetch('./assets/js/products.json');
    const products = await response.json();

    // Find the selected product
    const product = products.find(item => item.id == productId);

    // Display product details if found
    if (product) {
        document.querySelector('.col-2 img').src = product.image;
        document.querySelector('.col-2 img').alt = product.name;
        document.querySelector('.left:nth-of-type(1)').textContent = product.name;
        document.querySelector('.left:nth-of-type(2)').textContent = product.price;
        document.querySelector('.left:nth-of-type(3)').textContent = 'Description';
        document.querySelector('.left:nth-of-type(4)').textContent = product.description;
    } else {
        // Handle case where product is not found
        document.querySelector('main').innerHTML = '<p>Product not found.</p>';
    }
});

document.querySelector('.btn').addEventListener('click', function() {
    // Product details
    const product = {
        name: document.querySelector('.left:nth-of-type(1)').textContent,
        price: document.querySelector('.left:nth-of-type(2)').textContent,
        description: document.querySelector('.left:nth-of-type(3)').textContent,
        quantity: document.querySelector('#quantity').value // Get the selected quantity
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
