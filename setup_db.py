import sqlite3
from typing import Dict
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

#Create user table
def create_user_table(conn):
    """Create table."""
    cur = conn.cursor()
    try:
        sql = ("CREATE TABLE users ("
               "userid INTEGER PRIMARY KEY, "
               "username VARCHAR(20) NOT NULL, "
               "password VARCHAR(120) NOT NULL, "
               "role TEXT, "
               "UNIQUE(username))")
        cur.execute(sql)
        conn.commit
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    else:
        print("User table created.")
    finally:
        cur.close()

#Create post table
def create_post_table(conn):
    """Create table."""
    cur = conn.cursor()
    try:
        sql = ("CREATE TABLE posts ("
               "postid INTEGER PRIMARY KEY, "
               "title VARCHAR(120) NOT NULL, "
               "imgUrl VARCHAR(255), "
               "content VARCHAR(255), "
               "datetime timestamp)")
        cur.execute(sql)
        conn.commit
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    else:
        print("Post table created.")
    finally:
        cur.close()

#Create post table
def create_comments_table(conn):
    """Create table."""
    cur = conn.cursor()
    try:
        sql = ("CREATE TABLE comments ("
               "commentid INTEGER PRIMARY KEY, "
               "comment VARCHAR(255) NOT NULL,"
               "postid INTEGER,"
               "username VAERCHAR(255),"
               "FOREIGN KEY(postid) REFERENCES posts(postid),"
                "FOREIGN KEY(username) REFERENCES users(username))")
        cur.execute(sql)
        conn.commit()
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    else:
        print("Comment table created.")
    finally:
        cur.close()

#Add user to user table, and returns user id in console
def add_user(conn, username, password, role="user"):
    cur = conn.cursor()
    try:
        sql = ("INSERT INTO users (username, password, role) VALUES (?,?,?)")
        cur.execute(sql, (username, password,role))
        conn.commit()
    except sqlite3.Error as err:
        print("Error in add user: {}".format(err))
        return -1
    else:
        print("User {} created with id {}.".format(username, cur.lastrowid))
        return cur.lastrowid
    finally:
        cur.close()

def check_users(conn, username):
    cur = conn.cursor()
    sql = ("SELECT username FROM Users WHERE username = ?")
    cur.execute(sql, (username,))
    data=cur.fetchall()
    print(data)
    if len(data) == 0:
        return False #No one uses this name
    else:
        return True #Name is used
        


def add_post(conn, title, imgUrl, content, datetime):
    cur = conn.cursor()
    try:
        sql = ('INSERT INTO posts (title, imgUrl, content, datetime) VALUES (?,?,?,?)') 
        cur.execute(sql, (title, imgUrl, content, datetime))
        conn.commit()
    except sqlite3.Error as err:
        print("Error: {}".format(err))
        return -1
    else:
        print("Post {} created with id {}.".format(title, cur.lastrowid))
        return cur.lastrowid
    finally:
        cur.close()

def add_comment(conn, comment, postid, username): #MÅ FIKSES MED FOREIGN KEYS NÅR LOGIN FUNKER
    cur = conn.cursor()
    try:
        sql = ('INSERT INTO comments (comment, postid, username) VALUES (?, ?,?)') 
        cur.execute(sql, (comment, postid, username))
        conn.commit()
    except sqlite3.Error as err:
        print("Error in add_comment: {}".format(err))
        return -1
    else:
        print("Comment {} added with id {}".format(comment, cur.lastrowid))
        return cur.lastrowid
    finally:
        cur.close()

def delete_comment_by_commentid(conn, commentid):
    cur = conn.cursor()
    try:
        sql = ('DELETE FROM Comments WHERE commentid = ?')
        cur.execute(sql, (commentid,))
        conn.commit()
    except sqlite3.Error as err:
        print("Error in del comment by id: {}".format(err))
        return -1
    else:
        return cur.lastrowid
    finally:
        cur.close()



