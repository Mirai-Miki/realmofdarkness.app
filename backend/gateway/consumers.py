import json as JSON
from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import serialize_user, serialize_chronicle
from .serializers import serialize_member
from .constants import GATEWAY_OPCODE, Group
from haven.models import Character
from chronicle.models import Member
from channels.db import database_sync_to_async
import logging
from django.db.models import Q

# Utility function to get concrete subclass of a character and its appropriate serializer
from haven.utility import get_derived_instance, get_tracker_serializer

logger = logging.getLogger("DEBUG")
log = logging.getLogger()


class GatewayConsumer(AsyncWebsocketConsumer):
    """
    Main WebSocket consumer that handles real-time communication with clients.
    Manages character, chronicle, and member data subscriptions.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dictionary to store character data by ID
        self.characters = None
        # Dictionary to store chronicle data by ID
        self.chronicles = None
        # Dictionary to store member data by chronicle ID and user ID
        self.members = None
        # The authenticated user
        self.user = None
        # Set of group names this consumer is subscribed to
        self.subscriptions = set()
        # Currently selected character sheet (if any)
        self.sheetSubscription = None
        # Set of character IDs this consumer is subscribed to
        self.subscribed_character_ids = set()

    async def connect(self):
        """
        Handle websocket connection - accept connection and initialize data if user is authenticated
        """
        try:
            # Accept the WebSocket connection
            await self.accept()
            # Get the user from the scope (provided by authentication middleware)
            self.user = self.scope["user"]
            # Only initialize data if user is authenticated
            if not self.user.is_anonymous:
                await self.init_data()

            # Add this consumer to all its subscribed groups
            for subscription in self.subscriptions:
                await self.add_group_subscription(subscription)
            # Send welcome message
            await self.send(text_data=GatewayMessage().welcome())
        except Exception as e:
            logger.error(f"Connection error: {str(e)}")
            await self.close(code=1011)  # Internal error

    async def disconnect(self, close_code):
        """
        Handle websocket disconnect - cleanup subscriptions
        """
        try:
            # Remove this consumer from all subscribed groups
            await self.clear_subscriptions()
        except Exception as e:
            logger.error(f"Disconnect error: {str(e)}")

    async def receive(self, text_data=None):
        """
        Handle messages from the websocket client
        """
        try:
            # Parse the incoming message
            gateway = await GatewayMessage().loadJson(text_data)

            # Validate message structure
            if not gateway.validate():
                logger.warning(f"Invalid message format received: {text_data}")
                return

            # Handle client identification
            if gateway.getOpcode() == GATEWAY_OPCODE.identify:
                # Respond with all initialized data
                data = {
                    "characters": self.characters,
                    "chronicles": self.chronicles,
                    "members": self.members,
                }
                await self.send(text_data=GatewayMessage().ready(self.user, data))

            # Handle sheet subscription requests
            elif gateway.getOpcode() == GATEWAY_OPCODE.request:
                if gateway.getEvent() == "sheet_subscribe":
                    # Subscribe to detailed updates for a specific character sheet
                    id = gateway.getData().get("id", None)
                    if id:
                        self.sheetSubscription = id
                    else:
                        self.sheetSubscription = None

        except JSON.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
        except Exception as e:
            logger.error(f"Receive error: {str(e)}")

    async def character_update(self, event):
        """
        Handle character update events
        Check visibility permissions before sending data to client
        """
        try:
            # Check if user has permission to see this character
            chronicle = event.get("tracker", {}).get("chronicle", None)
            is_visible = (int(chronicle) if chronicle else 0) in self.chronicles
            if (
                str(event.get("tracker", {}).get("user", "")) != str(self.user.id)
                and not is_visible
            ):
                # If not visible, treat as a deletion
                return await self.character_delete(event)

            # Check if this is the currently selected character sheet
            sub = None
            if (
                self.sheetSubscription
                and self.sheetSubscription in self.subscribed_character_ids
            ):
                sub = self.sheetSubscription
            # Send update to client
            await self.send(text_data=GatewayMessage().update_character(event, sub))
        except Exception as e:
            logger.error(f"Character update error: {str(e)}")

    async def member_update(self, event):
        """Handle member update events from the channel layer"""
        try:
            await self.send(text_data=GatewayMessage().update_member(event))
        except Exception as e:
            logger.error(f"Member update error: {str(e)}")

    async def user_update(self, event):
        """Handle user update events from the channel layer"""
        try:
            await self.send(text_data=GatewayMessage().update_user(event))
        except Exception as e:
            logger.error(f"User update error: {str(e)}")

    async def chronicle_update(self, event):
        """Handle chronicle update events from the channel layer"""
        try:
            await self.send(text_data=GatewayMessage().update_chronicle(event))
        except Exception as e:
            logger.error(f"Chronicle update error: {str(e)}")

    async def character_new(self, event):
        """
        Handle new character creation events
        Add character to subscriptions if user has permission to see it
        """
        try:
            # Verify permission to see this character
            if await self.verify_new_character(event.get("tracker", {})):
                # Add subscription to this character
                character_id = event.get("id")
                await self.add_character_subscription(character_id)
                # Send update to client
                await self.send(
                    text_data=GatewayMessage().update_character(event, None)
                )
        except Exception as e:
            logger.error(f"New character error: {str(e)}")

    async def character_delete(self, event):
        """
        Handle character deletion events
        Remove character from subscriptions and notify client
        """
        try:
            id = str(event.get("id", ""))
            if id not in self.subscribed_character_ids:
                return
            # Remove from subscriptions
            await self.remove_character_subscription(id)
            # Notify client
            await self.send(text_data=GatewayMessage().delete_character(id))
        except Exception as e:
            logger.error(f"Character delete error: {str(e)}")

    # Centralized subscription management methods
    async def add_group_subscription(self, group_name):
        """Add subscription to a channel layer group"""
        await self.channel_layer.group_add(group_name, self.channel_name)
        self.subscriptions.add(group_name)

    async def remove_group_subscription(self, group_name):
        """Remove subscription from a channel layer group"""
        await self.channel_layer.group_discard(group_name, self.channel_name)
        if group_name in self.subscriptions:
            self.subscriptions.remove(group_name)

    async def add_character_subscription(self, character_id):
        """Add subscription to a character's updates"""
        if not character_id:
            return
        group_name = Group.character_update(character_id)
        await self.add_group_subscription(group_name)
        self.subscribed_character_ids.add(str(character_id))

    async def remove_character_subscription(self, character_id):
        """Remove subscription from a character's updates"""
        if not character_id or str(character_id) not in self.subscribed_character_ids:
            return
        group_name = Group.character_update(character_id)
        await self.remove_group_subscription(group_name)
        self.subscribed_character_ids.remove(str(character_id))

    async def clear_subscriptions(self):
        """Clear all subscriptions"""
        for subscription in list(self.subscriptions):
            await self.remove_group_subscription(subscription)
        self.subscriptions.clear()
        self.subscribed_character_ids.clear()
        self.sheetSubscription = None

    def character_subscribe(self, id):
        """
        Add character to subscription list (synchronous version)
        Used during initialization
        """
        self.subscribed_character_ids.add(str(id))
        self.subscriptions.add(Group.character_update(id))

    @database_sync_to_async
    def verify_new_character(self, character):
        """
        Verify if current user has permissions to see a new character
        Either owned by user or user is admin/storyteller in the chronicle
        """
        try:
            # User can always see their own characters
            if str(self.user.id) == str(character.get("user", "")):
                return True
            # For characters in chronicles, check if user is admin/storyteller
            elif character.get("chronicle"):
                return Member.objects.filter(
                    Q(user=self.user)
                    & Q(chronicle_id=character["chronicle"])
                    & (Q(admin=True) | Q(storyteller=True))
                ).exists()
        except Exception as e:
            logger.error(f"Character permission verification error: {str(e)}")
            return False
        return False

    @database_sync_to_async
    def init_data(self):
        """
        Initialize character, chronicle and member data for the current user
        Uses DRF serializers to format data for the client
        """
        if self.user.is_anonymous:
            return None

        try:
            self.characters = {}
            self.chronicles = {}
            self.members = {}

            # Add user subscriptions
            self.subscriptions.add(Group.user_update(self.user.id))
            self.subscriptions.add(Group.character_new())
            self.subscriptions.add(Group.character_delete())

            # Process each chronicle the user belongs to
            chronicle_set = self.user.chronicles.all()
            for chronicle in chronicle_set:
                self.chronicles[chronicle.id] = serialize_chronicle(chronicle)
                self.subscriptions.add(Group.chronicle_update(chronicle.id))

                # Get member info for the current user in this chronicle
                try:
                    member = Member.objects.get(user=self.user, chronicle=chronicle)
                    is_staff = member.admin or member.storyteller
                except Member.DoesNotExist:
                    is_staff = False

                # Initialize characters for this chronicle
                character_set_all = chronicle.character_set

                # Filter characters based on permissions
                if is_staff:
                    # Staff can see all characters
                    character_set = character_set_all.all()
                else:
                    # Regular users only see their own
                    character_set = character_set_all.filter(user=self.user)

                if not self.members.get(chronicle.id):
                    self.members[chronicle.id] = {}

                # Process each character in the chronicle
                for character in character_set:
                    try:
                        # Get derived instance and serialize using appropriate tracker serializer
                        derived_character = get_derived_instance(character)

                        # Only serialize if we have a valid splat
                        if derived_character.splat:
                            tracker_serializer_class = get_tracker_serializer(
                                derived_character.splat
                            )
                            if tracker_serializer_class:
                                serialized_data = tracker_serializer_class(
                                    derived_character
                                ).data
                                self.characters[character.id] = serialized_data
                                self.character_subscribe(character.id)

                            # Add member information if we haven't already
                            if not self.members[chronicle.id].get(character.user_id):
                                # Make sure character has proper member association
                                repair_character(character)
                                if character.member:
                                    self.members[chronicle.id][character.user_id] = (
                                        serialize_member(character.member)
                                    )
                                    self.subscriptions.add(
                                        Group.member_update(character.member.id)
                                    )
                    except Exception as e:
                        logger.error(
                            f"Error processing chronicle character {getattr(character, 'name', 'unknown')}: {str(e)}"
                        )

            # Process characters not associated with any chronicle
            for character in Character.objects.filter(user=self.user, chronicle=None):
                try:
                    # Get derived instance and serialize
                    derived_character = get_derived_instance(character)

                    if derived_character.splat:
                        tracker_serializer_class = get_tracker_serializer(
                            derived_character.splat
                        )

                        if tracker_serializer_class:
                            serialized_data = tracker_serializer_class(
                                derived_character
                            ).data
                            self.characters[character.id] = serialized_data
                            self.character_subscribe(character.id)
                except Exception as e:
                    logger.error(
                        f"Error serializing {getattr(derived_character, 'name', 'unknown')}: {str(e)}"
                    )

        except Exception as e:
            logger.error(f"Error initializing data: {str(e)}")


