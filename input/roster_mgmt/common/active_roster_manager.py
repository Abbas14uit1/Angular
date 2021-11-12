import logging
from pymongo import MongoClient
from bson import regex
import uuid
import config
import time


VERIFIED = "Verified"
UNVERIFIED = "UnVerified"
MANUAL_CATEGORY = "Manually Verified"
MASTER_CATEGORY = "Master Verified"
ACTIVE_CATEFOGY = "Active Verified"
UNVERIFIED_CATEGORY = "Unverified"

player_class_array = ['FR', 'SO', 'JR', 'SR']

last_season_class_dict = dict()
last_season_class_dict['SO'] = 'FR'
last_season_class_dict['JR'] = 'SO'
last_season_class_dict['SR'] = 'JR'

possible_last_player_class_FR = ['FR']
possible_last_player_class_SO = ['FR', 'SO']
possible_last_player_class_JR = ['FR', 'SO', 'JR']
possible_last_player_class_SR = ['FR', 'SO', 'JR', 'SR']


class ActiveRosterManager:

    def __init__(self, mongo_url='localhost:27017', mongo_db_name='athlyte', mongo_collection='ActiveRoster'):
        self.logger= logging.getLogger(__name__)
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db = self.mongo_client[mongo_db_name]
        self.mongo_connection = self.mongo_db[mongo_collection]


    def find_player_in_last_seasons(self, player_name_opts, sport_code, team_code, season, player_class, player_uni, player_code):

        last_seasons = self._get_season_array(player_class, season)
        reg_name = regex.Regex(player_name_opts.check_name)

        # Not including player class in query because current season & last season player class will be different.
        query = {"$and": [{"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": {"$in": last_seasons}},
                          {"playerName": reg_name}]}

        active_players_list = []
        active_players = self.mongo_connection.find(query)
        for active_player in active_players:
            active_players_list.append(active_player)

        # found multiple matches so comparing other parameters
        self.logger.info('Found Active players:' + str(len(active_players_list)))

        if len(active_players_list) == 0:
            self.logger.info('No Players found in Active Roster. Player Name: <' + player_name_opts.check_name + '>')
            return None
        active_player_found = None
        found_count = 0
        active_player_found_after_check_name = list()
        for active_player in active_players_list:
            '''For now considering only the first from the array.'''
            if active_player['playerName'][0] == player_name_opts.check_name:
                found_count += 1
                active_player_found = active_player
                active_player_found_after_check_name.append(active_player_found)

        if found_count == 1:
            last_season_class = last_season_class_dict.get(player_class, None)
            if (last_season_class is not None and last_season_class == active_player_found['playerClass']) \
                or player_class == active_player_found['playerClass']:
                self.logger.info('Last season player class matched. Last Season Class: ' + str(last_season_class)
                                 + ', Current Season Class: ' + player_class)
                return active_player_found

        if found_count == 0:
            active_player_found_after_check_name = active_players_list

        # found multiple matches so comparing other parameters
        self.logger.info('After full name still Found Multiple matches in Active, so comparing other parameters. '
                         'Found players:' + str(len(active_player_found_after_check_name)))
        active_players_found_after_uniform = list()
        # Not comparing player class because last season class will be different.
        for active_player in active_player_found_after_check_name:
            if active_player['jerseyNumber'] == player_uni or active_player['jerseyNumber'] == player_code:
                self.logger.info('Jersey Number Matched: ' + player_code)
                active_players_found_after_uniform.append(active_player)

        if len(active_players_found_after_uniform) == 0:
            active_players_found_after_uniform = active_players_list

        for active_player in active_players_found_after_uniform:
            if active_player['playerClass'] == 'FR' and active_player['playerClass'] in possible_last_player_class_FR:
                return active_player
            elif active_player['playerClass'] == 'SO' and active_player['playerClass'] in possible_last_player_class_SO:
                return active_player
            elif active_player['playerClass'] == 'JR' and active_player['playerClass'] in possible_last_player_class_JR:
                return active_player
            elif active_player['playerClass'] == 'SR' and active_player['playerClass'] in possible_last_player_class_SR:
                return active_player

        if len(active_players_found_after_uniform) == 1 and (active_players_found_after_uniform[0]['playerClass'] is None or
                                                             len(active_players_found_after_uniform[0]['playerClass']) == 0):
            self.logger.info('Player found in Active however no match found with player class because player class is blank or null. '
                             'Considering the found player.')
            return active_players_found_after_uniform[0]

        self.logger.info('No player found in Active Roster.')
        return None


    def _get_season_array(self, player_class, season):

        season_lst = list()
        max_last_season = 4
        if player_class is None or len(player_class) == 0:
            max_last_season = 5
        elif player_class.upper() == 'FR':
            max_last_season = 3
        elif player_class.upper() == 'SO':
            max_last_season = 4
        elif player_class.upper() == 'JR':
            max_last_season = 5
        elif player_class.upper() == 'SR':
            max_last_season = 5

        # for - 4 years.
        for i in range(0, max_last_season):
            season_lst.append(season - i)

        # for + 4 Years.
        for i in range(0, max_last_season):
            season_lst.append(season + i)

        # To get Unique seasons.
        return list(set(season_lst))

    def move_roster_stage_to_active(self, current_season, stage_roster_manager, master_roster_provider):

        self.logger.info('Started Moving rosters from stage to Active.')
        query = {'status': {'$in': [config.VERIFIED_MASTER, config.VERIFIED_ACTIVE, config.VERIFIED_MASTER_ACTIVE, config.MANUAL_VERIFIED]}}
        staged_rosters = stage_roster_manager.mongo_connection.find(query)
        ins_cnt = 0
        for staged_roster in staged_rosters:
            active_player_id = staged_roster['activePlayerId'] if 'activePlayerId' in staged_roster else None
            transferred = staged_roster['transferred'] if 'transferred' in staged_roster else None
            insert_required = True

            sport_code = staged_roster['sportCode']
            team_code = staged_roster['teamCode']
            season = staged_roster['season']

            if active_player_id is not None:
                active_uuid = active_player_id
                player_exist_query = {'playerId': active_uuid, 'sportCode': sport_code, 'teamCode': team_code, 'season': season}
                query_result = self.mongo_connection.find(player_exist_query)
                if query_result is not None and query_result.count() > 0:
                    insert_required = False
            else:
                active_uuid = str(uuid.uuid4())

            if not insert_required:
                self.logger.info('Player is already available in active. Player Id: ' + active_uuid + ', season: ' + str(season) +
                                 ', team code: ' + team_code + ', sport code: ' + sport_code)
                continue

            player_name = staged_roster['playerName']
            red_shirted = False
            red_shirted_season = 0
            player_class = staged_roster['playerClass']
            jersey_number = staged_roster['code']

            player_data = {'playerId': active_uuid, 'sportCode': sport_code, 'playerName': player_name, 'teamCode': team_code,
                           'season': season, 'redshirted': red_shirted, 'redshirtedSeason': red_shirted_season,
                           'playerClass': player_class, 'jerseyNumber': jersey_number}

            if transferred is not None:
                player_data['transferred'] = transferred

            self.mongo_connection.insert_one(player_data)
            ins_cnt += 1
            # self.logger.info('Roster inserted in Active. UUID: <' + active_uuid + '>')

        self.logger.info('Total inserted rosters in active: <' + str(ins_cnt) + '>')
        deleted_many = stage_roster_manager.mongo_connection.delete_many(query)
        self.logger.info('Total cleared stage rosters: <' + str(deleted_many.deleted_count) + '>')

        if current_season in config.move_roster_seasons_to_active:
            self.logger.info('Found current season in move to active seasons list. Current Season: ' + str(current_season))
            for season in config.move_roster_seasons_to_active:
                players_exists = master_roster_provider.player_available_in_season(season)
                self.logger.info('Players exists in master: <' + str(players_exists) + '> for season: ' + str(season))
                if not players_exists:
                    season_query = {'$and': [{'status': {'$in': [config.UNVERIFIED, config.UNVERIFIED_PLAYER_HAS_NO_CLASS]}},
                                               {'season': int(season)}]}
                    season_staged_rosters = stage_roster_manager.mongo_connection.find(season_query)
                    season_ins_cnt = 0
                    for season_staged_roster in season_staged_rosters:
                        transferred = season_staged_roster['transferred'] if 'transferred' in season_staged_roster else None
                        sport_code = season_staged_roster['sportCode']
                        team_code = season_staged_roster['teamCode']
                        season = season_staged_roster['season']
                        player_name = season_staged_roster['playerName']
                        red_shirted = False
                        red_shirted_season = 0
                        player_class = season_staged_roster['playerClass']
                        jersey_number = season_staged_roster['code']
                        active_uuid = str(uuid.uuid4())
                        player_data = {'playerId': active_uuid, 'sportCode': sport_code, 'playerName': player_name, 'teamCode': team_code,
                                       'season': season, 'redshirted': red_shirted, 'redshirtedSeason': red_shirted_season,
                                       'playerClass': player_class, 'jerseyNumber': jersey_number}

                        if transferred is not None:
                            player_data['transferred'] = transferred

                        self.mongo_connection.insert_one(player_data)
                        season_ins_cnt += 1
                    self.logger.info('Total inserted rosters in active: <' + str(season_ins_cnt) + '>')
                    season_deleted_many = stage_roster_manager.mongo_connection.delete_many(season_query)
                    self.logger.info('Total cleared stage rosters: <' + str(season_deleted_many.deleted_count) + '>')


    def get_all_active_player_class_blank_null(self):

        print 'in get all active players'
        query = {"$and": [{'$or': [{'playerClass': None}, {'playerClass': ''}]}, {"season":
                                                                                       {"$nin": config.move_roster_seasons_to_active}}]}
        print 'query:: ' + str(query)
        unverified_players = self.mongo_connection.find(query)

        unverified_players_lst = list()

        for player in unverified_players:
            # in Active we don't have this attributes so manually adding them to use the same html page to update the player class.
            player['code'] = player['jerseyNumber']
            player['uni'] = player['jerseyNumber']
            player['status'] = 999
            # Not sure which attribute we are using in stage. However it's not required because we will directly update Active
            player['played'] = True
            unverified_players_lst.append(player)

        return unverified_players_lst

    def update_player_class(self, player_mongo_obj_id, player_class):

        self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerClass': player_class}})
        print 'Updated player class: ' + player_class + ', for mongo object Id: ' + str(player_mongo_obj_id)
