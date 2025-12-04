from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/patients/", views.PatientProfileList.as_view()),
    path("api/consultations/", views.ConsultationList.as_view()),
    path("api/prescriptions/", views.PrescriptionList.as_view()),
]
