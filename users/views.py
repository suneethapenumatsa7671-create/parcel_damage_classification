import json
from django.shortcuts import render, HttpResponse
from .forms import UserRegistrationForm
from django.contrib import messages
from .models import UserRegistrationModel
from django.core.files.storage import FileSystemStorage
import os


import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report
from django.shortcuts import render
from django.conf import settings



# Create your views here.
def UserRegisterActions(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            print('Data is Valid')
            form.save()
            messages.success(request, 'You have been successfully registered')
            form = UserRegistrationForm()
            return render(request, 'UserRegistrations.html', {'form': form})
        else:
            messages.success(request, 'Email or Mobile Already Existed')
            print("Invalid form")
    else:
        form = UserRegistrationForm()
    return render(request, 'UserRegistrations.html', {'form': form})


def UserLoginCheck(request):
    if request.method == "POST":
        loginid = request.POST.get('loginname')
        pswd = request.POST.get('pswd')
        print("Login ID = ", loginid, ' Password = ', pswd)
        try:
            check = UserRegistrationModel.objects.get(loginid=loginid, password=pswd)
            status = check.status
            print('Status is = ', status)
            if status == "activated":
                request.session['id'] = check.id
                request.session['loggeduser'] = check.name
                request.session['loginid'] = loginid
                request.session['email'] = check.email
                print("User id At", check.id, status)
                return render(request, 'users/UserHome.html', {})
            else:
                messages.success(request, 'Your Account Not at activated')
                return render(request, 'UserLogin.html')
        except Exception as e:
            print('Exception is ', str(e))
            pass
        messages.success(request, 'Invalid Login id and password')
    return render(request, 'UserLogin.html', {})


def UserHome(request):
    return render(request, 'users/UserHome.html', {})





import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
import os

# Load model once
model = load_model(r'models\resnet34_model.h5')
class_names = ['Not_Damaged', 'Damaged']
 
# Prediction view
def predict_view(request):
    context = {}

    if request.method == 'POST' and request.FILES.get('image'):
        uploaded_file = request.FILES['image']
        fs = FileSystemStorage()
        file_path = fs.save(uploaded_file.name, uploaded_file)
        full_path = fs.path(file_path)

        # Preprocess image
        img = image.load_img(full_path, target_size=(256, 256))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        prediction = model.predict(img_array)[0]

        if len(prediction) == 1:  # sigmoid model
            prob = float(prediction)

            if prob >= 0.6:
                predicted_class = "Damaged"
                confidence = prob
            elif prob <= 0.4:
                predicted_class = "Not_Damaged"
                confidence = 1 - prob
            else:
                predicted_class = "Non-Parcel Image"
                confidence = prob

        else:  # softmax model
            confidence = np.max(prediction)
            predicted_class = class_names[np.argmax(prediction)]

            if confidence < 0.60:
                predicted_class = "Non-Parcel Image"

        context = {
            'prediction': predicted_class,
            'confidence': f"{confidence:.2f}",
            'image_url': fs.url(file_path),
        }

    return render(request, 'users/predict.html', context)
    