import xml.etree.ElementTree as ET
import datetime
import re
import os
import sys
import getopt
from pymongo import MongoClient
import random
import json
import traceback
import logging
import pprint
from bson.json_util import dumps

#import boto3
sys.path.append("../common")
from schedule_manager import ScheduleManager
from teammaster_manager import TeamMasterManager
from roster_manager import RosterManager

hv_dict = {}  # home & visitor dictionary
game_date = ""
player_dict = {}  # All the player
team_stats = {}
player_stats = {}
logger = None
roster_manager1 = None
roster_manager2 = None


minimum_plays_required = -1
minimum_qtr_required = -1 #One per team

db_host = "localhost"
db_port = 27017
db = "athlyte"
game_start_season_month= "06" #June
game_end_season_month= "01" #Jan

client = MongoClient(db_host, db_port)
unknown_player_name = 'unknown, unknown'
collection_name = 'Rosters-ec2'


def clean_up():
    global hv_dict
    hv_dict = {}
    global game_date
    game_date = ""
    global player_dict
    player_dict = {}
    global team_stats
    team_stats['V'] = []
    team_stats['H'] = []
    global player_stats
    player_stats = {}
    global roster_manager1, roster_manager2
    roster_manager1 = RosterManager()
    roster_manager2 = RosterManager()


def get_team_code_from_master(team_name, team_id, team_code, team_tag):

    master = TeamMasterManager(db_host, int(db_port), db)
    team_data = master.get_team_data_from_master(team_name, team_id, team_code)

    team_tag.set('code', team_data['teamCode'])
    team_tag.set('name', team_data['teamName'])

    return team_data


def set_team_names(root, homename, visname):
    venue = root.find('venue')
    if venue is not None:
        venue.set('homename',homename)
        venue.set('visname',visname)


def add_drive_and_play(root):
    'called adding drive and plays'
    _plays = ET.Element('plays')
    _plays.set('format', 'summary')
    _qtr1 = ET.SubElement(_plays, 'qtr')
    _qtr2 = ET.SubElement(_plays, 'qtr')
    _qtr3 = ET.SubElement(_plays, 'qtr')
    _qtr4 = ET.SubElement(_plays, 'qtr')

    _qtr1.set('number', '1')
    _qtr2.set('number', '2')
    _qtr3.set('number', '3')
    _qtr4.set('number', '4')
    _qtr1.set('text', '1st')
    _qtr2.set('text', '2nd')
    _qtr3.set('text', '3rd')
    _qtr4.set('text', '4th')

    for team in root.iter('team'):
        if(team.attrib['vh'] == 'H'):
            hometeam = team.attrib['id']
            hometeamspot = hometeam + str(35)
        if(team.attrib['vh'] == 'V'):
            visitor = team.attrib['id']
            visitorspot = visitor + str(35)

    play_dict = {}
    play_dict = {'hasball': hometeam,
                 'down': '1',
                 'togo': '1',
                 'spot': hometeamspot,
                 'context': 'H,1,1,V35',
                 'playid': '0,3,3',
                 'type': 'K',
                 'tokens': 'KO: 35',
                 'text': 'Kickoff',
                 'newcontext': 'H,1,1,V35'}

    _play1 = ET.SubElement(_qtr1, 'play', play_dict)
    _play2 = ET.SubElement(_qtr2, 'play', play_dict)
    _play3 = ET.SubElement(_qtr3, 'play', play_dict)
    _play4 = ET.SubElement(_qtr4, 'play', play_dict)

    _drives = ET.Element('drives')
    drive_dict = {}
    drive_dict = {
        'vh': 'H',
        'team': hometeam,
        'start': 'KO,1,15:00,35',
        'end': 'PUNT,1,14:00,61',
        'plays': '1',
        'yards': '1',
        'top': '1:00',
        'start_how': 'KO',
        'start_qtr': '1',
        'start_time': '15:00',
        'start_spot': hometeamspot,
        'end_how': 'PUNT',
        'end_qtr': '1',
        'end_time': '14:00',
        'end_spot': visitorspot,
        'drive_index': '1'}

    _drive = ET.SubElement(_drives, 'drive', drive_dict)

    root.insert(6, _plays)
    root.insert(7, _drive)
    return root


