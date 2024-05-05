from django.urls import path

from . import views

urlpatterns = [
    path("map-edit/", views.map_edit_view, name="map-edit"),
    # API views
    path("route/api/v1/new-route/", views.RouteApiView.as_view()),
]
