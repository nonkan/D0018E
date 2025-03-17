from flask import Flask, jsonify, render_template, redirect, url_for, request, session
import psycopg2
from psycopg2 import extras  # Import extras explicitly
from flask_cors import CORS
from flask_bcrypt import Bcrypt  # For password hashing, run in terminal:::: pip install flask-bcrypt

app = Flask(__name__)
CORS(app) 
app.secret_key = 'tomten.txt'
bcrypt = Bcrypt(app)



#   Database setup
def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_db",
        user="d0018e",
        password="pass",
        host="13.60.187.38",     #ändra till localhost eller 13.60.187.38
        port="5432"
        
    )
    return conn

#   Home page for customer
@app.route('/')
def home():
    return render_template('customer.html')

#---------------------------------------Login and register--------------------------------------------------
# Register Customer
@app.route('/register', methods=['GET','POST'])
def register():
     if request.method == 'POST':   
        username = request.form['username']
        password = request.form['password']

        conn = connect_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        existing_user = cur.fetchone()

        if existing_user:
            return "Username already exist. Try another."
        
        #insert user

        cur.execute("INSERT INTO users (username, password, admin) VALUES (%s, %s, %s)", (username, password, False))

        conn.commit()
        cur.close()
        conn.close()

        return redirect(url_for('login'))
     return render_template('register.html')


# Login Customer
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':   
        username = request.form['username']
        password = request.form['password']

        conn = connect_db()
        cur = conn.cursor()

        # Check if user exists and retrieve admin status
        cur.execute("SELECT username, admin FROM users WHERE username = %s AND password = %s", (username, password))
        user = cur.fetchone()

        cur.close()
        conn.close()

        if user:
            session['username'] = user[0]  # Store username in session
            session['admin'] = user[1]  # Store admin status in session
            
            # Return a JSON response with both the username and admin status
            return jsonify({
                'username': user[0],
                'admin': user[1]
            })
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
        
    return render_template('login.html')

#customer page
@app.route('/customer_page')
def customer_page():
    if 'username' in session:
        username = session['username']  # Get the logged-in username
        is_admin = session.get('admin', False)  # Get admin status from session

        return render_template('customer.html', username=username, admin=is_admin)
    else:
        return redirect(url_for('login'))
    
#logout
#customer page
@app.route('/logout')
def logout():
    session.pop('username',None)
    
    return redirect(url_for('login'))

#-------------------------------------stock-------------------------------------------------------
#get stock
@app.route('/api/stock', methods=['GET'])
def get_stock_data():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT item_id, amount FROM stock")  # Fetch stock data
    stock_items = cur.fetchall()
    cur.close()
    conn.close()

    # Convert the data into a list of dictionaries
    stock_data = [{"item_id": item[0], "amount": item[1]} for item in stock_items]

    # Return stock data as JSON
    return jsonify(stock_data)

