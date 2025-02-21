CREATE TABLE customers (
    place_in_shoppingcart SERIAL PRIMARY KEY,
    order_ID VARCHAR(255) UNIQUE,
    item_ID INTEGER,
    amount VARCHAR(255),
    color VARCHAR(255),
    model VARCHAR(255),
    price VARCHAR(255),
    customer_name VARCHAR(255)
);

CREATE TABLE retailer (
    item_ID SERIAL PRIMARY KEY,
    amount VARCHAR(255),
    color VARCHAR(255),
    model VARCHAR(255),
    price VARCHAR(255),
    order_ID VARCHAR(255),
    customer VARCHAR(255)
);

CREATE TABLE producer (
    production_id SERIAL PRIMARY KEY,
    item_id INTEGER,
    amount VARCHAR(255),
    color VARCHAR(255),
    model VARCHAR(255),
    order_id VARCHAR(255)
);

ALTER TABLE customers 
ADD CONSTRAINT fk_customers_item FOREIGN KEY (item_ID) 
REFERENCES retailer(item_ID) ON DELETE CASCADE;

ALTER TABLE retailer 
ADD CONSTRAINT fk_retailer_order FOREIGN KEY (order_ID) 
REFERENCES customers(order_ID) ON DELETE CASCADE;

ALTER TABLE producer 
ADD CONSTRAINT fk_producer_item FOREIGN KEY (item_id) 
REFERENCES retailer(item_ID) ON DELETE CASCADE;

ALTER TABLE producer 
ADD CONSTRAINT fk_producer_order FOREIGN KEY (order_id) 
REFERENCES customers(order_ID) ON DELETE CASCADE;