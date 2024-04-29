from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.shortcuts import render
from main.views import index

from . import forms


def login_view(request, message: str = ""):
    if request.method == "POST":
        form = forms.LoginForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(request, username=username, password=password)
            login(request, user)
            return redirect(index)
        message = "Имя пользователя или пароль указаны неверно."
    else:
        form = forms.LoginForm()

    return render(request, "account/login.html", {"form": form, "message": message})


def signup_view(request):
    if request.method == "POST":
        form = forms.SignupForm(data=request.POST)
        if form.is_valid():
            user = form.save()
            user.save()
            login(request, user)
            return redirect(index)
    else:
        form = forms.SignupForm()

    return render(request, "account/signup.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect(index)
