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

#import boto3
sys.path.append("../common")
from schedule_manager import ScheduleManager
from teammaster_manager import TeamMasterManager
from roster_manager import StageRoster
from name_normalizer import NameNormalizer

game_start_season_month= "06" #June
game_end_season_month= "01" #Jan

    

'''
Takes a season directory as input and constructs an active roster
'''

def process(season_dir, filename, sport_code):
	roster_manager = StageRoster()
	for root_dir, dirs, files in os.walk(season_dir):
		for file in files:
			_file = os.path.join(root_dir, file)
			print "Found File " + _file
            		logger.info("Found file " + _file)
			tree = ET.ElementTree()
			try:
				tree = ET.parse(_file)
			except:
				continue
			_root = tree.getroot()
			if(_root.tag != 'fbgame'):
				continue
			#print "Process started for " + _file
			logger.info("Process started for " + _file)
			player_check_and_fix(tree, sport_code, roster_manager)
	roster_manager.complete(sport_code)


'''
1) Take all the player and attempt a match with player name in the current season 
2) If found update the player_class, code, uni 
3) If multiple player then mark both as unverified.
4) If not found then search previous player season 
5) If found 1 then insert the current one with mapping to the player.
6) If found more than 1 then insert the current one with multiple mapping and mark it as unverified.
'''
def player_check_and_fix(root, sport_code, roster_manager):    
    team_dict = {'V':'', 'H':''}
    game_date=get_gamedate(root)
    for team in root.iter("team"):
         master = TeamMasterManager()
         team_code = None
         team_name = team.attrib['name']
         team_id = team.attrib['id']
         team_data = master.get_team_data_from_master(team_name, team_id, team_code)         
         team_code = team_data["teamCode"]
         team_dict[team.attrib['vh']] = team_code
         for player in team.iter("player"):
         	player_name = get_player_name(player)
         	if "TEAM"==player_name or "TM" == player_name or "" == player_name or player_name is None:
        		continue
         	print "Player Name " + player_name
         	logger.info("Player Name " + player_name)
         	finger_print = roster_manager.get_player_finger_print(player)
                player_class = None if "class" not in player.attrib else player.attrib["class"]
         	roster_manager.update_player(sport_code, team_code, player_name, player_class, player.attrib["uni"], player.attrib["code"], game_date, get_season(game_date), finger_print)
    #print "Start DNP "
    for dnp in root.iter("dnp"):
        vh = dnp.attrib["vh"]
        team_code = team_dict[vh]
        #roster_manager.setup_roster_for_team(sport_code, hv_dict[vh]["code"])
        print "Started DNP"
        for player in dnp.iter("player"):
        	player_name = get_player_name(player)
        	rcv, rush, passing, defense, fg, pat, punt, pr, fr, kr, dnp= ("0",)*11
        	if "TEAM"==player_name or "TM" == player_name or "" == player_name or player_name is None:
        		continue
        	dnp = 1        		
        	print "Player Name " + player_name
        	logger.info("Player Name " + player_name)
        	finger_print = roster_manager.get_player_finger_print(player, True)
                player_class = None if "class" not in player.attrib else player.attrib["class"]
        	roster_manager.update_player(sport_code, team_code, player.attrib["checkname"], player_class, player.attrib["uni"], player.attrib["code"], game_date, get_season(game_date), finger_print)                
    #print "End DNP"
    

def get_player_name(player):
	name_normalizer = NameNormalizer()
	if player.attrib["checkname"] != "":
		return player.attrib["checkname"].encode("ascii", "ignore").strip()
	if player.attrib["name"] != "" and player.attrib["name"].strip() != "":
		(name,checkname) = name_normalizer.normalize_name(player.attrib["name"])
		return checkname 

def get_gamedate(root):
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
    return game_date

def validate_gamedate(game_date):
	year = get_season(game_date)
	#validate if the game date is within the season dates. Ignore all other games
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
            
        
    



def help():
    print 'process_roster.py -u <uncorrected season folder> -t <sportcode> -l <logfile>'
    


def main(argv):
    dir_name = ""
    output_dir_name = ""
    sport_code = ""
    global logger
    try:        
        opts, args = getopt.getopt(
            argv, "hu:t:r:l:", ["uncorrected=", "sportcode=", "report=", "log="])
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
    if dir_name == "":
        help()
        sys.exit(2)
    if (logger is not None):
        logging.basicConfig(level=logging.INFO,format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        logger = logging.getLogger(__name__)

    process(dir_name, output_dir_name, sport_code)


if __name__ == "__main__":
    main(sys.argv[1:])


