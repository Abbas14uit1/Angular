import xml.etree.ElementTree as ET
import datetime
import os
import sys
import getopt
from pymongo import MongoClient
import time
import traceback
import shutil

hv_dict = {}  # home & visitor dictionary
game_date = ""
player_dict = {}  # All the player
team_stats = {}
player_stats = {}

client = MongoClient('localhost', 27019)
unknown_player_name = 'unknown, unknown'
collection_name = 'Rosters-ec2'

action_type_event_points_dict = dict()
action_type_event_points_dict['SUB.OUT'] = ''
action_type_event_points_dict['TURNOVER.None'] = 'to:1'
action_type_event_points_dict['STEAL.None'] = 'stl:1'
action_type_event_points_dict['GOOD.3PTR'] = 'fgm3:3'
action_type_event_points_dict['ASSIST.None'] = 'ast:1'
action_type_event_points_dict['MISS.3PTR'] = 'fga3:1'
action_type_event_points_dict['REBOUND.OFF'] = 'oreb:1'
action_type_event_points_dict['FOUL.None'] = 'pf:1'
action_type_event_points_dict['MISS.JUMPER'] = 'fga:1'
action_type_event_points_dict['REBOUND.DEF'] = 'dreb:1'
action_type_event_points_dict['GOOD.LAYUP'] = 'fgm:2'
action_type_event_points_dict['GOOD.FT'] = 'ftm:1'
action_type_event_points_dict['TIMEOUT.MEDIA'] = ''
action_type_event_points_dict['SUB.IN'] = ''
action_type_event_points_dict['GOOD.DUNK'] = 'fgm:2'
action_type_event_points_dict['BLOCK.None'] = 'blk:1'
action_type_event_points_dict['GOOD.JUMPER'] = 'fgm:2'
action_type_event_points_dict['MISS.FT'] = 'fta:1'
action_type_event_points_dict['REBOUND.DEADB'] = 'deadball:1'
action_type_event_points_dict['TIMEOUT.30SEC'] = ''
action_type_event_points_dict['MISS.LAYUP'] = 'fga:1'
action_type_event_points_dict['TIMEOUT.TEAM'] = ''
action_type_event_points_dict['GOOD.TIPIN'] = 'fgm:2'
action_type_event_points_dict['MISS.DUNK'] = 'fga:1'
action_type_event_points_dict['MISS.TIPIN'] = 'fga:1'
action_type_event_points_dict['FOUL.TECH'] = 'tf:1'
action_type_event_points_dict['TIMEOUT.20SEC'] = ''


class Stat(dict):

    def __init__(self):
        self.fgm = 0
        self.fga = 0
        self.fgm3 = 0
        self.fga3 = 0
        self.ftm = 0
        self.fta = 0
        self.tp = 0
        self.blk = 0
        self.stl = 0
        self.ast = 0
        self.min = 0
        self.oreb = 0
        self.dreb = 0
        self.treb = 0
        self.pf = 0
        self.tf = 0
        self.to = 0
        self.deadball = 0
        self.fgpct = 0
        self.fg3pct = 0
        self.ftpct = 0
        self.foul = 0

    def __getattr__(self, name):
        if name in self:
            return self[name]
        else:
            raise AttributeError("No such attribute: " + name)

    def __setattr__(self, name, value):
        self[name] = value

    def calculate(self, actionType):
        '''print actionType.event'''
        '''if actionType.event == 'ast':
            print self[actionType.event]'''
        self[actionType.event] = self[actionType.event] + 1
        self['treb'] = self.dreb + self.oreb
        self['foul'] = self.pf + self.tf


class ActionType(object):

    def __init__(self, event, points):
        self.event = event
        self.points = points


class MongoPlayerDetails(object):
    def __init__(self, player_name, game_details):
        self.player_name = player_name
        self.game_details = game_details


class MongoGameDetails(object):

    def __init__(self, game_date, college_year, academic_year):
        self.game_date = game_date
        self.college_year = college_year
        self.academic_year = academic_year


''' Get the correct event points for a given action and type'''


