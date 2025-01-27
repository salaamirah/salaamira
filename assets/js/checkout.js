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

 // Initialize EmailJS
emailjs.init("WzMtmdYy-eFZkRFKM"); // Replace with your EmailJS public key

// Form submission handler
document.getElementById("checkout-form").addEventListener("submit", function (event) {
  event.preventDefault();

  // Collect form data
  const customerName = document.getElementById("name").value;
  const customerAddress = document.getElementById("address").value;

  // Send email
  emailjs.send("service_ukj9rrd", "template_2litgj8", {
    customer_name: customerName,
    customer_address: customerAddress,
  }).then(
    function (response) {
      alert("Email sent successfully!");
    },
    function (error) {
      alert("Failed to send email. Please try again.");
    }
  );
});