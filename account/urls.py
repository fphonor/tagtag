from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login/$', views.login_, name='account_login'),
    url(r'^logout/$', views.logout_, name='account_logout'),
]
