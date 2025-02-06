from flask import Flask, jsonify, render_template, redirect, url_for, request
import psycopg2

app = Flask(__name__)

def connect_db():
    conn = psycopg2.connect(
        dbname="d0018e_retailer",
        user="d0018e",
        password="pass",
        host="localhost",
        port="5432"
    )
    return conn

@app.route('/')
def home():
    #for database testing
    #conn = connect_db()
    #cur = conn.cursor()
    #cur.execute("CREATE TABLE test (id INT)")
    #cur.execute("DROP TABLE test")
    #conn.commit()
    #cur.close()
    #conn.close()
    #return "Startsida"
    return render_template('index.html')

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
    item_ID = request.form['item_ID']
    amount = request.form['amount']
    color = request.form['color']
    model = request.form['model']
    price = request.form['price']
    order_ID = request.form['order_ID']
    customer = request.form['customer']

    conn = connect_db()
    cur = conn.cursor()
    
    insert_query = """
        INSERT INTO test (item_ID, amount, color, model, price, order_ID, customer)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cur.execute(insert_query, (item_ID, amount, color, model, price, order_ID, customer))

    conn.commit()
    cur.close()
    conn.close()

    # Return a success message as a JSON response
    return jsonify({"message": "inserted"})

if __name__ == '__main__':
    app.run(debug=True)