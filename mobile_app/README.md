# Parcel Guard Mobile App (Flet)

This is a cross-platform mobile application version of the Parcel Damage Classification project, built using **Flet** (Flutter for Python).

## Features
- **AI-Powered Analysis**: Uses a ResNet34 model to detect parcel damage.
- **Premium UI**: Modern, dark-themed interface with smooth transitions.
- **Cross-Platform**: Can be run as a desktop app, mobile app, or web app.

## How to Run

### Prerequisites
- Python 3.9 or higher

### Steps
1. Navigate to the `mobile_app` directory:
   ```bash
   cd mobile_app
   ```
2. Install dependencies (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python main.py
   ```
   *On Windows, you can simply double-click `run_app.bat`.*

## Project Structure
- `main.py`: The entry point and UI logic.
- `models/resnet34_model.h5`: The trained ResNet34 model used for inference.
- `requirements.txt`: Python package dependencies.
