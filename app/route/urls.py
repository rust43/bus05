from django.urls import path

from . import views

urlpatterns = [
    path("map-edit/", views.map_edit_view, name="map-edit"),
    # API views
    path("api/v1/routes/", views.RouteApiView.as_view()),
]
