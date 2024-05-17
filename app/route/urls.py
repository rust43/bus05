from django.urls import path

from . import views

urlpatterns = [
    # API views
    path("api/v1/routes/", views.RouteApiView.as_view()),
]
