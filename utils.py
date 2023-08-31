import re
from markdown import markdown
from config import Config


def check_username(username):
    if len(username) < 3 or len(username) > 16:
        return False
    match_iter = re.finditer(Config.USER_NAME_ILLEGAL_CHAR, username)
    try:
        next(match_iter)
    except StopIteration:
        pass
    else:
        False
    return True


def check_password(password):
    if len(password) < 6 or len(password) > 16:
        return False
    match_iter = re.finditer(Config.USER_PASSWORD_ILLEGAL_CHAR, password)
    try:
        next(match_iter)
    except StopIteration:
        pass
    else:
        False
    return True


def convert_markdown(src):
    extensions = [
        'tables', 'extra', 'fenced_code', 'nl2br', 'md_in_html', 'smarty', 'toc',
        'codehilite', 'attr_list', 'abbr', 'admonition', 'meta'
    ]
    extension_configs = {
        'codehilite': {
            'linenums': False
        }
    }
    html = markdown(
        src,
        output_format='html',
        extensions=extensions,
        # extension_configs=extension_configs
    )
    return html
