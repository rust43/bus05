from django.urls import path

from . import views

urlpatterns = [
    # API views
    path("api/v1/route", views.RouteApiView.as_view()),
    path("api/v1/route/type", views.RouteTypeAPIView.as_view()),
    path("api/v1/busstop", views.BusStopApiView.as_view()),
    path("api/v1/data", views.DataApiView.as_view()),
]
