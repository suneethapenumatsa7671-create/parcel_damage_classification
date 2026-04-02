# 🚀 FastAPI Backend — Parcel Damage Classification

This backend mirrors all Django app functions as REST API endpoints, served via **FastAPI + Uvicorn**.

---

## 📁 Folder Structure

```
backend/
├── __init__.py
├── main.py          ← FastAPI app, CORS, router registration
├── database.py      ← SQLAlchemy engine (re-uses Django's db.sqlite3)
├── models.py        ← SQLAlchemy models (mirrors Django ORM)
├── schemas.py       ← Pydantic request/response schemas
├── requirements.txt ← Python dependencies
├── README_BACKEND.md
└── routers/
    ├── __init__.py
    ├── auth.py      ← Register & Login
    ├── predict.py   ← Image upload & damage prediction
    └── admin.py     ← Admin login, user management, activation
```

---

## ▶️ How to Run

### 1. Install dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Start the server (from project root)
```bash
python run.py
```
Or directly:
```bash
uvicorn backend.main:app --reload --port 8001
```

### 3. Open interactive docs
| Interface | URL |
|-----------|-----|
| Swagger UI | http://127.0.0.1:8001/docs |
| ReDoc | http://127.0.0.1:8001/redoc |

---

## 📡 API Endpoints

### 🔐 Authentication — `/api/auth`

| Method | URL | Description | Django Equivalent |
|--------|-----|-------------|-------------------|
| `POST` | `/api/auth/register` | Register a new user | `UserRegisterActions` |
| `POST` | `/api/auth/login` | Login with credentials | `UserLoginCheck` |

---

#### `POST /api/auth/register`
Registers a new user. Account starts with `status = "waiting"` until admin activates it.

**Request Body (JSON):**
```json
{
  "name": "John Doe",
  "loginid": "johndoe",
  "password": "Secret@123",
  "mobile": "9876543210",
  "email": "john@example.com",
  "locality": "Koramangala",
  "address": "123, Main Road",
  "city": "Bangalore",
  "state": "Karnataka"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful! Your account is pending admin activation.",
  "user_id": 42
}
```

**Error Responses:**
- `400` — Login ID / Mobile / Email already exists

---

#### `POST /api/auth/login`
Login with loginid + password. Account must be `"activated"` by admin.

**Request Body (JSON):**
```json
{
  "loginid": "johndoe",
  "password": "Secret@123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful!",
  "user_id": 42,
  "name": "John Doe",
  "loginid": "johndoe",
  "email": "john@example.com",
  "status": "activated"
}
```

**Error Responses:**
- `401` — Invalid login ID or password
- `403` — Account not activated

---

### 🖼️ Image Upload & Prediction — `/api/predict`

| Method | URL | Description | Django Equivalent |
|--------|-----|-------------|-------------------|
| `POST` | `/api/predict/upload` | Upload animal/parcel image, get damage prediction | `predict_view` |
| `GET`  | `/api/predict/health` | Health check & model status | *(new)* |

---

#### `POST /api/predict/upload`
Upload an image file (JPG/PNG/BMP/WEBP). The ResNet-34 model classifies it as **Damaged**, **Not_Damaged**, or **Non-Parcel Image**.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | `UploadFile` | Image file (JPEG / PNG / BMP / WEBP) |

**Success Response (200):**
```json
{
  "prediction": "Damaged",
  "confidence": "0.87",
  "image_url": "/media/uploads/abc123.jpg",
  "message": "Prediction complete: Damaged (confidence: 87.00%)"
}
```

**Error Responses:**
- `422` — Unsupported file type or corrupt image
- `500` — Model inference error

---

#### `GET /api/predict/health`
```json
{
  "status": "ok",
  "model_path": "C:/Users/Sunitha/Desktop/parcel_damage_classification/models/resnet34_model.h5",
  "model_file_exists": true,
  "model_status": "loaded"
}
```

---

### 🛡️ Admin — `/api/admin`

| Method | URL | Description | Django Equivalent |
|--------|-----|-------------|-------------------|
| `POST` | `/api/admin/login` | Admin login | `AdminLoginCheck` |
| `GET`  | `/api/admin/users` | List all registered users | `ViewRegisteredUsers` |
| `PUT`  | `/api/admin/users/{user_id}/activate` | Activate a user account | `AdminActivaUsers` |
| `GET`  | `/api/admin/home` | Admin dashboard stats | `AdminHome` |

---

#### `POST /api/admin/login`
```json
{ "loginid": "admin", "password": "admin" }
```
**Success (200):**
```json
{ "message": "Admin login successful!", "role": "admin" }
```

---

#### `GET /api/admin/users`
Returns a list of all registered users with full details.

---

#### `PUT /api/admin/users/{user_id}/activate`
Activates the user account so they can log in.

**Success (200):**
```json
{
  "message": "User 'John Doe' has been successfully activated.",
  "user_id": 42,
  "status": "activated"
}
```

---

#### `GET /api/admin/home`
```json
{
  "message": "Welcome to the Admin Dashboard",
  "stats": {
    "total_users": 10,
    "activated_users": 7,
    "waiting_activation": 3
  }
}
```

---

## 🔌 Quick Test (cURL Examples)

```bash
# Register
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","loginid":"john","password":"Secret@123","mobile":"9876543210","email":"j@e.com","locality":"MG Road","address":"123 Main St","city":"Bangalore","state":"Karnataka"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginid":"john","password":"Secret@123"}'

# Upload image
curl -X POST http://localhost:8001/api/predict/upload \
  -F "file=@/path/to/image.jpg"

# Admin login
curl -X POST http://localhost:8001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"loginid":"admin","password":"admin"}'

# Activate user
curl -X PUT http://localhost:8001/api/admin/users/1/activate
```