def set_gamedate(root):
    global game_date
    game_date_set = False
    if root.find('venue') is not None:
        for venue in root.iter('venue'):
            if 'date' in venue.attrib:
                game_date_string = venue.attrib['date']
                if re.match('\d+/\d+/\d+', game_date_string) is None:
                    raise ValueError("Invalid xml: Date Format invalid ")
                game_date = datetime.datetime.strptime(
                    game_date_string, "%m/%d/%Y")
                game_date_set = True

    if game_date_set == False:
        raise ValueError("Invalid xml: unable to find the date string in the xml")
    validate_gamedate(game_date)

def validate_gamedate(game_date):
    ''' validate if the game date is within the season dates. Ignore all other games '''
    year = get_season(game_date)
    season_start_date = datetime.datetime.strptime(game_start_season_month + "/01/" + str(year),"%m/%d/%Y")
    season_end_date = datetime.datetime.strptime(game_end_season_month + "/29/" + str(year+1),"%m/%d/%Y")
    if game_date > season_start_date and game_date < season_end_date:
        return True

    raise ValueError("Invalid xml: Date not during season")


def get_season(game_date):
    month = game_date.strftime("%m")
    year = game_date.strftime("%Y")
    if(int(month)<3):
        return int(year) - 1
    return int(year)

def set_hv_dict(team):
    global hv_dict
    if(team.attrib['vh'] == 'V'):
        hv_dict['V'] = {'id_name': team.attrib[
            'id'], 'code': team.attrib['code']}
    if(team.attrib['vh'] == 'H'):
        hv_dict['H'] = {'id_name': team.attrib[
            'id'], 'code': team.attrib['code']}


def add_sport_tag(root):
    sport_element = ET.Element('sport')
    sport_element.set('sport', 'football')
    root.insert(0, sport_element)
    return root

def add_conf_details(team, team_code, season):
    team_master = TeamMasterManager()
    conf_details = team_master.get_conference_details(team_code, season)
    logger.info("Got it: " + str(team_code) + " for season " + str(season) + " " + dumps(conf_details))
    team.set('conf', conf_details['confName'] )
    try:
        if 'confDivisionName' in conf_details and conf_details['confDivisionName']:
            team.set('confdivision', conf_details['confDivisionName'] )
    except:
        #ignore
        logger.info("conf division does not exist for " + str(team_code) + " during season " + str(season) )
        team.set('confdivision', "")

def fix_team_code(root):
    visitor = None
    home = None
    for team in root.iter('team'):
        team_code = team.get('code', None)
        team_id = team.get('id', None)
        team_data = get_team_code_from_master(team.attrib['name'], team.attrib['id'], team_code, team)        
        #print dumps(team_data)
        add_conf_details(team, team_data['teamCode'], get_season(game_date))
        set_hv_dict(team)
        if team.attrib['vh'] == 'V':
            visitor = team_data['teamName']
        else:
            home = team_data['teamName']
    set_team_names(root,home,visitor)
    return root


def add_sport_code(root, sport_code):
    venue_tag = root.find('venue')
    if venue_tag is not None:
        venue_tag.set('sportcode', sport_code)

    root.set('sportcode', sport_code)


def drive_check(root):
    # Checks to see if xml root has drive element
    return 'drives' in set([x.tag for x in root])


def play_check(root):
    # Checks to see if xml root has plays element
    total_play_element = 0
    missing_token_element = 0
    error = False
    if minimum_plays_required < 0:
        #ignore errors if the minimum_player_required is set to less that 0
        return True
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for play_element in qtr.iter('play'):
                total_play_element += 1
                if 'tokens' not in play_element.attrib:
                    missing_token_element += 1
    if total_play_element <= minimum_plays_required:
        error = True
        logger.error("Available play elements   " + str(total_play_element) + " is less than the required. Minimum required is " + str(minimum_plays_required))
    if missing_token_element > 0:
        error = True
        logger.error( "Missing tokens attribute for " + str(missing_token_element) + " play elements")
    if error is False:
        return True
    return False


