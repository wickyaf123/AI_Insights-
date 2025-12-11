"""
Configuration module for the backend application.
Loads environment variables and provides configuration settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

# Model Configuration
GEMINI_MODEL = "gemini-2.5-flash"

# Server Configuration
HOST = "0.0.0.0"
PORT = 3000

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Data Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Supported Sports
SUPPORTED_SPORTS = ["nba", "afl", "nrl", "epl", "ipl"]

