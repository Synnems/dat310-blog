from datetime import datetime

from setup_db import *
import json
from flask import Flask, request, g, session

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


#Valid login check with hashing of passwords
def valid_login(username, password): 
    conn = get_db()
    hash = get_hash_for_login(conn, username)
    if hash != None:
        return check_password_hash(hash, password)
    return False
    

#Login setting session if validation when logging in
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

#Validation when registering
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

#Register add user to database if validation is true.
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

#Post with admin auth. If true, add image to path and add post to database.
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

#Post to index
@app.route('/get_post', methods=['GET', 'POST'])
def get_post():
    conn=get_db()
    getpost = get_posts(conn)
    return json.dumps(getpost)

#Post for index/postid
@app.route('/get_post_postid', methods=['POST'])
def get_post_postid():
    conn=get_db()
    data_postid = request.get_json()
    getpost = get_post_by_postid(conn, data_postid['postid'])
    return json.dumps(getpost)

#Add comment to database with auth for local storage security problems.
@app.route('/comment', methods=['POST'])
def comment():
    data_comment = request.get_json()
    conn=get_db()
    if session.get('user') == data_comment['username']:
        add_comment(conn, data_comment['comment'], data_comment['postid']['postid'], data_comment['username'])
        return json.dumps({'noHacking': True})
    else:
        return json.dumps({'noHacking': False})

#Deletes post and the belonging commnts at click if admin
@app.route('/delete_post', methods=['POST'])
def delete_post():
    postid = request.get_json()
    conn = get_db()
    delete_post_by_postid(conn, postid['postid'])
    delete_comment_by_postid(conn, postid['postid'])
    return ''

#Splits comments by posts with postid.
@app.route('/comments_get', methods=['POST'])
def comments_get():
    if request.method=="POST": 
        conn = get_db()
        data = request.get_json()
        getcomments = get_comment_by_postid(conn, data['postid']['postid'])
        return json.dumps(getcomments)
    
#Logout remove backend session
@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user',None)
    session.pop('role', None)
    return json.dumps({'loggedOut': True})

#Checks if user is logged in with backend session
@app.route('/check_user', methods=['GET'])
def check_user():
    if session.get('user') == None:
        return json.dumps({'loggedOut': True})
    else:
        return json.dumps({'loggedOut': False})

#Checks role with backend session
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