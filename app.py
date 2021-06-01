from datetime import datetime

from setup_db import *
import json
from flask import Flask, request, g, session, abort

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



def valid_login(username, password):
    conn = get_db()
    hash = get_hash_for_login(conn, username)
    if hash != None:
        return check_password_hash(hash, password) #Denne returnerer false ?
    return False
    

#Login backend
@app.route('/login', methods=['POST'])
def login():
    data_login = request.get_json()
    validation = valid_login(data_login['username'], data_login['password'])
    if validation:
        conn=get_db()
        user = get_user_by_name(conn,data_login["username"])
        session['user'] = user['username']
        session['role'] = user['role']
        return json.dumps({'login': True, 'username': user['username'], 'role': user['role']})
    return json.dumps({'login': False})

def valid_register(username, password):
    conn = get_db()
    id = check_users(conn, username)
    if id == -1:
        return False
    if len(username) < 4:
        return False
    if password == '':
        return False
    else:
        return True

#Register backend
@app.route("/register", methods=["POST"])
def register():
    data_register = request.get_json()
    conn=get_db()
    id = check_users(conn, data_register['username'])
    validation = valid_register(data_register['username'], data_register['password'])
    if validation:
        hash = generate_password_hash(data_register['password'])
        add_user(conn, data_register['username'], hash, role='user')
        return json.dumps({'addSuccess': True,'username': data_register['username'], 'password': data_register['password'], 'id': id})
    else:
        return json.dumps({'addSuccess': False,'username': data_register['username'], 'password': data_register['password'], 'id': id})

#Post backend
@app.route('/post', methods=['POST'])
def post():
    if session.get('role', None) == 'admin': 
        data_post = request.get_json()
        conn=get_db()
        now = datetime.datetime.now()
        imgFile = data_post['filedata']
        starter = imgFile.find(',')
        image64 = imgFile[starter+1:]
        image64 = bytes(image64, encoding="ascii")
        im = Image.open(BytesIO(base64.b64decode(image64)))
        im.save(os.path.join("static/img/",data_post['imgUrl']))
        add_post(conn, data_post['title'], data_post['imgUrl'], data_post['content'], now.strftime("%m/%d/%Y, %H:%M"))
        return json.dumps({'posted': True})
    else:
        return json.dumps({'posted': False})

@app.route('/get_post', methods=['GET', 'POST'])
def get_post():
    conn=get_db()
    getpost = get_posts(conn)
    return json.dumps(getpost)

@app.route('/get_post_postid', methods=['POST'])
def get_post_postid():
    conn=get_db()
    data_postid = request.get_json()
    getpost = get_post_by_postid(conn, data_postid['postid'])
    return json.dumps(getpost)

@app.route('/comment', methods=['POST'])
def comment():
    data_comment = request.get_json()
    conn=get_db()
    add_comment(conn, data_comment['comment'], data_comment['postid']['postid'], data_comment['username'])
    return ''

@app.route('/comments_get', methods=['GET', 'POST'])
def comments_get():
    if request.method=="GET":
        conn = get_db()
        comments = get_comments(conn) 
        return json.dumps(comments)
    if request.method=="POST": #DENNE SKAL OGSÅ RETURNERE NAVN
        conn = get_db()
        data = request.get_json()
        getcomments = get_comment_by_postid(conn, data['postid']['postid'])
        return json.dumps(getcomments)
    

@app.route('/logout', methods=['GET'])
def logout():
    #print(session.get("user")) = Johndoe
    session.pop('user',None)
    session.pop('role', None)
    #print(session.get("user")) = None
    return json.dumps({'loggedOut': True})

@app.route('/check_user', methods=['GET'])
def check_user():
    if session.get('user') == None:
        return json.dumps({'loggedOut': True})
    else:
        return json.dumps({'loggedOut': False})


@app.route('/check_role', methods=['GET'])
def check_role():
    if session.get('user') == None:
        return({'admin': False})
    if session.get('role') == 'admin':
        return json.dumps({'admin': True})
    if session.get('role') == 'user':
        return json.dumps({'admin': False})


if __name__ == '__main__':
    app.run(debug=True)