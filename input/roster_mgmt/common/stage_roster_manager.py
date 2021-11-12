import logging
from pymongo import MongoClient
import uuid
import config
from name_normalizer import NameOpts
from operator import itemgetter


class StageRosterManager:

    def __init__(self, mongo_url='localhost:27017', mongo_db_name='athlyte', mongo_collection='StageActiveRoster'):
        self.logger= logging.getLogger(__name__)
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db = self.mongo_client[mongo_db_name]
        self.mongo_connection = self.mongo_db[mongo_collection]

    def find_player(self, player_check_name, sport_code, team_code, season, player_class):

        if player_class is None or len(player_class.strip()) == 0:
            query = {"$and": [{"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(season)},
                              {"playerName": player_check_name}]}
        else:
            query = {"$and": [{"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(season)},
                              {"playerName": player_check_name}, {"playerClass": player_class.upper()}]}

        stage_players_list = []

        stage_players = self.mongo_connection.find(query)
        for stage_player in stage_players:
            stage_players_list.append(stage_player)

        # Scenario - First XML file does not have player class and player got staged,
        # in subsequent file player has class. that's why above query is returning empty list.
        # To handle this case running another query to check the player is staged.
        if len(stage_players_list) == 0 and player_class is not None:
            query = {"$and": [{"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(season)},
                              {"playerName": player_check_name}]}
            stage_players = self.mongo_connection.find(query)
            for stage_player in stage_players:
                stage_players_list.append(stage_player)
            # if only one player found update the player class. TODO we should move this updation to other place.
            if len(stage_players_list) == 1:
                mongo_obj_id = stage_players_list[0]['_id']
                player_stage_status = 1 if stage_players_list[0]['status'] == 7 else stage_players_list[0]['status']
                self.logger.info("Updating player class in find player method. Object Id: " + str(mongo_obj_id)
                                 + ', status: ' + str(player_stage_status))
                self.mongo_connection.update({'_id': mongo_obj_id}, {'$set': {'playerClass': player_class, 'status': player_stage_status}})

        return stage_players_list


    def insert_player(self, player_name, player_class, sport_code, season, team_code, player_uni,
                      player_code, played, status, active_player_id, transferred):
        uid = str(uuid.uuid4())

        player_data = {'status': status, 'code': self._prepend_zero_player_jersey_number(player_code), 'played': played,
                       'playerId': uid, 'season': season, 'playerClass': player_class,
                       'playerName': [player_name], 'sportCode': sport_code, 'teamCode': team_code, 'uni':
                           self._prepend_zero_player_jersey_number(player_uni)}
        if active_player_id is not None:
            player_data['activePlayerId'] = active_player_id
        if transferred is not None:
            player_data['transferred'] = True

        if int(season) >= config.player_class_mandate_season and (player_class is None or len(player_class.strip()) == 0):
            self.logger.info('Player does not have any Class. Player Name: ' + player_name + ', sport code: ' + sport_code + ', season: '
                             + str(season) + ', team code: ' + team_code)
            if status == config.UNVERIFIED:
                player_data['status'] = config.UNVERIFIED_PLAYER_HAS_NO_CLASS

        if player_class is not None and len(player_class.strip()) > 0:
            player_exist_query = {'playerName': player_name, 'sportCode': sport_code, 'teamCode': team_code, 'season': season,
                                  'status': config.UNVERIFIED_PLAYER_HAS_NO_CLASS}
            query_result = self.mongo_connection.find(player_exist_query)
            if query_result is not None and query_result.count() > 0:
                mongo_obj_id = query_result[0]['_id']
                self.mongo_connection.update({'_id': mongo_obj_id}, {'$set': {'playerClass': player_class}})
                self.logger.info('Updated player class in Stage. Because in one xml we have player class and in another it is not. '
                                 'Returning without inserting new document in Stage.')
                return

        inserted = self.mongo_connection.insert_one(player_data)
        self.logger.info('Player Inserted in Stage: ' + str(inserted.inserted_id) + ', player Name: ' + player_name + ',status: ' +
                         str(player_data['status']))
        return str(inserted.inserted_id)


    def _prepend_zero_player_jersey_number(self, player_code):

        if player_code is not None and len(player_code) == 1:
            return '0' + player_code

        return player_code

    def get_all_staged_unverified_master(self):
        query = {'status': int(config.UNVERIFIED)}
        unverified_players = self.mongo_connection.find(query).sort("teamCode", 1)

        unverified_players_lst = list()

        for player in unverified_players:
            unverified_players_lst.append(player)

        return sorted(unverified_players_lst, key=itemgetter('teamCode'))


    def get_all_staged_player_class_blank_null(self):

        query = {'status': config.UNVERIFIED_PLAYER_HAS_NO_CLASS}
        unverified_players = self.mongo_connection.find(query)

        unverified_players_lst = list()

        for player in unverified_players:
            unverified_players_lst.append(player)

        return unverified_players_lst


    def get_all_staged_players(self):

        query = {'status': {"$in": [config.UNVERIFIED, config.UNVERIFIED_PLAYER_HAS_NO_CLASS]}}
        unverified_players = self.mongo_connection.find(query)

        unverified_players_lst = list()

        for player in unverified_players:
            unverified_players_lst.append(player)

        return len(unverified_players_lst) > 0

    def update_manual_verification(self, manual_verified_players, active_roster_manager, master_roster_provider):

        self.logger.info('Manual verified players: <' + str(len(manual_verified_players)) + '>')
        update_cnt = 0
        call_active_update = False
        for player in manual_verified_players:
            if player['playerClass'] is None or len(player['playerClass'].strip()) == 0:
                continue
            update_cnt += 1
            player_status = player['status']
            player_mongo_obj_id = player['_id']
            player_class = player['playerClass']
            print 'Mongo Object Id: ' + str(player_mongo_obj_id) + ', Player Status: ' + str(player_status) + \
                  ', Player Class: ' + player_class

            if player_status == 999: # Player status 999 is dummy to indicate for Active updation.
                active_roster_manager.update_player_class(player_mongo_obj_id, player_class)

            elif player_status == 7: # player status 7 is for unverified and player class blank.

                # For active player search we are not using any other value then check name. So create object with only check name.
                player_name_opts = NameOpts(None, None, player['playerName'][0], None, None)

                active_roster = active_roster_manager.find_player_in_last_seasons(player_name_opts, player['sportCode'], player['teamCode'],
                                                                                  player['season'], player['playerClass'], player['code'],
                                                                                  player['uni'])

                active_player_id = active_roster['playerId'] if active_roster is not None else None
                if active_player_id is not None:
                    self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerClass': player_class,
                                                                                         'status': config.VERIFIED_ACTIVE,
                                                                                         'activePlayerId': active_player_id}})
                    call_active_update = True
                else:
                    self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerClass': player_class,
                                                                                         'status': config.UNVERIFIED}})

            elif player_status == 1: # player status 1 is for unverified players - Not available in Active/Master.
                print 'In status ONE.'
                player_name_opts = NameOpts(None, None, player['playerName'][0], None, None)

                active_roster = active_roster_manager.find_player_in_last_seasons(player_name_opts, player['sportCode'], player['teamCode'],
                                                                                  player['season'], player['playerClass'], player['code'],
                                                                                  player['uni'])

                active_player_id = active_roster['playerId'] if active_roster is not None else None
                if active_player_id is not None:
                    self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerName': [player['playerName'][0]],
                                                                                         'status': config.VERIFIED_ACTIVE,
                                                                                         'activePlayerId': active_player_id}})
                    call_active_update = True
                else:
                    master_roster = master_roster_provider.find_player_with_check_name(player['playerName'][0], player['season'])
                    if master_roster is not None:
                        self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerName': [player['playerName'][0]],
                                                                                             'status': config.VERIFIED_MASTER}})
                        call_active_update = True
                    else:
                        self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerName': [player['playerName'][0]]}})
            elif player_status == 8:
                print 'In Status EIGHT.'
                master_roster = master_roster_provider.find_player_with_check_name(player['playerName'][0], player['season'])
                if master_roster is not None:
                    self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerName': [player['playerName'][0]],
                                                                                         'status': config.VERIFIED_MASTER}})
                else:
                    self.mongo_connection.update({'_id': player_mongo_obj_id}, {'$set': {'playerName': [player['playerName'][0]],
                                                                                         'status': config.MANUAL_VERIFIED}})
                call_active_update = True

        print 'Updated count: <' + str(update_cnt) + '>'
        return call_active_update

    def update_player_class(self, mongo_obj_id, status, player_class):

        if status == config.UNVERIFIED_PLAYER_HAS_NO_CLASS:
            self.mongo_connection.update({'_id': mongo_obj_id}, {'$set': {'playerClass': player_class, 'status': config.UNVERIFIED}})
        else:
            self.mongo_connection.update({'_id': mongo_obj_id}, {'$set': {'playerClass': player_class}})
