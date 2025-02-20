from flask import Flask, jsonify, render_template, request
import psycopg2

app = Flask(__name__)

# Database setup
def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_db",
        user="d0018e",
        password="pass",
        host="51.21.197.33",
        port="5432"
    )
    return conn

# Home page for customer
@app.route('/')
def home():
    return render_template('customer.html')

# Fetch product list dynamically
@app.route('/products', methods=['GET'])
def get_products():
    conn = connect_db()
    cur = conn.cursor()
    
    query = "SELECT item_id, amount, color, model, price FROM test"  # Ensure `test` is your product table
    cur.execute(query)
    products = cur.fetchall()
    
    product_list = [
        {
            "id": item[0],
            "amount": item[1],
            "color": item[2],
            "model": item[3],
            "price": item[4],
            "image": "/static/cap_black.png"  # Placeholder image
        }
        for item in products
    ]

    cur.close()
    conn.close()
    
    return jsonify(product_list)

# Add product to cart
@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    data = request.json  # Expecting JSON payload
    item_id = data.get('item_id')
    amount = data.get('amount')
    color = data.get('color')
    model = data.get('model')
    price = data.get('price')
    order_id = data.get('order_id')
    customer = data.get('customer')

    conn = connect_db()
    cur = conn.cursor()
    
    insert_query = """
        INSERT INTO shopping_cart (item_id, amount, color, model, price, order_id, customer)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cur.execute(insert_query, (item_id, amount, color, model, price, order_id, customer))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Item added to cart!"})

# Create shopping cart table (if not exists)
@app.route('/create_cart_table')
def create_cart_table():
    conn = connect_db()
    cur = conn.cursor()
    create_table_query = """
        CREATE TABLE IF NOT EXISTS shopping_cart (
            shopping_cart_id SERIAL PRIMARY KEY,
            item_id INT REFERENCES test(item_id),
            amount VARCHAR(255),
            color VARCHAR(255),
            model VARCHAR(255),
            price VARCHAR(255),
            order_id VARCHAR(255),
            customer VARCHAR(255)
        )
    """
    cur.execute(create_table_query)
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Shopping cart table created!"})

# Drop shopping cart table
@app.route('/drop_cart_table')
def drop_cart_table():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS shopping_cart")
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Shopping cart table deleted!"})

# Routes between modules
@app.route('/goto_customer')
def goto_customer():
    return render_template('customer.html')

@app.route('/goto_producer')
def goto_producer():
    return render_template('producer.html')

@app.route('/goto_designer')
def goto_designer():
    return render_template('designer.html')

@app.route('/goto_retailer')
def goto_retailer():
    return render_template('retailer.html')

if __name__ == '__main__':
    app.run(debug=True)