def qtr_summary_check(root):
    # Checks to see if xml root has plays.qtr.qtrsummary element
    total_qtrsummary_element = 0
    missing_token_element = 0
    error = False
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for play_element in qtr.iter('qtrsummary'):
                total_qtrsummary_element += 1
                
    if total_qtrsummary_element < minimum_qtr_required:
        error = True
        logger.error("Missing qtrsummary elements   " + str(total_qtrsummary_element) + " is less than the required. Minimum required is " + str(minimum_qtr_required))
    
    if error is False:
        return True
    return False


def player_check_and_fix(root, sport_code):
    player_not_found= []
    global roster_manager1, roster_manager2
    for team in root.iter("team"):
        vh = team.attrib['vh']
        roster_manager = roster_manager1 if vh == 'V' else roster_manager2
        logger.info(" setup the roster manager for the " + vh)
        roster_manager.setup_roster_for_team(sport_code, hv_dict[vh]["code"])
        
        for player in team.iter("player"):
            if "TEAM"==player.attrib['name'].upper() or "TM" == player.attrib['name'].strip().upper():
                continue
            roster_player = get_player_code(roster_manager, player, sport_code, vh)
            if roster_player != None:
                player.set("name", roster_player["playerName"][0])
                player.set("playerid", roster_player["playerId"])
                player.set("class", roster_player["playerClass"] if roster_player["playerClass"] else "")
            else:
                player_not_found.append(player.attrib['name'])
            defense = player.find("defense")
            if defense is not None and len(defense.attrib.items()) == 0:
                defense.set("tacka", "0")
                defense.set("tackua", "0")
            for item in player.iter():
                if len(item.attrib.items()) == 0:
                    logger.warning( "Player " + player.attrib["name"] + " or one of its child elements has empty atributes")
        
    logger.info( "Start DNP ")
    for dnp in root.iter("dnp"):
        vh = dnp.attrib["vh"]
        roster_manager = roster_manager1 if vh == 'V' else roster_manager2
        #roster_manager.setup_roster_for_team(sport_code, hv_dict[vh]["code"])
        for player in dnp.iter("player"):
            if "TEAM"==player.attrib['name'].upper() or "TM" == player.attrib["name"].strip().upper():
                continue
            roster_player = get_player_code(roster_manager,player, sport_code, vh)
            if roster_player != None:
                player.set("name", roster_player["playerName"][0])
                player.set("playerid", roster_player["playerId"])
                player.set("class", roster_player["playerClass"] if roster_player["playerClass"] else "")
            else:
                logger.error("Player not found " + player.attrib['name'])
                player_not_found.append(player.attrib['name'])

    roster_manager1.setup_roster_for_team(sport_code,hv_dict[vh]["code"])
    roster_manager2.setup_roster_for_team(sport_code,hv_dict[vh]["code"])
    if len(player_not_found) > 0:
        logger.warning( str(len(player_not_found)) + " players are not available in the roster manager")
        raise ValueError("Player: Player not found in roster")
    logger.info( "End DNP")

def fix_promise_player(root):
    return 
    for team in root.iter("team"):
        vh = team.attrib['vh']
        roster_manager = roster_manager1 if vh == 'V' else roster_manager2
        
        for player in team.iter("player"):
            if "TEAM"==player.attrib['name'].upper() or "TM" == player.attrib["name"].strip().upper():
                player.set("name", "TEAM")
                player.set("checkname", "TEAM")
                continue
            roster_player = get_player_code(roster_manager, player, sport_code, vh)
            if roster_player != None:
                player.set("name", roster_player["playerName"][0])
                player.set("playerid", roster_player["playerId"])
            else:
                player_not_found.append(player.attrib['name'])
    
    print "starting dnp player"
    for dnp in root.iter("dnp"):
        vh = dnp.attrib["vh"]
        roster_manager = roster_manager1 if vh == 'V' else roster_manager2
        roster_manager.setup_roster_for_team(sport_code, hv_dict[vh]["code"])
        for player in dnp.iter("player"):            
            if "TEAM" == player.attrib['name'].upper() or "TM" == player.attrib['name'].strip().upper():
                player.set("name", "TEAM")
                player.set("checkname", "TEAM")
                continue
            if get_processed_player_name(player) == None:
                continue
            roster_player = get_player_code(roster_manager,player, sport_code, vh)
            if roster_player != None:
                player.set("name", roster_player["playerName"][0])
                player.set("playerid", roster_player["playerId"])
            else:
                player_not_found.append(player.attrib['name'])

    print "end dnp player"

