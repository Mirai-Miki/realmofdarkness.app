def serialize_chronicle(chronicle):
    return {
        "id": str(chronicle.id),
        "name": chronicle.name,
        "iconUrl": chronicle.icon_url,
        "createdAt": chronicle.created_at.timestamp(),
    }
