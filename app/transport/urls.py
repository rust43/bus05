from django.urls import path

from . import views

urlpatterns = [
    # API views
    path("api/v1/transport-imei-list/", views.ListTransportIMEI.as_view()),
    # path("api/v1/busstop/", views.BusStopApiView.as_view()),
    # path("api/v1/data/", views.DataApiView.as_view()),
]
