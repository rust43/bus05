from django.urls import path

from . import views

urlpatterns = [
    # API views
    path("api/v1/transport/imei/", views.TransportIMEIAPIView.as_view()),
    path("api/v1/transport/type/", views.TransportTypeAPIView.as_view()),
    path("api/v1/transport/point/", views.TransportPointAPIView.as_view()),
    path("api/v1/transport/", views.TransportApiView.as_view()),
    # path("api/v1/data/", views.DataApiView.as_view()),
]
