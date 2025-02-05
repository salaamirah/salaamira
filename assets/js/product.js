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
        const mainImage = document.querySelector('.col-2 img');
        mainImage.src = product.image;
        mainImage.alt = product.name;
        document.querySelector('.left:nth-of-type(1)').textContent = product.name;
        document.querySelector('.left:nth-of-type(2)').textContent = product.price;
        document.querySelector('.left:nth-of-type(3)').textContent = 'Description';
        document.querySelector('.left:nth-of-type(4)').textContent = product.description;

        // Create a container for additional images and video
        const mediaContainer = document.createElement('div');
        mediaContainer.classList.add('media-container');
        document.querySelector('.col-2').appendChild(mediaContainer);

        // Check for additional images and append them
        Object.keys(product).forEach(key => {
            if (key.startsWith('image-')) {
                const extraImg = document.createElement('img');
                extraImg.src = product[key];
                extraImg.alt = `${product.name} - additional image`;
                extraImg.classList.add('extra-image');
                mediaContainer.appendChild(extraImg);
            }
        });

        // Check if a video exists and append it
        if (product.video) {
            const videoElement = document.createElement('video');
            videoElement.src = product.video;
            videoElement.controls = true;
            videoElement.classList.add('product-video');
            mediaContainer.appendChild(videoElement);
        }
    } else {
        // Handle case where product is not found
        document.querySelector('main').innerHTML = '<p>Product not found.</p>';
    }
});

// Add to cart functionality
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
