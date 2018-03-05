from account.models import User
from django.settings import JWT_SECRET
import jwt


def get_user_(info):
    token = info.context.session.get('token')
    if token:
        try:
            user = User.objects.get(token=token)
            return user
        except Exception:
            raise Exception('User not found!')


def get_user(info):
    token = info.context.META.get('Authorization')
    if token:
        token = token[len('Bearer '):]
        user_info = jwt.decode(token, JWT_SECRET)
        try:
            user = User.objects.get(token=user_info['token'])
            return user
        except Exception:
            raise Exception('User not found!')