def get_event_points(action, type):
    action_type = action + '.' + type
    event_points = action_type_event_points_dict.get(action_type, None)
    if event_points and len(event_points) > 1:  # checking length because value is empty in dict.
        event_points_list = []
        event_points_arrs = event_points.split(',')
        for event_points_arr in event_points_arrs:
            event_points_colon_arr = event_points_arr.split(':')
            action_type_obj = ActionType(event_points_colon_arr[0], event_points_colon_arr[1])
            event_points_list.append(action_type_obj)

        return event_points_list

    return None


def clean_up():
    global hv_dict
    hv_dict = {};
    global game_date
    game_date = ""
    global player_dict
    player_dict = {}
    global team_stats
    team_stats['V'] = []
    team_stats['H'] = []
    global player_stats
    player_stats = {}


def parse_basketball_xml(filename):
    tree = ET.ElementTree()
    tree = ET.parse(filename)
    root = tree.getroot()
    return root;


def get_team_code_from_master(team_name, team_code, team_tag):
    db = client.athlyte
    # print "Find for " + team_name
    #team_data = {}
    if team_code is None or len(team_code) == 0:
        team_data = db.TeamMaster.find_one({"teamName": team_name})        
    else:
        team_data = db.TeamMaster.find_one({"teamCode": team_code})        
    if team_data is not None:        
        team_tag.set('code', team_data['teamCode'])
        team_tag.set('name', team_data['teamName'])
        return
    modified_team_name = team_name.replace("State", "St.")
    team_data = db.TeamMaster.find_one({"teamName": modified_team_name})
    if team_data is not None:
        team_tag.set('code', team_data['teamCode'])
        team_tag.set('name', team_data['teamName'])
        return
    team_data = db.TeamMaster.find_one({"teamNickNames": team_name})
    if team_data is not None:
        team_tag.set('code', team_data['teamCode'])
        team_tag.set('name', team_data['teamName'])
        return

    raise ValueError("Team: <" + team_name + "> not found in team master")


def set_gamedate(root):
    global game_date
    if root.find('venue') is not None:
        for venue in root.iter('venue'):
            if 'date' in venue.attrib:
                game_date_string = venue.attrib['date']
                game_date = datetime.datetime.strptime(game_date_string, "%m/%d/%Y")


def set_hv_dict(team):
    global hv_dict
    if (team.attrib['vh'] == 'V'):
        hv_dict['V'] = {'id_name': team.attrib['id'], 'code': team.attrib['code']}
    if (team.attrib['vh'] == 'H'):
        hv_dict['H'] = {'id_name': team.attrib['id'], 'code': team.attrib['code']}


def add_sport_tag(root):
    sport_element = ET.Element('sport')
    sport_element.set('sport', 'basketball')
    root.insert(0, sport_element)
    return root


def fix_team_code(root):
    for team in root.iter('team'):
        team_code = team.get('code', None)        
        get_team_code_from_master(team.attrib['name'], team_code, team)
            # team.set('code', code)
        set_hv_dict(team)
    return root


def process_all_plays(root):
    plays = root.find('plays')
    if plays is None:
        raise ValueError('Plays Tag Not found error.')

    # for plays in root.iter('plays'):
    if plays.find('period') is None:
        raise ValueError('Periods Tag Not found in Plays Tag error.')
    play_seq = 1
    periods = plays.iter('period')
    for period in periods:
        if period.find('play') is None:
            raise ValueError('Play Tag Not found in period Tag error.')
        period_int = int(period.attrib['number'])
        print ("Started re-calculation for period: " + str(period_int))
        for play in period.iter('play'):
            compute_stats(play, period_int)
            compute_players_stats(play, period_int)
            vh = play.attrib['vh']
            team = play.attrib['team']
            uni = play.attrib['uni']
            if uni == 'TM':
                continue
            key_dict = vh + '_' + team + '_' + uni
            check_name = player_dict.get(key_dict, None)
            check_name = check_name if check_name is not None else unknown_player_name
            play.set('checkname', check_name)
            if 'seq' not in play.attrib:
                play.set('seq', str(play_seq))
                play_seq += 1


