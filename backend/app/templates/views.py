from rest_framework import generics
from .models import PatientProfile, Consultation, Prescription
from .serializers import PatientProfileSerializer, ConsultationSerializer, PrescriptionSerializer

class PatientProfileList(generics.ListCreateAPIView):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer

class ConsultationList(generics.ListCreateAPIView):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer

class PrescriptionList(generics.ListCreateAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
