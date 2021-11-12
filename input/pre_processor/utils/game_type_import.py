import os
import sys
import getopt
import csv
import re
from datetime import datetime
from pymongo import MongoClient



sys.path.append("../common")  
from schedule_manager import ScheduleManager
from teammaster_manager import TeamMasterManager


check_year=re.compile("^---[0-9][0-9][0-9][0-9]$")
ignore_list = ["Navy","Army"]


def process_championship(sport_code, game_type_file, db_host, db_port, db):

    
    schedule_manager = ScheduleManager(mongo_host=db_host, port=db_port, database=db)
    with open(game_type_file, mode='r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_number = 0
        for line in csv_reader:
            years = line[0]
            season = int(line[1])
            game_type_array = [line[2].strip(), line[3].strip()]
            if len(line[4].strip()) > 0:
                game_type_array.append(line[4].strip())

            game_type_array.append("Post Season")
            game_date = datetime.strptime(line[5].strip(), '%d/%m/%Y')
            team_name = line[6].strip()  # Team 1
            team_code = line[7].strip()  # Team 1 Code
            oppo_team_name = line[8].strip()  # Team 2
            oppo_team_code = line[9].strip()  # Team 2 Code
            if team_code.isdigit() and oppo_team_code.isdigit():
                schedule_manager.update_game_type(sport_code, team_code, team_name, 0, oppo_team_code, oppo_team_name, 0, game_date, season, game_type_array)
                print str(season) + " " + str(game_date) + " " + ",".join(game_type_array) + " " + team_name + " " + oppo_team_name 
            #game_type = GameTypes(years, season, game_type_array, game_date, team_name, team_code,
                                  #oppo_team_name, oppo_team_code)
            #gt_mapping_list.append(game_type)

    return 


def process(sport_code, filename, db_host, db_port, db):
	season = 0
	team_master = TeamMasterManager(mongo_host=db_host, port=db_port, database=db)
	schedule_manager = ScheduleManager(mongo_host=db_host, port=db_port, database=db)
	with open(filename) as tsv:
		for line in csv.reader(tsv, dialect="excel-tab"): 
			if not line:
				continue
			trim_line = line[0].strip()
			if check_year.match(trim_line) :
				trim_line = trim_line[3:]
				season = int(trim_line)
				continue
			if trim_line == "Date":
				continue
			game_date, bowl, winner, winner_code, loser, loser_code = [None]*6
			if " PM" in line[1] or " AM" in line[1] or not line[1].strip():
				(game_date, bowl, winner, winner_code, winner_pts, loser, loser_code, loser_pts) = process_line2(line, team_master)
			else:
				(game_date, bowl, winner, winner_code, winner_pts, loser, loser_code, loser_pts) = process_line(line, team_master)

			if not game_date: 
				continue

			#This is hardcoded we need to think better if we have to reuse this
			game_type_array = ["Post Season", "Bowl"]
			game_type_array.append(bowl)
			schedule_manager.update_game_type(sport_code, winner_code, winner, winner_pts, loser_code, loser, loser_pts, game_date, season, game_type_array)
			print str(season) + " " + str(game_date) + " " + bowl + " " + winner + " " + loser 


def process_line(line, team_master):
	game_date = datetime.strptime(line[0],"%Y-%m-%d")
	bowl = line[1].strip()
	winner = line[2].strip()
	if winner in ignore_list:
		return (None, None, None, None, None, None, None, None)
	winner_code = team_master.get_team_code_from_master(winner)
	winner_pts = line[3].strip()
	loser = line[4].strip()
	if loser in ignore_list:
		return (None, None, None, None, None, None, None, None)
	loser_code = team_master.get_team_code_from_master(loser)
	loser_pts = line[5].strip()

	return (game_date, bowl, winner, winner_code, winner_pts, loser, loser_code, loser_pts)

def process_line2(line, team_master):
	game_date = datetime.strptime(line[0],"%Y-%m-%d")
	bowl = line[2].strip()
	winner = line[3].strip()
	if winner in ignore_list:
		return (None, None, None, None, None, None, None, None)
	winner_code = team_master.get_team_code_from_master(winner)
	winner_pts = line[4].strip()
	loser = line[5].strip()
	if loser in ignore_list:
		return (None, None, None, None, None, None, None, None)
	loser_code = team_master.get_team_code_from_master(loser)
	loser_pts = line[6].strip()

	return (game_date, bowl, winner, winner_code, winner_pts, loser, loser_code, loser_pts)
       


def help():
    print 'game_type_import.py -f <tab seperated bowl file> -t <sportcode> [Optional params] -d <database> -p <port> -m <database machine name/ip>'
    print 'game_type_import.py -c <comma seperated championship file> -t <sportcode> [Optional params] -d <database> -p <port> -m <database machine name/ip>'

def main(argv):
    db_host = "localhost"
    db_port = 27017
    db = "athlyte"
    sport_code = ""
    file_type = None
    try:
      opts, args = getopt.getopt(argv,"hm:p:d:f:c:t:",["dbhost=","port=","database=","file=", "champ_file=" "sport_code="])      
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)        
    for opt, arg in opts:        
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-m', "--dbhost"):
            db_host = arg
        elif opt in ('-p',"--port"):
            db_port = arg        
        elif opt in ('-d',"--database"):
            db = arg
        elif opt in ('-f',"--file"):
        	file_type = "bowl"
            	file = arg
        elif opt in ('-c',"--champ_file"):
        	file_type = "championship"
            	file = arg
        elif opt in ('-t',"--sport_code"):
        	sport_code = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)
   
    if file_type and file_type == "bowl":
    	process(sport_code, file, db_host, db_port, db)

    if file_type and file_type == "championship":
    	process_championship(sport_code, file, db_host, db_port, db)



if __name__ == "__main__":
    main(sys.argv[1:])

