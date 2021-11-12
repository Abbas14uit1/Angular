from pymongo import MongoClient
from ast import literal_eval
from os import environ
import os
import re
import json
import logging
import uuid
import pprint
from bson import regex
from bson.json_util import dumps

from name_normalizer import NameNormalizer

class RosterManager:
    "This is a RosterManager class to mangage the active roster data. It references the Rosters collection when in doubt"

    # TODO: we need to implement the logic to update team master as well.


    def __init__(self, mongo_host="localhost", port=27017, database="athlyte", roster_collection="Rosters", silent_mode = False):
        self.logger= logging.getLogger(__name__)
        self.mongo_host = mongo_host
        self.mongo_port = port
        self.database = database
        self.collection = roster_collection
        self.active_roster_collection = "ActiveRoster"
        self.player_class_array = ['FR', 'SO', 'JR', 'SR']
        self.first_import = False
        self.unconfirmed_player_list_serial = 0
        self.unconfirmed_player_list = []
        self.silent_mode = silent_mode
        

    def _get_client(self):
        client = MongoClient(self.mongo_host, self.mongo_port)
        return client.athlyte

    def _is_he_available_in_previous_season(self, sport_code, team_code, player_name, game_date, season, player_class, jersey_number = None):
        previous_season = int(season) - 1
        db = self._get_client()
        uid = uuid.uuid4()
        
        query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(previous_season)}, {"playerName": player_name} ]}
        result = db[self.active_roster_collection].find_one(query)
        if result is None:
            return self._ask_and_upsert_player(sport_code, team_code, player_name, game_date, season, player_class, "First", jersey_number)

            #raise ValueError("Player not found in the active roster ")
        self.logger.info("Yes found " + player_name)
        current_player_index = self._get_player_class_index(player_class)
        
        uid = result["playerId"]
        if current_player_index == 0:
            if player_class == self.player_class_array[0] and result['playerClass'] == player_class:
                #ask the analyst if the player is redshirted in his FR year. If redshirted then assume this is the player.
                return self._ask_and_upsert_player(sport_code, team_code, player_name, game_date, season, player_class, "Redshirted", jersey_number, result["playerId"])
                
            return self._ask_and_upsert_player(sport_code, team_code, player_name, game_date, season, player_class, "First", jersey_number)

        if result['playerClass'] == self.player_class_array[current_player_index-1]:
            #The current player class is one less for the previous year so we found a exact match.

            return result

        if result['playerClass'] == player_class and result['redshirtedSeason'] == 0:
            #current and previous class is same and the player has not been redshirted then
            #   redshirt the player and return the result
            return self._ask_and_upsert_player(sport_code, team_code, player_name, game_date, season, player_class, "Redshirted", jersey_number, result["playerId"])
            

        #now there is nothing we could do to match so assume its a new player.
        self.logger.info ("Player with " + player_class + " not able to match exact in active roster")
        return self._ask_and_upsert_player(sport_code, team_code, player_name, game_date, season, player_class, "Redshirted", jersey_number, result["playerId"])

        
    def _get_player_class_index(self, player_class):
        counter = -1
        for p_class in self.player_class_array:
            counter +=1
            if p_class == player_class:
                return counter
        if player_class:
            raise ValueError("Invalid player class " + player_class)
        else:
            raise ValueError("Invalid player class " )


    def _update_player(self, uid, player_name, season, player_class, redshirted_season = 0 ):
        db=self._get_client()
        player = db[self.active_roster_collection].find_one({"playerId": str(uid), "season": int(season)})
        #First insert the player for the current season.
        if player is None:
            player = db[self.active_roster_collection].find_one({"playerId": str(uid)})
            player_list = player["playerName"] + list(set([player_name])-set(player["playerName"]))
            player_season = {"sportCode": player["sportCode"], "playerId": str(uid), "teamCode": player["teamCode"], "season": int(season), "playerName": player_list, "playerClass": player_class, "jerseyNumber": player["jerseyNumber"], "redshirted": False, "redshirtedSeason": 0} 
            db[self.active_roster_collection].insert_one(player_season)

            #self._insert_player(player["sportCode"], player["teamCode"], player_name, season, player_class, ,player["playerId"])
        
        if redshirted_season > 0 :
            self.logger.info( "Player redshirted let us modify the DB " + str(uid))
            db[self.active_roster_collection].update({"playerId": str(uid)},{"$set":{"redshirted": True, "redshirtedSeason": int(redshirted_season)}}, multi = True)
        result = db[self.active_roster_collection].find_one({"playerId": str(uid), "season": int(season)})
        return result

        

    # def _update_player(self, id, player_name, season, redshirted_season = 0 ):
    #     db=self._get_client()
    #     player = db[self.active_roster_collection].find_one({"_id": id})

    #     if redshirted_season > 0 :
    #         return db[self.active_roster_collection].find_and_modify({"_id": id},{"$addToSet":{"playerName": player_name, "season": season}, "$set":{"redshirted": True, "redshirtedSeason": redshirted_season}})

    #     return db[self.active_roster_collection].find_and_modify({"_id": id},{"$addToSet":{"playerName": player_name, "season": season}})


    def _insert_player(self, sport_code, team_code, player_name, season, player_class, uid, jersey_number = None ):
        db=self._get_client()
        player = {"sportCode": sport_code, "teamCode": str(team_code), "playerId": str(uid), "season": int(season), "playerName": [player_name], "playerClass": player_class, "jerseyNumber": jersey_number, "redshirted": False, "redshirtedSeason": 0} 
        #pprint.pprint(player, width = 1)
        result = db[self.active_roster_collection].insert_one(player)
        return db[self.active_roster_collection].find_one({"_id":result.inserted_id})

    def _ask_and_upsert_player(self, sport_code, team_code, player_name, game_date, season, player_class, reason_code, jersey_number = None, uid = None):
        
        if reason_code == "Redshirted":
            redshirted_y_n = 'Y' #raw_input("Is the player " + player_name + " redshirted for the season " + str(season -1) + " ? [Y/N] :" )
            if redshirted_y_n == 'Y' or redshirted_y_n == 'y':
                return self._update_player(uid, player_name, season, player_class, season -1)
            #if not redshirted then continue the questions for First reason code
            #uid = None
            #reason_code = "First"

        if reason_code == "First":
            while True:
                if uid is None: 
                    print "Unable to find a matching player " + player_name + " in team " + team_code
                    insert_y_n = raw_input("Do you want to add the player as a new player [Y/N] :")
                    if insert_y_n == 'Y'or insert_y_n == 'y' :
                        uid = str(uuid.uuid4())
                        return self._insert_player(sport_code, team_code, player_name, season, player_class, uid, jersey_number )
                    uid = raw_input("Please provide the UID of a existing player to map : ")
                db = self._get_client()
                result = db[self.active_roster_collection].find_one({"playerId": str(uid)})

                if result is None:
                    print "I am sorry, I am unable to find the player please try again"
                    uid = None
                    continue;
                self.logger.info("Found player " + result["playerId"])
                self._update_player(uid, player_name, season, result["playerClass"])
                return result

    def _get_player_class(self, sport_code, team_code, player_name, game_date, season):
        try:
            playerInActiveRoster = self.get_player_from_active_roster(sport_code, team_code, player_name, game_date, season)
            for player in playerInActiveRoster:
                #TODO: What should we do if we get two players
                return player["playerClass"]            
        except:
            self.logger.warning("Player " + player_name + " not found in the active roster for team " + str(team_code) + " game_date " + str(game_date))

        self.logger.warning("Player " + player_name + " attempt to find in master " + str(team_code) + " game_date " + str(game_date))
        try:
            playerInMasterRoster=self.get_player(sport_code, team_code, player_name, game_date, season)
            for played_season in playerInMasterRoster["playerPlayedDetails"]:
                if played_season['season'] == season:
                        return str(played_season["collegeYear"])
        except:
            self.logger.info("Player " + player_name + " not found in the master for team " + str(team_code) + " game_date " + str(game_date))
        
        self.logger.info("Player " + player_name + " not found in the master for team " + str(team_code) + " game_date " + str(game_date))
        return None


    #This will setup the team so we can decide to import the roster
    def setup_roster_for_team(self,sport_code, team_code):
        db=self._get_client()
        query = {"$and": [{"sportCode": sport_code}, {"teamCode":team_code}]}
        result = db[self.active_roster_collection].find_one(query)
        if result is None:
            self.first_import = True
        else:
            self.first_import = False


    #Attempts to match the player in the scrapped content
    def get_player(self, sport_code, team_code, player_name, game_date, jersey_number = None ):
        db=self._get_client()        
        query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"playerName": player_name}, {"rosterGamesDetails.gameDate": str(game_date.strftime("%m/%d/%Y"))} ]}
        result = db[self.collection].find_one(query)
        if result is None:
            self.logger.warning("Player " + player_name + " match " + lastname + " jersey number " + str(jersey_number) + " played in team " + str(team_code) + " not found in roster for game date " + str(game_date.strftime("%m/%d/%Y")))
            raise ValueError("Player not found in the roster ")

        return result

    def get_player_from_active_roster(self, sport_code, team_code, player_name, game_date, season, jersey_number = None):
        db=self._get_client()        
        player_list = []
        query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"playerName": player_name}, {"season": int(season)} ]}
        print str(query)
        result = db[self.active_roster_collection].find(query)
        for player in result:
            player_list.append(player)
        if len(player_list) == 0   :
            self.logger.warning("Player " + player_name + "  jersey number " + str(jersey_number) + " played in team " + str(team_code) + " not found in active roster for season " + str(season))
            raise ValueError("Player not found in the roster ")        
        return player_list        




    def get_player_from_rosters(self, sport_code, team_code, player_name, game_date, season, player_class, jersey_number = None):
        db=self._get_client()
        normalizer = NameNormalizer()
        (normalized_name, check_name) = normalizer.normalize_name(player_name)
        if check_name is None:
            return
        self.logger.info("Processing player " + check_name + " for played date " + str(game_date) + " season " + str(season))
        if player_class == "" or player_class is None:
            self.logger.warning(" Attempting to search for player class for " + check_name )
            player_class = self._get_player_class(sport_code, team_code, check_name, game_date, season)

        
        while True:
            if player_class is None:
                #Its ok to have player class empty if the active roster says so (the _get_player_class takes care of this). 
                player_class = ""
                break
            if player_class.upper() not in ["FR", "SO", "JR", "SR"]:

                player_class = raw_input("Please enter the player Class for " + check_name + " played in " + team_code + " on " + str(game_date) + " :")
                if player_class in self.player_class_array:
                    break
                else:
                    print "Allowed Player class [FR, SO, JR, SR]"
                    player_class = "K" #Just set to invalid player class
            else:
                break

        if self.first_import is True:
            uid = uuid.uuid4()
            return self._insert_player(sport_code, team_code, check_name, season, player_class, str(uid))

        player_class = player_class.upper()
        query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(season)}, {"playerName": check_name}, {"playerClass": player_class} ]}
        #pprint.pprint(query, width = 1)       
        result = db[self.active_roster_collection].find_one(query)
        if result is not None:
            return result
        query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(season)}, {"playerName": check_name} ]}
        result = db[self.active_roster_collection].find_one(query)
        if result is not None:
            return result
        self.logger.info("Let us check in previous season. current season: " + str(season) + " player " + check_name + " class " + player_class)
        return self._is_he_available_in_previous_season(sport_code, team_code, check_name, game_date, season, player_class)



