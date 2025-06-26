import requests
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files import File
import logging
from typing import Tuple, Optional, Literal

from constants import ImageError

logger = logging.getLogger("DEBUG")
max_size_mb = 5  # Default max size in MB

# Use the Literal type with the constants from ImageError
FailureReason = Literal[
    "NO_URL", "TOO_LARGE", "DOWNLOAD_FAILED", "INVALID_IMAGE", "SUCCESS"
]


def download_and_verify_image(
    image_url,
) -> Tuple[Optional[InMemoryUploadedFile], FailureReason]:
    """
    Downloads an image from the URL, verifies it using Pillow, and returns it.

    Args:
        image_url: The URL of the image to download.

    Returns:
        Tuple containing:
          - The image file as InMemoryUploadedFile or None if failed
          - A string indicating success or the reason for failure
    """
    if not image_url:
        logger.warning("No image URL provided")
        return None, ImageError.NO_URL

    # Convert MB to bytes for comparison
    max_size_bytes = max_size_mb * 1024 * 1024

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    try:
        # First make a HEAD request to check size before downloading
        head_response = requests.head(image_url, headers=headers, timeout=5)
        content_length = head_response.headers.get("Content-Length")

        # Check content length if available
        if content_length and int(content_length) > max_size_bytes:
            logger.warning(
                f"Image too large: {int(content_length) / (1024 * 1024):.2f}MB exceeds limit of {max_size_mb}MB"
            )
            return None, ImageError.TOO_LARGE

        # Download the image
        logger.debug(f"Downloading image from: {image_url}")
        response = requests.get(image_url, headers=headers, timeout=10, stream=True)

        # Check if the response was successful
        if response.status_code != 200:
            logger.warning(
                f"Failed to download image. Status code: {response.status_code}"
            )
            return None, ImageError.DOWNLOAD_FAILED

        # Download content in chunks to check size
        chunks = []
        total_size = 0
        for chunk in response.iter_content(chunk_size=8192):
            chunks.append(chunk)
            total_size += len(chunk)

            # Check size during download
            if total_size > max_size_bytes:
                return None, ImageError.TOO_LARGE

        # Combine chunks into image data
        image_data = b"".join(chunks)

        # Verify using Pillow
        try:
            image = Image.open(BytesIO(image_data))
            # Get actual format from the image
            image_format = image.format.lower() if image.format else None
        except Exception as img_error:
            return None, ImageError.INVALID_IMAGE

        # Get content type from response headers or infer from image format
        content_type = response.headers.get("Content-Type", "")

        # If no content type in headers or it's not an image type, use the format from PIL
        if not content_type or not content_type.startswith("image/"):
            if image_format:
                content_type = f"image/{image_format}"
            else:
                content_type = "image/jpeg"  # Default fallback

        # Get file extension from content type or image format
        if "/" in content_type:
            format_ext = content_type.split("/")[-1].lower()
        else:
            format_ext = image_format or "jpg"

        # Handle special cases
        if format_ext == "jpeg":
            format_ext = "jpg"

        # Create the file object
        image_file = InMemoryUploadedFile(
            file=BytesIO(image_data),
            field_name="faceclaim",
            name=f"downloaded_image.{format_ext}",
            content_type=content_type,
            size=len(image_data),
            charset=None,
        )
        return image_file, ImageError.SUCCESS

    except requests.RequestException as req_error:
        logger.warning(f"Request error downloading image: {req_error}")
        return None, ImageError.DOWNLOAD_FAILED
    except Exception as e:
        logger.exception(f"Unexpected error downloading image: {e}")
        return None, ImageError.DOWNLOAD_FAILED
