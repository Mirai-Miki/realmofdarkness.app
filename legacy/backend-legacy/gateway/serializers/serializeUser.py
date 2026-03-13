def serialize_user(user):
    return {
        "id": str(user.id),
        "username": user.username,
        "discriminator": user.discriminator,
        "avatar_url": user.avatar_url,
        "admin": user.admin,
        "supporter": user.supporter,
        "date_created": user.created_at.timestamp(),
    }
