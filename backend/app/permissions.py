from rest_framework import permissions

def _get_user_role(user):
    profile = getattr(user, 'profile', None)
    return getattr(profile, 'role', None)

class IsAlumni(permissions.BasePermission):
    """
    Allows access only to alumni users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _get_user_role(request.user) == 'alumni')

class IsStudent(permissions.BasePermission):
    """
    Allows access only to student users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _get_user_role(request.user) == 'student')

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _get_user_role(request.user) == 'admin')

class IsAlumniOrAdmin(permissions.BasePermission):
    """
    Allows access to alumni or admin users.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return _get_user_role(request.user) in ['alumni', 'admin']

class IsProfileOwnerOrAdmin(permissions.BasePermission):
    """
    Allows profile owners to edit themselves; admins can edit any profile.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        role = _get_user_role(request.user)
        return role == 'admin' or obj.user_id == request.user.id

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
