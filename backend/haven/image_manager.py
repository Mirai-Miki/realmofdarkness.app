"""
Image Manager Service for handling character avatar operations.

This module provides a centralized service for downloading, validating, and
managing character avatar images. It handles URL validation, size limits,
format verification, and file operations.

All methods raise appropriate exceptions with HTTP status codes instead of
returning result tuples. This allows for proper transaction rollbacks and
cleaner error handling.
"""

import logging
import re
from typing import Optional
from io import BytesIO

import requests
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction

from backend.haven.models import Character
from .errors import (
    ImageValidationError,
    ImageDownloadError,
    ImageTooLargeError,
    ImageFormatUnsupported,
    CharacterManagerException,
)

logger = logging.getLogger("DEBUG")


class ImageManager:
    """
    Centralized manager for all image operations related to character avatars.

    Handles downloading, validation, saving, and cleanup of character avatar images.
    All image operations should go through this class for consistency and security.

    All methods raise appropriate exceptions instead of returning result codes,
    allowing for proper transaction rollbacks and cleaner error handling.
    """

    # Maximum file size in MB
    MAX_SIZE_MB: int = 5

    # Allowed image formats
    ALLOWED_FORMATS: set[str] = {"JPEG", "PNG", "WEBP", "GIF"}

    # Request headers for image downloads
    REQUEST_HEADERS: dict[str, str] = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    @classmethod
    def download_and_validate_image(
        cls, image_url: Optional[str]
    ) -> Optional[InMemoryUploadedFile]:
        """
        Download and validate an image from a URL.

        Args:
            image_url: The URL of the image to download and validate

        Returns:
            The validated image file as InMemoryUploadedFile, or None if no URL provided

        Raises:
            ImageValidationError: If the image URL format is invalid or image format is unsupported
            ImageTooLargeError: If the image exceeds size limits
            ImageDownloadError: If the download fails or network error occurs
        """
        if not image_url:
            return None

        # Skip processing if URL is already from the app (existing avatar)
        if re.match(r"^https:\/\/(dev\.)?realmofdarkness\.app", image_url):
            return None

        max_size_bytes = cls.MAX_SIZE_MB * 1024 * 1024

        try:
            # Validate URL format (Discord CDN only for security)
            if not image_url.startswith("https://cdn.discordapp.com/"):
                logger.warning(f"Invalid image URL format: {image_url}")
                raise ImageValidationError(
                    f"Invalid image URL format. Only Discord CDN URLs are allowed: {image_url}",
                    log=True,
                )

            # Check content size before downloading
            head_response = requests.head(
                image_url, headers=cls.REQUEST_HEADERS, timeout=5
            )
            content_length = head_response.headers.get("Content-Length")

            if content_length and int(content_length) > max_size_bytes:
                size_mb = int(content_length) / (1024 * 1024)
                raise ImageTooLargeError(
                    f"Image too large: {size_mb:.1f}MB (max: {cls.MAX_SIZE_MB}MB)",
                    size_mb,
                )

            # Download the image
            response = requests.get(
                image_url, headers=cls.REQUEST_HEADERS, timeout=10, stream=True
            )

            if response.status_code != 200:
                raise ImageDownloadError(
                    f"Failed to download image: HTTP {response.status_code}"
                )

            # Download and validate size
            chunks = []
            total_size = 0

            for chunk in response.iter_content(chunk_size=8192):
                chunks.append(chunk)
                total_size += len(chunk)

                if total_size > max_size_bytes:
                    size_mb = total_size / (1024 * 1024)
                    raise ImageTooLargeError(
                        f"Image too large: {size_mb:.1f}MB (max: {cls.MAX_SIZE_MB}MB)",
                        size_mb,
                    )

            # Combine chunks and validate image
            image_data = b"".join(chunks)
            return cls._validate_and_create_file(image_data)

        except requests.RequestException as e:
            raise ImageDownloadError(
                message=f"Network error downloading image", details=str(e)
            )
        except (ImageValidationError, ImageTooLargeError, ImageDownloadError):
            # Re-raise our custom exceptions
            raise
        except Exception as e:
            raise CharacterManagerException(
                message=f"Unexpected error downloading image", details=str(e)
            )

    @classmethod
    def _validate_and_create_file(cls, image_data: bytes) -> InMemoryUploadedFile:
        """
        Validate image data and create an InMemoryUploadedFile.

        Args:
            image_data: The raw image data

        Returns:
            The validated file as InMemoryUploadedFile

        Raises:
            ImageFormatUnsupported: If the image format is invalid or validation fails
        """
        # Validate image using Pillow
        image_stream = BytesIO(image_data)
        image = Image.open(image_stream)

        # Verify image format
        if image.format not in cls.ALLOWED_FORMATS:
            raise ImageFormatUnsupported()

        # Get file extension
        format_to_ext = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp", "GIF": "gif"}
        file_ext = format_to_ext.get(image.format, "jpg")

        # Create filename
        filename = f"downloaded_image.{file_ext}"

        # Reset stream position
        image_stream.seek(0)

        # Create InMemoryUploadedFile
        uploaded_file = InMemoryUploadedFile(
            file=image_stream,
            field_name="avatar",
            name=filename,
            content_type=f"image/{file_ext}",
            size=len(image_data),
            charset=None,
        )

        logger.debug(f"Successfully validated image: {image.format}, {image.size}")
        return uploaded_file

    @classmethod
    @transaction.atomic
    def save_character_avatar(
        cls, character: Character, image_file: InMemoryUploadedFile
    ) -> None:
        """
        Save an avatar image to a character instance.

        Args:
            character: The character model instance
            image_file: The validated image file to save

        Raises:
            CharacterManagerException: If saving the avatar fails
        """
        # Delete existing avatar if present
        try:
            if character.avatar:
                character.avatar.delete()

            # Generate unique filename
            new_filename = image_file.name.replace(
                "downloaded_image", f"{character.pk}"
            )

            # Save the new avatar
            character.avatar.save(new_filename, image_file)
        except Exception as e:
            raise CharacterManagerException(
                message=f"Failed to save avatar for character {character.pk}",
                details=str(e),
            )

    @classmethod
    def delete_character_avatar(cls, character: Character) -> None:
        """
        Delete a character's avatar file.

        Args:
            character: The character model instance

        Raises:
            CharacterManagerException: If deleting the avatar fails
        """
        try:
            if character.avatar:
                character.avatar.delete()
        except Exception as e:
            raise CharacterManagerException(
                message=f"Failed to delete avatar for character {character.pk}",
                details=str(e),
            )
