
let iconCart = document.querySelector('.icon-cart'); //Shopping cart window appear when you click on icon
let closeCart = document.querySelector('.close');
let body = document.querySelector('body'); //Shopping cart window to appear



iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})
//------------------------------------------------------------------------------------------
//TODO CREATE A TABLE IN DATABASE WHEN CLICKED ON ITEM
const addDataToHTML = () => {
    // remove datas default from HTML

        // add new datas
        if(products.length > 0) // if has data
        {
            products.forEach(product => {
                let newProduct = document.createElement('div');
                newProduct.dataset.id = product.id;
                newProduct.classList.add('item');
                newProduct.innerHTML = 
                `<img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart">Add To Cart</button>`;
                listProductHTML.appendChild(newProduct);
            });
        }
    }

//-----------------------------------------------------------------------------------------------------------
/*document.addEventListener("DOMContentLoaded", function () {
    fetch('/shopping_cart')
        .then(response => response.json())
        .then(data => {
            let cartContainer = document.querySelector(".shoppingCart");
            cartContainer.innerHTML = ""; // Clear existing content

            data.forEach(item => {
                let cartHTML = `
                    <div class="cart-item">
                        <h2>Model: ${item.model}</h2>
                        <p>Color: ${item.color}</p>
                        <p>Amount: ${item.amount}</p>
                        <p>Customer: ${item.customer}</p>
                        <div class="price">Price: ${item.price} SEK</div>
                        <button class="removeCart" data-id="${item.place_in_shoppingcart}">Remove</button>
                    </div>
                `;
                cartContainer.innerHTML += cartHTML;
            });
        })
        .catch(error => console.error('Error fetching cart:', error));
});
*/