def compute_stats(play, period):
    type_data = 'None' if 'type' not in play.attrib else play.attrib['type']
    event_point_list = get_event_points(play.attrib['action'], type_data)
    '''if play.attrib['vh'] == 'V':
        print play.attrib['action'] + ',' + type_data'''
    if event_point_list:
        for event_point in event_point_list:

            if len(team_stats[play.attrib['vh']]) == 0:
                team_stats[play.attrib['vh']].append(Stat())

            if len(team_stats[play.attrib['vh']]) == period:
                team_stats[play.attrib['vh']].append(Stat())

            team_stats[play.attrib['vh']][0].calculate(event_point)
            team_stats[play.attrib['vh']][period].calculate(event_point)


def compute_players_stats(play, period):
    player_uni = play.attrib['uni']
    if player_uni == 'TM':
        return

    type_data = 'None' if 'type' not in play.attrib else play.attrib['type']
    event_point_list = get_event_points(play.attrib['action'], type_data)
    if event_point_list:
        for event_point in event_point_list:
            player_key_0 = play.attrib['vh'] + '_' + str('0') + '_' + play.attrib['team'] + '_' + player_uni
            player_key_prd = play.attrib['vh'] + '_' + str(period) + '_' + play.attrib['team'] + '_' + player_uni
            each_player_stats_0 = player_stats.get(player_key_0, None)
            each_player_stats_prd = player_stats.get(player_key_prd, None)
            if each_player_stats_0 is None:
                player_stats[player_key_0] = Stat()

            if each_player_stats_prd is None:
                player_stats[player_key_prd] = Stat()

            player_stats[player_key_0].calculate(event_point)
            player_stats[player_key_prd].calculate(event_point)


def update_all_stats(root):
    update_stats_totals(root)
    update_stats_byprd(root)
    construct_summary_stas_byprd(root)
    update_players_stats(root)


def update_stats_totals(root):
    for team in root.iter('team'):
        total = team.find('totals')
        stat = total.find('stats')
        vh = team.attrib['vh']
        update_stats(stat, vh, 0)


def update_stats_byprd(root):
    for team in root.iter('team'):
        total = team.find('totals')
        stats_by_prd = total.iter('statsbyprd')
        for stat_by_prd in stats_by_prd:
            period = stat_by_prd.get('prd') if stat_by_prd.get('prd').isdigit() else str(int(period) + 1)
            vh = team.attrib['vh']
            update_stats(stat_by_prd, vh, int(period))


def update_special(special, root, period, vh):
    plays = root.find('plays')

    periods = plays.iter('period')
    for prd in periods:
        prd_attr = prd.attrib['number']
        if prd_attr == str(period):
            play_special_tags = prd.iter('special')
            for play_special_tag in play_special_tags:
                pst_vh = play_special_tag.attrib['vh']
                if pst_vh == vh:
                    pst_keys = play_special_tag.keys()
                    for pst_key in pst_keys:
                        special.set(pst_key, play_special_tag.get(pst_key))


def construct_summary_stas_byprd(root):
    byprdsummaries = root.find('byprdsummaries')
    if byprdsummaries == None:
        byprd_summaries_element = ET.Element('byprdsummaries')
        team_stats_keys = team_stats.keys()
        no_of_periods = team_stats.get(team_stats_keys[0])
        periods = get_total_periods(no_of_periods, True)

        for period in periods:
            byprd_summary_element = ET.SubElement(byprd_summaries_element, 'byprdsummary')
            byprd_summary_element.set('prd', str(period))
            for team_stats_key in team_stats_keys:
                summary = ET.SubElement(byprd_summary_element, 'summary')
                update_stats(summary, team_stats_key, period)
                special = ET.SubElement(byprd_summary_element, 'special')
                update_special(special, root, period, team_stats_key)

        root.insert(0, byprd_summaries_element)
        return

    update_summary_stas_byprd(byprdsummaries)


# calculating number of periods in the game. Not sure whether is correct method to find number of periods.
def get_total_periods(team_stats_one_list, exclude_0_stats):
    periods = []
    start_prd = 1 if exclude_0_stats else 0
    while start_prd < len(team_stats_one_list):
        periods.append(start_prd)
        start_prd = start_prd + 1
    return periods


def update_summary_stas_byprd(byprdsummaries):
    for byprdsummary in byprdsummaries.iter('byprdsummary'):
        period = byprdsummary.attrib['prd']
        for summary in byprdsummary.iter('summary'):
            vh = summary.attrib['vh']
            update_stats(summary, vh, int(period))


