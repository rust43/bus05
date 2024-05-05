from account.models import User
from rest_framework import permissions


def is_in_group(user: User, group_name: str):
    return user.groups.filter(name=group_name).exists()


class HasGroupPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Get a mapping of methods -> required group.
        required_groups_mapping = getattr(view, "required_groups", {})

        # Determine the required groups for this particular request method.
        required_groups = required_groups_mapping.get(request.method, [])

        # Return True if the user has all the required groups or is staff.
        return all(
            [
                is_in_group(request.user, group_name) if group_name != "__all__" else True
                for group_name in required_groups
            ]
        ) or (request.user and request.user.is_staff)
