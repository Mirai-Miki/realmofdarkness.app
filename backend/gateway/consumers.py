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
from chronicle.models import Chronicle
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

    async def character_new(self, event):
        """
        Handle new character creation events
        Add character to subscriptions if user has permission to see it
        """
        try:
            character_id = str(event.get("id", ""))

            # Check if we're already subscribed to this character
            if character_id in self.subscribed_character_ids:
                # Already subscribed, ignore this event to avoid duplicates
                return

            if await self.verify_new_character(event.get("tracker", {})):
                # Add subscription to this character
                await self.add_character_subscription(character_id)
                # Send update to client
                await self.send(
                    text_data=GatewayMessage().update_character(event, None)
                )
        except Exception as e:
            logger.error(f"New character error: {str(e)}")

    async def character_update(self, event):
        """
        Handle character update events
        Check visibility permissions before sending data to client
        """
        try:
            tracker = event.get("tracker", {})
            chronicle_id = tracker.get("chronicle", None)
            user_id = tracker.get("user", "")

            is_current_user = user_id == str(self.user.id) if user_id else False
            is_staff = (
                await self.is_user_staff_in_chronicle(chronicle_id)
                if chronicle_id
                else False
            )
            is_visible = is_current_user or is_staff
            # Check if user has permission to see this character
            if not is_visible:
                # If not visible then treat as a deletion (delete also unsubs)
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

    async def member_new(self, event):
        """
        Handle new member creation events
        Subscribe to member updates if:
        1. User is the member being created (need to track their own membership)
        2. User is admin/storyteller of the chronicle (need to see new members)
        """
        try:
            member_data = event.get("member", {})
            user_id = str(member_data.get("user", ""))
            chronicle_id = str(member_data.get("chronicle", ""))

            # Check if this is the current user joining
            is_current_user = user_id == str(self.user.id)

            # Check if current user is staff in this chronicle
            is_staff_member = await self.is_user_staff_in_chronicle(chronicle_id)

            if not is_current_user and not is_staff_member:
                # If not current user or staff, do not process this event
                return

            # If this is the current user joining, handle chronicle setup FIRST
            if is_current_user:
                await self.add_group_subscription(Group.chronicle_update(chronicle_id))

                # Send chronicle data to frontend so they can see the new chronicle FIRST
                chronicle_data = await self.get_chronicle_data(chronicle_id)
                if chronicle_data:
                    await self.send(
                        text_data=GatewayMessage().update_chronicle(
                            {
                                "type": "chronicle.update",
                                "chronicle": chronicle_data,
                            }
                        )
                    )

            # If the user is also staff, subscribe to ALL existing members and characters
            if is_staff_member:
                # Get and send all existing members in this chronicle
                existing_members = await self.get_chronicle_members_data(chronicle_id)
                for member_data_item in existing_members:
                    member_group = Group.member_update(member_data_item["id"])
                    # Only subscribe if not already subscribed
                    if member_group not in self.subscriptions:
                        await self.add_group_subscription(member_group)
                        # Send member data to frontend only if newly subscribed
                        await self.send(
                            text_data=GatewayMessage().update_member(
                                {
                                    "type": "member.update",
                                    "member": member_data_item,
                                }
                            )
                        )

                # Get and send all existing characters in this chronicle
                existing_characters = await self.get_chronicle_characters_data(
                    chronicle_id
                )
                for character_data in existing_characters:
                    character_id = str(character_data["id"])
                    # Only subscribe if not already subscribed
                    if character_id not in self.subscribed_character_ids:
                        await self.add_character_subscription(character_id)
                        # Send character data to frontend only if newly subscribed
                        await self.send(
                            text_data=GatewayMessage().update_character(
                                {
                                    "type": "character.update",
                                    "id": character_data["id"],
                                    "tracker": character_data["tracker"],
                                },
                                None,
                            )
                        )

            # Subscribe to this specific member's updates (both for current user and staff)
            new_member_group = Group.member_update(member_data.get("id"))
            new_member_already_subscribed = new_member_group in self.subscriptions

            if not new_member_already_subscribed:
                await self.add_group_subscription(new_member_group)

            # Send member update to client
            # Only send if we haven't already subscribed to this member (which means we already sent it above)
            if not new_member_already_subscribed:
                await self.send(text_data=GatewayMessage().update_member(event))
        except Exception as e:
            logger.error(f"Member new error: {str(e)}")

    async def member_update(self, event):
        """Handle member update events from the channel layer"""
        try:
            await self.send(text_data=GatewayMessage().update_member(event))
        except Exception as e:
            logger.error(f"Member update error: {str(e)}")

    async def member_delete(self, event):
        """
        Handle member deletion events
        Remove subscriptions and forward event if:
        1. It's the current user being removed (need to clean up ALL chronicle access)
        2. Current user is admin/storyteller and can see this member (need to update member list)
        """
        try:
            member_data = event.get("member", {})
            user_id = str(member_data.get("user", ""))
            chronicle_id = str(member_data.get("chronicle", ""))
            member_id = member_data.get("id")

            # Check if this is the current user being removed
            is_current_user = user_id == str(self.user.id)

            # Check if current user is staff in this chronicle and can see this member
            is_staff_member = await self.is_user_staff_in_chronicle(chronicle_id)

            # Process if this is the current user OR if user is staff in this chronicle
            if is_current_user or is_staff_member:
                # If this is the current user being removed, do comprehensive cleanup
                if is_current_user:
                    # Unsubscribe from chronicle updates
                    if chronicle_id:
                        await self.remove_group_subscription(
                            Group.chronicle_update(chronicle_id)
                        )

                    # Get all member IDs in this chronicle and unsubscribe from them
                    member_ids = await self.get_chronicle_member_ids(chronicle_id)
                    for member_id_to_unsub in member_ids:
                        await self.remove_group_subscription(
                            Group.member_update(member_id_to_unsub)
                        )

                    # Get all character IDs in this chronicle and unsubscribe from them
                    character_ids = await self.get_chronicle_character_ids(chronicle_id)
                    for character_id in character_ids:
                        await self.remove_character_subscription(character_id)

                else:
                    # Staff member viewing another user leave - just unsubscribe from this specific member
                    if member_id:
                        await self.remove_group_subscription(
                            Group.member_update(member_id)
                        )

                # Send member deletion to client so staff can update their view
                await self.send(text_data=GatewayMessage().delete_member(event))
        except Exception as e:
            logger.error(f"Member delete error: {str(e)}")

    @database_sync_to_async
    def get_chronicle_member_ids(self, chronicle_id):
        """
        Get all member IDs in a chronicle for cleanup when user leaves
        """
        try:
            # Get all members in this chronicle
            members = Member.objects.filter(chronicle_id=chronicle_id)
            return [member.id for member in members]
        except Exception as e:
            logger.error(f"Error getting chronicle member IDs: {str(e)}")
            return []

    @database_sync_to_async
    def get_chronicle_character_ids(self, chronicle_id):
        """
        Get all character IDs in a chronicle for cleanup when user leaves
        """
        try:
            # Get all characters in this chronicle
            from haven.models import Character

            characters = Character.objects.filter(chronicle_id=chronicle_id)
            return [character.id for character in characters]
        except Exception as e:
            logger.error(f"Error getting chronicle character IDs: {str(e)}")
            return []

    @database_sync_to_async
    def get_chronicle_members_data(self, chronicle_id):
        """
        Get all member data in a chronicle for sending to staff when they join
        """
        try:
            members = Member.objects.filter(chronicle_id=chronicle_id)
            members_data = []
            for member in members:
                members_data.append(serialize_member(member))
            return members_data
        except Exception as e:
            logger.error(f"Error getting chronicle members data: {str(e)}")
            return []

    @database_sync_to_async
    def get_chronicle_characters_data(self, chronicle_id):
        """
        Get all character data in a chronicle for sending to staff when they join
        """
        try:
            from haven.models import Character

            characters = Character.objects.filter(chronicle_id=chronicle_id)
            characters_data = []
            for character in characters:
                # Get the derived instance to access the specific splat
                derived_character = get_derived_instance(character)
                # Get the tracker serializer for this splat
                tracker_serializer = get_tracker_serializer(derived_character.splat)
                # Serialize the character
                tracker_data = tracker_serializer(derived_character).data

                characters_data.append(
                    {
                        "id": character.id,
                        "tracker": tracker_data,
                        "class": derived_character.splat,
                    }
                )
            return characters_data
        except Exception as e:
            logger.error(f"Error getting chronicle characters data: {str(e)}")
            return []

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
    def is_user_staff_in_chronicle(self, chronicle_id):
        """
        Check if current user is admin or storyteller in the given chronicle
        """
        try:
            return Member.objects.filter(
                Q(user=self.user)
                & Q(chronicle_id=chronicle_id)
                & (Q(admin=True) | Q(storyteller=True))
            ).exists()
        except Exception as e:
            logger.error(f"Error checking staff status: {str(e)}")
            return False

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
    def get_chronicle_data(self, chronicle_id):
        """
        Get chronicle data for a given chronicle ID
        """
        try:
            chronicle = Chronicle.objects.get(pk=chronicle_id)
            return serialize_chronicle(chronicle)
        except Chronicle.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error fetching chronicle data: {str(e)}")
            return None

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
            self.subscriptions.add(Group.member_new())
            self.subscriptions.add(Group.member_delete())

            # Process each chronicle the user belongs to
            chronicle_set = self.user.chronicles.all()
            for chronicle in chronicle_set:
                self.chronicles[str(chronicle.id)] = serialize_chronicle(chronicle)
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
                    self.members[str(chronicle.id)] = {}

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
                                self.characters[str(character.id)] = serialized_data
                                self.character_subscribe(character.id)

                            # Add member information if we haven't already
                            if not self.members[str(chronicle.id)].get(
                                str(character.user_id)
                            ):
                                # Make sure character has proper member association
                                repair_character(character)
                                if character.member:
                                    self.members[str(chronicle.id)][
                                        str(character.user_id)
                                    ] = serialize_member(character.member)
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
                            self.characters[str(character.id)] = serialized_data
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

    def delete_member(self, event):
        """Create a member deletion message"""
        try:
            self.data["op"] = GATEWAY_OPCODE.dispatch
            self.data["t"] = "DELETE_MEMBER"
            self.data["d"] = {"member": event.get("member", {})}
            return self.toJson()
        except Exception as e:
            logger.error(f"Error preparing member deletion: {str(e)}")
            return self.error_message("Failed to delete member")

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
