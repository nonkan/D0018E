from flask import Flask
import psycopg2

app = Flask(__name__)

def connect_db():
    try:
        conn = psycopg2.connect(
            dbname="d0018e_retailer",
            user="d0018e",
            password="pass",
            host="localhost",  # Update as needed
            port="5432"
        )
        return conn
    except Exception as e:
        print("Unable to connect to the database:", e)
        return None

@app.route('/')
def home():
    return "Hello, World!"

if __name__ == '__main__':
    # For Gunicorn, app.run() isn't needed, it's handled by Gunicorn
    app.config["ENV"] = "production"  # Set to production environment
