from model.manage_log import ManageLog
from slim.base.permission import Permissions
from slim.support.peewee import PeeweeView
from api import route


@route('log/manage')
class LogManageView(PeeweeView):
    model = ManageLog

    @classmethod
    def ready(cls):
        cls.add_soft_foreign_key('user_id', 'user')
