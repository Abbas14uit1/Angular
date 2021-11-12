import xml.etree.ElementTree as ET
import datetime
import re
import os
import sys
import getopt
import logging
from common.roster_master_provider import MasterRosterProvider
from common.team_master_provider import TeamMasterProvider
from common.stage_roster_manager import StageRosterManager
from common.active_roster_manager import ActiveRosterManager
from player_manager import PlayerManager
import config
import traceback


def start_processing(season_dir, proc_team_code, sport_code):

    master_roster_provider = MasterRosterProvider(config.master_mongo_url, config.master_mongo_db_name,
                                                  config.master_mongo_collection)

    stage_roster_manager = StageRosterManager(config.stage_mongo_url, config.stage_mongo_db_name, config.stage_mongo_collection)

    active_roster_manager = ActiveRosterManager(config.active_mongo_url, config.active_mongo_db_name, config.active_mongo_collection)

    player_manager = PlayerManager()

    proc_roster_master_cache_dict = None
    verified_rosters = dict()
    total_files = 0
    team_master_provider = TeamMasterProvider()
    for root_dir, dirs, files in os.walk(season_dir):
        dirs.sort()
        files.sort()
        print 'root_dir:: ' + str(root_dir)
        print 'Found <' + str(len(files)) + '> files in dir : <' + str(root_dir) + '>'
        print 'Found dirs: ' + str(dirs)

        dir_files_cnt = 0
        found_season = 0
        season = 0
        for _file in files:
            xml_file = os.path.join(root_dir, _file)
            total_files += 1
            dir_files_cnt += 1

            logger.info("Found file: " + xml_file)
            tree = ET.ElementTree()
            try:
                tree = ET.parse(xml_file)
            except:
                logger.error('Error Processing file: ' + xml_file)
                continue

            _root = tree.getroot()
            if _root.tag != config.game_tag.get(sport_code, None):
                logger.error('File: ' + _file + ' is NOT valid file.')
                continue

            logger.info("Processing started for: " + xml_file)
            game_date = get_gamedate(_root, sport_code)
            season = get_season(game_date, sport_code)
            logger.info('Found season with dir(before): ' + str(found_season) + ', Game Date: ' + str(game_date))
            if found_season == 0:
                found_season = season
            elif found_season != season:
                logger.error('Found INVALID GAME DATE and invalid season in xml file. File Name: ' + str(xml_file) +
                             ', continuing with previous season: ' + str(found_season))
                season = found_season

            logger.info('Found season with dir(after): ' + str(found_season))

            if proc_roster_master_cache_dict is None:
                proc_roster_master_cache_dict = master_roster_provider.get_rosters_for_season(proc_team_code, season)
                if len(proc_roster_master_cache_dict) < config.min_rosters_in_master.get(sport_code, 0) and \
                        config.validate_roster_master_numbers:
                    raise LookupError('Roster Master does not have minimum number of players in season: ' + str(season)
                                      + ', for Team: ' + str(proc_team_code))
            try:
                start_player_processing(_root, proc_roster_master_cache_dict, verified_rosters, sport_code, game_date,
                                    proc_team_code, master_roster_provider, season, team_master_provider, player_manager)
            except Exception as e:
                logger.error('Error after started processing players: <' + str(e) + '>, xml file path: ' + xml_file)
                print 'Error after started process players: <' + str(e) + '>, xml file path: ' + xml_file
                traceback.print_exc()
                sys.exit(3)

            print 'Completed file count(Overall): ' + str(total_files)
            print 'Completed file count(Dir): ' + str(dir_files_cnt)

        print 'Started Active Insertions.'
        active_roster_manager.move_roster_stage_to_active(season, stage_roster_manager, master_roster_provider)
        proc_roster_master_cache_dict = None
        verified_rosters = dict()
        logger.info('verified_rosters dict: ' + str(verified_rosters))
        logger.info('=============================Completed Season===========================================\n\n\n')
        print '\n\n'

    print 'Total Files Processed: <' + str(total_files) + '>\n\n'
    print 'Starting manual verification:'
    player_manager.finalize_staged_players()


