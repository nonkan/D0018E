
let iconCart = document.querySelector('.icon-cart'); //Shopping cart window appear when you click on icon
let closeCart = document.querySelector('.close');
let body = document.querySelector('body'); //Shopping cart window to appear
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCartSpan = document.querySelector('.icon-cart span');
let checkout = document.querySelector('.checkout');

let listProducts = [];
let carts = [];



iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})
/*
checkout.addEventListener('click', (event) =>{
    let positionClick = event.target;
    if(positionClick.classList.contains('checkout')){
        alert('1');
    }
})*/



document.querySelector('.checkout').addEventListener('click', async (event) => {
    if (event.target.classList.contains('checkout')) {
        // Customer name input validation
        let username = sessionStorage.getItem('username');

        if (!username) {
            alert("Please log in before checking out.");
            
            return;
        }

        // Get the current order_id from sessionStorage, default to 1 if it doesn't exist
        let orderId = sessionStorage.getItem('order_id');
        if (!orderId) {
            orderId = 1; // First order
        } else {
            orderId = parseInt(orderId) + 1; // Increment order_id for the next order
        }

        // Save the updated order_id to sessionStorage
        sessionStorage.setItem('order_id', orderId);

        // Calculate totalAmount based on cart
        let totalAmount = carts.reduce((sum, item) => sum + item.quantity, 0);

        // Prepare order data dynamically from the cart
        let orderData = {
            order_id: orderId,
            item_id: carts.map(item => item.product_id).join(", "), // List of item IDs
            amount: totalAmount,
            customer: username
        };

        // Prepare selected items for the server
        let orderinfo = carts.map(cart => ({
            item_id: cart.product_id,
            amount: cart.quantity,
            price: cart.price,  // Include the price for each item
            customer: username
        }));

        let shoppinginfo = carts.map(cart => ({
            item_id: cart.product_id,
            amount: cart.quantity,
            totalprice: cart.totalprice * cart.totalQuantity,  // Include the price for each item
            customer: username
        }));

        // Prepare the payload for both requests
        let retailerData = {
            order_id: orderData.order_id,
            items: orderinfo
        };

        let customerData = {
            order_id: orderData.order_id,
            items: shoppinginfo,
            customer: username
        };
        console.log('Customer Data:', customerData);

        try {
            // Send both requests at the same time using Promise.all
            const [retailerResponse, customerResponse] = await Promise.all([
                fetch('http://127.0.0.1:5001/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(retailerData)
                }),
                fetch('http://127.0.0.1:5000/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customerData)
                })
            ]);

            // Wait for both responses to resolve
            const retailerResult = await retailerResponse.json();
            const customerResult = await customerResponse.json();

            // Handle the responses from both endpoints
            console.log('Retailer Response:', retailerResult);
            console.log('Customer Response:', customerResult);

            if (retailerResult.success && customerResult.success) {
                alert("Order placed successfully in both retailer and customer systems!");
                window.location.href = "http://127.0.0.1:5000/"; // Redirect after checkout
            } else {
                alert("Error in processing the order: " + retailerResult.message + " / " + customerResult.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Can't place order. Please check the console for details.");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    let username = sessionStorage.getItem("username");

    if (username) {
        let welcomeMessage = document.getElementById("welcome-message");
        let loginLink = document.getElementById("login-link");
        let logoutButton = document.getElementById("logout-button");

        // If username exists in sessionStorage, update the welcome message and hide login link
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${username}!`;
        }

        // Hide login link since user is already logged in
        if (loginLink) {
            loginLink.style.display = "none";
        }

        // Show logout button since user is logged in
        if (logoutButton) {
            logoutButton.style.display = "inline-block";
        }
    } else {
        // If no username in sessionStorage, show the login link
        let welcomeMessage = document.getElementById("welcome-message");
        if (welcomeMessage) {
            welcomeMessage.textContent = "Please log in before checkingout.";
        }

        // Hide logout button
        let logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.style.display = "none";
        }
    }
});
//----
document.getElementById('logout-button').addEventListener('click', () => {
            // Remove the username from sessionStorage
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("admin");


            // Optionally, redirect to the login page after logout
            window.location.href = "/login";  // Redirect to the login page
        });



/*
document.addEventListener("DOMContentLoaded", () => {
    let nameInput = document.getElementById("username");
    let welcomeMessage = document.getElementById("welcome-message");
    let customerForm = document.getElementById("customer-form");

     // Check sessionStorage for a stored username
     if (sessionStorage.getItem("username")) {
        displayWelcomeMessage(sessionStorage.getItem("username"));
    }

    customerForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form submission

        let username = nameInput.value.trim();
        if (username) {
            sessionStorage.setItem("username", username); // Store username in sessionStorage
            displayWelcomeMessage(username);
        }
    });

    function displayWelcomeMessage(username) {
        welcomeMessage.textContent = `Welcome, ${username}!`;
        welcomeMessage.style.display = "block";
        customerForm.style.display = "none"; // Hide form after username is entered
    }
});
*/

const addDataToHTML = () => {
    // remove datas default from HTML
    listProductHTML.innerHTML = '';

        // add new datas
        if(listProducts.length > 0) // if has data
        {
            listProducts.forEach(product => {
                let newProduct = document.createElement('div');
                newProduct.dataset.id = product.id;
                newProduct.classList.add('item');
                newProduct.innerHTML = `
                    <img src="${product.image}" alt="">
                    <h2>${product.name}</h2>
                    <div class="price">${product.price}SEK</div>
                    <button class="addCart">
                        Add To Cart
                    </button>`;
                listProductHTML.appendChild(newProduct);
            });
        }
}
//This is when a user is clicking on a Add To Cart Button.
listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('addCart')){
        let product_id = positionClick.parentElement.dataset.id;
        addToCart(product_id); //this is the product id
    }
})

const addToCart = (product_id) => {
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
    if(carts.length <= 0){
        carts = [{
            product_id: product_id,
            quantity: 1
        }];
    }else if(positionThisProductInCart < 0){
        carts.push({
            product_id: product_id,
            quantity: 1
        });
    }else{
        carts[positionThisProductInCart].quantity = carts[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
   // addCartToMemory();
}
const addCartToMemory = () => {
    sessionStorage.setItem('cart', JSON.stringify(carts));
};

const addCartToHTML = () => {
    listCartHTML.innerHTML = ''; // Clear cart display
    let totalQuantity = 0; // Variable for the total quantity in the cart
    let groupedItems = {}; // Object to group items by their name or product type

    if (carts.length > 0) {
        // Loop through each item in the cart
        carts.forEach(cart => {
            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            let info = listProducts[positionProduct];

            // Add to grouped items (group by product name or type)
            if (!groupedItems[info.name]) {
                groupedItems[info.name] = 0;
            }
            groupedItems[info.name] += cart.quantity;

            let newCart = document.createElement('div');
            newCart.classList.add('item');
            newCart.dataset.id = cart.product_id;

            // Add item to the cart display
            listCartHTML.appendChild(newCart);
            newCart.innerHTML = `
                <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">
                    ${info.name}
                </div>
                <div class="totalPrice">${info.price * cart.quantity} SEK</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${cart.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;

            // Add to the total quantity for the cart icon
            totalQuantity += cart.quantity;
        });

        // Display the total quantity grouped by product name
        let totalItems = 0;
        for (let item in groupedItems) {
            totalItems += groupedItems[item]; // Sum the quantities
        }

        // Display the total quantity in the shopping cart icon and total section
        iconCartSpan.innerText = totalQuantity; // Update cart icon quantity
        document.getElementById('total-items').textContent = totalItems; // Update total amount of items in cart
    } else {
        // If the cart is empty, set both values to 0
        iconCartSpan.innerText = 0;
        document.getElementById('total-items').textContent = 0;
    }
};



listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if(positionClick.classList.contains('plus')){
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
})
const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = carts.findIndex((value) => value.product_id == product_id);

    if (positionItemInCart >= 0) {
        let info = carts[positionItemInCart];
        switch (type) {
            case 'plus':
                carts[positionItemInCart].quantity += 1;
                break;

            default:
                let changeQuantity = carts[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    carts[positionItemInCart].quantity = changeQuantity;
                } else {
                    carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }

    addCartToHTML(); // Refresh the cart display with the new quantities
}

const initApp = () => {
    //get data
    fetch('/static/products.json')  
    .then(response => response.json())
    .then(data => {
        listProducts = data;
        addDataToHTML();

          // Get cart from sessionStorage
          if (sessionStorage.getItem('cart')) {
            carts = JSON.parse(sessionStorage.getItem('cart'));
            addCartToHTML();
        }
    })
}
initApp();





