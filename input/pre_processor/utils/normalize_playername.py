import os
import sys
import getopt
from pymongo import MongoClient
import re
import time

sys.path.append("../common")  
from name_normalizer import NameNormalizer

db_host = "localhost"
db_port = 27017
db = "athlyte"
collection_roster = "ActiveRoster"


class PlayerNameProcessor:
    def __init__(self, mongo_host="localhost", port=27017, database="athlyte", collection="Rosters"):        
        self.mongo_host = mongo_host
        self.mongo_port = port
        self.database = database
        self.collection =collection
        self.active_roster_collection = "ActiveRoster"
        self.client = None
        self.name_pattern = re.compile('[\W_]+')
        

    def _get_client(self):
        if self.client == None:
            self.client = MongoClient(self.mongo_host, self.mongo_port)
        return self.client.athlyte    

    def _update_names(self, id, check_name, normalized_name):
        db = self._get_client()
        result = db[self.collection].find_and_modify({"_id": id}, {"$set": {"normalizedName": normalized_name, "checkName": check_name}})

    def process(self):
        db_connection= self._get_client()
        name_normalizer = NameNormalizer()
    	for player in db_connection[self.collection].find({"checkName": {"$exists": False}}):
            try:
                player_name = player["playerName"]
                clean_name, check_name = name_normalizer.normalize_name(player_name)
                if clean_name == None and check_name == None:
                    continue
                print "Clean Name: " + clean_name + " , " + "CheckName: " + check_name
                #time.sleep(0.1)
                self._update_names(player["_id"],check_name, clean_name)                
            except ValueError as e:
                print(e)
    			

def main(argv):
    db_host = "localhost"
    db_port = 27017
    db = "athlyte"
    collection_roster = "ActiveRoster"
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

    player_name_processor = PlayerNameProcessor(db_host, db_port, db)
    player_name_processor.process()



if __name__ == "__main__":
    main(sys.argv[1:])

