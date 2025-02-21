from flask import Flask, jsonify, render_template, redirect, url_for, request
import psycopg2

app = Flask(__name__)

#   Database setup
def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_db",
        user="d0018e",
        password="pass",
        host="51.21.197.33",
        port="5432"
    )
    return conn

#   Home page for customer
@app.route('/')
def home():
    return render_template('customer.html')


@app.route('/show_cart')
def show_cart():
    conn = connect_db()
    cur = conn.cursor()
    query = "SELECT * FROM customer"
    cur.execute(query)
    results = cur.fetchall()
    
    
    conn.commit()
    cur.close()
    conn.close()

    #prints out on webpage stock.html
    return render_template('customer.html', results=results)
    #return ".."

@app.route('/add_to_cart', methods=['POST'])
def insert():
    item_id = request.form['item_id']
    amount = request.form['amount']
    color = request.form['color']
    model = request.form['model']
    price = request.form['price']
    order_id = request.form['order_id']
    customer = request.form['customer']

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


@app.route('/create_cart_table')
def create_cart_table():
    conn = connect_db()
    cur = conn.cursor()
    create_table_query = """
        CREATE TABLE shopping_cart (
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

@app.route('/drop_cart_table')
def drop_cart_table():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DROP TABLE shopping_cart")
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Shopping cart table deleted!"})

#-------------------------------routes between modules------------------------------------

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


#-----------------------------------------------------------------------------------------
#-----------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