def get_processed_player_name(player):
    name = player.attrib["checkname"].strip()
    jersey_number = player.attrib["uni"]
    if name=="":
        name = player.attrib["name"].strip().upper() 

    if name == "" or name is None:
        return None

    return name


def get_player_code(roster_manager, player, sport_code, vh):
    
    name = get_processed_player_name(player)
    jersey_number = player.attrib["uni"]
    try:
        player_class = ""
        if "class" in player.attrib:
            player_class = player.attrib["class"]
        roster_player = roster_manager.get_player_from_rosters(sport_code, hv_dict[vh]["code"], name, game_date, get_season(game_date), player_class, jersey_number)
        #roster_player = roster_manager.get_player(sport_code, hv_dict[vh]["code"], name, game_date, jersey_number)
    except ValueError : 
        return None
    return roster_player


def play_drive_check(root):
    p_check = play_check(root)
    d_check = drive_check(root)
    q_qsummary_check = qtr_summary_check(root)

    if(p_check is False):
        outputstring = 'p'
    elif(q_qsummary_check is False):
        outputstring = 'q'
    elif(p_check is True and d_check is False):
        outputstring = 'd'
    elif(p_check is True and d_check is True):
        outputstring = 'n'
    return outputstring


def return_drive_start(root):

    # Parses through parsed root XML and returns list of drive starts
    drive_starts = []
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for drivestart in qtr.iter('drivestart'):
                drive_starts.append(drivestart.attrib)
    return drive_starts


def return_drive_sum(root):
    # Parses through parsed root XML and returns list of drive summaries
    drive_summaries = []
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for drivesum in qtr.iter('drivesum'):
                drive_summaries.append(drivesum.attrib)
    return drive_summaries


def add_missing_play_attrib(play, qtr_number):
    if 'quarter' not in play.attrib:
        play.set('quarter', qtr_number)
    if 'hasball' not in play.attrib:
        play.set('hasball', hv_dict[play.attrib['context'][0]]['id_name'])
    if 'spot' not in play.attrib:
        # + play.attrib['context'].replace(","," ").split()[3][1] + play.attrib['context'].replace(","," ").split()[3][2] )
        play.set('spot', hv_dict[play.attrib['context'][0]]['id_name'])
    if 'down' not in play.attrib:
        play.set('down', play.attrib['context'].replace(
            ",", " ").split()[3][1])
    if 'togo' not in play.attrib:
        play.set('togo', play.attrib['context'].replace(
            ",", " ").split()[3][2])
    return play

def add_game_type(root, game_type_array):
    venue = root.find('venue')
    venue.set('gametype',",".join(game_type_array))



# def update_team_names(root):
#     venue = root.find('venue')
#     home_code = hv_dict['H']['code']
#     visitor_code = hv_dict['V']['code']
#     venue.set('homename',team_dict[home_code][0])
#     venue.set('visname',team_dict[visitor_code][0])
#     for team in root.iter('team'):
#         team.set('name',team_dict[team.attrib['code']][0])
#         team.set('nickname',team_dict[team.attrib['code']][5])
#         team.set('org',team_dict[team.attrib['code']][2])
#         team.set('division',team_dict[team.attrib['code']][3])
#     return root


