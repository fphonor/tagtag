from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout


def index(req):
    return redirect('account_login')


def login_(req):
    username = req.POST.get('username')
    password = req.POST.get('password')

    status = 200
    context = {}

    if username and password:
        user = authenticate(username=username, password=password)
        if user is None:
            context = {'authenticationFailed': True}
            status = 400
        elif not user.is_active:
            context = {'accountDisabled': True}
            status = 403
        else:
            login(req, user)
            return render(req, "account/success.html", context)
    return render(req, "account/login.html", context, status=status)


def logout_(req):
    return logout(req.user)