def get_post_by_postid(conn, postid):
    cur = conn.cursor()
    try:
        sql = ("SELECT title, imgUrl, content FROM posts WHERE postid = ?")
        cur.execute(sql, (postid,))
        for row in cur:
            (title,imgUrl,content) = row
            return {
                "title": title,
                "imgUrl": imgUrl,
                "content": content
            }
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    finally:
        cur.close()

def get_comment_by_postid(conn, postid):
    cur = conn.cursor()
    comment_list= []
    try:
        sql = ("SELECT commentid, comment, username FROM comments WHERE postid = ?")
        cur.execute(sql, (postid,))
        for row in cur:
            (commentid, comment, username) = row
            dicto = {
                "commentid": commentid,
                "comment": comment,
                'username': username,
                'postid': postid,
            }
            comment_list.append(dicto)
        return comment_list
    except sqlite3.Error as err:
        print("Error in get cmt by postid: {}".format(err))
    finally:
        cur.close()

def get_posts(conn):
    cur = conn.cursor()
    try:
        sql = ("SELECT * FROM posts")
        post_list= []
        cur.execute(sql)
        curAll = cur.fetchall()
        for row in curAll:
            (postid,title,imgUrl,content, timestamp) = row
            
            dicto = {
                'postid': postid,
                "title": title,
                "imgUrl": imgUrl,
                "content": content,
                'timestamp': timestamp
                
            }
            post_list.append(dicto)
            post_list.reverse()
        return post_list
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    finally:
        cur.close()

def get_comments(conn):
    cur = conn.cursor()
    try:
        sql = ("SELECT commentid, comment, postid, username FROM comments")
        comment_list= []
        cur.execute(sql)
        curAll = cur.fetchall()
        for row in curAll:
            (commentid, comment, postid, username) = row
            
            dicto = {
                'commentid': commentid,
                "comment": comment,
                'postid': postid,
                'username': username
            }
            comment_list.append(dicto)
            comment_list.reverse()
        return comment_list
    except sqlite3.Error as err:
        print("Error in get_comments: {}".format(err))
    finally:
        cur.close()

#Get users details by name
def get_user_by_name(conn, username):
    cur = conn.cursor()
    try:
        sql = ("SELECT userid, username, role FROM users WHERE username = ?")
        cur.execute(sql, (username,))
        for row in cur:
            (userid,name,role) = row
            return {
                "username": name,
                "userid": userid,
                "role": role
            }
        else:
            #user does not exist
            return {
                "username": username,
                "userid": None,
                "role": None
            }
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    finally:
        cur.close()

#Get users details by name, without ID.
def password_and_user(conn, username):
    sql = ("SELECT password, username FROM users WHERE username = ?")
    try:
        cur = conn.cursor()
        cur.execute(sql, (username,))
        for i in cur:
            password, user = i
            return{
                'username': username,
                'password': password,
            }
        else:
            return None
    except sqlite3.Error as err:
        print('Error {}'.format(err))
    finally:
        cur.close()

def get_hash_for_login(conn, username):
    """Get user details from id."""
    cur = conn.cursor()
    try:
        sql = ("SELECT password FROM users WHERE username=?")
        cur.execute(sql, (username,))
        for row in cur:
            (passhash,) = row
            return passhash
        else:
            return None
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    finally:
        cur.close()

if __name__ == "__main__":
    try:
        conn = sqlite3.connect("database.db")
    except sqlite3.Error as err:
        print(err)
    else:
        create_user_table(conn)
        create_post_table(conn)
        create_comments_table(conn)
        add_user(conn,"johndoe", generate_password_hash("Joe123"), "admin")
        add_user(conn,"maryjane",generate_password_hash("LoveDogs"), "user") 
        now = datetime.datetime.now()
        add_post(conn, 'Hello world in Python', 'python_code.jpg', 'To print hello world in python you must write print(Hello world!)', now.strftime("%m/%d/%Y, %H:%M"))
        add_post(conn, 'What is python?', 'python2.png', 'Python is a programming language!',now.strftime("%m/%d/%Y, %H:%M"))
        add_comment(conn, 'This is cool!', 1, 'johndoe')
        add_comment(conn, 'Nice post!', 2, 'maryjane')
        conn.close()