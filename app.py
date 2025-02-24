from flask import Flask, jsonify, render_template, redirect, url_for, request
import psycopg2

app = Flask(__name__)

#   Database setup for retailers database
def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_db",
        user="d0018e",
        password="pass",
        host="51.21.197.33",
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
    stock = "SELECT * FROM test"
    cur.execute(stock)
    results = cur.fetchall()
    
    #prints out in terminal
    #for row in cur.fetchall():
    #    print (row, '\n')
    
    conn.commit()
    cur.close()
    conn.close()

    #prints out on webpage stock.html
    return render_template('stock.html', results=results)
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
        INSERT INTO test (amount, color, model, price, order_ID, customer)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cur.execute(insert_query, (amount, color, model, price, order_ID, customer))

    conn.commit()
    cur.close()
    conn.close()

    # Return a success message as a JSON response
    return jsonify({"message": "inserted"})


@app.route('/create_product_table')
def create_product_table():
    conn = connect_db()
    cur = conn.cursor()
    table = "CREATE TABLE IF NOT EXIST products (item_ID SERIAL PRIMARY KEY, amount VARCHAR(255), color VARCHAR(255), model VARCHAR(255), price VARCHAR(255), order_ID VARCHAR(255), customer VARCHAR(255))" 
    cur.execute(table)
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Product table created successfully"})

@app.route('/drop_table')
def drop_table():
    conn = connect_db()
    cur = conn.cursor()
    drop = "DROP TABLE test" 
    cur.execute(drop)
    conn.commit()
    cur.close()
    conn.close()

    #
    return render_template('retailer.html')
    #return jsonify({"message": "Removed Stock"})

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