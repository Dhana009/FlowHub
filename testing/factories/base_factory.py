"""
Base factory class for test data factories.

Provides common functionality for HTTP client setup, error handling,
and logging used by all factory classes.
"""

import logging
import requests
from typing import Optional, Dict, Any
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .config import Config


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BaseFactory:
    """Base factory class with common utilities."""
    
    def __init__(self, base_url: Optional[str] = None, timeout: Optional[int] = None):
        """
        Initialize base factory.
        
        Args:
            base_url: Optional base URL override (default: from Config)
            timeout: Optional timeout override (default: from Config)
        """
        self.base_url = base_url or Config.API_BASE_URL
        self.timeout = timeout or Config.REQUEST_TIMEOUT
        self.session = self._create_session()
    
    def _create_session(self) -> requests.Session:
        """
        Create HTTP session with retry strategy.
        
        Returns:
            Configured requests.Session
        """
        session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=Config.MAX_RETRIES,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        return session
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        headers: Optional[Dict[str, str]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        raise_for_status: bool = True
    ) -> requests.Response:
        """
        Make HTTP request with error handling.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE, PATCH)
            endpoint: API endpoint path
            headers: Optional request headers
            json_data: Optional JSON request body
            params: Optional query parameters
            raise_for_status: Whether to raise exception on HTTP error (default: True)
            
        Returns:
            requests.Response object
            
        Raises:
            requests.HTTPError: If raise_for_status=True and HTTP error occurred
            requests.RequestException: For other request errors
        """
        url = Config.get_api_url(endpoint)
        
        # Default headers
        request_headers = headers or {}
        if "Content-Type" not in request_headers:
            request_headers["Content-Type"] = "application/json"
        
        try:
            logger.debug(f"Making {method} request to {url}")
            
            response = self.session.request(
                method=method,
                url=url,
                headers=request_headers,
                json=json_data,
                params=params,
                timeout=self.timeout
            )
            
            if raise_for_status:
                response.raise_for_status()
            
            logger.debug(f"Response status: {response.status_code}")
            return response
            
        except requests.HTTPError as e:
            logger.error(f"HTTP error {e.response.status_code}: {e.response.text}")
            raise
        except requests.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            raise
    
    def _handle_response(self, response: requests.Response, expected_status: int = 200) -> Dict[str, Any]:
        """
        Handle API response and extract JSON data.
        
        Args:
            response: requests.Response object
            expected_status: Expected HTTP status code (default: 200)
            
        Returns:
            Response JSON data as dictionary
            
        Raises:
            ValueError: If response status doesn't match expected
            requests.JSONDecodeError: If response is not valid JSON
        """
        if response.status_code != expected_status:
            raise ValueError(
                f"Expected status {expected_status}, got {response.status_code}. "
                f"Response: {response.text}"
            )
        
        try:
            return response.json()
        except requests.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON response: {response.text}")
            raise ValueError(f"Invalid JSON response: {str(e)}")
    
    def get(self, endpoint: str, headers: Optional[Dict[str, str]] = None, 
            params: Optional[Dict[str, Any]] = None) -> requests.Response:
        """Make GET request."""
        return self._make_request("GET", endpoint, headers=headers, params=params)
    
    def post(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None,
             headers: Optional[Dict[str, str]] = None) -> requests.Response:
        """Make POST request."""
        return self._make_request("POST", endpoint, headers=headers, json_data=json_data)
    
    def put(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None,
            headers: Optional[Dict[str, str]] = None) -> requests.Response:
        """Make PUT request."""
        return self._make_request("PUT", endpoint, headers=headers, json_data=json_data)
    
    def delete(self, endpoint: str, headers: Optional[Dict[str, str]] = None) -> requests.Response:
        """Make DELETE request."""
        return self._make_request("DELETE", endpoint, headers=headers)
    
    def patch(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None,
              headers: Optional[Dict[str, str]] = None) -> requests.Response:
        """Make PATCH request."""
        return self._make_request("PATCH", endpoint, headers=headers, json_data=json_data)
    
    def close(self):
        """Close HTTP session."""
        if self.session:
            self.session.close()
