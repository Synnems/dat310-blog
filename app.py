from setup_db import *
import json
from flask import Flask, jsonify, render_template, request, g, session, abort, flash
import time
from time import sleep
app = Flask(__name__)
app.config.update(
    DEBUG=True,
    SECRET_KEY="some_sauce")

#db connection
def get_db():
    if not hasattr(g, "_database"):
        print("create connection")
        g._database = sqlite3.connect("database.db")
    return g._database

#Prevents flask from addin unneccasary to URL
@app.route('/', defaults = {'path': ''})

#One static file sent with flask routing. Rest of routes is in vue
@app.route('/<path:path>')
def index(path):
    return app.send_static_file('index.html')

#Checks if username-password combination is valid.
def valid_login(username, password):
    conn = get_db()
    user = password_and_user(conn,username)
    if user is None:
        return False
    if user['username'] == username and user['password'] == password:
        return True
    else:
        return False

#Login backend
@app.route('/login', methods=['POST'])
def login():
    data_login = request.get_json()
    sleep(1)
    validation = valid_login(data_login['username'], data_login['password'])
    if validation:
        conn = get_db()
        user = get_user_by_name(conn,data_login["username"])
        return json.dumps({'login': True, 'username': user['username']})
    return json.dumps({'login': False})

#Register backend
@app.route("/register", methods=["POST"])
def register():
    data_register = request.get_json()
    sleep(1)
    conn = get_db()
    add_user(conn, data_register['username'], data_register['password'], role='user')
    return json.dumps({'addSuccess': True})
    

if __name__ == '__main__':
    app.run(debug=True)