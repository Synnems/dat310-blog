import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

#Create user table
def create_user_table(conn):
    """Create table."""
    cur = conn.cursor()
    try:
        sql = ("CREATE TABLE users ("
               "userid INTEGER, "
               "username VARCHAR(20) NOT NULL, "
               "password VARCHAR(120) NOT NULL, "
               "role TEXT, "
               "PRIMARY KEY(userid) "
               "UNIQUE(username))")
        cur.execute(sql)
        conn.commit
    except sqlite3.Error as err:
        print("Error: {}".format(err))
    else:
        print("Table created.")
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
        print("Error: {}".format(err))
        return -1
    else:
        print("User {} created with id {}.".format(username, cur.lastrowid))
        return cur.lastrowid
    finally:
        cur.close()

#Get users details by name
def get_user_by_name(conn, username):
    cur = conn.cursor()
    try:
        sql = ("SELECT userid, username, role FROM users WHERE username = ?")
        cur.execute(sql, (username,))
        for row in cur:
            (id,name,role) = row
            return {
                "username": name,
                "userid": id,
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

if __name__ == "__main__":
    try:
        conn = sqlite3.connect("database.db")
    except sqlite3.Error as err:
        print(err)
    else:
        create_user_table(conn)
        add_user(conn,"johndoe", "Joe123", "admin")
        add_user(conn,"maryjane","LoveDogs", "admin") 
        conn.close()