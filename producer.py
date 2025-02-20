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

@app.route('/')
def home():
    return render_template('producer.html')

#-------------------------------routes between modules------------------------------------

@app.route('/goto_customer')
def goto_customer():
    return render_template('customer.html')

@app.route('/goto_designer')
def goto_designer():
    return render_template('designer.html')

@app.route('/goto_retailer')
def goto_retailer():
    return render_template('retailer.html')

@app.route('/get_orders')
def get_orders():
    conn = connect_db()
    cur = conn.cursor()
    stock = "SELECT * FROM producer"
    cur.execute(stock)
    results = cur.fetchall()
    
    #prints out in terminal
    #for row in cur.fetchall():
    #    print (row, '\n')
    
    conn.commit()
    cur.close()
    conn.close()

    #prints out on webpage stock.html
    return render_template('producer.html', results=results)


#-----------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True)

#-----------------------------------------------------------------------------------------