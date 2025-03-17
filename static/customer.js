
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

//----------------------------------------checkout button--------------------------------

document.querySelector('.checkout').addEventListener('click', async (event) => {
    if (event.target.classList.contains('checkout')) {
         // Check if the cart is empty
         if (carts.length === 0) {
            alert("Your shopping cart is empty. Add items before checking out.");
            return;
        }
        
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

        // Fetch the current stock data from the backend
        const stockData = await getStockData(); // Ensure this function fetches the latest stock info from the backend

        // Check if any item quantity exceeds the available stock
        for (let cartItem of carts) {
            // Find the product based on product_id
            let product = listProducts.find(product => product.id == cartItem.product_id);

            // If product is found, get the name, otherwise set to "Unknown Product"
            let productName = product ? product.name : "Unknown Product"; 

            let stockInfo = stockData.find(stock => stock.item_id == cartItem.product_id); // Find stock info by item_id
            let stockAmount = stockInfo ? stockInfo.amount : 0;

            // If the cart item quantity exceeds available stock, alert and stop the checkout
            if (cartItem.quantity > stockAmount) {
                alert(`You have selected more of the "${productName}" than are available in stock. Only ${stockAmount} left.`);
                return;
            }
        }

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

                // Prepare data for stock update (items that were purchased)
                let updatedStockData = carts.map(cart => ({
                    product_id: cart.product_id,
                    quantity: cart.quantity
                }));

                try {
                    // Loop through each item and update stock
                    for (let item of updatedStockData) {
                        // Fetch the current stock data for the product_id
                        let currentStockResponse = await fetch(`/api/stock`);
                        let stockData = await currentStockResponse.json();

                        // Find the stock info for the product_id
                        let stockInfo = stockData.find(stock => stock.item_id == item.product_id);

                        if (stockInfo) {
                            let newAmount = stockInfo.amount - item.quantity; // Decrease stock by quantity

                            // Send request to update stock
                            const stockUpdateResponse = await fetch('/api/update_stock', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    item_id: item.product_id,
                                    amount: newAmount
                                })
                            });

                            const stockUpdateResult = await stockUpdateResponse.json();

                            if (stockUpdateResult.message) {
                                console.log(`Stock for product ID ${item.product_id} updated successfully.`);
                            } else {
                                console.error(`Error updating stock for product ID ${item.product_id}`);
                            }
                        }
                    }

                    // Redirect after successful checkout
                    window.location.href = "http://127.0.0.1:5000/"; // Redirect to home or another page
                } catch (error) {
                    console.error("Error:", error);
                    alert("Can't update stock. Please check the console for details.");
                }
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("There was an issue with the checkout. Please try again.");
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
//--------------Log out button-------------------------------------
document.getElementById('logout-button').addEventListener('click', () => {
            // Remove the username from sessionStorage
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("admin");


            // Optionally, redirect to the login page after logout
            window.location.href = "/login";  // Redirect to the login page
        });


//-------------------------customer page-------------------------------------------------

//----------------stock---------------------------

// Function to fetch stock data and populate the dropdown
const populateItemIds = async () => {
    const response = await fetch('/api/stock');  // Get stock data from the backend
    const stockData = await response.json();    // Parse the JSON response

    const selectElement = document.getElementById('item-id');

    // Populate the dropdown options with item_id from stock data
    stockData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.item_id;  // Set the value of the option to item_id
        option.textContent = `Item ID: ${item.item_id} (Amount: ${item.amount})`;  // Option text
        selectElement.appendChild(option);
    });
};

// Call the function to populate the dropdown when the page loads
document.addEventListener('DOMContentLoaded', populateItemIds);

document.addEventListener('DOMContentLoaded', function() {
    // Function to handle form submission
    document.getElementById('modify-stock-form').addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent the form from submitting the traditional way

        // Get the form data
        const itemId = document.getElementById('item-id').value;
        const newAmount = document.getElementById('new-amount').value;

        // Make sure the data is valid
        if (itemId && newAmount >= 0) {
            // Send the data to the backend to update the stock
            const response = await fetch('/api/update_stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId, amount: newAmount })
            });

            // Handle the response from the backend
            if (response.ok) {
                alert('Stock updated successfully!');
                // Optionally, refresh the stock data or update the UI to reflect the change
                addDataToHTML(); // Assuming this function refreshes the stock list
            } else {
                alert('Failed to update stock.');
            }
        } else {
            alert('Please enter valid data.');
        }
    });
});



