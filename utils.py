import psycopg2


def get_conn():
    conn = psycopg2.connect(database='learning_analysis', user='pyskell', password='')
    return conn