def start_player_processing(xml_root_tag, proc_roster_master_cache_dict, verified_rosters, sport_code, game_date,
                            proc_team_code, master_roster_provider, season, team_master_provider,
                            player_manager):
    team_dict = {'V': '', 'H': ''}
    oppo_roster_master_cache_dict = None

    for team in xml_root_tag.iter("team"):

        team_code = team_master_provider.get_team_code_from_master(team)
        # we are getting opponent team code only when we iterate the xml file. So, query master for rosters now.
        if proc_team_code != team_code and oppo_roster_master_cache_dict is None:
            logger.info('Processing Oppo Team Players. Team Name: <' + team.attrib['name'] + '>')
            xml_team_code = team.attrib['code'] if 'code' in team.attrib is not None else ''
            if xml_team_code != team_code and len(xml_team_code) != 0:
                logger.warn('Team Name and Team code in xml file did not match. Team Name : ' + team.attrib['name']
                                  + ', Team Code: ' + xml_team_code)
            if len(xml_team_code.strip()) != 0:
                logger.info('XML file has team code, Considering it for processing. XML Team Code: ' + str(xml_team_code) +
                            ', team master team code: ' + str(team_code))
                team_code = xml_team_code
            team_dict[team.attrib['vh']] = team_code
            oppo_roster_master_cache_dict = master_roster_provider.get_rosters_for_season(team_code, season)
            if oppo_roster_master_cache_dict is not None and \
                    len(oppo_roster_master_cache_dict) < config.min_rosters_in_master.get(sport_code, 0) and \
                    config.validate_roster_master_numbers:
                raise LookupError('Roster Master does not have minimum number of players in season: ' + str(season) +
                                  ', for Team: ' + str(team_code) + ', no of players found: ' + str(len(oppo_roster_master_cache_dict)))

            player_manager.process_players(team, oppo_roster_master_cache_dict, dict(), sport_code, team_code, game_date, season, True)
        else:
            logger.info('Processing Team Players. Team Name: <' + team.attrib['name'] + '>')
            xml_team_code = team.attrib['code'] if team.find('code') is not None else ''
            if len(xml_team_code.strip()) != 0 and xml_team_code != proc_team_code:
                logger.warn('Team Name and Team code in xml file did not match for Processing Team. Team Name : ' + team.attrib['name'] +
                            ', Team Code: ' + xml_team_code)
            team_dict[team.attrib['vh']] = proc_team_code
            player_manager.process_players(team, proc_roster_master_cache_dict, verified_rosters, sport_code, proc_team_code,
                                       game_date, season, True)

    for dnp in xml_root_tag.iter("dnp"):
        logger.info('Starting DNP players.')
        team_name = dnp.attrib['id']
        team_code = team_dict[dnp.attrib["vh"]]
        logger.info('team_name: <' + team_name + '>, team code: <' + team_code + '>')
        if proc_team_code != team_code:
            logger.info('Started Processing DNP players for opponent team.')
            player_manager.process_players(dnp, oppo_roster_master_cache_dict, dict(), sport_code, team_code, game_date, season, False)
        else:
            logger.info('Started Processing DNP players for processing team.')
            player_manager.process_players(dnp, proc_roster_master_cache_dict, verified_rosters, sport_code, proc_team_code,
                                           game_date, season, False)
    logger.info('Completed DNP player processing.')


def get_gamedate(root, sport_code):

    game_date_available = False
    if root.find('venue') is not None:
        for venue in root.iter('venue'):
            if 'date' in venue.attrib:
                game_date_string = venue.attrib['date']

                if re.match('\d+/\d+/\d+', game_date_string) is None:
                    raise ValueError("Invalid xml: Date Format invalid ")

                game_date = datetime.datetime.strptime(game_date_string, "%m/%d/%Y")
                game_date_available = True

    if not game_date_available:
        raise ValueError("Invalid xml: unable to find the date string in the xml")

    validate_gamedate(game_date, sport_code)
    return game_date


def validate_gamedate(game_date, sport_code):

    year = get_season(game_date, sport_code)
    # validate if the game date is within the season dates. Ignore all other games
    season_start_date = datetime.datetime.strptime(config.game_start_season_month.get(sport_code.upper()) +
                                                   "/01/" + str(year), "%m/%d/%Y")
    season_end_date = datetime.datetime.strptime(config.game_end_season_month.get(sport_code.upper()) +
                                    "/" + config.game_end_season_date.get(sport_code.upper()) + "/" + str(year+1),
                                                 "%m/%d/%Y")

    if season_start_date < game_date < season_end_date:
        return True

    raise ValueError("Invalid xml: Date not during season")


def get_season(game_date, sport_code):
    month = game_date.strftime("%m")
    year = game_date.strftime("%Y")
    if int(month) < int(config.game_end_season_month.get(sport_code.upper())) + 1:
        return int(year) - 1

    return int(year)


def help():
    print 'process_roster.py -u <uncorrected season folder> -c <teamcode>-t <sportcode> -l <logfile>'


def main(argv):

    dir_name = ""
    sport_code = ""
    proc_team_code = ''
    global logger

    try:
        opts, args = getopt.getopt(
            argv, "hu:c:t:l:", ["uncorrected=", "teamcode=", "sportcode=", "log="])
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-u', "--uncorrected"):
            dir_name = arg
        elif opt in ('-c', "--teamcode"):
            proc_team_code = arg
        elif opt in ('-t', "--sportcode"):
            sport_code = arg
        elif opt in ('-l', "--log"):
            print("Configure the logs to " + arg)
            logging.basicConfig(level=logging.INFO, filename=arg, filemode='w', format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', handlers=[logging.StreamHandler()])
            logger = logging.getLogger()
        else:
            print "Error invalid options"
            help()
            sys.exit(2)

    if dir_name == "" or proc_team_code == "" or sport_code == "":
        help()
        sys.exit(2)

    #if logger is not None:
    log_file_name = '/opt/athlyte/sprint1/logs/roster_mgmt_' + datetime.datetime.now().strftime('%d_%m_%Y_%H_%M_%S') + '.log'
    logging.basicConfig(level=logging.INFO, filename=log_file_name, filemode='w', format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logger = logging.getLogger(__name__)

    print 'Log File Name: ' + log_file_name
    start_processing(dir_name, proc_team_code, sport_code)


if __name__ == "__main__":
    main(sys.argv[1:])
