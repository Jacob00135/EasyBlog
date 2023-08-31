import re
from flask import render_template, request, jsonify, redirect, url_for, flash
from flask_login import current_user, login_user, login_required, logout_user
from config import Config, db
from utils import check_username, check_password
from app import app
from model import Users


@app.route('/login', methods=['GET', 'POST'])
def login():
    # 避免重复登录
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'GET':
        return render_template(
            'login.html',
            title='登录',
            form='login',
            Config=Config
        )

    # 检查用户名
    user_name = request.form.get('username', '', type=str)
    user = Users.query.filter_by(user_name=user_name).first()
    if user is None:
        flash('用户名不存在！')
        return redirect(url_for('login'))

    # 检查密码
    user_password = request.form.get('password', '', type=str)
    if not user.verify_password(user_password):
        flash('密码错误！')
        return redirect(url_for('login'))

    # 登录成功
    login_user(user, True)

    return redirect(url_for('index'))


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/update_user_name', methods=['GET', 'POST'])
@login_required
def update_user_name():
    if request.method == 'GET':
        return render_template(
            'login.html',
            title='更改用户名',
            form='update-user-name',
            Config=Config
        )

    # 检查合法性
    new_username = request.form.get('new-username', '', type=str)
    if not check_username(new_username):
        flash(Config.USER_NAME_CHAR_HINT)
        return render_template(
            'login.html',
            title='更改用户名',
            form='update-user-name',
            Config=Config
        )

    # 检查是否重名
    if Users.query.filter_by(user_name=new_username).first() is not None:
        flash('用户名已存在！')
        return render_template(
            'login.html',
            title='更改用户名',
            form='update-user-name',
            Config=Config
        )

    # 更改用户名
    current_user.user_name = new_username
    db.session.add(current_user)
    db.session.commit()

    return redirect(url_for('index'))


@app.route('/update_password', methods=['GET', 'POST'])
@login_required
def update_password():
    if request.method == 'GET':
        return render_template(
            'login.html',
            title='更改密码',
            form='update-password',
            Config=Config
        )

    # 检查合法性
    new_password = request.form.get('new-password', '', type=str)
    if not check_password(new_password):
        flash(Config.USER_PASSWORD_CHAR_HINT)
        return render_template(
            'login.html',
            title='更改密码',
            form='update-password',
            Config=Config
        )

    # 更改密码
    current_user.user_password = new_password
    db.session.add(current_user)
    db.session.commit()

    # 登出
    logout_user()
    return redirect(url_for('login'))