def update_stats(element, vh, period):
    #element.set('vh', vh)
    #element.set('fgm', str(team_stats[vh][period]['fgm']))

    fga3 = team_stats[vh][period]['fga3'] + team_stats[vh][period]['fgm3']
    fga = team_stats[vh][period]['fga'] + team_stats[vh][period]['fgm'] + fga3
    fta = team_stats[vh][period]['fta'] + team_stats[vh][period]['ftm']
    fgm = team_stats[vh][period]['fgm'] + team_stats[vh][period]['fgm3']

    element.set('fga', str(fga))
    element.set('fga3', str(fga3))
    element.set('fta', str(fta))
    element.set('fgm', str(fgm))

    element.set('fgm3', str(team_stats[vh][period]['fgm3']))
    element.set('ftm', str(team_stats[vh][period]['ftm']))
    element.set('blk', str(team_stats[vh][period]['blk']))
    element.set('stl', str(team_stats[vh][period]['stl']))
    element.set('ast', str(team_stats[vh][period]['ast']))

    element.set('oreb', str(team_stats[vh][period]['oreb']))
    element.set('dreb', str(team_stats[vh][period]['dreb']))
    element.set('treb', str(team_stats[vh][period]['treb']))
    element.set('pf', str(team_stats[vh][period]['pf']))
    element.set('tf', str(team_stats[vh][period]['tf']))
    element.set('to', str(team_stats[vh][period]['to']))
    element.set('foul', str(team_stats[vh][period]['foul']))

    if team_stats[vh][period]['min'] != 0 :
        element.set('min', str(team_stats[vh][period]['min']))

    # Need to get details from Kiron for deadball.
    #element.set('deadball', str(team_stats[vh][period]['deadball']) + ',0')
    element.set('fgpct', str(calculate_pct(fga, fgm)))
    element.set('fg3pct', str(calculate_pct(fga3, team_stats[vh][period]['fgm3'])))
    element.set('ftpct', str(calculate_pct(fta, team_stats[vh][period]['ftm'])))

    tp = (team_stats[vh][period]['fgm'] * 2) + (team_stats[vh][period]['fgm3'] * 3) + (team_stats[vh][period]['ftm'] * 1)
    element.set('tp', str(tp))


def calculate_pct(attempts, made):
    if attempts == 0:
        return 0
    pct = (float(made) / float(attempts)) * 100
    return round(pct, 1)


def update_player_stats(element, player_stat):
    if player_stat is None:  # Need to handle separately, may be add 0 for all attributes.
        return

    fga3 = player_stat['fga3'] + player_stat['fgm3']
    fga = player_stat['fga'] + player_stat['fgm'] + fga3
    fta = player_stat['fta'] + player_stat['ftm']
    fgm = player_stat['fgm'] + player_stat['fgm3']

    element.set('fga', str(fga))
    element.set('fga3', str(fga3))
    element.set('fta', str(fta))
    element.set('fgm', str(fgm))

    element.set('fgm3', str(player_stat['fgm3']))
    element.set('ftm', str(player_stat['ftm']))
    element.set('blk', str(player_stat['blk']))
    element.set('stl', str(player_stat['stl']))
    element.set('ast', str(player_stat['ast']))
    element.set('oreb', str(player_stat['oreb']))
    element.set('dreb', str(player_stat['dreb']))
    element.set('treb', str(player_stat['treb']))
    element.set('pf', str(player_stat['pf']))
    element.set('tf', str(player_stat['tf']))
    element.set('to', str(player_stat['to']))

    element.set('fgpct', str(player_stat['fgpct']))
    element.set('fg3pct', str(player_stat['fg3pct']))
    element.set('ftpct', str(player_stat['ftpct']))
    element.set('foul', str(player_stat['foul']))

    if player_stat['min'] != 0 :
        element.set('min', str(player_stat['min']))

    # Need to get details from Kiron for deadball.
    #element.set('deadball', str(team_stats[vh][period]['deadball']) + ',0')
    element.set('fgpct', str(calculate_pct(fga, fgm)))
    element.set('fg3pct', str(calculate_pct(fga3, player_stat['fgm3'])))
    element.set('ftpct', str(calculate_pct(fta, player_stat['ftm'])))

    tp = (player_stat['fgm'] * 2) + (player_stat['fgm3'] * 3) + (player_stat['ftm'] * 1)
    element.set('tp', str(tp))


