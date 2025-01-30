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
    return "Flask app with PostgreSQL running on Mac!"

if __name__ == '__main__':
    app.run(debug=True)