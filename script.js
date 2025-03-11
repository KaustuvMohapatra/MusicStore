// script.js - Main JavaScript file for Harmony Haven music store

document.addEventListener('DOMContentLoaded', function () {
    // Initialize cart from localStorage or create empty cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const image = this.closest('.instrument-card, .album-card, .product-card')
                .querySelector('img').getAttribute('src');

            // Check if item already exists in cart
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    image: image,
                    quantity: 1
                });
            }

            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();

            // Show add to cart notification
            showNotification(`${name} added to cart!`);
        });
    });

    // Quick View functionality
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const card = this.closest('.instrument-card, .album-card, .product-card');
            const name = card.querySelector('h3').textContent;
            const image = card.querySelector('img').getAttribute('src');
            const price = card.querySelector('.instrument-price, .album-price, .product-price').textContent;

            // Get description if available
            let description = '';
            const descriptionEl = card.querySelector('.instrument-description, .album-artist');
            if (descriptionEl) {
                description = descriptionEl.textContent;
            }

            // Open modal with product details
            openQuickViewModal(name, description, price, image);
        });
    });

    // Cart page functionality
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
        setupCartInteractions();
    }

    // Filter functionality for instruments, albums, and events pages
    setupFilters();

    // FAQ accordion functionality
    setupFaqAccordion();

    // Event calendar functionality
    setupEventCalendar();

    // Newsletter form submission
    setupNewsletterForm();

    // Contact form submission
    setupContactForm();
});

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
    });
}

// Show notification when item is added to cart
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }


    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Open quick view modal
function openQuickViewModal(name, description, price, image) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('quickViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quickViewModal';
        modal.className = 'modal';


        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-body">
                    <div class="modal-image">
                        <img src="" alt="Product Image" id="modalImage">
                    </div>
                    <div class="modal-info">
                        <h3 id="modalTitle"></h3>
                        <p class="modal-description" id="modalDescription"></p>
                        <p class="modal-price" id="modalPrice"></p>
                        <div class="modal-actions">
                            <div class="quantity-selector">
                                <button class="quantity-btn minus">-</button>
                                <input type="number" value="1" min="1" max="10" class="quantity-input">
                                <button class="quantity-btn plus">+</button>
                            </div>
                            <button class="add-to-cart" id="modalAddToCart">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Quantity buttons
        const minusBtn = modal.querySelector('.minus');
        const plusBtn = modal.querySelector('.plus');
        const quantityInput = modal.querySelector('.quantity-input');

        minusBtn.addEventListener('click', () => {
            if (quantityInput.value > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            if (quantityInput.value < 10) {
                quantityInput.value = parseInt(quantityInput.value) + 1;
            }
        });
    }

    // Update modal content
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalImage').src = image;

    // Show modal
    modal.style.display = 'block';
}

