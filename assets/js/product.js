document.addEventListener("DOMContentLoaded", function () {
    const addToCartButton = document.querySelector(".btn");
    const quantitySelect = document.getElementById("quantity");

    addToCartButton.addEventListener("click", function () {
        // Get product details
        const productName = document.querySelector(".col-2 h2.left").textContent;
        const productPrice = document.querySelector(".col-2 h2.left:nth-of-type(2)").textContent;
        const quantity = quantitySelect.value;

        // Create a cart item object
        const cartItem = {
            name: productName,
            price: productPrice,
            quantity: quantity
        };

        // Get existing cart data from localStorage
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Check if product already exists in cart
        const existingItem = cart.find(item => item.name === productName);
        if (existingItem) {
            existingItem.quantity = parseInt(existingItem.quantity) + parseInt(quantity);
        } else {
            cart.push(cartItem);
        }

        // Save updated cart data back to localStorage
        localStorage.setItem("cart", JSON.stringify(cart));

        window.location.href = "cart.html";
    });
});
