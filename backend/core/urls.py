# backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from app.views import EmailOrUsernameTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. Include all the URLs from your 'app' directory under api/v1/
    path('api/v1/', include('app.urls')), 
    
    # 2. Standard JWT endpoints also under api/v1/
    path('api/v1/auth/token/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
