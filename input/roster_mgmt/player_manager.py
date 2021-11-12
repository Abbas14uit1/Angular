import logging
from common.name_normalizer import NameNormalizer
from common.stage_roster_manager import StageRosterManager
from common.roster_master_provider import MasterRosterProvider
from common.active_roster_manager import ActiveRosterManager
from common.player_class_validator import PlayerClassValidator
import config
import os


possible_master_class_SO = ['SO', 'JR', 'SR']
possible_master_class_JR = ['JR', 'SR']
possible_master_class_SR = ['SR']

class PlayerManager(object):

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.stage_roster_manager = StageRosterManager(config.stage_mongo_url, config.stage_mongo_db_name,
                                                       config.stage_mongo_collection)
        self.active_roster_manager = ActiveRosterManager(config.active_mongo_url, config.active_mongo_db_name,
                                                         config.active_mongo_collection)
        self.player_class_validator = PlayerClassValidator()
        self.master_roster_provider = MasterRosterProvider(config.master_mongo_url, config.master_mongo_db_name,
                                                           config.master_mongo_collection)

    def process_players(self, player_xml_tag, master_roster_dict, verified_rosters, sport_code, team_code,
                             game_date, season, played):

        for player in player_xml_tag.iter("player"):

            player_name_opts = self._get_player_check_name(player)
            if player_name_opts.check_name is None or player_name_opts.check_name in ("TEAM", "TM", ""):
                log_player_name = '' if player_name_opts.check_name is None else player_name_opts.check_name
                self.logger.info('Got Invalid Player CheckName OR TEAM OR TM. Player Name: <' + log_player_name + '>')
                continue

            xml_player_class = None if "class" not in player.attrib else player.attrib["class"]
            player_uni = self._prepend_zero_player_jersey_number(player.attrib['uni'])
            player_code = self._prepend_zero_player_jersey_number(player.attrib['code'])
            # TODO: compare other parameter before deciding verified player. Need to handle Mahammed, T and Mahammed, Taheer scenario.
            # Step :- 1
            verified_player_key = player_name_opts.check_name + '_' + player_uni
            verified_roster = verified_rosters.get(verified_player_key, None)
            if player_name_opts.check_name == 'MCDONALD,BLAKE':
                print 'found.'
            if verified_roster is not None:
                self.logger.info('Player found in verified dict. Player Name: <' + verified_roster.player_check_name +
                                 '>, for season:' + str(season))
                if xml_player_class is not None and verified_roster.player_class is None:
                    self.logger.info('xml file has player class, but verified player has no player class. Player Name: <' +
                                     verified_roster.player_check_name + '>, teamCode: ' + team_code)
                    mongo_obj_id = verified_roster.mongo_obj_id
                    stage_player_status = verified_roster.status
                    self.stage_roster_manager.update_player_class(mongo_obj_id, stage_player_status, xml_player_class)
                    self.logger.info('Update player class in stage. mongo_obj_id: ' + str(mongo_obj_id)
                                     + ',status: ' + str(stage_player_status))
                elif xml_player_class is not None and (xml_player_class.upper() == verified_roster.player_class.upper()) \
                            and len(xml_player_class.strip()) != 0:
                    self.logger.info('xml file has player class and it matched with verified player. Continuing as verified player')
                elif xml_player_class is not None and (xml_player_class.upper() != verified_roster.player_class.upper()) \
                            and len(xml_player_class.strip()) != 0:
                    # scenario to check whether player has different class in different xml files of the same season.
                    self.logger.info('xml file has player class and Does not matched with verified player. Continuing as verified player')
                else:
                    self.logger.info('xml file does not have player class and does not match with verified player class. Continuing as '
                                     'verified player')
                continue

            # Step :- 2
            stage_player_list = self.stage_roster_manager.find_player(player_name_opts.check_name, sport_code,
                                                                      team_code, season, xml_player_class)
            if len(stage_player_list) == 0:
                ''' First, checking in Master for the player exists '''
                master_match_player = MasterRosterProvider.find_roster(master_roster_dict, player_name_opts,
                                                                       season, xml_player_class,
                                                                       player_uni, player_code, team_code)

                valid_player_class_from_master = self.player_class_validator.find_valid_player_class_with_master(master_match_player,
                                                                                                                 xml_player_class)
                ''' Second, checking in Active for the player exists '''
                active_match_player = self.active_roster_manager.find_player_in_last_seasons(player_name_opts,
                                                                                             sport_code, team_code,
                                                                                             season, valid_player_class_from_master,
                                                                                             player_uni, player_code)

                verified_player = VerifiedPlayers(player_name_opts.check_name, valid_player_class_from_master, player_uni,
                                                  player_code, season, None, None)
                verified_player_key = player_name_opts.check_name + '_' + player_uni
                if master_match_player is not None and active_match_player is not None:
                    mongo_obj_id = self.stage_roster_manager.insert_player(player_name_opts.check_name, valid_player_class_from_master, sport_code,
                                                            season, team_code, player_uni, player_code,
                                                            played, config.VERIFIED_MASTER_ACTIVE, active_match_player['playerId'], None)
                    verified_player.mongo_obj_id = mongo_obj_id
                    verified_player.status = config.VERIFIED_MASTER_ACTIVE
                    verified_rosters[verified_player_key] = verified_player
                elif master_match_player is not None:
                    mongo_obj_id = self.stage_roster_manager.insert_player(player_name_opts.check_name, valid_player_class_from_master, sport_code,
                                                            season, team_code, player_uni, player_code,
                                                            played, config.VERIFIED_MASTER, None, None)
                    verified_player.mongo_obj_id = mongo_obj_id
                    verified_player.status = config.VERIFIED_MASTER
                    verified_rosters[verified_player_key] = verified_player
                elif active_match_player is not None:
                    # To find the player class, because player has found only in Active roster.
                    found_roster_master = self.master_roster_provider.find_player_with_check_name(player_name_opts.check_name, season)
                    valid_player_class_from_master = self.player_class_validator.find_valid_player_class_with_master(found_roster_master,
                                                                                                                     xml_player_class)

                    valid_player_class_from_active = self.is_player_class_valid(xml_player_class, valid_player_class_from_master,
                                                                                active_match_player['playerClass'])
                    transferred = active_match_player['transferred'] if 'transferred' in active_match_player else None
                    mongo_obj_id = self.stage_roster_manager.insert_player(player_name_opts.check_name, valid_player_class_from_active, sport_code,
                                                            season, team_code, player_uni, player_code,
                                                            played, config.VERIFIED_ACTIVE, active_match_player['playerId'], transferred)
                    verified_player.mongo_obj_id = mongo_obj_id
                    verified_player.status = config.VERIFIED_ACTIVE
                    verified_rosters[verified_player_key] = verified_player
                else:
                    # As Master Roster has only the latest college the roster is played for. So adding below condition
                    # To check whether the player has transferred to other college, checking in master with check name and
                    # comparing the exact season to match the player
                    found_roster_master = self.master_roster_provider.find_player_with_check_name(player_name_opts.check_name, season)
                    if found_roster_master is not None:
                        if team_code != found_roster_master.team_code:
                            self.logger.info('ROSTER TRANSFERRED, found in Team: <' + found_roster_master.team_code +
                                             '>, when searched for Team: <' + team_code + '>')
                        valid_player_class_from_master = self.player_class_validator.find_valid_player_class_with_master(
                                                            found_roster_master, xml_player_class)
                        mongo_obj_id = self.stage_roster_manager.insert_player(player_name_opts.check_name, valid_player_class_from_master, sport_code,
                                                            season, team_code, player_uni, player_code,
                                                            played, config.VERIFIED_MASTER, None, True)
                        verified_player = VerifiedPlayers(player_name_opts.check_name, valid_player_class_from_master, player_uni,
                                                          player_code, season, mongo_obj_id, config.VERIFIED_MASTER)
                    else:
                        mongo_obj_id = self.stage_roster_manager.insert_player(player_name_opts.check_name, valid_player_class_from_master, sport_code,
                                                                season, team_code, player_uni, player_code,
                                                                played, config.UNVERIFIED, None, None)
                        verified_player.mongo_obj_id = mongo_obj_id
                        verified_player.status = config.VERIFIED_MASTER_ACTIVE

                    verified_rosters[verified_player_key] = verified_player
            else:
                self.logger.info('Player is available in Stage Roster. Player Name: <' + player_name_opts.check_name +
                                 '>, for season: <' + str(season) + '>, for team: <' + team_code +
                                 '>, jersey number: <' + player_code + '>')


    def _get_player_class(self, master_player, xml_player_class, player_check_name):

        if master_player is None:
            return None

        if xml_player_class is not None and xml_player_class.upper() == master_player.player_class.upper():
            self.logger.info('Master & XML class is matched. Considering it as valid class.')
            return xml_player_class

        self.logger.info('Master & XML class is NOT matched. Considering master class')
        player_class = None if master_player.played_details is None \
            else master_player.played_details.player_class.upper()

        if player_class not in config.player_class_array:
            self.logger.warning('Player class in master is not available in valid player class array: ' + player_class)

        return player_class


    def _get_player_check_name(self, player):

        name_normalizer = NameNormalizer()
        if player.attrib["checkname"] != "":
            return name_normalizer.normalize_xml_check_name(player.attrib["checkname"])

        player_name = player.attrib["name"]
        if player_name != "" and player_name.strip() != "":
            return name_normalizer.normalize_name(player_name)

    # Duplicate code from stage_roster_manager.py
    def _prepend_zero_player_jersey_number(self, player_code):

        if player_code is not None and len(player_code) == 1:
            return '0' + player_code

        return player_code

    def is_player_class_valid(self, xml_player_class, master_player_class, active_player_class):

        if xml_player_class is not None and len(xml_player_class) != 0:
            return xml_player_class

        if master_player_class == active_player_class:
            return active_player_class

        if master_player_class == 'SO' and master_player_class in possible_master_class_SO:
            return master_player_class
        elif master_player_class == 'JR' and master_player_class in possible_master_class_JR:
            return master_player_class
        elif master_player_class == 'SR' and master_player_class in possible_master_class_SR:
            return master_player_class

        return None

    def finalize_staged_players(self):

        while True:
            unverified_player_exists = self.stage_roster_manager.get_all_staged_players() \
                                       or (len(self.active_roster_manager.get_all_active_player_class_blank_null()) > 0)
            if not unverified_player_exists:
                break

            print "Use the URL and validate the unverified players. Once done press Ctrl + C "
            os.system('python roster_manual_verifier.py')
            exit_y_n = raw_input("Do you want to exit ? [Y/N] :")
            if exit_y_n == 'Y' or exit_y_n == "y":
                break

        print "Yes I am out of this"


class VerifiedPlayers(object):

    def __init__(self, player_check_name, player_class, player_uni, player_code, season, mongo_obj_id, status):
        self.player_check_name = player_check_name
        self.player_class = player_class
        self.player_uni = player_uni
        self.player_code = player_code
        self.season = season
        self.mongo_obj_id = mongo_obj_id
        self.status = status

