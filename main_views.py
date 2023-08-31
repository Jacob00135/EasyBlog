import os
from functools import wraps
from datetime import datetime
from flask import render_template, jsonify, request, redirect, flash, url_for, abort
from flask_login import login_required, current_user
from config import Config, db
from utils import convert_markdown
from model import Article
from app import app


def login_required_post(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'status': 0, 'message': '无权限'})
        return f(*args, **kwargs)
    return decorator


@app.errorhandler(404)
def forbidden(e):
    return render_template('404.html'), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return render_template('404.html'), 405


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500


@app.route('/')
def index():
    search_keyword = request.args.get('search-keyword', None)
    if search_keyword is None:
        article_list = Article.query.order_by(Article.article_last_modify_time.desc()).all()
        return render_template('index.html', article_list=article_list)

    article_list = Article.query.filter(
        Article.article_title.like('%{}%'.format(search_keyword))
    ).order_by(Article.article_last_modify_time.desc()).all()

    return render_template('index.html', article_list=article_list)


@app.route('/edit_article/<int:article_id>')
@login_required
def edit_article(article_id):
    article = Article.query.get(article_id)
    if article is None:
        abort(404)

    article_html = convert_markdown(article.article_source_markdown)

    return render_template(
        'edit-article.html',
        article=article,
        article_html=article_html
    )


@app.route('/create_article', methods=['GET', 'POST'])
@login_required
def create_article():
    if request.method == 'GET':
        return render_template('create-article.html')

    title = request.form.get('article-title', '', type=str)
    if title == '' or len(title) > 255:
        flash('标题长度应小于256')
        return render_template('create-article.html')

    if Article.query.filter_by(article_title=title).first() is not None:
        flash('文章标题已存在')
        return render_template('create-article.html')

    article = Article(article_title=title)
    db.session.add(article)
    db.session.commit()

    return redirect(url_for('edit_article', article_id=article.article_id))


@app.route('/md_to_html', methods=['POST'])
@login_required_post
def md_to_html():
    src = request.json.get('source_markdown', '')
    html = convert_markdown(src)
    return jsonify({'status': 1, 'data': html})


@app.route('/update_article_title', methods=['POST'])
@login_required_post
def update_article_title():
    # 获得文章对象
    request_json = request.json
    article_id = request_json.get('article-id', None)
    if article_id is None:
        return jsonify({'status': 0, 'message': '缺少参数：article-id'})
    article = Article.query.get(article_id)
    if article is None:
        return jsonify({'status': 0, 'message': '文章不存在'})

    # 设置新标题
    new_title = request_json.get('article-title', '')
    if new_title == '' or len(new_title) > 255:
        return jsonify({'status': 0, 'message': '标题长度应小于256'})
    if Article.query.filter_by(article_title=new_title).first() is not None:
        return jsonify({'status': 0, 'message': '文章标题已存在'})
    if article.article_title == new_title:
        return jsonify({'status': 0, 'message': '新旧标题相同'})
    article.article_title = new_title
    db.session.commit()

    return jsonify({'status': 1, 'message': '修改成功'})


@app.route('/save_article', methods=['POST'])
@login_required_post
def save_article():
    # 获得文章对象
    article_id = request.json.get('article-id', None)
    if article_id is None:
        return jsonify({'status': 0, 'message': '缺少参数：article-id'})
    article = Article.query.get(article_id)
    if article is None:
        return jsonify({'status': 0, 'message': '文章不存在'})

    # 保存文章
    article_source_markdown = request.json.get('article-source-markdown', None)
    if article_source_markdown is None:
        return jsonify({'status': 0, 'message': '缺少参数：article-source-markdown'})
    article.article_source_markdown = article_source_markdown
    article.article_last_modify_time = datetime.utcnow()
    db.session.commit()

    return jsonify({'status': 1, 'message': '保存成功'})


@app.route('/article/<int:article_id>')
def show_article(article_id):
    article = Article.query.get(article_id)
    if article is None:
        abort(404)

    article_html = convert_markdown(article.article_source_markdown)

    return render_template(
        'article.html',
        article=article,
        article_html=article_html
    )


@app.route('/delete_article', methods=['POST'])
@login_required_post
def delete_article():
    # 获得文章对象
    article_id = request.json.get('article-id', None)
    if article_id is None:
        return jsonify({'status': 0, 'message': '缺少参数：article-id'})
    article = Article.query.get(article_id)
    if article is None:
        return jsonify({'status': 0, 'message': '文章不存在'})

    # 删除文章
    db.session.delete(article)
    db.session.commit()

    return jsonify({'status': 1, 'message': '删除成功'})


@app.route('/image_manage')
@login_required
def image_manage():
    return render_template(
        'image-manage.html',
        filenames=os.listdir(Config.MARKDOWN_IMAGE_PATH),
        route_prefix=Config.MARKDOWN_IMAGE_ROUTE_PREFIX
    )


@app.route('/delete_image', methods=['POST'])
@login_required_post
def delete_image():
    # 检查参数
    filename = request.json.get('filename', None)
    if filename is None:
        return jsonify({'status': 0, 'message': '缺少参数：filename'})
    image_path = os.path.join(Config.MARKDOWN_IMAGE_PATH, filename)

    # 删除图片
    if not os.path.exists(image_path):
        return jsonify({'status': 0, 'message': '文件不存在！'})
    try:
        os.remove(image_path)
    except Exception as e:
        return jsonify({'status': 0, 'message': str(e)})
    return jsonify({'status': 1, 'message': '删除成功'})



@app.route('/upload_image', methods=['POST'])
@login_required_post
def upload_image():
    images = request.files.getlist('images', None)
    if images is None:
        flash('缺少参数：images');
        return redirect(url_for('image_manage'))
    
    for image in images:
        if image.mimetype.split('/', 1)[0] != 'image':
            flash('上传的必须都是图片')
            return redirect(url_for('image_manage'))
        save_path = os.path.join(Config.MARKDOWN_IMAGE_PATH, image.filename)
        if os.path.exists(save_path):
            flash('同名图片已存在')
            return redirect(url_for('image_manage'))
        image.save(save_path)
    return redirect(url_for('image_manage'))


@app.route('/get_markdown_image_list')
@login_required
def get_markdown_image_list():
    return jsonify({
        'status': 1,
        'data': {
            'filenames': os.listdir(Config.MARKDOWN_IMAGE_PATH),
            'route_prefix': Config.MARKDOWN_IMAGE_ROUTE_PREFIX
        }
    })
