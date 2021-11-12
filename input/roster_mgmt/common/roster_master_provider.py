from pymongo import MongoClient
import logging


class MasterRosterProvider(object):

    def __init__(self, mongo_url='localhost:27017', mongo_db_name='athlyte', mongo_collection='Rosters'):
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db = self.mongo_client[mongo_db_name]
        self.mongo_connection = self.mongo_db[mongo_collection]
        self.logger = logging.getLogger(__name__)

    def get_rosters_for_season(self, team_code, season):

        roster_master_dict = dict()
        roster_result = self.mongo_connection.find({'teamCode': team_code, "playerPlayedDetails.season": season})

        for roster_master in roster_result:
            player_name = roster_master['playerName']
            team_name = roster_master['teamName']
            sport_code = roster_master['sportCode']
            team_code = roster_master['teamCode']
            check_name = roster_master['checkName']
            normalized_name = roster_master['normalizedName']

            roster_played_details = None
            for played_details in roster_master['playerPlayedDetails']:
                if played_details['season'] == season:
                    player_class = played_details['collegeYear']
                    if player_class == "N/A":
                        player_class = ''
                    played_season = played_details['season']
                    jersey_number = self._prepend_zero_player_jersey_number(played_details['jerseyNumber'])
                    roster_played_details = RosterPlayedDetails(player_class, played_season, jersey_number)

            roster_game_details = []
            for game_details in roster_master['rosterGamesDetails']:
                if game_details['season'] == season:
                    player_class = game_details['playerCollegeYear']
                    game_season = game_details['season']
                    game_date = game_details['gameDate']
                    jersey_number = self._prepend_zero_player_jersey_number(game_details['playerJerseyNumber'])

                    game_details_obj = GameDetails(player_class, game_season, game_date, jersey_number)
                    roster_game_details.append(game_details_obj)

            roster_master_obj = MasterRosterDetails(player_name, team_name, sport_code, team_code, check_name,
                                                    normalized_name, roster_played_details, roster_game_details)

            # to make uniqueness concat'ing jersey number. Need to check later for any issues.
            dick_key = check_name + '_' + roster_played_details.jersey_number
            self.logger.debug('Player dick_key:: ' + str(dick_key.encode("ascii", "ignore").strip()))

            roster_master_dict[dick_key] = roster_master_obj

        self.logger.info("Total Roster found in Master: " + str(len(roster_master_dict)) + ', for team code: <' + str(team_code) + '>')
        return roster_master_dict


    # Duplicate code from stage_roster_manager.py
    def _prepend_zero_player_jersey_number(self, player_code):

        if player_code is not None and len(player_code) == 1:
            return '0' + player_code

        return player_code

    @staticmethod
    def find_roster(master_roster_dict, player_name_opts, season, xml_player_class, player_uni, player_code, team_code):
        logger = logging.getLogger(__name__)
        logger.info("Searching player in Master: " + player_name_opts.check_name + ', Season: ' + str(season) + ', TeamCode: ' + team_code)
        found_players = list()
        for key, value in master_roster_dict.items():
            if player_name_opts.short_name in value.check_name: # Check with SHORT Name
                found_players.append(value)

        # found multiple matches so comparing other parameters
        logger.info('Found Number of Players in Master, count:' + str(len(found_players)))
        master_player = None
        found_count = 0
        found_players_after_check_name = list()
        for found_player in found_players:
            if found_player.check_name == player_name_opts.check_name: # comparing FULL Name
                master_player = found_player
                found_players_after_check_name.append(found_player)
                found_count += 1

        if found_count == 1:
            logger.info("ONLY ONE MATCH found in Master with FULL name. Player: " + str(found_players[0].check_name))
            return master_player

        if found_count == 0:
            found_players_after_check_name = found_players

        logger.info("After full name match found multiple players, continuing with other parameters.")
        for found_player in found_players_after_check_name:
            if found_player.played_details.season == season and found_player.played_details.player_class.upper() == xml_player_class: # comparing player class
                logger.info('Player Class Matched: ' + xml_player_class)
                return found_player
            elif found_player.played_details.season == season and \
                    (found_player.played_details.jersey_number == player_uni
                     or found_player.played_details.jersey_number == player_code): # comparing player jersey number
                logger.info('Jersey Number matched: ' + player_code)
                return found_player

        if len(found_players) == 0:
            found_players_after_check_name = master_roster_dict.values()

        # TODO: add logic to check for uniform code & Player class after normalized name.
        for found_player in found_players_after_check_name:
            if player_name_opts.special_name is True and \
                    found_player.normalized_name == player_name_opts.normalized_name:
                logger.info('normalized name match found. So considering it as player found.')
                if found_player.played_details.season == season and found_player.played_details.player_class.upper() == xml_player_class:  # comparing player class
                    logger.info('Player Class Matched: ' + xml_player_class)
                    return found_player
                elif found_player.played_details.season == season and \
                        (found_player.played_details.jersey_number == player_uni
                         or found_player.played_details.jersey_number == player_code):  # comparing player jersey number
                    logger.info('Jersey Number matched: ' + player_code)
                    return found_player

        return None

    '''@staticmethod
    def _get_cleared_uni_code(uni_code):

        if uni_code is not None and len(uni_code) == 2 and uni_code.startswith('0'):
            return uni_code[1:]

        return uni_code
    '''

    def find_player_with_check_name(self, player_name, season):

        roster_result = self.mongo_connection.find({'$or': [{'checkName': player_name}, {'playerName': player_name}],
                                                    "playerPlayedDetails.season": season})
        found_rosters_list = list()

        for roster_master in roster_result:
            player_name = roster_master['playerName']
            team_name = roster_master['teamName']
            sport_code = roster_master['sportCode']
            team_code = roster_master['teamCode']
            check_name = roster_master['checkName']
            normalized_name = roster_master['normalizedName']

            roster_played_details = None
            for played_details in roster_master['playerPlayedDetails']:
                if played_details['season'] == season:
                    player_class = played_details['collegeYear']
                    if player_class == "N/A":
                        player_class = ''
                    played_season = played_details['season']
                    jersey_number = played_details['jerseyNumber']
                    roster_played_details = RosterPlayedDetails(player_class, played_season, jersey_number)

            roster_game_details = []
            for game_details in roster_master['rosterGamesDetails']:
                if game_details['season'] == season:
                    player_class = game_details['playerCollegeYear']
                    game_season = game_details['season']
                    game_date = game_details['gameDate']
                    jersey_number = game_details['playerJerseyNumber']

                    game_details_obj = GameDetails(player_class, game_season, game_date, jersey_number)
                    roster_game_details.append(game_details_obj)

            roster_master_obj = MasterRosterDetails(player_name, team_name, sport_code, team_code, check_name,
                                                    normalized_name, roster_played_details, roster_game_details)
            found_rosters_list.append(roster_master_obj)

        self.logger.info('Total rosters found in Master with check name: <' + player_name + '>, count: <'
                         + str(len(found_rosters_list)) + '>')
        if len(found_rosters_list) == 1:
            return found_rosters_list[0]

        return None

    def player_available_in_season(self, season):
        result = self.mongo_connection.find({'playerPlayedDetails.season': int(season)})
        return result is not None and result.count() > 0


class MasterRosterDetails(object):

    def __init__(self, player_name, team_name, sport_code, team_code, check_name, normalized_name,
                 played_details, game_details):
        self.player_name = player_name
        self.team_name = team_name
        self.sport_code = sport_code
        self.team_code = team_code
        self.check_name = self._remove_dots_spaces(check_name)
        self.normalized_name = normalized_name
        self.played_details = played_details
        self.game_details = game_details

    def _remove_dots_spaces(self, check_name):
        return check_name.replace('.', '')


class RosterPlayedDetails(object):

    def __init__(self, player_class, season, jersey_number):
        self.player_class = player_class
        self.season = season
        self.jersey_number = jersey_number


class GameDetails(object):

    def __init__(self, player_class, season, game_date, jersey_number):
        self.player_class = player_class
        self.season = season
        self.game_date = game_date
        self.jersey_number = jersey_number
