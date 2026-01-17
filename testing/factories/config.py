"""
Configuration module for test data factories.

Provides centralized configuration for API endpoints, authentication keys,
and other settings used by factory classes.
"""

import os
from typing import Optional


class Config:
    """Configuration class for test data factories."""
    
    # API Configuration
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:3000/api/v1")
    
    # Internal Automation Key
    INTERNAL_AUTOMATION_KEY: str = os.getenv(
        "INTERNAL_AUTOMATION_KEY",
        "flowhub-secret-automation-key-2025"
    )
    
    # HTTP Configuration
    REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "30"))
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    
    # Test Data Configuration
    DEFAULT_PASSWORD: str = os.getenv("DEFAULT_PASSWORD", "TestPassword123!")
    UNIQUE_NAME_PREFIX: str = os.getenv("UNIQUE_NAME_PREFIX", "Test")
    UNIQUE_EMAIL_PREFIX: str = os.getenv("UNIQUE_EMAIL_PREFIX", "test")
    UNIQUE_EMAIL_DOMAIN: str = os.getenv("UNIQUE_EMAIL_DOMAIN", "test.com")
    
    # Cleanup Configuration
    CLEANUP_ON_ERROR: bool = os.getenv("CLEANUP_ON_ERROR", "true").lower() == "true"
    CLEANUP_TIMEOUT: int = int(os.getenv("CLEANUP_TIMEOUT", "60"))
    
    @classmethod
    def get_api_url(cls, endpoint: str) -> str:
        """
        Get full API URL for an endpoint.
        
        Args:
            endpoint: API endpoint path (e.g., "/auth/login")
            
        Returns:
            Full URL (e.g., "http://localhost:3000/api/v1/auth/login")
        """
        # Remove leading slash if present
        endpoint = endpoint.lstrip("/")
        # Ensure base URL doesn't end with slash
        base_url = cls.API_BASE_URL.rstrip("/")
        return f"{base_url}/{endpoint}"
    
    @classmethod
    def get_internal_headers(cls) -> dict:
        """
        Get headers for internal/automation endpoints.
        
        Returns:
            Dictionary with x-internal-key header
        """
        return {
            "x-internal-key": cls.INTERNAL_AUTOMATION_KEY,
            "Content-Type": "application/json"
        }
    
    @classmethod
    def get_auth_headers(cls, token: str) -> dict:
        """
        Get headers for authenticated endpoints.
        
        Args:
            token: JWT access token
            
        Returns:
            Dictionary with Authorization header
        """
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
