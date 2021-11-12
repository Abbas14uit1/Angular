import os
import sys
import getopt
from pymongo import MongoClient

sys.path.append("../common")  
from schedule_manager import ScheduleManager
from teammaster_manager import TeamMasterManager


def process(db_host, db_port, db):
	schedule = ScheduleManager(db_host, int(db_port), db)
	master = TeamMasterManager(db_host, int(db_port), db)
	teams = schedule.find_missing_team_code()
	for team in teams:
		try:
			team_code = master.get_team_code_from_master(team['teamName'])
			opponent_code = master.get_team_code_from_master(team['oppoTeamName'])
			schedule.update_team_code(team['_id'], team_code, opponent_code)
		except ValueError as e:
			#print(e)
			possible_team_code = str(schedule.get_team_code(team['oppoTeamName']))
			if possible_team_code == "N/A":
				print "missing team " + team['oppoTeamName']				
			else:
				print "missing team code " + possible_team_code +" added" 

def main(argv):
    db_host = "localhost"
    db_port = 27017
    db = "athlyte"
    try:
      opts, args = getopt.getopt(argv,"hm:p:d:",["dbhost=","port=","database="])      
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
        else:
            print "Error invalid options"
            help()
            sys.exit(2)
   
    process(db_host, db_port, db)



if __name__ == "__main__":
    main(sys.argv[1:])

