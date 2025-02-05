from flask import Flask
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
    return "Hello, World!"

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=4444, debug=True)