document.addEventListener("DOMContentLoaded", () => {
    const iconCart = document.querySelector(".icon-cart");
    const closeCart = document.querySelector(".close");
    const body = document.querySelector("body");
    const listProductHTML = document.querySelector(".listProduct");
    const listCartHTML = document.querySelector(".listCart");
    const iconCartSpan = document.querySelector(".icon-cart span");

    let listProducts = [];
    let carts = [];

    iconCart.addEventListener("click", () => {
        body.classList.toggle("showCart");
    });

    closeCart.addEventListener("click", () => {
        body.classList.toggle("showCart");
    });

    const addDataToHTML = () => {
        listProductHTML.innerHTML = "";
        if (listProducts.length > 0) {
            listProducts.forEach(product => {
                let newProduct = document.createElement("div");
                newProduct.classList.add("item");
                newProduct.dataset.id = product.id;
                newProduct.innerHTML = `
                    <img src="${product.image}" alt="">
                    <h2>${product.name}</h2>
                    <div class="price">$${product.price}</div>
                    <button class="addCart">Add To Cart</button>`;
                listProductHTML.appendChild(newProduct);
            });
        }
    };

    listProductHTML.addEventListener("click", (event) => {
        if (event.target.classList.contains("addCart")) {
            let product_id = event.target.parentElement.dataset.id;
            addToCart(product_id);
        }
    });

    const addToCart = (product_id) => {
        let positionInCart = carts.findIndex(cart => cart.product_id == product_id);
        if (positionInCart < 0) {
            carts.push({ product_id, quantity: 1 });
        } else {
            carts[positionInCart].quantity++;
        }
        addCartToHTML();
    };

    const addCartToHTML = () => {
        listCartHTML.innerHTML = "";
        let totalQuantity = 0;
        carts.forEach(cart => {
            let product = listProducts.find(p => p.id == cart.product_id);
            if (product) {
                totalQuantity += cart.quantity;
                let newCart = document.createElement("div");
                newCart.classList.add("item");
                newCart.dataset.id = cart.product_id;
                newCart.innerHTML = `
                    <div class="image"><img src="${product.image}"></div>
                    <div class="name">${product.name}</div>
                    <div class="totalPrice">$${(product.price * cart.quantity).toFixed(2)}</div>
                    <div class="quantity">
                        <span class="minus">&lt;</span>
                        <span>${cart.quantity}</span>
                        <span class="plus">&gt;</span>
                    </div>`;
                listCartHTML.appendChild(newCart);
            }
        });
        iconCartSpan.innerText = totalQuantity;
    };

    listCartHTML.addEventListener("click", (event) => {
        let product_id = event.target.closest(".item")?.dataset.id;
        if (product_id) {
            if (event.target.classList.contains("minus")) {
                changeQuantityCart(product_id, "minus");
            } else if (event.target.classList.contains("plus")) {
                changeQuantityCart(product_id, "plus");
            }
        }
    });

    const changeQuantityCart = (product_id, type) => {
        let positionInCart = carts.findIndex(cart => cart.product_id == product_id);
        if (positionInCart >= 0) {
            if (type === "plus") {
                carts[positionInCart].quantity++;
            } else {
                carts[positionInCart].quantity--;
                if (carts[positionInCart].quantity <= 0) {
                    carts.splice(positionInCart, 1);
                }
            }
        }
        addCartToHTML();
    };

    const initApp = () => {
        //fetch("/static/products.json")
        fetch("/products")
            .then(response => response.json())
            .then(data => {
                listProducts = data;
                addDataToHTML();
            });
    };

    initApp();
});
