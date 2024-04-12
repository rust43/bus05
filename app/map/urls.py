from django.urls import path

from . import views

urlpatterns = [
    path("map/", views.map_view, name="map"),
    # path("map/zone-list/", views.zone_list_view, name="zone-list"),
    # path("map/zone-create/", views.zone_create_view, name="zone-create"),
    # path("map/zone-view/<uuid:zone_id>/", views.zone_view_view, name="zone-view"),
    # path("map/zone-task/<uuid:zone_id>/", views.zone_task_view, name="zone-task"),
    # path("tiles/<path:layer>/<int:z>/<int:x>/<int:y>.png", views.serve_tile, name="serve-tile"),
    # API paths
    # path("map/api/<uuid:zone_id>/", views.ZoneDetailApiView.as_view()),
    # path("map/api/<uuid:zone_id>/visibility/", views.GetVisibility.as_view()),
    # path("map/api/<uuid:zone_id>/leadzone/", views.GetLeadZone.as_view()),
    # path("map/api/<uuid:zone_id>/leadline/", views.GetLeadLine.as_view()),
    # path("map/api/estimate/", views.LeadZoneEstimate.as_view()),
]
