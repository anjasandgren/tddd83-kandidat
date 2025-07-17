import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use an absolute path for the SQLite database
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Absolute path of `/app/`
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "../instance/app.db"))

class Config:
    """Base configuration (used in all environments)."""
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"  
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

    # Debug mode
    DEBUG = False

class DevelopmentConfig(Config):
    """Development environment config."""
    DEBUG = True

class ProductionConfig(Config):
    """Production environment config."""
    DEBUG = False

# Environment Mapping
config_dict = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
