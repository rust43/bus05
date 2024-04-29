from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User


class LoginForm(forms.Form):
    username = forms.CharField(max_length=100, required=True)
    password = forms.CharField(max_length=100, required=True)


class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "password1", "password2"]


class UserCreateForm(UserCreationForm):
    first_name = forms.CharField(max_length=100, required=False)
    last_name = forms.CharField(max_length=100, required=False)

    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "password1", "password2"]
