import os
import sys
import getopt
from pymongo import MongoClient
from pprint import pprint
from datetime import datetime

sys.path.append("../common")  
from schedule_manager import ScheduleManager
from teammaster_manager import TeamMasterManager
from teamdata_manager import TeamDataManager
from proddata_manager import ProductionDataManager

def process(location, sport_type, team_name, db_host, db_port, db, user, password):
	schedule_manager = ScheduleManager(db_host, int(db_port), db,  user, password)
	master = TeamMasterManager(db_host, int(db_port), db, user, password)
	teamdata_manager = TeamDataManager(location, master)
	proddata_manager = ProductionDataManager(user='backend',password='hijNuMDtcoxb3lBL')
	team_code = master.get_team_code_from_master(team_name)	
	sorted_dirs = teamdata_manager.get_sorted_by_year_folders()
	schedule = {}
	for folder in sorted_dirs:
		schedule_info_file = teamdata_manager.get_schedule(folder)
		schedule_info = schedule_manager.get_schedule_data_with_season(sport_type, team_code, folder)
		pre_schedule_info = teamdata_manager.get_schedule_pre_processed(folder)
		prod_schedule_info = proddata_manager.get_available_game_schedule(sport_type, team_code, folder)
		schedule = set_schedule_info(schedule, schedule_info, master)
		schedule = merge_schedule_info(schedule, schedule_info_file, 'school')
		schedule = merge_schedule_info(schedule, pre_schedule_info, 'preprocess')
		schedule = merge_schedule_info(schedule, prod_schedule_info, 'prod')
	print_schedule(schedule)


def print_schedule(schedule):
	for key, schedule_data in schedule.iteritems():
		print schedule_data['date'] + ", " + schedule_data['teamName'] + ", " + schedule_data['oppoTeamName'] + ", " + schedule_data['schedule'] + ", " + schedule_data['school'] + ", " + schedule_data['preprocess'] + ", " + schedule_data['prod'] + ", " + str(key)
                    
def set_schedule_info(schedule, schedule_info, master):
	
	for s in schedule_info:
		#print s['gameDate']
		s['teamCode'] = team_code = master.get_team_code_from_master(s['teamName'])	
		s['oppoTeamCode'] = team_code = master.get_team_code_from_master(s['oppoTeamName'])	
		s['gameDate'] = format_date(s['gameDate'])
		key = str(s['teamCode'] + "_" + s['oppoTeamCode'] + "_" + s['gameDate'])
		alt_key = str(s['oppoTeamCode'] + "_" + s['teamCode'] + "_" + s['gameDate'])
		if key in schedule or alt_key in schedule:
			continue
		schedule[key] = {'schedule': 'Available', 'teamCode': s['teamCode'], 'oppoTeamCode': s['oppoTeamCode'], 'teamName': s['teamName'], 'oppoTeamName': s['oppoTeamName'], 'date': s['gameDate'], 'school': 'Not Available', 'preprocess': 'Not Available', 'prod': 'Not Available'}
	return schedule

def format_date(input_date):
	return datetime.strptime(input_date, '%m/%d/%Y').strftime('%m/%d/%Y')

def merge_schedule_info(schedule, schedule_info, stage):	
	for s in schedule_info:
		s['date'] = format_date(str(s['date']))
		key = s['homeCode'] + "_" + s['visitorCode'] + "_" + str(s['date'])
		alt_key = s['visitorCode'] + "_" + s['homeCode'] + "_" + str(s['date'])
		if key in schedule and schedule[key][stage] != 'Not Available':
			print "Duplicate file found " + s['file']
			continue
		if alt_key in schedule and schedule[alt_key][stage] != 'Not Available':
			print "Duplicate file found " + s['file']
			continue

		if key not in schedule and alt_key not in schedule:
			schedule[key] = {'schedule': 'Not Available', 'teamCode': s['homeCode'], 'oppoTeamCode': s['visitorCode'], 'teamName': s['home'], 'oppoTeamName': s['visitor'], 'date': str(s['date']), 'school': 'Not Available', 'preprocess': 'Not Available', 'prod': 'Not Available'}

		available_key = key if key in schedule else alt_key
		schedule[available_key][stage]= str(s['file'])

	return schedule


def help():
	print "missing_xml -s <sport_code> -t <team name> -l <location of the football file> "


'''
	Main method for the util.
'''
def main(argv):
    db_host = "18.191.170.18"
    db_port = 27017
    db = "athlyte_shared"
    sport_type = ""
    team_name = ""
    location = ""
    db_user = "athlytesuser"
    db_password = "Eb!$a8#V4PsD"    
    try:
      opts, args = getopt.getopt(argv,"hs:t:l:m:p:d:",["sport=","team=","location=","dbhost=","port=","database="])      
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)        
    for opt, arg in opts:        
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-s', "--sport"):
            sport_type = arg
        elif opt in ('-t', "--team"):
            team_name = arg
        elif opt in ('-l', "--location"):
        	location = arg
        elif opt in ('-m', "--dbhost"):
            db_host = arg
        elif opt in ('-p',"--port"):
            db_port = arg        
        elif opt in ('-d',"--database"):
            db = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)
   
    process(location, sport_type, team_name, db_host, db_port, db, db_user, db_password)



if __name__ == "__main__":
    main(sys.argv[1:])