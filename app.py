from config import create_app, db
from model import Users, Article

app = create_app()

import auth_views
import main_views


@app.shell_context_processor
def make_shell_context():
    return dict(
        db=db,
        Users=Users,
        Article=Article
    )