// Display cart items on cart page
function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountText = document.querySelector('.cart-count-text .cart-count');


    if (!cartItemsContainer) return;

    // Update cart count text
    if (cartCountText) {
        cartCountText.textContent = cart.length;
    }

    // Clear cart items container
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="instruments.html">Continue shopping</a></p>';
        updateOrderSummary(0, 0, 0);
        return;
    }

    // Add cart items
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemHTML = `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-category">${item.category || 'Music Item'}</p>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn minus"><i class="fas fa-minus"></i></button>
                    <input type="number" value="${item.quantity}" min="1" max="10" class="quantity-input">
                    <button class="quantity-btn plus"><i class="fas fa-plus"></i></button>
                </div>
                <div class="item-total">
                    <p>$${itemTotal.toFixed(2)}</p>
                </div>
                <div class="item-actions">
                    <button class="remove-item"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;

        cartItemsContainer.innerHTML += cartItemHTML;
    });

    // Calculate and update order summary
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + tax;

    updateOrderSummary(subtotal, tax, total);
}

// Update order summary on cart page
function updateOrderSummary(subtotal, tax, total) {
    const subtotalElement = document.querySelector('.summary-items .summary-item:nth-child(1) span:last-child');
    const taxElement = document.querySelector('.summary-items .summary-item:nth-child(3) span:last-child');
    const totalElement = document.querySelector('.summary-total span:last-child');


    if (subtotalElement && taxElement && totalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Setup cart interactions (quantity buttons, remove item, etc.)
function setupCartInteractions() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;


    // Quantity buttons and remove item
    cartItemsContainer.addEventListener('click', function (e) {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;

        const itemId = cartItem.getAttribute('data-id');
        const quantityInput = cartItem.querySelector('.quantity-input');
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Minus button
        if (target.classList.contains('minus') || target.parentElement.classList.contains('minus')) {
            if (quantityInput.value > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
                updateCartItemQuantity(itemId, parseInt(quantityInput.value));
            }
        }

        // Plus button
        if (target.classList.contains('plus') || target.parentElement.classList.contains('plus')) {
            if (quantityInput.value < 10) {
                quantityInput.value = parseInt(quantityInput.value) + 1;
                updateCartItemQuantity(itemId, parseInt(quantityInput.value));
            }
        }

        // Remove item button
        if (target.classList.contains('remove-item') || target.parentElement.classList.contains('remove-item')) {
            cart = cart.filter(item => item.id !== itemId);
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
            updateCartCount();
        }
    });

    // Quantity input change
    cartItemsContainer.addEventListener('change', function (e) {
        const target = e.target;
        if (target.classList.contains('quantity-input')) {
            const cartItem = target.closest('.cart-item');
            const itemId = cartItem.getAttribute('data-id');
            const quantity = parseInt(target.value);

            if (quantity >= 1 && quantity <= 10) {
                updateCartItemQuantity(itemId, quantity);
            }
        }
    });

    // Continue shopping button
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function () {
            window.location.href = 'instruments.html';
        });
    }

    // Clear cart button
    const clearCartBtn = document.querySelector('.clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to clear your cart?')) {
                localStorage.removeItem('cart');
                displayCartItems();
                updateCartCount();
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            alert('Checkout functionality would be implemented here.');
            // In a real implementation, this would redirect to a checkout page
        });
    }

    // Promo code button
    const promoCodeBtn = document.querySelector('.promo-code button');
    if (promoCodeBtn) {
        promoCodeBtn.addEventListener('click', function () {
            const promoInput = document.querySelector('.promo-code input');
            const promoCode = promoInput.value.trim();

            if (promoCode) {
                alert(`Promo code "${promoCode}" applied!`);
                // In a real implementation, this would validate the promo code and apply a discount
            } else {
                alert('Please enter a promo code.');
            }
        });
    }
}

// Update cart item quantity
function updateCartItemQuantity(itemId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update item total
        const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        const itemTotalElement = cartItem.querySelector('.item-total p');
        const itemTotal = item.price * quantity;
        itemTotalElement.textContent = `$${itemTotal.toFixed(2)}`;

        // Recalculate subtotal, tax, and total
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.07; // 7% tax
        const total = subtotal + tax;

        updateOrderSummary(subtotal, tax, total);
        updateCartCount();
    }
}

// Setup filters for instruments, albums, and events pages
function setupFilters() {
    // Instrument filters
    const instrumentFilterBtns = document.querySelectorAll('.filter-btn');
    const instrumentCards = document.querySelectorAll('.instrument-card');


    if (instrumentFilterBtns.length > 0 && instrumentCards.length > 0) {
        instrumentFilterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                instrumentFilterBtns.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                // Show/hide instrument cards based on filter
                instrumentCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Album filters
    const genreFilterBtns = document.querySelectorAll('.genre-filter');
    const albumCards = document.querySelectorAll('.album-card');

    if (genreFilterBtns.length > 0 && albumCards.length > 0) {
        genreFilterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                genreFilterBtns.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                // Show/hide album cards based on filter
                albumCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-genre') === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Event filters
    const eventFilterBtns = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');

    if (eventFilterBtns.length > 0 && eventCards.length > 0) {
        eventFilterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                eventFilterBtns.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                // Show/hide event cards based on filter
                eventCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }
}

// Setup FAQ accordion
function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');


    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function () {
            // Toggle active class on clicked item
            item.classList.toggle('active');

            // Update toggle icon
            const toggleIcon = this.querySelector('.faq-toggle i');
            if (item.classList.contains('active')) {
                toggleIcon.classList.remove('fa-plus');
                toggleIcon.classList.add('fa-minus');
            } else {
                toggleIcon.classList.remove('fa-minus');
                toggleIcon.classList.add('fa-plus');
            }
        });
    });
}

// Setup event calendar
function setupEventCalendar() {
    const calendarContainer = document.querySelector('.calendar-grid');
    if (!calendarContainer) return;


    // Current date is March 12, 2025
    const currentDate = new Date(2025, 2, 12); // Month is 0-indexed (2 = March)

    // Get current month and year
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Update current month text
    const currentMonthElement = document.querySelector('.current-month');
    if (currentMonthElement) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Add event listener for calendar navigation
    const prevMonthBtn = document.querySelector('.calendar-nav.prev');
    const nextMonthBtn = document.querySelector('.calendar-nav.next');


    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', function () {
            // Navigate to previous month
            alert('Previous month navigation would be implemented here.');
            // In a real implementation, this would update the calendar to show the previous month
        });

        nextMonthBtn.addEventListener('click', function () {
            // Navigate to next month
            alert('Next month navigation would be implemented here.');
            // In a real implementation, this would update the calendar to show the next month
        });
    }

    // Add event listener for calendar days
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function () {
            if (!this.classList.contains('inactive')) {
                // Show events for selected day
                alert(`Events for ${this.textContent} ${currentMonthElement.textContent} would be shown here.`);
                // In a real implementation, this would show events for the selected day
            }
        });
    });
}

// Setup newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;


    newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (email) {
            alert(`Thank you for subscribing with ${email}! You'll now receive our latest updates and exclusive offers.`);
            emailInput.value = '';
        }
    });
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;


    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const name = this.querySelector('#name').value.trim();
        const email = this.querySelector('#email').value.trim();
        const message = this.querySelector('#message').value.trim();

        if (name && email && message) {
            alert(`Thank you for your message, ${name}! We'll get back to you as soon as possible.`);
            this.reset();
        } else {
            alert('Please fill in all required fields.');
        }
    });
}
function clearCart() {
    localStorage.removeItem('cart');
    displayCartItems();
    updateCartCount();
  }
  
// Clear cart button
const clearCartBtn = document.querySelector('.clear-cart');
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    });
}

  