from flask import Flask, jsonify, render_template, redirect, url_for, request
import psycopg2
import retailer
from psycopg2 import extras  # Import extras explicitly
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
#   Database setup for retailers database
def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_db",
        user="d0018e",
        password="pass",
        host="13.60.187.38",
        port="5432"
    )
    return conn

@app.route('/')
def home():
    return render_template('producer.html')

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

@app.route('/get_orders')
def get_orders():
    order_id = retailer.check_orders()
    
    conn = connect_db()
    cur = conn.cursor()
    rows = "SELECT COUNT(*) FROM orders"
    cur.execute(rows)
    count = cur.fetchone()[0]

    if count > 0:
        stock = "SELECT * FROM orders WHERE order_id = %s"
        cur.execute(stock,(order_id,))
        results = cur.fetchall()

        
        conn.commit()
        cur.close()
        conn.close()

        return render_template('producer.html', results=results)
        
    else:
        x = "Nothing to produce!"

        conn.commit()
        cur.close()
        conn.close()

        return render_template('producer.html', x=x)
    
@app.route('/produce')
def produce():

    order_id = retailer.check_orders()
    
    conn = connect_db()
    cur = conn.cursor()

    stock = "SELECT * FROM orders WHERE order_id = %s"
    cur.execute(stock,(order_id,))
    results = cur.fetchall()

    item_id = results[0][2]
    amount = results[0][3]

    rows = "SELECT COUNT(*) FROM producer WHERE item_id = %s AND amount = %s"
    cur.execute(rows, (item_id,amount))
    count = cur.fetchone()[0]

    if count <= 0:
        order = "INSERT INTO producer VALUES(%s, %s) ON CONFLICT DO NOTHING"
        cur.execute(order,(item_id, amount))
    
    select = "SELECT * FROM producer"
    cur.execute(select)
    produce = cur.fetchall()

    conn.commit()
    cur.close()
    conn.close()

    return render_template('producer.html', produce=produce)

#-----------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

#-----------------------------------------------------------------------------------------
#INSERT INTO producer (item_id, amount, color, model, order_id) VALUES (2, 2, 2, 2, 2)
#delete from producer
#SELECT * FROM producer