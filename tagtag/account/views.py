import inspect

from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout


def index(req):
    return HttpResponse(inspect.stack()[0][3])


def login_(req):
    username = req.POST.get('username')
    password = req.POST.get('password')

    context = {}

    if username and password:
        user = authenticate(username=username, password=password)
        if user is None:
            context = {'authenticationFailed': True}
        elif not user.is_active:
            context = {'accountDisabled': True}
        else:
            login(req, user)
            return render(req, "account/success.html", context)
    return render(req, "account/login.html", context)


def logout_(req):
    return logout(req.user)
