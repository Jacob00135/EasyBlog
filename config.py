import os
import sqlite3
from werkzeug.security import generate_password_hash
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_moment import Moment

root_path = os.path.dirname(__file__)
db_path = os.path.join(root_path, 'database_sqlite')
if not os.path.exists(db_path):
    os.mkdir(db_path)

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.login_message = '你需要登录才能进行此操作'
moment = Moment()


class Config(object):
    # 密钥
    SECRET_KEY = os.urandom(16)

    # 管理员用户和密码
    FLASK_ADMIN_USERNAME = os.environ.get('FLASK_ADMIN_USERNAME')
    if FLASK_ADMIN_USERNAME is None:
        raise ValueError('环境变量中必须要设置FLASK_ADMIN_USERNAME的值！')
    FLASK_ADMIN_PASSWORD = os.environ.get('FLASK_ADMIN_PASSWORD')

    # 数据库配置
    DATABASE_PATH = os.path.join(db_path, 'db.sqlite')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///{}'.format(DATABASE_PATH)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 用户名不允许出现的字符
    USER_NAME_ILLEGAL_CHAR = '[^a-zA-Z0-9@()_-]'
    USER_NAME_CHAR_HINT = '用户名规则：数字、字母、*()_-中的3-16个字符'

    # 密码不允许出现的字符
    USER_PASSWORD_ILLEGAL_CHAR = '[^a-zA-Z0-9@()_-]'
    USER_PASSWORD_CHAR_HINT = '密码规则：数字、字母、*()_-中的6-16个字符'

    # Markdown图片保存路径
    MARKDOWN_IMAGE_ROUTE_PREFIX = '/static/images/markdown-images'
    MARKDOWN_IMAGE_PATH = os.path.join(root_path, MARKDOWN_IMAGE_ROUTE_PREFIX[1:])

    # 分页时，每一页能显示的条目数
    PAGE_MAX_FILE_NUMBER = int(os.environ.get('FLASK_PAGE_MAX', 20))

    @staticmethod
    def init_app(app):
        if not os.path.exists(Config.MARKDOWN_IMAGE_PATH):
            os.makedirs(Config.MARKDOWN_IMAGE_PATH)


from utils import check_username, check_password


def init_database():
    # 连接数据库，同时也能在数据库不存在时创建数据库
    con = sqlite3.connect(Config.DATABASE_PATH)
    cursor = con.cursor()

    # 建表：users
    cursor.execute("""CREATE TABLE IF NOT EXISTS `users`(
        `user_id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `user_name` VARCHAR(255) NOT NULL UNIQUE,
        `user_password_hash` VARCHAR(128) NOT NULL
    );""")
    con.commit()

    # 添加管理员账户
    result = cursor.execute('SELECT COUNT(*) FROM `users`;').fetchone()
    if result[0] <= 0:
        admin_username = Config.FLASK_ADMIN_USERNAME
        admin_password = Config.FLASK_ADMIN_PASSWORD
        assert check_username(admin_username), Config.USER_NAME_CHAR_HINT
        assert check_password(admin_password), Config.USER_PASSWORD_CHAR_HINT
        admin_password_hash = generate_password_hash(admin_password)
        cursor.execute(
            'INSERT INTO `users`(`user_name`, `user_password_hash`) VALUES(?, ?);',
            (admin_username, admin_password_hash)
        )
        con.commit()

    # 建表：article
    cursor.execute("""CREATE TABLE IF NOT EXISTS `article`(
        `article_id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `article_title` VARCHAR(255) NOT NULL UNIQUE,
        `article_source_markdown` TEXT NOT NULL DEFAULT '',
        `article_create_time` INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `article_last_modify_time` INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );""")
    con.commit()

    # 关闭连接
    cursor.close()
        


def create_app():
    # 选择环境
    app = Flask(__name__)
    app.config.from_object(Config)
    Config.init_app(app)

    # Flask扩展配置
    db.init_app(app)
    login_manager.init_app(app)
    moment.init_app(app)

    # 初始化数据库
    init_database()

    return app