// Function to get stock data from the backend
const getStockData = async () => {
    const response = await fetch('/api/stock'); // Fetch stock data from the backend API
    const stockData = await response.json();  // Parse the JSON response
    return stockData;  // Return an array of stock objects
};

// Function to add product data and stock information to HTML
const addDataToHTML = async () => {
    // Remove default data from HTML
    listProductHTML.innerHTML = '';

    // Fetch the stock data from the backend
    const stockData = await getStockData();
    const priceData = await getPriceData();

    // Add new data
    if (listProducts.length > 0) { // If data exists
        listProducts.forEach(product => {
            // Find stock info based on item_id
            const stockInfo = stockData.find(stock => stock.item_id === product.id);
            const priceInfo = priceData.find(price => price.item_id === product.id);

            // If stock info exists, get the amount; otherwise, set to 0
            const stockAmount = stockInfo ? stockInfo.amount : 0;
            const priceAmount = priceInfo ? priceInfo.price : 0;

            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
                <img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">${priceAmount} SEK</div>
                <div class="stock">Stock: ${stockAmount}</div>  
                <button class="addCart" ${stockAmount > 0 ? '' : 'disabled'}>
                    ${stockAmount > 0 ? 'Add To Cart' : 'Out of Stock'}
                </button>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
};
//-----------------------------Modify Price---------------------------------------------------
// Function to fetch price data and populate the dropdown
const getprice = async () => {
    const response = await fetch('/api/price');  // Get price data from the backend
    const priceData = await response.json();    // Parse the JSON response

    const selectElement = document.getElementById('item-id-price');

    // Populate the dropdown options with item_id from price data
    priceData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.item_id;  // Set the value of the option to item_id
        option.textContent = `Item ID: ${item.item_id} (Price: ${item.price})`;  // Option text
        selectElement.appendChild(option);
    });
};

// Call the function to populate the dropdown when the page loads
document.addEventListener('DOMContentLoaded', getprice);
document.addEventListener('DOMContentLoaded', function() {
    // Function to handle form submission
    document.getElementById('modify-price-form').addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent the form from submitting the traditional way

        // Get the form data
        const itemId = document.getElementById('item-id-price').value;
        const newPrice = document.getElementById('new-price').value;

        // Make sure the data is valid
        if (itemId && newPrice >= 0) {
            // Send the data to the backend to update the price
            const response = await fetch('/api/update_price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId, price: newPrice })
            });

            // Handle the response from the backend
            if (response.ok) {
                alert('price updated successfully!');
                // Optionally, refresh the price data or update the UI to reflect the change
                addDataToHTML(); // Assuming this function refreshes the price list
            } else {
                alert('Failed to update price.');
            }
        } else {
            alert('Please enter valid data.');
        }
    });
});

// Function to get price data from the backend
const getPriceData = async () => {
    const response = await fetch('/api/price'); // Fetch price data from the backend API
    const priceData = await response.json();  // Parse the JSON response
    return priceData;  // Return an array of price objects
};

//----------------------------------------------------------------------------------------------------
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
   
}
const addCartToMemory = () => {
    sessionStorage.setItem('cart', JSON.stringify(carts));
};

const addCartToHTML = async () => {

    const priceData = await getPriceData();

    listCartHTML.innerHTML = ''; // Clear cart display
    let totalQuantity = 0; // Variable for the total quantity in the cart
    let groupedItems = {}; // Object to group items by their name or product type

    if (carts.length > 0) {
        // Loop through each item in the cart
        carts.forEach(cart => {
            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            let info = listProducts[positionProduct];

            // Find the corresponding price info
            const priceInfo = priceData.find(price => price.item_id === info.id);
            const priceAmount = priceInfo ? priceInfo.price : 0; // Get the price or default to 0

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
                <div class="totalPrice">${priceAmount * cart.quantity} SEK</div>
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