class GatewayMessage:
    """
    Helper class for formatting messages sent through the websocket.
    Follows a standard format with operation code, type and data.
    """

    def __init__(self):
        # Initialize empty message structure
        self.data = {"op": None, "d": None, "t": None}

    def getOpcode(self):
        """Get the operation code from the message"""
        return self.data.get("op")

    def getEvent(self):
        """Get the event type from the message"""
        return self.data.get("t", None)

    def getData(self):
        """Get the data payload from the message"""
        return self.data.get("d", None)

    def validate(self):
        """Validate message structure"""
        return (
            isinstance(self.data, dict)
            and "op" in self.data
            and self.data["op"] is not None
        )

    async def loadJson(self, json):
        """Parse a JSON string into a message object"""
        try:
            self.data = JSON.loads(json)
            return self
        except JSON.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            self.data = {"op": None, "d": None, "t": None}
            return self

    def toJson(self):
        """Convert message to JSON string for sending"""
        try:
            return JSON.dumps(self.data)
        except Exception as e:
            logger.error(f"JSON serialization error: {str(e)}")
            return JSON.dumps(
                {
                    "op": GATEWAY_OPCODE.dispatch,
                    "t": "ERROR",
                    "d": {"message": "Serialization error"},
                }
            )

    def welcome(self):
        """Create a welcome message (connection acknowledgment)"""
        self.data["op"] = GATEWAY_OPCODE.welcome
        return self.toJson()

    def ready(self, user, data):
        """
        Create a ready message with initial data for the client
        Sent in response to an identify request
        """
        try:
            if user.is_anonymous:
                self.data["op"] = GATEWAY_OPCODE.dispatch
                self.data["t"] = "READY"
                self.data["d"] = {}
                return self.toJson()

            self.data["op"] = GATEWAY_OPCODE.dispatch
            self.data["t"] = "READY"
            self.data["d"] = {
                "user": serialize_user(user),
                "members": data["members"],
                "characters": data["characters"],
                "chronicles": data["chronicles"],
            }
            return self.toJson()
        except Exception as e:
            logger.error(f"Error preparing ready message: {str(e)}")
            return self.error_message("Failed to prepare data")

    def update_character(self, event, sheet_id):
        """
        Create a character update message
        Optionally includes detailed sheet data if this is the selected character
        """
        try:
            self.data["op"] = GATEWAY_OPCODE.dispatch
            self.data["t"] = "UPDATE_CHARACTER"
            sheet = None
            if sheet_id and sheet_id == str(event.get("id")) and "sheet" in event:
                tracker = event.get("tracker", {})
                sheet = event.get("sheet")
            else:
                tracker = event.get("tracker", {})

            self.data["d"] = {"character": tracker, "id": event.get("id")}
            if sheet:
                self.data["d"]["sheet"] = sheet

            return self.toJson()
        except Exception as e:
            logger.error(f"Error preparing character update: {str(e)}")
            return self.error_message("Failed to update character")

    def delete_character(self, id):
        """Create a character deletion message"""
        try:
            self.data["op"] = GATEWAY_OPCODE.dispatch
            self.data["t"] = "DELETE_CHARACTER"
            self.data["d"] = {"id": id}
            return self.toJson()
        except Exception as e:
            logger.error(f"Error preparing character deletion: {str(e)}")
            return self.error_message("Failed to delete character")

    def update_member(self, event):
        """Create a member update message"""
        try:
            self.data["op"] = GATEWAY_OPCODE.dispatch
            self.data["t"] = "UPDATE_MEMBER"
            self.data["d"] = {"member": event.get("member", {})}
            return self.toJson()
        except Exception as e:
            logger.error(f"Error preparing member update: {str(e)}")
            return self.error_message("Failed to update member")

    def update_user(self, event):
        """Create a user update message"""
        try:
            self.data["op"] = GATEWAY_OPCODE.dispatch
            self.data["t"] = "UPDATE_USER"
            self.data["d"] = {"user": event.get("user", {})}
            return self.toJson()
        except Exception as e:
            logger.error(f"Error preparing user update: {str(e)}")
            return self.error_message("Failed to update user")

    def update_chronicle(self, event):
        """Create a chronicle update message"""
        try:
            self.data["op"] = GATEWAY_OPCODE.dispatch
            self.data["t"] = "UPDATE_CHRONICLE"
            self.data["d"] = {"chronicle": event.get("chronicle", {})}
            return self.toJson()
        except Exception as e:
            logger.error(f"Error preparing chronicle update: {str(e)}")
            return self.error_message("Failed to update chronicle")

    def error_message(self, message):
        """Create an error message"""
        self.data["op"] = GATEWAY_OPCODE.dispatch
        self.data["t"] = "ERROR"
        self.data["d"] = {"message": message}
        return self.toJson()


def repair_character(character):
    """
    Make sure character has a valid member if it belongs to a chronicle
    This helps maintain referential integrity
    """
    try:
        if character.chronicle and not character.member:
            try:
                character.member = Member.objects.get(
                    user=character.user, chronicle=character.chronicle
                )
                character.save()
            except Member.DoesNotExist:
                pass
        return character
    except Exception as e:
        logger.error(
            f"Error repairing character {getattr(character, 'name', 'unknown')}: {str(e)}"
        )
        return character