def return_plays(root):
    # Returns last play of previous drive and last play of current drive in
    # list of lists
    drive_tuple_dict = {}
    first_and_last = []
    previous_play = previous_drive_last_play = None
    previous_drive_counter = 0

    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            temp_hold_play = None

            for play in qtr.iter('play'):
                # Setting quarter key-value pair in play
                play = add_missing_play_attrib(play, qtr.attrib['number'])
                drive_counter = int(
                    play.attrib['playid'].replace(",", " ").split()[0])
                play_counter = int(
                    play.attrib['playid'].replace(",", " ").split()[1])
                if previous_drive_last_play == None:
                    previous_drive_last_play = play

                if previous_drive_counter != drive_counter:
                    first_and_last.append(
                        [previous_drive_last_play, previous_play])
                    previous_drive_last_play = previous_play
                    temp_hold_play = previous_play = None

                if drive_counter not in drive_tuple_dict:
                    drive_tuple_dict[str(drive_counter)] = {}
                    drive_tuple_dict[str(drive_counter)][
                        'previous_drive_last_play'] = previous_drive_last_play

                if 'type' in play.attrib and play.attrib["type"] == 'X':
                    temp_hold_play = play
                    # we should not update the previous play. Also drives cant
                    # end with X so we are safe to continue.
                    continue
                if 'type' in play.attrib and play.attrib["type"] == 'K' and temp_hold_play != None and previous_play != None:
                    drive_tuple_dict[str(drive_counter)][
                        'current_last'] = previous_play
                else:
                    drive_tuple_dict[str(drive_counter)]['current_last'] = play
                # always in the last
                previous_play = play
                previous_drive_counter = drive_counter
    # Prepare for the last drive
    first_and_last.append([previous_drive_last_play, previous_play])

    return first_and_last


def set_team_dict(root):
    global hv_dict
    for team in root.iter('team'):
        if(team.attrib['vh'] == 'V'):
            hv_dict['V'] = {'id_name': team.attrib[
                'id'], 'code': team.attrib['code']}
        if(team.attrib['vh'] == 'H'):
            hv_dict['H'] = {'id_name': team.attrib[
                'id'], 'code': team.attrib['code']}


def return_team_start_spot_array(root):
    # returns an array with the team id + starting position of each drive
    #hv_dict = {}
    team_start_spot_array = []

    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for drivestart in qtr.iter('drivestart'):
                team_start_spot_array.append(hv_dict[drivestart.attrib['spot'][0]][
                                             'id_name'] + drivestart.attrib['spot'][1:])
    return team_start_spot_array


def end_time_element(zipped_element):
    '''
    Calculates the end time for each drive by subtracting the time
    of possesion from the starting time for each drive
    Called for each element of zipped list when assembling drive dictionary
    '''
    start_time = zipped_element[0]['clock']
    top = zipped_element[1]['top']
    quarter_start_time = '15:00'

    t1 = datetime.datetime.strptime(start_time, "%M:%S")
    t2 = datetime.datetime.strptime(top, "%M:%S")
    quarter_time = datetime.datetime.strptime(quarter_start_time, "%M:%S")

    #datetime.datetime.strftime(quarter_time - (t2-t1), "%M:%S")
    if(t2 > t1):
        t3 = datetime.datetime.strftime(quarter_time - (t2 - t1), "%M:%S")
        return t3
    elif(t1 > t2):
        t3 = (t1 - t2)
        s = (t3.seconds)
        return str(datetime.timedelta(seconds=s))[2:]
    else:  # Called when time of possesion == start time. Only encountered in a few cases
        t3 = (t1 - t2)
        s = t3.seconds
        return(str(datetime.timedelta(seconds=s))[2:])


def start_end_how(zipped_element):
    '''
    Parses the tokens from the last play of the previous drive
    and the last play of the current drive using a regular expression
    For example: PUNT:23 returns PUNT
    May need to update this later
    '''
    s = zipped_element[2][0].attrib['tokens']  # take first group before colon
    e = zipped_element[2][1].attrib['tokens']  # take first group before colon
    p = re.compile('^(.*?):')
    start_how = p.search(s).group(0)[:-1]
    end_how = p.search(e).group(0)[:-1]
    return [start_how, end_how]


