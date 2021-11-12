

validate_roster_master_numbers = False

move_roster_seasons_to_active = [1998, 1999, 2000]

player_class_mandate_season = 2005

game_start_season_month = dict()
game_end_season_month = dict()
game_end_season_date = dict()
game_tag = dict()
min_rosters_in_master = dict()

game_start_season_month['MBB'] = '11' # Nov
game_end_season_month['MBB'] = '3' # Mar
game_end_season_date['MBB'] = '31' # Mar
game_tag['MBB'] = 'bbgame'
min_rosters_in_master['MBB'] = 5

game_start_season_month['MFB'] = '08' # Aug
game_end_season_month['MFB'] = '01' # Jan
game_end_season_date['MFB'] = '31' # Jan 31
game_tag['MFB'] = 'fbgame'
min_rosters_in_master['MFB'] = 50


stage_mongo_url = 'localhost:27017'
stage_mongo_db_name = 'athlyte'
stage_mongo_collection = 'StageActiveRoster'


active_mongo_url = 'localhost:27017'
active_mongo_db_name = 'athlyte'
active_mongo_collection = 'ActiveRoster'


master_mongo_url = 'localhost:27017'
master_mongo_db_name = 'athlyte'
master_mongo_collection = 'Rosters'

player_class_array = ['FR', 'SO', 'JR', 'SR']


UNVERIFIED = 1
VERIFIED_MASTER = 2
VERIFIED_ACTIVE = 3
VERIFIED_MASTER_ACTIVE = 4
# not sure why I have added the status - 5. Re-validate later.
PLAYER_CLASS_MISMATCH = 5
PLAYER_HAS_TWO_CLASSES = 6
UNVERIFIED_PLAYER_HAS_NO_CLASS = 7
MANUAL_VERIFIED = 8