class StageRoster:
    VERIFIED = "Verified"
    UNVERIFIED = "UnVerified"
    MANUAL_CATEGORY = "Manually Verified"
    MASTER_CATEGORY = "Master Verified"
    ACTIVE_CATEFOGY = "Active Verified"
    UNVERIFIED_CATEGORY = "Unverified"

    def __init__(self, mongo_host="localhost", port=27017, database="athlyte"):
        self.logger= logging.getLogger(__name__)
        self.mongo_host = mongo_host
        self.mongo_port = port
        self.database = database
        self.collection = "StageActiveRoster"
        self.active_roster_collection = "ActiveRoster"
        self.master_roster = "Rosters"
        self.player_class_array = ['FR', 'SO', 'JR', 'SR']
        self.client = None
        
    
    def _get_client(self):
        if self.client == None:
            self.client = MongoClient(self.mongo_host, self.mongo_port)
        return self.client.athlyte 


    def _get_player_class_index(self, player_class):
        counter = -1
        for p_class in self.player_class_array:
            counter +=1
            if p_class == player_class:
                return counter
        if player_class:
            raise ValueError("Invalid player class " + player_class)
        else:
            raise ValueError("Invalid player class " )


    def _player_exits(self, sport_code, player_name, team_code, player_class, season):
        player_list = []
        
        if player_class == "" or player_class == None:
            query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(season)}, {"playerName": player_name} ]}
        else:
            query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(season)}, {"playerName": player_name}, {"playerClass": player_class.upper()} ]}
        db = self._get_client()
        players = db[self.collection].find(query)
        for player in players:
            player_list.append(player)
        
        return player_list 

    def _player_exists_active_roster(self, sport_code, player_name, team_code, player_class, last_season):
        player_list = []

        self.logger.info("search in active " + player_name + " team_code " + team_code + " player_class " + str(player_class) + " season " + str(last_season))
        if player_class == "" or player_class == None:
            query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(last_season)}, {"playerName": player_name} ]}
        else:
            query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"season": int(last_season)}, {"playerName": player_name}, {"playerClass": player_class.upper()} ]}
        db = self._get_client()
        players = db[self.active_roster_collection].find(query)
        for player in players:
            player_list.append(player)

        self.logger.info("Search for " + player_name + " in the active roster resulted in  " + dumps(player_list))
        return player_list 


    def _player_exists_master_roster(self, sport_code, player_name, team_code, game_date, season, uni, code):
        player_list = []
        #print "FIX THIS BUG"
        #season = int(season) + 1
        name_match = regex.Regex(player_name)

        query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"checkName": name_match}, {"playerPlayedDetails.season": int(season)} ]}
        if game_date is not None:
            query = {"$and":[ {"sportCode": sport_code}, {"teamCode": str(team_code)}, {"checkName": name_match}, {"rosterGamesDetails.gameDate": str(game_date.strftime("%m/%d/%Y"))} ]} 
        
        db=self._get_client() 
        players = db[self.master_roster].find(query,{"playerPlayedDetails": {"$elemMatch":{"season": int(season)}}})        
        for player in players:
            
            if (code != "" or code != 0 and code == player["playerPlayedDetails"][0]["jerseyNumber"] ) or (uni != "" or uni !=0 and uni == player["playerPlayedDetails"][0]["jerseyNumber"]):
                player["season"] = player["playerPlayedDetails"][0]["season"]
                player["playerClass"] = player["playerPlayedDetails"][0]["collegeYear"]
                player_list.append(player)

        return player_list        

    def _insert_player(self, sport_code, team_code, player_name, player_class, uni, code, season, finger_print, dnp ):
        db=self._get_client()
        uid = uuid.uuid4()
        player = {"sportCode": sport_code, "teamCode": str(team_code), "playerId": str(uid), "season": int(season), "playerName": [player_name], "playerClass": player_class, "uni": uni, "code": code, "fingerPrint": str(finger_print), "played": dnp, "status": StageRoster.UNVERIFIED, "statusCateogy": StageRoster.UNVERIFIED_CATEGORY} 
        result = db[self.collection].insert_one(player)
        self.logger.info("Inserted the new player to stage roster " + player_name)
        return db[self.collection].find_one({"_id":result.inserted_id})


    def _is_player_staged(self, sport_code, team_code, player_name, player_class, uni, code, game_date, season):
       
        stage_player_list = self._player_exits(sport_code, player_name, team_code, player_class, season)
        return self._identify_the_best_matching_player(stage_player_list, uni, code, None)

    #TODO: Add the finger print to search for offence and defence
    def _identify_the_best_matching_player(self, player_list, uni, code, finger_print ):

        if len(player_list) == 0:
            return None

        for player in player_list:
            if "code" in player and player["code"] == code :
                return player 
            if "uni" in player and player["uni"] == uni:
                return player

        return None


    def _update_staged_player_class(self, uid, player_class):
        db=self._get_client()
        db[self.collection].update({"playerId": str(uid)},{"$set":{"playerClass": player_class.upper()}})
        

    def _update_staged_player(self, uid, player_class, uni, code, finger_print, dnp):
        db=self._get_client()
        player_class = player_class 
        if player_class == "" or player_class == None or player_class == "N/A":
            player_class = ""
        else:
            player_class = player_class.upper()

        if dnp == False:
            db[self.collection].update({"playerId": str(uid)},{"$set":{"playerClass": player_class, "uni": uni, "code": code, "fingerPrint": str(finger_print), "played": True}})
        else:
            db[self.collection].update({"playerId": str(uid)},{"$set":{"playerClass": player_class, "uni": uni, "code": code, "fingerPrint": str(finger_print)}})

    def _update_staged_player_status(self, uid, status, statusCateogy):
        db = self._get_client()
        db[self.collection].update({"$and":[{"playerId": str(uid)}, {"verification_status": {"$ne": StageRoster.VERIFIED}} ]},{"$set":{ "status": status, "statusCateogy": statusCateogy}})

    
    def _update_active_roster_mapping(self, staged_player, active_player_id ):
        db = self._get_client()
        db[self.collection].update({"playerId": str(staged_player["playerId"])},{ "$addToSet":{ "activeCollectionId": active_player_id}})


    def update_player(self, sport_code, team_code, player_name, player_class, uni, code, game_date, season, finger_print, dnp = False):
        if player_name is None or player_name == "" or player_name.upper() == "TEAM" or player_name.upper() == "TM":
            return
        normalizer = NameNormalizer()
        (normalized_name, check_name) = normalizer.normalize_name(player_name)
        self.logger.info("Mapping started for " + check_name)
        player = self._is_player_staged(sport_code, team_code, check_name, player_class, uni, code, game_date, season)
        if player != None:
            self.logger.info( check_name + " player found to be staged ")
            if player_class is not None and player_class is not "":
                player["playerClass"] = player_class.upper()

            if code is not None and code is not "":
                player["code"]= code

            if uni is not None and uni is not "":
                player["uni"] = uni
            self._update_staged_player(player["playerId"], player["playerClass"], player["uni"], player["code"], finger_print, dnp)
            master_playerlist = self._match_player_from_master(sport_code, player, game_date,uni, code)
            active_playerlist = self._player_exists_active_roster(sport_code, check_name, team_code, player_class, season)
            if active_playerlist is None or len(active_playerlist) == 0:
                self.logger.info("Player " +  check_name  + " not found in active roster ")
                self.logger.info("Search started for " +  check_name  + " in last year active roster ")
                active_playerlist = self._match_last_year_active(sport_code, player)
            else:
                self._complete_active_stage_mapping(active_playerlist, player)
            
        else:
            player = self._insert_player(sport_code, team_code, check_name, player_class, uni, code, season, finger_print, dnp)
            self._match_player_from_master(sport_code, player, game_date, uni, code)
            active_playerlist = self._player_exists_active_roster(sport_code, check_name, team_code, player_class, season)
            if active_playerlist is None or len(active_playerlist) == 0:
                self.logger.info("Player " +  check_name  + " not found in active roster ")
                self.logger.info("Search started for " +  check_name  + " in last year active roster ")
                active_playerlist = self._match_last_year_active(sport_code, player)
            else:
                self._complete_active_stage_mapping(active_playerlist, player)



    # Ignore scoring, interception (ir), kick returns, fumbles, ko, 
    # Special - Kr
    def _construct_player_finger_print(self, rcv, rush, passing, defense, fg, pat, punt, pr, fr, kr, dnp):
        finger_print = ""
        finger_print = self._construct_finger_print(rcv, finger_print)
        finger_print = self._construct_finger_print(rush, finger_print)
        finger_print = self._construct_finger_print(passing, finger_print)
        finger_print = self._construct_finger_print(defense, finger_print)
        finger_print = self._construct_finger_print(fg, finger_print)
        finger_print = self._construct_finger_print(pat, finger_print)
        finger_print = self._construct_finger_print(punt, finger_print)
        finger_print = self._construct_finger_print(pr, finger_print)
        finger_print = self._construct_finger_print(fr, finger_print)
        finger_print = self._construct_finger_print(kr, finger_print)
        #Not required to fingerprint the dnp
        #finger_print = self._construct_finger_print(dnp, finger_print)
        return finger_print
        

    def get_player_finger_print(self, player_element, dnp_player=False):
        finger_print = ""
        rcv, rush, passing, defense, fg, pat, punt, pr, fr, kr, dnp= ("0",)*11
        if not "team"==player_element.attrib['name'].lower():
            if self._element_exists("rcv", player_element):
                rcv = "1"
            if self._element_exists("rush", player_element):
                rush = "1"
            if self._element_exists("passing", player_element):
                passing = "1"
            if self._element_exists("defense", player_element):
                defense = "1"
            if self._element_exists("fg", player_element):
                fg = "1"
            if self._element_exists("pat", player_element):
                pat = "1"
            if self._element_exists("punt", player_element):
                punt = "1"
            if self._element_exists("pr", player_element):
                pr = "1"
            if self._element_exists("fr", player_element):
                fr = "1"
            if self._element_exists("kr", player_element):
                kr = "1"
            if dnp_player == True:
                dnp = "1"
            finger_print = self._construct_player_finger_print(rcv, rush, passing, defense, fg, pat, punt, pr, fr, kr, dnp)
            #print "player " + player_element.attrib["checkname"] + "finger_print " + finger_print
            return finger_print


    def _element_exists(self, element_name, player):
        element = player.find(element_name)
        if element is None or len(element.attrib.items()) == 0:
            return False
        return True


    def _construct_finger_print(self, data, finger_print):        
        if data is None or data is "0":
            finger_print += "0"
        else:
            finger_print += "1"
        return finger_print


    def get_all_staged_unverified(self):
        db=self._get_client()
        player_list = []
        cursor = db[self.collection].find({"status": {"$ne": StageRoster.VERIFIED}})
        for player in cursor:
            player_list.append(player)
        return player_list

    def get_all_staged_missing(self):
        db=self._get_client()
        player_list = []
        cursor = db[self.collection].find({"status": {"$ne": StageRoster.VERIFIED}, "playerClass": "", "playerClass": None})
        for player in cursor:
            player_list.append(player)
        return player_list
        

    def _match_player_from_master(self, sport_code, player, game_date, code, uni):
        player_list = self._player_exists_master_roster(sport_code, player["playerName"][0], player["teamCode"], game_date, player["season"], code, uni)
        if(len(player_list) == 1):
            self.logger.info("Found a match in master for " + player["playerName"][0])
            playerClass = player_list[0]["playerClass"]
            #Some times the player class in the Master is N/A
            if playerClass.upper() not in self.player_class_array:
                self.logger.warning("The player class in the master for " + player["playerName"][0] + " season " + str(player["season"])  + " is not matching the valid class " + playerClass)
                playerClass = player["playerClass"] 
            self._update_staged_player(player["playerId"], playerClass, player["uni"], player["code"], player["fingerPrint"], player["played"])
            self._update_staged_player_status(player["playerId"], StageRoster.VERIFIED, StageRoster.MASTER_CATEGORY )
        elif len(player_list) == 0:
            self.logger.info(player["playerName"][0] + " not found in master")
            return
        else:
                #found multiple player let us try and match the best.
                self.logger.info("Found multiple player match in master for " + player["playerName"][0])
                matched_player = self._identify_the_best_matching_player(player_list, player["uni"], player['code'], player['fingerPrint'])
                if matched_player == None:
                    self.logger.info("No proper match for " + player["playerName"][0] + " in master")
                    return
                self.logger.info("Found proper match for " + player["playerName"][0] + " in master")
                playerClass = matched_player[0]["playerClass"]
                #Some times the player class in the Master is N/A
                if playerClass not in self.player_class_array:
                    self.logger.warning("The player class in the master for " + player["playerName"][0] + " season " + str(player["season"])  + " is not matching the valid class " + playerClass)
                    playerClass = player["playerClass"] 
                self._update_staged_player(player["playerId"], playerClass, player["uni"], player["code"], player["fingerPrint"], player["played"])

    def _match_last_year_active(self, sport_code, player):
        season = int(player["season"]) - 1
        self.logger.info("Attempting to match the last season " + str(season) + " for " + player["playerName"][0])
        player_list = self._player_exists_active_roster(sport_code, player["playerName"][0], player["teamCode"], None, season)
        return self._complete_active_stage_mapping(player_list, player)
                

    def _complete_active_stage_mapping(self, active_playerlist, search_player):
        self.logger.info("Mapping the active stage for " + search_player["playerName"][0] )
        if active_playerlist == None or len(active_playerlist) == 0:
            return

        if len(active_playerlist) == 1:
            self.logger.info("Got one active player " + search_player["playerName"][0]  )

            (player_class, redshirted, redshirted_year) = self._player_class_identification(active_playerlist[0],search_player)
            if player_class is None:
                self.logger.info("player class not matching, So we will not map for "+ search_player["playerName"][0] )
                return
            self._update_staged_player_class(search_player["playerId"], player_class)
            self._update_active_roster_mapping(search_player, active_playerlist[0]['playerId'])
            self._update_staged_player_status(search_player["playerId"], StageRoster.VERIFIED, StageRoster.ACTIVE_CATEFOGY )
            search_player["redshirted"] = redshirted
            search_player["redshirtedSeason"] = redshirted_year
            self._validate_insert_active(search_player,active_playerlist[0]['playerId'])
            return active_playerlist
        #print dumps(active_player_list)

        possible_player = []
        for active_player in active_playerlist:
            self._update_active_roster_mapping(search_player, active_player["playerId"])
            (player_class, redshirted, redshirted_year) = self._player_class_identification(active_playerlist[0],search_player)
            if player_class is None:
                self.logger.info("player class not matching, So we will not map for "+ search_player["playerName"][0] )
                continue
            possible_player.append(active_player)
            self._update_staged_player_class(search_player["playerId"], player_class)  
            player_matched = self._identify_the_best_matching_player([active_player], search_player["uni"], search_player["code"], search_player["fingerPrint"] )          
            if player_matched:
                search_player["redshirted"] = redshirted
                search_player["redshirtedSeason"] = redshirted_year
                self._update_staged_player_status(search_player["playerId"], StageRoster.VERIFIED, StageRoster.ACTIVE_CATEFOGY )
                self._validate_insert_active(search_player,active_player['playerId'])
                return [active_player]

        return possible_player

    def _player_class_identification(self, player, search_player):
        try:
            if search_player["season"] == player["season"] :
                if search_player["playerClass"] == "" or search_player["playerClass"] is None:
                    self.logger.info(search_player["playerName"][0] + " same season playerClass is empty")
                    return (player["playerClass"], False, 0)
                if search_player["playerClass"] == player["playerClass"]:
                    self.logger.info(search_player["playerName"][0] + " same season playerClass match")
                    return (player["playerClass"], False, 0)

            if search_player["playerClass"] == "" or search_player["playerClass"] is None:
                self.logger.info(search_player["playerName"][0] + " different season playerClass is empty")
                return (None, False, 0)

            self.logger.info(search_player["playerName"][0]+ " current season " + str(player["season"]) + " attempt to map to season " + str(search_player["season"]) )
            if int(search_player["season"]) == int(player["season"]) +1:            
                search_player_index = self._get_player_class_index(search_player["playerClass"])
                player_index = self._get_player_class_index(player["playerClass"]) 
                self.logger.info(search_player["playerName"][0] + " check last season, playerClass index " + str(search_player_index) + " found index " + str(player_index))
                if player_index + 1 == search_player_index :
                    #Its moving one up direction
                    self.logger.info(search_player["playerName"][0] + " found match with player " + player["playerId"] )
                    return (search_player["playerClass"], False, 0)
                if search_player_index == player_index:
                    self.logger.info(search_player["playerName"][0] + " found match with player "+ player["playerId"] + " player redishirted " + str(player["season"]))
                    return (search_player["playerClass"],True, player["season"] )

            self.logger.info(search_player["playerName"][0] + " Found no match consider this as new player")
        except :
            self.logger.info("Error in class identification for " + player["playerName"][0])
        return (None, False, 0)

    

    def complete(self, sport_code):
        db = self._get_client()
        self.logger.info("Complete is invoked")
        query = {"$and": [{"status": StageRoster.VERIFIED}, {"playerClass": {"$ne": ""} }, {"playerClass": {"$ne": None} }, {"sportCode": sport_code}] }
        verified_players=db[self.collection].find(query)
        for player in verified_players:
            should_we_insert_to_active= False
            self.logger.info("Atempt to search for " + player["playerName"][0] + " in active roster")
            player_list = self._player_exists_active_roster(sport_code, player["playerName"][0], player["teamCode"], player["playerClass"], player["season"])
            if player_list == None or len(player_list) == 0:
                self.logger.info("Atempt to search last season for " + player["playerName"][0] + " in active roster")
                player_list = self._match_last_year_active(sport_code, player)
                if player_list == None or len(player_list) == 0:
                    should_we_insert_to_active = True
            if should_we_insert_to_active:
                self._validate_insert_active(player)
            if player_list is not None:
                self._complete_active_stage_mapping(player_list, player)
        self._remove_all_verified_staged(sport_code)
        self._handle_dnp_players(sport_code)
        self._finalize(sport_code)

    ''' 
    Neve call this method direct. Its too dangerous. Call throug the validate_insert_active
    '''
    def _insert_to_active(self, staged_player, uid = None):
        db = self._get_client()
        if uid is None:
            uid = str(uuid.uuid4())
        if 'redshirted' in staged_player and 'redshirtedSeason' in staged_player:
            player = {"sportCode": staged_player["sportCode"], "teamCode": staged_player["teamCode"], "playerId": str(uid), "season": staged_player["season"], "playerName": staged_player["playerName"], "playerClass": staged_player["playerClass"], "jerseyNumber": staged_player["code"], "redshirted": staged_player["redshirted"], "redshirtedSeason": staged_player["redshirtedSeason"]} 
        else:
            player = {"sportCode": staged_player["sportCode"], "teamCode": staged_player["teamCode"], "playerId": str(uid), "season": staged_player["season"], "playerName": staged_player["playerName"], "playerClass": staged_player["playerClass"], "jerseyNumber": staged_player["code"], "redshirted": False, "redshirtedSeason": 0} 

        result = db[self.active_roster_collection].insert_one(player)
        return db[self.active_roster_collection].find_one({"_id":result.inserted_id})

    def _validate_insert_active(self, staged_player, uid = None):
        active_list = self._player_exists_active_roster(staged_player["sportCode"], staged_player["playerName"][0], staged_player["teamCode"], staged_player["playerClass"], staged_player["season"])
        if active_list == None or len(active_list) == 0:
            if uid:
                self._insert_to_active(staged_player, uid) 
            else:
                self._insert_to_active(staged_player)

        
    def _remove_all_verified_staged(self, sport_code):
        db = self._get_client()
        query = {"$and": [{"status": StageRoster.VERIFIED}, {"playerClass": {"$ne": ""} }, {"sportCode": sport_code}] }
        db[self.collection].delete_many(query)

    '''
    Handles all the unverified dnp players
    '''
    def _handle_dnp_players(self, sport_code):
        db = self._get_client()
        query = {"$and": [{"status": StageRoster.UNVERIFIED}, {"playerClass": {"$ne": ""} }, {"playerClass": {"$ne": None}}, {"played": False}, {"sportCode": sport_code}] }
        dnp_players=db[self.collection].find(query)
        for player in dnp_players:
            self._validate_insert_active(player)            
        db[self.collection].delete_many(query)

    def _finalize(self, sport_code):
        while True:
            db = self._get_client()
            query = {"$and": [ {"$or":[ {"status": StageRoster.UNVERIFIED}, {"playerClass": {"$eq": ""} }]}, {"sportCode": sport_code}] }
            unverified_document_count = db[self.collection].find(query).count()
            if unverified_document_count == 0:
                break

            print "Use the URL and validate the unverified players. Once done press Ctrl + C "
            os.system('python roster_acceptance.py')
            exit_y_n = raw_input("Do you want to exit ? [Y/N] :" )
            if exit_y_n == 'Y' or exit_y_n == "y":
                break
                
        print "Yes I am out of this "

    def upsert_player(self, players):
        db = self._get_client()
        normalizer = NameNormalizer()

        should_i_complete = False
        sport_code = ""
        print "let us start"
        for player in players:
            if player["playerClass"] is None or player["playerClass"] == "":
                continue
            (normalized_name, checkName) = normalizer.normalize_name(player["playerName"][0])
            print player["playerName"][0]+ " ------- " + player["playerClass"]
            data = {"$set":{"playerClass": player["playerClass"], "playerName": [checkName], "uni": player["uni"], "code": player["code"], "status": player["status"], "statusCateogy": player["statusCateogy"] } }
            db[self.collection].update({"playerId": player["playerId"]}, data)
            if player["status"] == StageRoster.UNVERIFIED and player["statusCateogy"] == StageRoster.UNVERIFIED_CATEGORY:
                self.update_player(player["sportCode"], player["teamCode"], checkName, player["playerClass"], player["uni"], player["code"], None, player["season"], player["fingerPrint"], player["played"])
            else:
                sport_code = player["sportCode"]
                should_i_complete = True
        if should_i_complete:
            print "Calling from upsert_player"
            self.complete(sport_code)
        return