def assemble_drive_dict(zipped):
    '''
    Assembles drive dictionary that is written into the xml element
    Reads through the zipped list of drive information and assembles each drive element
    '''
    dict_array = []
    temp_dict = dict()

    for i in range(0, len(zipped)):

        '''
        Commented out lines are updated in the next paragraph
        Need to reset dictionary after every loop otherwise interal pointer
        references are not updated
        '''

        temp_dict = {}
        vh = zipped[i][0]['vh']
        team = hv_dict[vh]['id_name']
        plays = zipped[i][1]['plays']
        yards = zipped[i][1]['yards']
        top = zipped[i][1]['top']
        start_qtr = zipped[i][2][0].attrib['quarter']
        start_time = zipped[i][0]['clock']
        end_qtr = zipped[i][2][1].attrib['quarter']
        # need to parse with team name and position
        end_spot = zipped[i][2][1].attrib['spot']
        drive_index = zipped[i][1]['driveindex']

        # Updated attributes with drive.
        start_yard = zipped[i][3][-2:]
        end_yard = end_spot[-2:]
        start = start_end_how(zipped[i])[
            0] + ',' + start_qtr + ',' + zipped[i][0]['clock'] + ',' + start_yard
        start_how = start_end_how(zipped[i])[0]
        start_spot = zipped[i][3]
        end = start_end_how(zipped[i])[1] + ',' + end_qtr + \
            ',' + end_time_element(zipped[i]) + ',' + end_yard
        end_how = start_end_how(zipped[i])[1]
        end_time = end_time_element(zipped[i])

        temp_dict['vh'] = vh
        temp_dict['team'] = team
        temp_dict['start'] = start
        temp_dict['end'] = end
        temp_dict['plays'] = plays
        temp_dict['yards'] = yards
        temp_dict['top'] = top
        temp_dict['start_how'] = start_how
        temp_dict['start_qtr'] = start_qtr
        temp_dict['start_time'] = start_time
        temp_dict['start_spot'] = start_spot
        temp_dict['end_how'] = end_how
        temp_dict['end_qtr'] = end_qtr
        temp_dict['end_time'] = end_time
        temp_dict['end_spot'] = end_spot
        temp_dict['drive_index'] = drive_index
        dict_array.append(temp_dict)

    return dict_array


def create_drive_element(zipped):
    '''
    Creates "drives" element, assembles list of drive elements, and the inserts into
    root xml file after 'FGA' tag
    '''

    drives = ET.Element('drives')

    # call assemble_drive_dict function which returns array of dictionaries
    # corresponding to drives
    drive_dict = assemble_drive_dict(zipped)

    for i in range(len(zipped)):
        drive = ET.SubElement(drives, 'drive', drive_dict[i])

    return drives


def process(filename, sport_code):
    tree = ET.ElementTree()
    tree = ET.parse(filename)
    _root = tree.getroot()

    #############
    if(_root.tag != 'fbgame'):
        return False
    ##############
    clean_up()
    # store_input(filename)
    #set_team_dict(_root)
    # init_team_dict()
    set_gamedate(_root)
    add_sport_code(_root, sport_code)
    root = fix_team_code(_root)
    player_check_and_fix(root, sport_code)
    #root = update_team_names(root_with_sport)
    schedule = ScheduleManager()
    schedule.got_file(sport_code, hv_dict['H'][
                      'code'], hv_dict['V']['code'], game_date)    
    game_type_array = schedule.get_game_type(sport_code,hv_dict['H']['code'], hv_dict['V']['code'],game_date )
    add_game_type(root, game_type_array)
    play_drive_result = play_drive_check(root)
    if play_drive_result == 'n':
        pass  # don't do anything if plays and drives are present
    elif play_drive_result == 'p':
        root = add_drive_and_play(root)
        raise ValueError('Plays Tag Not found error.')
    elif play_drive_result == 'q':
        raise ValueError('Qtr Summary missing in the plays.')    
    elif play_drive_result == 'd':
        drive_starts = return_drive_start(root)
        drive_summaries = return_drive_sum(root)
        first_and_last = return_plays(root)
        team_start_spot_array = return_team_start_spot_array(root)
        zipped = list(zip(drive_starts, drive_summaries,
                          first_and_last, team_start_spot_array))
        elements_to_insert = create_drive_element(zipped)
        root.insert(6, elements_to_insert)
    schedule.preprocess_success(sport_code, hv_dict['H'][
                                'code'], hv_dict['V']['code'], game_date)
    return root


