import os
import sys
import getopt
import csv
import re
from datetime import datetime
from pymongo import MongoClient


sys.path.append("../common")  
from proddata_manager import ProductionDataManager


def process(gameid, db_host, db_port, db):
	proddata_manager = ProductionDataManager(user='backend',password='hijNuMDtcoxb3lBL')
	proddata_manager.delete_game(gameid)


def help():
    print 'delete_game.py -g <game id> -t [Optional params] -d <database> -p <port> -m <database machine name/ip>'
    

def main(argv):
    db_host = "localhost"
    db_port = 27017
    db = "athlyte"
    gameid = None
    try:
      opts, args = getopt.getopt(argv,"h:g:m:p:d",["help=", "gameid=", "dbhost=","port=","database="])      
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
        elif opt in ('-g',"--gameid"):
        	gameid = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)

    process(gameid, db_host, db_port, db)


if __name__ == "__main__":
    main(sys.argv[1:])