def update_players_stats(root):
    # no_of_team_stats = team_stats.get(team_stats.keys()[0])
    # periods = get_total_periods(no_of_team_stats, True)
    for team in root.iter('team'):
        vh = team.attrib['vh']
        team_id = team.attrib['id']
        for player in team.iter('player'):
            player_uni = player.attrib['uni']
            if player_uni == 'TM':
                continue
            stats_tag = player.find('stats')
            # Added condition for checkname with number issue. In Player tag there is no stats & statsbyprd tag available
            if stats_tag is None:
                stats_tag = ET.SubElement(player, 'stats')

            # '0' used for all stats.
            player_key = vh + '_' + '0' + '_' + team_id + '_' + player_uni
            player_stat = player_stats.get(player_key, None)

            update_player_stats(stats_tag, player_stat)
            player_byprds = player.find('statsbyprd')
            if player_byprds is not None:
                for player_byprd in player.iter('statsbyprd'):
                    if 'prd' not in player_byprd.attrib:
                        continue
                    prd = player_byprd.attrib['prd']
                    player_key = vh + '_' + prd + '_' + team_id + '_' + player_uni
                    player_stat = player_stats.get(player_key, None)
                    update_player_stats(player_byprd, player_stat)
            else:
                team_stats_keys = team_stats.keys()
                no_of_periods = team_stats.get(team_stats_keys[0])
                periods = get_total_periods(no_of_periods, True)
                for period in periods:
                    stats_byprd = ET.SubElement(player, 'statsbyprd')
                    player_key = vh + '_' + str(period) + '_' + team_id + '_' + player_uni
                    player_stat = player_stats.get(player_key, None)
                    update_player_stats(stats_byprd, player_stat)


def add_sport_code(root, sport_code):
    venue_tag = root.find('venue')
    if venue_tag is not None:
        venue_tag.set('sportcode', sport_code)

    root.set('sportcode', sport_code)


def get_player_details_from_mongo(game_date, sport_code_caps, team_name):
    db = client.athlyte
    player_details = db[collection_name].find({"$and": [{"rosterGamesDetails.gameDate": game_date},
                                                        {"sportCode": sport_code_caps}, {"teamCode": team_name}]},
                                              {"playerName": 1, "_id": 0, "rosterGamesDetails.gameDate": 1,
                                               "rosterGamesDetails.playerCollegeYear": 1,
                                               "rosterGamesDetails.season": 1})
    mongo_player_details_list = []
    for pd in player_details:
        gds = pd['rosterGamesDetails']
        gds_obj_list = []
        for gd in gds:
            gds_obj_list.append(MongoGameDetails(gd['gameDate'], gd['playerCollegeYear'], gd['season']))

        mongo_player_details_list.append(MongoPlayerDetails(pd['playerName'], gds_obj_list))

    return mongo_player_details_list


def update_player_college_year(root, sport_code):
    game_date = ''
    venue_tag = root.find('venue')
    if venue_tag is not None:
        game_date = time.strftime('%m/%d/%Y', time.strptime(venue_tag.attrib['date'], '%m/%d/%Y'))

    sport_code_caps = sport_code.upper()
    for team in root.iter('team'):
        team_name = team.attrib['name']
        team_code = team.attrib[
            'code']  # taking team code instead of team name, there is mismatch of team name between xml & mongo.
        print '-------------' + team_name + ' <START>--------------------'
        game_date = time.strftime('%m/%d/%Y', time.strptime(game_date, '%m/%d/%Y'))
        mongo_player_details = get_player_details_from_mongo(game_date, sport_code_caps, team_code)
        # dates are not matching between bbgame tag & venue tag. So querying again if we are not able find with venue tag date.
        if len(mongo_player_details) == 0:
            gen_date = root.attrib['generated']
            mongo_player_details = get_player_details_from_mongo(gen_date, sport_code_caps, team_code)

        for player in team.iter('player'):
            player_name_xml = player.attrib['checkname']
            if player_name_xml == 'TEAM':
                continue

            player_name_space = ', '.join(player_name_xml.split(','))
            found_mongo = False
            for mpd in mongo_player_details:
                if mpd.player_name.upper() == player_name_space.upper():
                    found_mongo = True
                    rosterGDs = mpd.game_details
                    for gd in rosterGDs:
                        if gd.game_date == game_date:
                            player.set('collegeyear', gd.college_year)
                            player.set('academicyear', gd.academic_year)
                            break  # breaking inner loop.
                    break  # breaking outer loop
            if not found_mongo:
                print "~~~~~ Player Name not found in Mongo. PlayerName(XML): " + player_name_space + \
                      ", TeamName: " + team_name + ', GameDate:' + game_date
        players_in_mongo = ''
        for mpd in mongo_player_details:
            if len(players_in_mongo) > 1:
                players_in_mongo = players_in_mongo + "; "
            players_in_mongo = players_in_mongo + mpd.player_name
        print "Players in Mongo: [" + players_in_mongo + "]"
        print '-------------' + team_name + ' <END>--------------------'


