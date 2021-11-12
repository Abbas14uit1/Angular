import os
from pymongo import MongoClient
import sys
import getopt

def process(gameid,sport_code):

	client = MongoClient('ec2-52-15-134-248.us-east-2.compute.amazonaws.com', 27017,username='backend', password='hijNuMDtcoxb3lBL', authSource='testing_mongo', authMechanism='SCRAM-SHA-1')
	db = client.testing_mongo 
	gameids=[]

	if sport_code is not None :
		print "Attempting to remove all game for " + sport_code
		gameids = db.games.aggregate([{"$match": {"sportCode": sport_code}}, {"$project": {"_id":1}}])

	if gameid is not None :
		print "Attempting to remove a game for " + gameid
		gameids = db.games.aggregate([{"$match": {"_id": gameid}}, {"$project": {"_id":1}}])		
	count =0
	for gameid in gameids:
		count +=1
		print "Found " + gameid['_id'] + " count " + str(count)
		db.teams.update({}, { "$pull": { "games": { "gameId": gameid['_id'] } } }, multi=True)
		db.players.update({}, { "$pull": { "games": { "gameId": gameid['_id']} } }, multi=True)		
		db.plays.delete_many({ "gameId": gameid['_id'] })
		db.games.delete_many({ "_id": gameid['_id'] })
	
	if count is 0:
		print "No records found"


def help():
    print 'delete_db.py -t <sportcode>  -- deletes all the games for the given sports'
    print 'delete_db.py -g <game_id>  -- deletes a specific game'

def main(argv):
    gameid = None
    input_ok = False
    sport_code = None
    try:
      opts, args = getopt.getopt(argv,"hg:t:",["game_id=","sportcode="])      
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)        
    for opt, arg in opts:        
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        if opt in ('-g', "--game_id"):
            gameid = arg
            input_ok = True
        if opt in ('-t',"--sportcode"):
            sport_code = arg
            input_ok = True
    if input_ok is not True:
    	print "Error invalid options"
    	help()
    	sys.exit(2)
    
    #Hard coded to football
    process(gameid,sport_code)


if __name__ == "__main__":
    main(sys.argv[1:])
    
