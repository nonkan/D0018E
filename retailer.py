from flask import Flask, jsonify, render_template, redirect, url_for, request
import psycopg2

app = Flask(__name__)

#   Database setup for retailers database
def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_db",
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

#------retailer.html related---------------------------

@app.route('/insertStatus', methods=['POST'])
def insertStatus():
    order_id = request.form['order_id']
    order_status = request.form['order_status']

    conn = connect_db()
    cur = conn.cursor()
    
    insert_query = """
        INSERT INTO retailer (order_id, order_status)
        VALUES (%s, %s)
    """
    cur.execute(insert_query, (order_id, order_status))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "inserted"})

@app.route('/insertInfo', methods=['POST'])
def insertInfo():
    order_id = request.form['order_id']
    item_id = request.form['item_id']
    amount = request.form['amount']
    customer = request.form['customer']

    conn = connect_db()
    cur = conn.cursor()
    
    insert_query = """
        INSERT INTO orders (order_id, item_id, amount, customer)
        VALUES (%s, %s, %s, %s)
    """
    cur.execute(insert_query, (order_id, item_id, amount, customer))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "inserted"})

@app.route('/show_orders')
def show_orders():
    conn = connect_db()
    cur = conn.cursor()
    order = "SELECT * FROM retailer"
    cur.execute(order)
    order_results = cur.fetchall()
    order2 = "SELECT * FROM orders"
    cur.execute(order2)
    order2_results = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()
    return render_template('order.html', order_results=order_results, order2_results=order2_results)


#---------order.html related---------------------------

    #to be used by producer
def check_orders():
    conn = connect_db()
    cur = conn.cursor()
    what_to_produce = "SELECT MIN(place_in_stock) FROM retailer;"
    cur.execute(what_to_produce)
    result = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return result

#to be used by producer
def order_done(order_id):
    conn = connect_db()
    cur = conn.cursor()
    change_status = "UPDATE retailer SET order_status = %s WHERE order_id = %s;"
    cur.execute(change_status,('produced',order_id,))
    conn.commit()
    cur.close()
    conn.close()
   
   #to be used by customer
def add_orders(order_id, items):
    try:
        conn = connect_db()
        cur = conn.cursor()

        insert_query = """
            INSERT INTO orders (order_id, item_id, amount, customer)
            VALUES %s
        """
        
        # Prepare a list of tuples for bulk insert
        values = [(order_id, item["item_id"], item["amount"], item["customer"]) for item in items]

        # Execute bulk insert
        psycopg2.extras.execute_values(cur, insert_query, values)

        conn.commit()
        cur.close()
        conn.close()
        return {"success": True, "message": f"Order {order_id} with {len(items)} items added successfully"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}

# API endpoint for checkout
@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    order_id = data.get("order_id")
    items = data.get("items")  # List of items

    if not order_id or not items:
        return jsonify({"success": False, "message": "Missing order details"}), 400

    result = add_orders(order_id, items)

    if result["success"]:
        return jsonify(result), 201
    else:
        return jsonify(result), 500  # Internal server error

   

def refresh_orders():
    conn = connect_db()
    cur = conn.cursor()
    order = "SELECT * FROM retailer"
    cur.execute(order)
    order_results = cur.fetchall()
    order2 = "SELECT * FROM orders"
    cur.execute(order2)
    order2_results = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()
    return(order_results, order2_results)


def clear_orders():
    conn = connect_db()
    cur = conn.cursor()
    remove = "DELETE FROM retailer WHERE order_status = 'produce' OR order_status = 'complete';"
    cur.execute(remove)
    conn.commit()
    cur.close()
    conn.close()

@app.route('/process_order')
def process_order():
    conn = connect_db()
    cur = conn.cursor()
    #select all of the same order_id that is the smallest i.e first to be produced
    order = """
        SELECT order_id FROM orders 
        WHERE order_id NOT IN (SELECT order_id FROM retailer) 
        ORDER BY order_id ASC 
        LIMIT 1;
    """
    cur.execute(order)
    row = cur.fetchone()

    if row:
        order_id = row[0]
        #insert selected order_id into order_status table
        insert_retailer = "INSERT into retailer (order_id, order_status) VALUES(%s, %s);"
        cur.execute(insert_retailer, (order_id,'in progress'))
    
    conn.commit()
    cur.close()
    conn.close()
    clear_orders()
    order_results, order2_results = refresh_orders()
    return render_template('order.html', order_results=order_results, order2_results=order2_results)

@app.route('/remove_order_status', methods=['POST'])
def remove_order_status():
    place_in_stock = request.form['place_in_stock']
    conn = connect_db()
    cur = conn.cursor()
    remove_query = """
        DELETE FROM retailer WHERE place_in_stock = %s
        """
    cur.execute(remove_query, (place_in_stock,))   
    conn.commit()
    conn.close()
    return render_template('order.html')

@app.route('/remove_order_info', methods=['POST'])
def remove_order_info():
    order_id = request.form['order_id']
    conn = connect_db()
    cur = conn.cursor()
    remove_query = """
        DELETE FROM orders WHERE order_id = %s
        """
    cur.execute(remove_query, (order_id,))   
    conn.commit()
    conn.close()
    return render_template('order.html')


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

#------------------------------------------comments----------------------------------------------

@app.route('/goto_comment')
def goto_comment():
    return render_template('comment.html')

#-----------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(port=5001, debug=True)