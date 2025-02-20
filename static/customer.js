
let iconCart = document.querySelector('.icon-cart'); //Shopping cart window appear when you click on icon
let closeCart = document.querySelector('.close');
let body = document.querySelector('body'); //Shopping cart window to appear
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCartSpan = document.querySelector('.icon-cart span');

let listProducts = [];
let carts = [];



iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
})

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
                newProduct.dataset.id = product.id;
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
//const addCartToMemory = () => {
   // localStorage.setItem('cart', JSON.stringify(cart));
//}
const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if(carts.length > 0){
        carts.forEach(cart => {
            totalQuantity = totalQuantity +  cart.quantity;
            let newCart = document.createElement('div');
            newCart.classList.add('item');
            newCart.dataset.id = cart.product_id;

            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            let info = listProducts[positionProduct];
            listCartHTML.appendChild(newCart);
            newCart.innerHTML = `
            <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">
                ${info.name}
                </div>
                <div class="totalPrice">${info.price * cart.quantity}SEK</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${cart.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
        })
    }
    iconCartSpan.innerText = totalQuantity;
}
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
    if(positionItemInCart >= 0){
        let info = carts[positionItemInCart];
        switch (type) {
            case 'plus':
                carts[positionItemInCart].quantity = carts[positionItemInCart].quantity + 1;
                break;
        
            default:
                let changeQuantity = carts[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    carts[positionItemInCart].quantity = changeQuantity;
                }else{
                    carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    //addCartToMemory();
}
const initApp = () => {
    //get data
    fetch('/static/products.json')  
    .then(response => response.json())
    .then(data => {
        listProducts = data;
        addDataToHTML();

         //get data cart from memory
        //if(localStorage.getItem('cart')){
            //carts = JSON.parse(localStorage.getItem('cart'));
            //addCartToHTML();
       // }
    })
}
initApp();

//------------------------------------------------------------------------------------------
//TODO CREATE A TABLE IN DATABASE WHEN CLICKED ON ITEM



