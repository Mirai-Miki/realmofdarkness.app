
class GATEWAY_OPCODE():
  dispatch = 0
  request = 1
  heartbeat = 2
  identify = 3
  welcome = 4
  heartbeatACK = 5

class Splats():
  vampire20th = 'vampire20th'
  ghoul20th = 'ghoul20th'
  human20th = 'human20th'
  werewolf20th = 'werewolf20th'
  changeling20th = 'changeling20th'  
  mage20th = 'mage20th'
  wraith20th = 'wraith20th' 
  demonTF = 'demon20th'
  vampire5th = 'vampire5th'
  mortal5th = 'mortal5th'
  hunter5th = 'hunter5th'

class Versions():
  v5 = '5th'
  v20 = '20th'
  cod = 'cod'
  splats_versions = {
    Splats.changeling20th: v20,
    Splats.vampire20th: v20,
    Splats.ghoul20th: v20,
    Splats.human20th: v20,
    Splats.werewolf20th: v20,
    Splats.mage20th: v20,
    Splats.wraith20th: v20,
    Splats.demonTF: v20,
    Splats.vampire5th: v5,
    Splats.mortal5th: v5,
    Splats.hunter5th: v5
  }
  
  @staticmethod
  def get_splat_version(splat):      
      return Versions.splats_versions.get(splat, None)