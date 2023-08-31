from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from config import db, login_manager


class Users(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), nullable=False, unique=True)
    user_password_hash = db.Column(db.String(128), nullable=False)

    @property
    def user_password(self):
        raise AttributeError('密码属性不可读！')

    @user_password.setter
    def user_password(self, password):
        self.user_password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.user_password_hash, password)

    @property
    def is_active(self):
        return True

    @property
    def is_authenticated(self):
        return self.is_active

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.user_id)

    def __repr__(self):
        return "<Users '{}'>".format(self.user_name)


class Article(db.Model):
    __tablename__ = 'article'
    article_id = db.Column(db.Integer, primary_key=True)
    article_title = db.Column(db.String(255), nullable=False, unique=True)
    article_source_markdown = db.Column(db.Text, nullable=False, default='')
    article_create_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    article_last_modify_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return "<Article '{}'>".format(self.article_title)


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))
