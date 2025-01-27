const createHeader = () => {
    let header = document.querySelector('header');
    if (!header) {
        console.error("No <header> element found in the DOM.");
        return;
    }

    header.innerHTML = `
    <!-- navigation tags - block level element -->
    <header>
      <nav>
        <ul>
          <li>
            <a href="new.html">New</a>
          </li>
          <li>
            <a href="scarves.html">Scarves</a>
          </li>
        </ul>
      </nav>
        <h1>
        <a href="index.html">
        <img src="./assets/images/SALA-AMIRA.png">  
        </a>
      </h1>
      <nav>
        <ul>
          <li>
            <a href="restock.html">Restock</a>
          </li>
          <li>
            <a href="more.html">More</a>
          </li>
        </ul>
      </nav>
    </header>
    <!-- end navigation -->
    `
    ;
};

// Call the function to create the header
createHeader();

const createSection = () => {
  let section = document.querySelector('.logo');
  section.innerHTML = `
      <div class="logo">
      <img src="./assets/images/SALA-AMIRA.png">
    </div>
    `
  ;
}
createSection();

const createFooter = () => {
    let footer = document.querySelector('footer');
    footer.innerHTML = `
        <footer>
    <div class="row">
        <div class="col-4">
            <h3>OUR MISSION</h3><br>
            <p>At Salaamirah, we create timeless, high-quality scarves with a focus on style, comfort, and sustainability. Our mission is to empower self-expression through ethical craftsmanship and thoughtful design.</p><br>
            <div class="social-media-icons">
              <a href="https://www.instagram.com/salaamirah/" target=_blank><i class="fa-brands fa-instagram"></i></a>
              <a href="#"><i class="fa-brands fa-tiktok"></i></a>
            </div>
        </div>
        <div class="col-4">
            <h3>SHOP</h3><br>
            <a href="collection.html"><p>Shop</p></a>
            <a href="index.html#about"><p>About</p></a>
            <a href="blog.html"><p>Blog</p></a>
        </div>
        <div class="col-4">
            <h3>RESOURCES</h3><br>
            <a href="contact-us.html"><p>Contact Us</p></a>
            <a href="shipping.html"><p>Shipping & Returns</p></a>
            <a href="FAQ.html"><p>FAQ</p></a>
            <a href="feedback.html"><p>Give us Feedback</p></a>
            <a href="privacy-policy.html"><p>Privacy Policy</p></a>
             <a href="terms-of-service.html"><p>Terms of Service</p></a>
        </div>
        <div class="col-4">
            <h3>STAY IN TOUCH</h3><br>
            <div class="contact-form">
          <form action="https://formsubmit.co/salaamirah@gmail.com" method="post">
      <input type="text" placeholder="Your Name" id="name" name="name" class="form-input" />
      <input type="email" placeholder="Email Address" id="email" name="email" class="form-input" />
        
            <button type="submit">Submit</button>
          </form>
        </div>
        </div>
    </div>
</footer>`
    ;
}
createFooter();