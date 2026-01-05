"""
Cleanup Factory for managing test data cleanup.

Provides methods to clean up test data safely, preserving user records when needed.
"""

import logging
from typing import Optional, Dict, Any

from .base_factory import BaseFactory
from .config import Config
from .helpers import validate_object_id

logger = logging.getLogger(__name__)


class CleanupFactory(BaseFactory):
    """Factory for cleaning up test data."""
    
    def __init__(self, base_url: Optional[str] = None, timeout: Optional[int] = None):
        """
        Initialize CleanupFactory.
        
        Args:
            base_url: Optional base URL override
            timeout: Optional timeout override
        """
        super().__init__(base_url, timeout)
    
    def cleanup_user_data(
        self,
        user_id: str,
        include_otp: bool = True,
        include_activity_logs: bool = True
    ) -> Dict[str, Any]:
        """
        Hard delete all data for a specific user while preserving user record.
        
        Deletes:
        - Items (where created_by = userId)
        - BulkJobs (where userId = userId)
        - ActivityLogs (where userId = userId, if include_activity_logs=True)
        - OTPs (where email = user.email, if include_otp=True)
        - Files (associated with deleted items)
        
        Preserves:
        - User record
        
        Args:
            user_id: User ID (ObjectId format, 24 hex chars)
            include_otp: Whether to delete OTPs (default: True)
            include_activity_logs: Whether to delete activity logs (default: True)
            
        Returns:
            Dictionary with cleanup results:
            {
                "deleted": {
                    "items": count,
                    "files": count,
                    "bulk_jobs": count,
                    "activity_logs": count,
                    "otps": count
                },
                "preserved": {
                    "user": true
                }
            }
            
        Raises:
            ValueError: If user_id is invalid format
            requests.HTTPError: If cleanup fails
        """
        # Validate user_id format
        if not validate_object_id(user_id):
            raise ValueError(
                f"Invalid user ID format: {user_id}. "
                "Expected 24-character hexadecimal string."
            )
        
        logger.info(f"Cleaning up all data for user: {user_id}")
        
        headers = Config.get_internal_headers()
        
        # Build URL with query parameters
        url = Config.get_api_url(f"/internal/users/{user_id}/data")
        url += f"?include_otp={str(include_otp).lower()}&include_activity_logs={str(include_activity_logs).lower()}"
        
        # Make DELETE request with params in URL
        response = self.session.delete(
            url,
            headers=headers,
            timeout=self.timeout
        )
        response.raise_for_status()
        
        result = response.json()
        
        logger.info(
            f"Cleanup completed for user {user_id}: "
            f"{result.get('deleted', {})}"
        )
        
        return result
    
    def cleanup_user_items(self, user_id: str) -> Dict[str, Any]:
        """
        Hard delete only items for a specific user (preserves BulkJobs, ActivityLogs, OTPs).
        
        Deletes:
        - Items (where created_by = userId)
        - Files (associated with deleted items)
        
        Preserves:
        - User record
        - BulkJobs
        - ActivityLogs
        - OTPs
        
        Args:
            user_id: User ID (ObjectId format)
            
        Returns:
            Dictionary with cleanup results:
            {
                "deleted": {
                    "items": count,
                    "files": count
                },
                "preserved": {
                    "user": true,
                    "bulk_jobs": true,
                    "activity_logs": true,
                    "otps": true
                }
            }
            
        Raises:
            ValueError: If user_id is invalid format
            requests.HTTPError: If cleanup fails
        """
        # Validate user_id format
        if not validate_object_id(user_id):
            raise ValueError(
                f"Invalid user ID format: {user_id}. "
                "Expected 24-character hexadecimal string."
            )
        
        logger.info(f"Cleaning up items for user: {user_id}")
        
        headers = Config.get_internal_headers()
        url = Config.get_api_url(f"/internal/users/{user_id}/items")
        
        response = self.session.delete(
            url,
            headers=headers,
            timeout=self.timeout
        )
        response.raise_for_status()
        
        result = response.json()
        
        logger.info(
            f"Items cleanup completed for user {user_id}: "
            f"{result.get('deleted', {})}"
        )
        
        return result
    
    def cleanup_single_item(self, item_id: str) -> Dict[str, Any]:
        """
        Hard delete a single item by ID (removes from MongoDB).
        
        Deletes:
        - Item (permanently removed)
        - File (if file_path exists)
        
        Args:
            item_id: Item ID (ObjectId format)
            
        Returns:
            Dictionary with cleanup results:
            {
                "deleted": {
                    "item_deleted": true,
                    "files_deleted": 0 or 1
                }
            }
            
        Raises:
            ValueError: If item_id is invalid format
            requests.HTTPError: If cleanup fails
        """
        # Validate item_id format
        if not validate_object_id(item_id):
            raise ValueError(
                f"Invalid item ID format: {item_id}. "
                "Expected 24-character hexadecimal string."
            )
        
        logger.info(f"Hard deleting item: {item_id}")
        
        headers = Config.get_internal_headers()
        url = Config.get_api_url(f"/internal/items/{item_id}/permanent")
        
        response = self.session.delete(
            url,
            headers=headers,
            timeout=self.timeout
        )
        response.raise_for_status()
        
        result = response.json()
        
        logger.info(f"Item {item_id} deleted successfully")
        
        return result
    
    def reset_database(self) -> Dict[str, Any]:
        """
        Reset entire database (wipe all data).
        
        Wipes:
        - Users
        - Items
        - OTP
        - BulkJob
        - ActivityLog
        
        Warning: This deletes ALL data including admin users!
        
        Returns:
            Dictionary with reset result:
            {
                "status": "success",
                "data": {
                    "message": "Database wiped successfully"
                }
            }
            
        Raises:
            requests.HTTPError: If reset fails
        """
        logger.warning("Resetting entire database - ALL DATA WILL BE DELETED")
        
        headers = Config.get_internal_headers()
        response = self.post("/internal/reset", headers=headers)
        
        if response.status_code != 200:
            raise ValueError(f"Failed to reset database: {response.text}")
        
        result = response.json()
        
        logger.info("Database reset completed successfully")
        
        return result