def populate_player_dict(root):
    for team in root.iter('team'):
        vh = team.attrib['vh']
        team_id = team.attrib['id']
        for player in team.iter('player'):
            uni = player.attrib['uni']
            check_name = player.attrib['checkname']
            dict_key = vh + '_' + team_id + '_' + uni
            player_dict[dict_key] = check_name


'''
This is the first function that starts the file processing. 
'''


def process(filename, sport_code):
    _root = parse_basketball_xml(filename)
    if (_root.tag != 'bbgame'):
        return False
    clean_up()
    # TODO: we need to change it later
    set_gamedate(_root)
    add_sport_code(_root, sport_code)  # adding the sport code provided in the arguments list.
    root_with_sport = add_sport_tag(_root)
    root_with_team_code = fix_team_code(root_with_sport)
    populate_player_dict(root_with_sport)
    process_all_plays(root_with_team_code)
    update_all_stats(root_with_team_code)
    update_player_college_year(root_with_team_code, sport_code)
    # root = fix_plays_with_player_code(root_with_team_code)
    return root_with_team_code


'''def update_team_names(root):
    venue = root.find('venue')
    home_code = hv_dict['H']['code']
    visitor_code = hv_dict['V']['code']
    venue.set('homename',team_dict[home_code][0])
    venue.set('visname',team_dict[visitor_code][0])
    for team in root.iter('team'):
        team.set('name',team_dict[team.attrib['code']][0])
        team.set('nickname',team_dict[team.attrib['code']][5])
        team.set('org',team_dict[team.attrib['code']][2])
        team.set('division',team_dict[team.attrib['code']][3])
    return root
'''


def compare_stats(old_file, new_file, period, vh):
    old_root = parse_basketball_xml(old_file)
    new_root = parse_basketball_xml(new_file)
    old_stats_dict = dict()
    new_stats_dict = dict()
    for team in old_root.iter('team'):
        if period == 0 and team.attrib['vh'] == vh:
            old_stats_dict = team.find('totals').find('stats')
        elif period != 0 and team.attrib['vh'] == vh:
            for statsbyprd in team.find('totals').iter('statsbyprd'):
                if statsbyprd.attrib['prd'] == str(period):
                    old_stats_dict = statsbyprd

    for team in new_root.iter('team'):
        if period == 0 and team.attrib['vh'] == vh:
            new_stats_dict = team.find('totals').find('stats')
        elif period != 0 and team.attrib['vh'] == vh:
            for statsbyprd in team.find('totals').iter('statsbyprd'):
                if statsbyprd.attrib['prd'] == str(period):
                    new_stats_dict = statsbyprd

    keys = old_stats_dict.keys()
    found_mismatch = False
    for key in keys:
        if old_stats_dict.get(key) != new_stats_dict.get(key):
            print "^^^^^^^^^^^^^^^^ value did not matched. For Key: " + key + ", Old Value: " + old_stats_dict.get(key) + \
                  ", New Value: " + new_stats_dict.get(key) + ", vh: " + vh + ", period: " + str(period)
            found_mismatch = True

    return found_mismatch

