from setup_db import *
import json
from flask import Flask, request, g
from time import sleep

from io import BytesIO
import base64
import os
from PIL import Image



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

def valid_role(conn, username, role):
    conn = get_db()
    

#Checks if username-password combination is valid.
def valid_login(username, password):
    conn=get_db()
    conn.execute("PRAGMA foreign_keys = ON")
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
        conn=get_db()
        conn.execute("PRAGMA foreign_keys = ON")
        user = get_user_by_name(conn,data_login["username"])
        return json.dumps({'login': True, 'username': user['username'], 'role': user['role']})
    return json.dumps({'login': False})

#Register backend
@app.route("/register", methods=["POST"])
def register():
    data_register = request.get_json()
    sleep(1)
    conn=get_db()
    conn.execute("PRAGMA foreign_keys = ON")
    add_user(conn, data_register['username'], data_register['password'], role='user')
    return json.dumps({'addSuccess': True})

#Post backend
@app.route('/post', methods=['POST'])
def post():
    data_post = request.get_json()
    conn=get_db()
    conn.execute("PRAGMA foreign_keys = ON")
    add_post(conn, data_post['title'], data_post['imgUrl'], data_post['content'])
    return json.dumps({'posted': True})

@app.route('/get_post', methods=['GET', 'POST'])
def get_post():
    conn=get_db()
    conn.execute("PRAGMA foreign_keys = ON")
    getpost = get_posts(conn)
    return json.dumps(getpost)

@app.route('/get_post_postid', methods=['POST'])
def get_post_postid():
    conn=get_db()
    conn.execute("PRAGMA foreign_keys = ON")
    data_postid = request.get_json()
    getpost = get_post_by_postid(conn, data_postid['postid'])
    return json.dumps(getpost)

@app.route('/comment', methods=['POST'])
def comment():
    data_comment = request.get_json()
    conn=get_db()
    conn.execute("PRAGMA foreign_keys = ON")
    print('postid', data_comment['postid'])
    add_comment(conn, data_comment['comment'], data_comment['postid'])
    return ''

@app.route('/comments_get', methods=['GET'])
def comments_get():
    conn=get_db()
    conn.execute("PRAGMA foreign_keys = ON")
    getcomments = get_comments(conn)
    return json.dumps(getcomments)

    

if __name__ == '__main__':
    app.run(debug=True)