def batch_process_drives(dir_name, output_dir_name, sport_code):
    file_names = []
    total_cnt = 0
    pass_cnt = 0
    failed_cnt = 0
    not_fb_file = 0
    play_not_available = 0
    qtr_summary_not_available =0
    team_not_found = 0
    mismatch_found = 0
    game_not_during_season = 0
    player_not_found = 0
    start_time = datetime.datetime.now()

    dirs = os.walk(dir_name).next()[1]
    #pprint.pprint(dirs, width = 1)
    sorted_dirs = sorted(dirs,key=lambda x: int(x))
    #pprint.pprint(sorted_dirs, width = 1)
    for folder in sorted_dirs:
        for root, dirs, files in os.walk(dir_name+"/"+folder):
            for name in files:
                if name.endswith('.xml') or name.endswith(".XML"):
                    _file = os.path.join(root, name)
                    logger.info("Processing " + _file)
                    schedule = ScheduleManager()
                    try:
                        total_cnt += 1
                        result = process(_file, sport_code)
                    except ValueError as e:

                        errMsg = ",".join(e.args)
                        
                        if not errMsg.startswith('Invalid xml:'):
                            schedule.preprocess_failed(sport_code, hv_dict['H'][
                                                       'code'], hv_dict['V']['code'], game_date)
                        if errMsg.startswith('Team: '):
                            team_not_found = team_not_found + 1
                        elif errMsg.startswith('Plays'):
                            play_not_available = play_not_available + 1
                        elif errMsg.startswith('Qtr'):
                            qtr_summary_not_available = qtr_summary_not_available + 1
                        elif errMsg.startswith("Invalid xml: Date not during season"):
                            game_not_during_season += 1
                        elif errMsg.startswith("Player:"):
                            player_not_found +=1
                        else:
                            logger.error("Exception occurred", exc_info=True)
                            failed_cnt = failed_cnt + 1
                        logger.error( errMsg + " Failed processing file step1: <" + _file + ">, Skipping the file.")
                        continue
                    except Exception as exp:
                        logger.error("Exception occurred", exc_info=True)
                        schedule.preprocess_failed(sport_code, hv_dict['H'][
                                                   'code'], hv_dict['V']['code'], game_date)
                        try:
                            logger.error("Exception occurred", exc_info=True)
                            logger.error( " Failed processing file step2: <" + _file + ">, Skipping the file.")
                        except Exception as final_ex:
                            logger.error( "Failed processing step3: <" + _file + ">, Skipping the file.")
                        traceback.print_exc()
                        failed_cnt = failed_cnt + 1
                        continue
                    if(result is False):
                        logger.info("Not a football file " + _file)
                        not_fb_file = not_fb_file + 1
                        pass
                    else:
                        try:
                            new_destination=save_file(result, _file, output_dir_name)                        
                            pass_cnt = pass_cnt + 1
                            # TODO: We will do this later
                            # store_preprocessed(new_destination,_file) 
                        except:
                            logger.error("Exception occurred", exc_info=True)
                            logger.error( " Failed processing file <" + _file + ">, while saving Skipping the file.")
                            traceback.print_exc()
                            failed_cnt = failed_cnt + 1
                
    end_time = datetime.datetime.now()
    logger.info( "_________________________________________")
    logger.info( "Total Files: " + str(total_cnt))
    logger.info( "Total Files Passed: " + str(pass_cnt))
    logger.info( "Total Files Failed: " + str(failed_cnt))
    logger.info( "Total Files Failed(play tags not available or has error or less than " + str(minimum_plays_required) + " plays): " + str(play_not_available))
    logger.info( "Total Files Failed(Qtr Summary not available. Required " + str(minimum_qtr_required) + " got): " + str(qtr_summary_not_available))
    logger.info( "Total Files with dates between 1st Feb to 31st July: " + str(game_not_during_season))
    logger.info( "Total Files Failed(Team not found in Master): " + str(team_not_found))
    logger.info( "Total Files Failed(Player not found in roster): " + str(player_not_found))
    logger.info( "Total Files Failed(Not a football): " + str(not_fb_file))
    logger.info( "Total Files Failed(Stats Mismatch): " + str(mismatch_found))
    logger.info( "_________________________________________")


def save_file(result, input_file, output_dir_name):
    new_filename = str(hv_dict['H']['id_name'] + "_" + hv_dict['V'][
        'id_name'] + "_" + str(game_date.strftime("%m-%d-%Y")) + ".xml")
    new_destination = output_dir_name + "/" + new_filename
    tree = ET.ElementTree(result)
    #xml_str = ET.tostring(tree.root).decode()
    #print(xml_str)
    tree.write(new_destination)
    logger.info("Completed Processing " + input_file + " as " + new_destination)
    return new_destination


