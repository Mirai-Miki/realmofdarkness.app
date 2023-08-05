from rest_framework import serializers
from haven.models import Vampire5th
from .Character5th import Character5thSerializer, Character5thDeserializer, Tracker5thSerializer

########################### Character Serializer ##############################
class Vampire5thSerializer(Character5thSerializer):
  # Define SerializerMethodField for skills
  
  class Meta(Character5thSerializer.Meta):
    model = Vampire5th
    fields = Character5thSerializer.Meta.fields + (
      'clan',
      'sire',
      'generation',
      'predator_type',
      'humanity',
      'stains',
      'hunger'
    )

############################ Tracker Serializer ###############################
class V5TrackerSerializer(Tracker5thSerializer):
  class Meta(Tracker5thSerializer.Meta):
    model = Vampire5th
    fields = Tracker5thSerializer.Meta.fields + (
      'clan',
      'humanity',
      'stains',
      'hunger'
    )

  def to_representation(self, instance):
    data = super().to_representation(instance)

    # Add the additional fields to the serialized data
    data['splat'] = 'vampire5th'
    data['version'] = '5th'

    return data

############################ Character Deserializer ###########################
class Vampire5thDeserializer(Character5thDeserializer):
  class Meta(Character5thDeserializer.Meta):
    model = Vampire5th
    fields = '__all__'
  
  def validate(self, data):
    data = super().validate(data)

    for field in ['strength', 'dexterity', 'stamina']:
      value = data.get(field)
      if value is not None and (value < 0 or value > 5):
        raise serializers.ValidationError()
    
    return data