def batch_process(input_dir_name, output_dir_name, sport_code):
    file_names = []
    pass_cnt = 0
    failed_cnt = 0
    not_bb_file = 0
    play_not_available = 0
    team_not_found = 0
    mismatch_found = 0
    for root, dirs, files in os.walk(input_dir_name):
        for name in files:
            if name.endswith('.xml') or name.endswith(".XML"):
                _file = os.path.join(root, name)
                print("\nProcessing " + _file)
                try:
                    result = process(_file, sport_code)
                except ValueError as e:
                    # print(e.args, "error")
                    errMsg = ",".join(e.args)
                    print errMsg + " \nFailed processing file: <" + _file + ">, Skipping the file."
                    if errMsg.startswith('Periods Tag Not'):
                        play_not_available = play_not_available + 1
                    elif errMsg.startswith('Team: '):
                        team_not_found = team_not_found + 1
                    else:
                        failed_cnt = failed_cnt + 1
                    continue
                except Exception as exp:
                    try:
                        print ",".join(exp.args) + " \nFailed processing file: <" + _file + ">, Skipping the file."
                    except Exception as final_ex: 
                        print "Failed processing file: <" + _file + ">, Skipping the file."                    
                    traceback.print_exc()
                    failed_cnt = failed_cnt + 1
                    continue

                if (result is False):
                    print("Not a basketball file " + _file)
                    not_bb_file = not_bb_file + 1
                    pass
                else:
                    # str(team_name + "_" + game_date + "_" + game_num + '.xml')
                    # print "Here is the date" + game_date
                    new_filename = str(hv_dict['H']['id_name'] + "_" + hv_dict['V']['id_name'] + "_" + str(
                        game_date.strftime("%m-%d-%Y")) + ".xml")
                    # new_filename = "test.xml"
                    new_destination = output_dir_name + "/" + new_filename
                    tree = ET.ElementTree(result)
                    tree.write(new_destination)
                    # store_preprocessed(new_destination,_file)
                    # map_schedule(game_date.strftime("%Y"),_file,new_destination)
                    print("Completed Processing " + _file + " saved as " + new_destination + '\n')
                    #print("Completed Processing(new) " + new_destination + '\n')
                    pass_cnt = pass_cnt + 1
                    '''found_mismatch_0 = compare_stats(_file, new_destination, 0, 'V')
                    found_mismatch_1 = compare_stats(_file, new_destination, 0, 'H')
                    found_mismatch_2 = compare_stats(_file, new_destination, 1, 'V')
                    found_mismatch_3 = compare_stats(_file, new_destination, 1, 'H')
                    found_mismatch_4 = compare_stats(_file, new_destination, 2, 'V')
                    found_mismatch_5 = compare_stats(_file, new_destination, 2, 'H')
                    if found_mismatch_0 or found_mismatch_1 or found_mismatch_2 or found_mismatch_3 or found_mismatch_4 or found_mismatch_5:
                        print "Mismatch File name:" + _file + ", processed file name: " + new_destination
                        mismatch_found = mismatch_found + 1'''
                        #err_op = 'D:/Taheer/personal/athlyte/xmlFiles/MenBasketball_mismatch/' + str(mismatch_found) + '_' + name
                        #shutil.copy(_file, err_op)



    print "\n\nTotal Files Passed: " + str(pass_cnt)
    print "Total Files Failed: " + str(failed_cnt)
    print "Total Files Failed(play tags not available): " + str(play_not_available)
    print "Total Files Failed(Team not found in Master): " + str(team_not_found)
    print "Total Files Failed(Not a basketball): " + str(not_bb_file)
    print "Total Files Failed(Stats Mismatch): " + str(mismatch_found)


def help():
    print 'preprocess_basketball.py -u <uncorrected folder path> -o <output folder path> -t <sportcode>'


def main(argv):
    dir_name = ""
    output_dir_name = ""
    sport_code = None
    try:
        opts, args = getopt.getopt(argv, "hu:o:t:", ["uncorrected=", "output=", "sportcode="])
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
        elif opt in ('-o', "--output"):
            output_dir_name = arg
        elif opt in ('-t', "--sportcode"):
            sport_code = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)

    if output_dir_name == "" or dir_name == "" or not sport_code:
        help()
        sys.exit(2)
    batch_process(dir_name, output_dir_name, sport_code)


if __name__ == "__main__":
    main(sys.argv[1:])
