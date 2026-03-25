from rest_framework import permissions

class IsAlumni(permissions.BasePermission):
    """
    Allows access only to alumni users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.profile.role == 'alumni')

class IsStudent(permissions.BasePermission):
    """
    Allows access only to student users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.profile.role == 'student')

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.profile.role == 'admin')

class IsAlumniOrAdmin(permissions.BasePermission):
    """
    Allows access to alumni or admin users.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.profile.role in ['alumni', 'admin']

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `owner`, `author`, `applicant`, or `user`
        owner = getattr(obj, 'owner', getattr(obj, 'author', getattr(obj, 'applicant', getattr(obj, 'user', None))))
        return owner == request.user