#add to stock
@app.route('/api/update_stock', methods=['POST'])
def update_stock():
    data = request.get_json()  # Get JSON data sent from the frontend
    item_id = data.get('item_id')
    new_amount = data.get('amount')

    if item_id is None or new_amount is None:
        return jsonify({"error": "Invalid input"}), 400  # Bad request if data is invalid

    # Update the stock amount for the given item_id
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("UPDATE stock SET amount = %s WHERE item_id = %s", (new_amount, item_id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Stock updated successfully!"}), 200

#-------------------------------------price-------------------------------------------------------
#get price
@app.route('/api/price', methods=['GET'])
def get_preice_data():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT item_id, price FROM items")  # Fetch stock data
    price_items = cur.fetchall()
    cur.close()
    conn.close()

    # Convert the data into a list of dictionaries
    price_data = [{"item_id": item[0], "price": item[1]} for item in price_items]

    # Return stock data as JSON
    return jsonify(price_data)

#add to stock
@app.route('/api/update_price', methods=['POST'])
def update_price():
    data = request.get_json()  # Get JSON data sent from the frontend
    price = data.get('price')
    item_id = data.get('item_id')

    if price is None or item_id is None:
        return jsonify({"error": "Invalid input"}), 400  # Bad request if data is invalid

    # Update the stock amount for the given item_id
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("UPDATE items SET price = %s WHERE item_id = %s", (price, item_id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Price updated successfully!"}), 200

#-------------------------------------customer page-------------------------------------------------------

@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    items = data.get("items")
    customer_name = data.get("customer")

    if not items or not customer_name:
        return jsonify({"success": False, "message": "Missing order details"}), 400

    # Loop through each item in the cart and add them to the shopping cart
    for item in items:
        item_data = {
            "item_id": item.get("item_id"),
            "amount": item.get("amount"),
            "total_price": item.get("totalprice"),
            "customer": customer_name,
        }

        # Add item to the shopping cart (insert into DB)
        add_to_cart(item_data)

    return jsonify({"success": True, "message": "Order placed successfully!"}), 200


def add_to_cart(item_data):
    try:
        item_id = item_data["item_id"]
        amount = item_data["amount"]
        total_price = item_data["total_price"]
        customer = item_data["customer"]

        conn = connect_db()
        cur = conn.cursor()

        insert_query = """
            INSERT INTO shopping_cart (item_id, amount, total_price, customer)
            VALUES (%s, %s, %s, %s)
        """
        cur.execute(insert_query, (item_id, amount, total_price, customer))

        conn.commit()
        cur.close()
        conn.close()

        print(f"Item {item_id} added to cart successfully!")

    except Exception as e:
        print(f"Error adding item {item_id} to cart: {str(e)}")


#-----------------------Adding items from json to the items table----------------------------
@app.route('/api/add_items', methods=['POST'])
def add_items():
    data = request.get_json()  # Receive JSON data from frontend
    print("Received data:", data)  # Debugging

    if not data or not isinstance(data, list):
        return jsonify({"error": "Invalid input"}), 400

    conn = connect_db()
    cur = conn.cursor()

    try:
        for item in data:
            item_id = item.get('id')
            color = item.get('color')
            model = item.get('model')
            price = item.get('price')

            if None in (item_id, color, model, price):
                continue  # Skip invalid entries

            # Update the existing item in the items table
            cur.execute("""
                UPDATE items
                SET color = %s, model = %s, price = %s
                WHERE item_id = %s
            """, (color, model, price, item_id))

        conn.commit()
        return jsonify({"message": "Items updated successfully!"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


#-----------------------------Dont know if this is needed--------------------------------------------------------------------
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



#---------------------------------------comments--------------------------------------------------

@app.route('/goto_comment')
def goto_comment():
    return render_template('comment.html')

# ✅ API to get comments (Now includes item_id)
@app.route('/get_comments', methods=['GET'])
def get_comments():
    conn = connect_db()
    cur = conn.cursor()
    
    # Fetch comments with item_id
    cur.execute("SELECT comment_id, comment, customer, item_id, created_at FROM comments ORDER BY created_at DESC")
    comments = cur.fetchall()

    cur.close()
    conn.close()

    # Convert to JSON format
    comments_list = [
        {
            "id": c[0],
            "text": c[1],
            "customer": c[2],
            "item_id": c[3],
            "created_at": c[4].strftime("%Y-%m-%d %H:%M:%S")
        }
        for c in comments
    ]

    return jsonify(comments_list)

@app.route('/add_comment', methods=['POST'])
def add_comment():
    data = request.json
    comment_text = data.get("comment")
    customer_name = data.get("customer")
    item_id = data.get("cap")  # ✅ Now storing the checkbox value as item_id

    # Ensure all required fields are provided
    if not comment_text or not customer_name or not item_id:
        return jsonify({"success": False, "message": "Missing comment, customer name, or item_id"}), 400

    conn = connect_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO comments (comment, customer, item_id) VALUES (%s, %s, %s) RETURNING comment_id",
            (comment_text, customer_name, item_id)
        )
        comment_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"success": True, "message": "Comment added!", "comment_id": comment_id})


#-----------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
