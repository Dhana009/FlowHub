"""
User Factory for creating test users and managing authentication.

Provides methods to create users with different roles, login, and manage OTPs.
"""

import logging
from typing import Optional, Dict, Any

from .base_factory import BaseFactory
from .config import Config
from .helpers import (
    generate_unique_email,
    generate_valid_password,
    validate_object_id
)

logger = logging.getLogger(__name__)


class UserFactory(BaseFactory):
    """Factory for creating and managing test users."""
    
    def __init__(self, base_url: Optional[str] = None, timeout: Optional[int] = None):
        """
        Initialize UserFactory.
        
        Args:
            base_url: Optional base URL override
            timeout: Optional timeout override
        """
        super().__init__(base_url, timeout)
    
    def create_user(
        self,
        first_name: str = "Test",
        last_name: str = "User",
        email: Optional[str] = None,
        password: Optional[str] = None,
        role: str = "EDITOR"
    ) -> Dict[str, Any]:
        """
        Create a new user via signup endpoint.
        
        Args:
            first_name: User's first name (default: "Test")
            last_name: User's last name (default: "User")
            email: User's email (default: auto-generated unique email)
            password: User's password (default: auto-generated valid password)
            role: User's role - ADMIN, EDITOR, or VIEWER (default: "EDITOR")
            
        Returns:
            Dictionary with user data including _id, email, role, etc.
            
        Raises:
            requests.HTTPError: If signup fails
            ValueError: If response is invalid
        """
        # Generate unique email if not provided
        if email is None:
            email = generate_unique_email()
        
        # Generate valid password if not provided
        if password is None:
            password = generate_valid_password()
        
        # Validate role
        if role not in ["ADMIN", "EDITOR", "VIEWER"]:
            raise ValueError(f"Invalid role: {role}. Must be ADMIN, EDITOR, or VIEWER")
        
        logger.info(f"Creating user: {email} with role: {role}")
        
        # Step 1: Request OTP
        otp_response = self.post(
            "/auth/signup/request-otp",
            json_data={"email": email}
        )
        
        if otp_response.status_code != 200:
            raise ValueError(f"Failed to request OTP: {otp_response.text}")
        
        otp_data = otp_response.json()
        
        # Step 2: Get OTP from internal endpoint (for automation)
        try:
            otp = self._get_otp_from_internal(email)
        except Exception as e:
            logger.warning(f"Could not get OTP from internal endpoint: {e}")
            # In development mode, OTP might be in response
            otp = otp_data.get("otp")
            if not otp:
                raise ValueError("Could not retrieve OTP for signup")
        
        # Step 3: Verify OTP
        verify_response = self.post(
            "/auth/signup/verify-otp",
            json_data={"email": email, "otp": otp}
        )
        
        if verify_response.status_code != 200:
            raise ValueError(f"Failed to verify OTP: {verify_response.text}")
        
        # Step 4: Signup
        signup_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "password": password,
            "otp": otp,
            "role": role
        }
        
        signup_response = self.post("/auth/signup", json_data=signup_data)
        
        if signup_response.status_code != 201:
            raise ValueError(f"Failed to create user: {signup_response.text}")
        
        signup_result = signup_response.json()
        user_data = signup_result.get("user", {})
        
        # Add password to user data for later use
        user_data["password"] = password
        
        logger.info(f"User created successfully: {user_data.get('_id')}")
        return user_data
    
    def create_admin(
        self,
        first_name: str = "Admin",
        last_name: str = "User",
        email: Optional[str] = None,
        password: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create an admin user.
        
        Args:
            first_name: User's first name (default: "Admin")
            last_name: User's last name (default: "User")
            email: User's email (default: auto-generated)
            password: User's password (default: auto-generated)
            
        Returns:
            Dictionary with admin user data
        """
        return self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            role="ADMIN"
        )
    
    def create_editor(
        self,
        first_name: str = "Editor",
        last_name: str = "User",
        email: Optional[str] = None,
        password: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create an editor user.
        
        Args:
            first_name: User's first name (default: "Editor")
            last_name: User's last name (default: "User")
            email: User's email (default: auto-generated)
            password: User's password (default: auto-generated)
            
        Returns:
            Dictionary with editor user data
        """
        return self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            role="EDITOR"
        )
    
    def create_viewer(
        self,
        first_name: str = "Viewer",
        last_name: str = "User",
        email: Optional[str] = None,
        password: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a viewer user.
        
        Args:
            first_name: User's first name (default: "Viewer")
            last_name: User's last name (default: "User")
            email: User's email (default: auto-generated)
            password: User's password (default: auto-generated)
            
        Returns:
            Dictionary with viewer user data
        """
        return self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            role="VIEWER"
        )
    
    def login(
        self,
        email: str,
        password: str,
        remember_me: bool = False
    ) -> Dict[str, Any]:
        """
        Login user and get access token.
        
        Args:
            email: User's email
            password: User's password
            remember_me: Whether to remember user (default: False)
            
        Returns:
            Dictionary with token and user data:
            {
                "token": "JWT access token",
                "user": {...}
            }
            
        Raises:
            requests.HTTPError: If login fails
            ValueError: If response is invalid
        """
        logger.info(f"Logging in user: {email}")
        
        login_data = {
            "email": email,
            "password": password,
            "rememberMe": remember_me
        }
        
        response = self.post("/auth/login", json_data=login_data)
        
        if response.status_code != 200:
            raise ValueError(f"Login failed: {response.text}")
        
        result = response.json()
        
        logger.info(f"Login successful for user: {email}")
        return result
    
    def get_user_info(self, token: str) -> Dict[str, Any]:
        """
        Get current user info via /auth/me endpoint (checkpoint validation).
        
        Args:
            token: JWT access token
            
        Returns:
            Dictionary with user data
            
        Raises:
            requests.HTTPError: If request fails
            ValueError: If response is invalid
        """
        headers = Config.get_auth_headers(token)
        response = self.get("/auth/me", headers=headers)
        
        if response.status_code != 200:
            raise ValueError(f"Failed to get user info: {response.text}")
        
        result = response.json()
        return result.get("data", {})
    
    def request_otp(self, email: str, otp_type: str = "signup") -> Dict[str, Any]:
        """
        Request OTP for signup or password reset.
        
        Args:
            email: User's email
            otp_type: Type of OTP - "signup" or "password-reset" (default: "signup")
            
        Returns:
            Dictionary with OTP request result
            
        Raises:
            requests.HTTPError: If request fails
        """
        if otp_type == "signup":
            endpoint = "/auth/signup/request-otp"
        elif otp_type == "password-reset":
            endpoint = "/auth/forgot-password/request-otp"
        else:
            raise ValueError(f"Invalid OTP type: {otp_type}. Must be 'signup' or 'password-reset'")
        
        response = self.post(endpoint, json_data={"email": email})
        
        if response.status_code != 200:
            raise ValueError(f"Failed to request OTP: {response.text}")
        
        return response.json()
    
    def verify_otp(self, email: str, otp: str, otp_type: str = "signup") -> Dict[str, Any]:
        """
        Verify OTP for signup or password reset.
        
        Args:
            email: User's email
            otp: OTP code (6 digits)
            otp_type: Type of OTP - "signup" or "password-reset" (default: "signup")
            
        Returns:
            Dictionary with verification result
            
        Raises:
            requests.HTTPError: If verification fails
        """
        if otp_type == "signup":
            endpoint = "/auth/signup/verify-otp"
        elif otp_type == "password-reset":
            endpoint = "/auth/forgot-password/verify-otp"
        else:
            raise ValueError(f"Invalid OTP type: {otp_type}. Must be 'signup' or 'password-reset'")
        
        response = self.post(
            endpoint,
            json_data={"email": email, "otp": otp}
        )
        
        if response.status_code != 200:
            raise ValueError(f"Failed to verify OTP: {response.text}")
        
        return response.json()
    
    def _get_otp_from_internal(self, email: str) -> str:
        """
        Get OTP from internal endpoint (for automation).
        
        Args:
            email: User's email
            
        Returns:
            OTP string (6 digits)
            
        Raises:
            requests.HTTPError: If request fails
            ValueError: If OTP not found
        """
        headers = Config.get_internal_headers()
        params = {"email": email}
        
        response = self.get("/internal/otp", headers=headers, params=params)
        
        if response.status_code != 200:
            raise ValueError(f"Failed to get OTP from internal endpoint: {response.text}")
        
        result = response.json()
        otp_data = result.get("data", {})
        otp = otp_data.get("otp")
        
        if not otp:
            raise ValueError(f"No OTP found for email: {email}")
        
        return otp
