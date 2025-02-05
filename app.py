from flask import Flask, jsonify, render_template, redirect, url_for
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

@app.route('/button_clicked')
def button_clicked():
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

if __name__ == '__main__':
    app.run(debug=True)