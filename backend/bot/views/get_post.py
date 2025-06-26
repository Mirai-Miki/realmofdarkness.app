from django.http import Http404
from json import loads
from .Authenticate import authenticate


def get_post(request):
    if request.method != "POST":
        raise Http404

    # Call authenticate first - it will raise NotFound if authentication fails
    authenticate(request)

    # If we get here, authentication succeeded
    try:
        post = loads(request.body)
        if not post:
            raise Http404
        return post
    except (ValueError, TypeError):
        # Handle JSON parsing errors
        raise Http404