def print_missing_schedule(team_code):

    schedule = ScheduleManager()
    result = schedule.get_schedule_data_with_status(team_code)

    print "\nMissing Files"
    print "_________________________________________"
    for missing_schedule in result:
        print   missing_schedule['gameDate'] + "     " + missing_schedule['teamName'] + " vs " + missing_schedule['oppoTeamName']

    result = schedule.get_schedule_data_with_status(team_code,"preprocess_failed")

    print "\nFailed Preproces"
    print "_________________________________________"

    for missing_schedule in result:
        print   missing_schedule['gameDate'] + "     " + missing_schedule['teamName'] + " vs " + missing_schedule['oppoTeamName']

    result = schedule.get_schedule_data_with_status(team_code,"upload_failed")

    print "\nFailed Upload"
    print "_________________________________________"

    for missing_schedule in result:
        print   missing_schedule['gameDate'] + "     " + missing_schedule['teamName'] + " vs " + missing_schedule['oppoTeamName']
    


def store_input(filename):
    stage = "football/input"
    upload_to_s3(filename, stage)


def store_preprocessed(filename, original_filename=None):
    stage = "football/pre-processed"
    if original_filename == None:
        upload_to_s3(filename, stage)
        return
    upload_to_s3(filename, stage, {
                 'Key': 'original_filename', 'Value': original_filename})


def store_uploaded(filename, original_filename=None):
    stage = "football/uploaded"
    if original_filename == None:
        upload_to_s3(filename, stage)
        return
    upload_to_s3(filename, stage, {
                 'Key': 'original_filename', 'Value': original_filename})


def store_upload_failed(filename, original_filename=None):
    stage = "football/upload-failed"
    if original_filename == None:
        upload_to_s3(filename, stage)
        return
    upload_to_s3(filename, stage, {
                 'Key': 'original_filename', 'Value': original_filename})


def upload_to_s3(filename, foldername, tagdict=None):
    # Create an S3 client
    s3 = boto3.client('s3')
    bucket_name = 'test-gamefiles'
    print "uploading file " + filename + " to " + foldername + "/" + filename.split('/')[-1]
    # Uploads the given file using a managed uploader, which will split up large
    # files automatically and upload parts in parallel.
    s3.upload_file(filename, bucket_name, foldername +
                   "/" + filename.split('/')[-1])
    if tagdict != None:
        s3.put_object_tagging(Bucket=bucket_name, Key=foldername +
                              "/" + filename.split('/')[-1], Tagging={"TagSet": [tagdict]})


def help():
    print 'preprocess_football.py -u <uncorrected folder path> -o <output folder path>  -t <sportcode> -l <logfile>'
    print 'preprocess_football.py -r <team_code>'


def main(argv):
    dir_name = ""
    output_dir_name = ""
    sport_code = ""
    global logger
    try:        
        opts, args = getopt.getopt(
            argv, "hu:o:t:r:l:", ["uncorrected=", "output=", "sportcode=", "report=", "log="])
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-r',"--report"):
            print_missing_schedule(arg)
            sys.exit()
        elif opt in ('-u', "--uncorrected"):
            dir_name = arg
        elif opt in ('-o', "--output"):
            output_dir_name = arg
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
    if output_dir_name == "" or dir_name == "":
        help()
        sys.exit(2)
    # Hard coded to football
    if (logger is not None):
        logging.basicConfig(level=logging.INFO,format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        logger = logging.getLogger(__name__)
    if os.path.isdir(dir_name):
        logger.info("Input is a folder " + dir_name)
        batch_process_drives(dir_name, output_dir_name, sport_code)
    if os.path.isfile(dir_name):
        logger.info("Input is single file " + dir_name)
        result = process(dir_name, sport_code)
        if result is False:
            print "Failed processing file"
        else:
            save_file(result, output_dir_name, output_dir_name)
            print "File " + dir_name + " Processed"


if __name__ == "__main__":
    main(sys.argv[1:])
