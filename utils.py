import psycopg2
import os


def get_conn():
    HOST = os.environ.get('DATABASE_HOST', 'localhost')
    NAME = os.environ.get('DATABASE_NAME', 'learning_analysis')
    USER = os.environ.get('DATABASE_USER', 'pyskell')
    PASSWORD = os.environ.get('DATABASE_PASSWORD', '')
    conn = psycopg2.connect(database=NAME, user=USER, password=PASSWORD, host=HOST)
    return conn
