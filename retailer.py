from flask import Flask, jsonify, render_template, redirect, url_for, request
import psycopg2

app = Flask(__name__)

#   Database setup for retailers database
def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_retailer",
        user="d0018e",
        password="pass",
        host="localhost",
        port="5432"
    )
    return conn


#   This routes is called upon when program is run
@app.route('/')
def home():
    return render_template('retailer.html')


@app.route('/show_stock')
def show_stock():
    conn = connect_db()
    cur = conn.cursor()
    stock = "SELECT * FROM retailer"
    cur.execute(stock)
    stock_results = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    #prints out on webpage stock.html
    return render_template('stock.html', stock_results=stock_results)
    #return ".."


@app.route('/insert', methods=['POST'])
def insert():
    amount = request.form['amount']
    color = request.form['color']
    model = request.form['model']
    price = request.form['price']
    order_ID = request.form['order_ID']
    customer = request.form['customer']

    conn = connect_db()
    cur = conn.cursor()
    
    insert_query = """
        INSERT INTO retailer (amount, color, model, price, order_ID, customer)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cur.execute(insert_query, (amount, color, model, price, order_ID, customer))

    conn.commit()
    cur.close()
    conn.close()

    # Return a success message as a JSON response
    return jsonify({"message": "inserted"})


@app.route('/create_table')
def create_table():
    conn = connect_db()
    cur = conn.cursor()
    table = "CREATE TABLE retailer (item_ID SERIAL PRIMARY KEY, amount VARCHAR(255), color VARCHAR(255), model VARCHAR(255), price VARCHAR(255), order_ID VARCHAR(255), customer VARCHAR(255))" 
    cur.execute(table)
    conn.commit()
    cur.close()
    conn.close()

    #
    return render_template('retailer.html')

@app.route('/drop_table')
def drop_table():
    conn = connect_db()
    cur = conn.cursor()
    drop = "DROP TABLE retailer" 
    cur.execute(drop)
    conn.commit()
    cur.close()
    conn.close()

    #
    return render_template('retailer.html')

@app.route('/process_order')
def process_order():
    # process the order in the form of removing all items with the same order_id -
    # from the stock and sending the order to producer
    conn = connect_db()
    cur = conn.cursor()
    order = "SELECT * FROM retailer WHERE order_id = (SELECT MIN(order_id) FROM retailer);"
    cur.execute(order)
    order_results = cur.fetchall()
    cleaning = "DELETE FROM retailer WHERE order_id = (SELECT MIN(order_id) FROM retailer);"
    cur.execute(cleaning)
    conn.commit()
    cur.close()
    conn.close()

    return render_template('stock.html', order_results=order_results)

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

if __name__ == '__main__':
    app.run(debug=True)