from pymongo import MongoClient
from ast import literal_eval
from os import environ
import re
import logging
from bson.json_util import dumps


class TeamMasterManager:
    "This is a TeamMasterManager class to read information from the team master data"

    # TODO: we need to implement the logic to update team master as well.

    def __init__(self, mongo_host="localhost", port=27017, database="athlyte", user="", password="",collection="TeamMaster"):
        self.logger= logging.getLogger(__name__)
        self.mongo_host = mongo_host
        self.mongo_port = port
        self.database = database
        self.collection = collection
        self.user = user
        self.password = password
        self.client = None

    def _get_client(self):
        if self.client == None:
            self.client = MongoClient(self.mongo_host, self.mongo_port)
        if self.user:
            self.client.athlyte_shared.authenticate(self.user, self.password)
            return self.client.athlyte_shared

        return self.client.athlyte


    def _get_team_list(self, team_data):
        team_list = []
        for team in team_data:
            team_list.append(team)
        return team_list


    def get_team_data_from_master(self, team_name, team_id, team_code):
        db = self._get_client()

        team_data = db.TeamMaster.find_one({"teamName": team_id})
        if team_data is not None:
            return team_data

        team_data = db.TeamMaster.find_one({"teamName": team_name})
        if team_data is not None:
            return team_data

        team_search = self.name_pattern = re.compile("^"+team_name+"$", re.IGNORECASE)
        if team_code is None or len(team_code) == 0:
            team_data = db.TeamMaster.find({"teamName": team_search})
        else:
            team_data = db.TeamMaster.find({"teamCode": team_code})

        name_team_list = self._get_team_list(team_data)
        if len(name_team_list) == 1:
            return name_team_list[0]
        elif len(name_team_list) > 1:
            self.logger.error("Multiple team found for " + team_name + ". got this dump " + dumps(name_team_list))

        modified_team_name = team_name.replace("State", "St.")        
        modified_team_name = modified_team_name.replace(";", "")
        modified_team_search = self.name_pattern = re.compile("^"+modified_team_name+"$", re.IGNORECASE)

        team_data = db.TeamMaster.find({"teamName": modified_team_search})

        modified_team_list = self._get_team_list(team_data)
        if len(modified_team_list) == 1:
            return modified_team_list[0]
        elif len(modified_team_list) > 1:
            self.logger.error("Multiple team found for modified team name " + modfied_team_name + ". got this dump " + dumps(modified_team_list))

        team_data = db.TeamMaster.find({"teamNickNames": team_name})
        nickname_team_list = self._get_team_list(team_data)
        if len(nickname_team_list) == 1:
            return nickname_team_list[0]
        elif len(nickname_team_list) > 1:
            self.logger.error("Multiple team found for nickname direct search team name " + nickname_team_list + ". got this dump " + dumps(nickname_team_list))

        team_data = db.TeamMaster.find({"teamNickNames": team_search})
        nickname_team_list = self._get_team_list(team_data)
        if len(nickname_team_list) == 1:
            return nickname_team_list[0]
        elif len(nickname_team_list) > 1:
            self.logger.error("Multiple team found for nickname team name " + team_name + ". got this dump " + dumps(nickname_team_list))


        raise ValueError("Team: <" + team_name + "> not found in team master")


    def get_team_code_from_master(self, team_name, team_code=None):
        return self.get_team_data_from_master(team_name, None, team_code)['teamCode']


    def add_nickname(self, team_code, nickname):
    	db = self._get_client()
    	nickname = nickname.strip()
    	nickname = re.sub(";$","",nickname)

    	db[self.collection].find_and_modify({"teamCode": team_code},{"$addToSet":{"teamNickNames": nickname}})


    def get_conference_details(self, team_code, season):
        db = self._get_client()
        result = None
        self.logger.info( "TEAM " + team_code + " season " + str(season) )
        pipeline = [
        {"$match": {"teamCode": team_code, 
            "sportDetails.confDetails.confStartYear": {"$lte": int(season)}, 
            "sportDetails.confDetails.confEndYear": {"$gte": int(season)},
            "sportDetails.confDetails.confDivisionStartYear": {"$lte": int(season)},
            "sportDetails.confDetails.confDivisionEndYear": {"$gte": int(season)} }},
         {"$unwind": "$sportDetails"},
         {"$unwind": "$sportDetails.confDetails"},
         {"$match": {"sportDetails.confDetails.confStartYear": {"$lte": int(season)}, 
                     "sportDetails.confDetails.confEndYear": {"$gte": int(season)},
                     "sportDetails.confDetails.confDivisionStartYear": {"$lte": int(season)},
                     "sportDetails.confDetails.confDivisionEndYear": {"$gte": int(season)}}},
         {"$project": { "confName": "$sportDetails.confDetails.confName",
                     "confDivisionName" : "$sportDetails.confDetails.confDivisionName",
                     "confStartYear" : "$sportDetails.confDetails.confStartYear", 
                     "confEndYear" : "$sportDetails.confDetails.confEndYear",
                     "confDivisionStartYear" : "$sportDetails.confDetails.confDivisionStartYear",
                     "confDivisionEndYear": "$sportDetails.confDetails.confDivisionEndYear"}}
        ]

        conf_details = db[self.collection].aggregate(pipeline)
        for data in conf_details:
            return data

        self.logger.info("Execute the 2nd pipeline for the conf process")
        pipeline2 = [
        {"$match": {"teamCode": str(team_code), 
            "sportDetails.confDetails.confStartYear": {"$lte": int(season)}, 
            "sportDetails.confDetails.confEndYear": {"$gte": int(season)}}},
         {"$unwind": "$sportDetails"},
         {"$unwind": "$sportDetails.confDetails"},
         {"$match": {"sportDetails.confDetails.confStartYear": {"$lte": int(season)}, 
                     "sportDetails.confDetails.confEndYear": {"$gte": int(season)}}},
         {"$project": { "confName": "$sportDetails.confDetails.confName",
                     "confDivisionName" : "$sportDetails.confDetails.confDivisionName",
                     "confStartYear" : "$sportDetails.confDetails.confStartYear", 
                     "confEndYear" : "$sportDetails.confDetails.confEndYear",
                     "confDivisionStartYear" : "$sportDetails.confDetails.confDivisionStartYear",
                     "confDivisionEndYear": "$sportDetails.confDetails.confDivisionEndYear"}}
        ]
        print dumps(pipeline2)
        conf_details = db[self.collection].aggregate(pipeline2)
        for data in conf_details:
            print "=================return the first "
            return data
        
            