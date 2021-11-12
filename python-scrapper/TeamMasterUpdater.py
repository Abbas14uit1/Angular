
from pymongo import MongoClient
import time

txt_path = 'D:/Taheer/personal/athlyte/teams-10b_3.txt'

mongo_url = 'localhost:27017'
mongo_db = 'athlyte'
mongo_collection = 'TeamMaster'

def parse_txt_file():
    excel_teams = []
    lines = []
    with open(txt_path) as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        columns = line.split('!')
        org_inst_name = columns[0]
        team_name = columns[1].strip()
        team_code = columns[2]
        team_location = columns[3]
        team_state = columns[4]
        nick_names = columns[5].split(';')
        men_nick_name = nick_names[0]
        women_nick_name = nick_names[1]

        team_master_excel = TeamMasterExcel(org_inst_name, team_name, team_code, team_location, team_state,
                                            men_nick_name, women_nick_name)
        excel_teams.append(team_master_excel)

    return excel_teams


class TeamMasterExcel(object):

    def __init__(self, org_inst_name, team_name, team_code, team_location, team_state, men_nick_name, women_nick_name):
        self.org_inst_name = org_inst_name
        self.team_name = team_name
        self.team_code = team_code
        self.team_location = self._check_blank(team_location, True)
        self.team_state = self._check_blank(team_state, True)
        self.men_nick_name = self._check_blank(men_nick_name, False)
        self.women_nick_name = self._check_blank(women_nick_name, False)

    def _check_blank(self, any_str, is_na_req):
        if not any_str.strip():
            if is_na_req:
                return 'N/A'
            else:
                return ''

        return any_str.strip()


class MongoDBHandler(object):

    def __init__(self, mongo_url, db_name, collection_name):
        self.mongo_url = mongo_url
        self.db_name = db_name
        self.collection_name = collection_name
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db = self.mongo_client[db_name]
        self.mongo_collection = self.mongo_db[collection_name]

    def check_and_update_master(self, excel_team):
        team_available = self.mongo_collection.find({"$and" : [{"teamCode": excel_team.team_code}, {"teamLocation" : "N/A"}]})

        if team_available.count() == 0:
            #print '~~~Team Not available in Mongo. Team Name:' + excel_team.team_name + ' & Team Code: ' + excel_team.team_code
            return
        else:
            print 'Total Teams found in Mongo:' + str(team_available.count()) + ", TeamCode: " + team_available[0]['teamCode']
            print "Team Location:" + excel_team.team_location

            mongo_team_name = team_available[0]['teamName']

            if mongo_team_name != excel_team.team_name :
                print '^^^Team Name is not matching with Mongo. Team Name(excel):' + excel_team.team_name \
                      + ', Team Name (Mongo):' + mongo_team_name + ' & Team Code: ' + excel_team.team_code
                return

            self.mongo_collection.update({"teamCode": excel_team.team_code},
                                             {"$set":
                                                 {
                                                     'orgInstName':excel_team.org_inst_name,
                                                     'teamLocation':excel_team.team_location,
                                                     'teamState': excel_team.team_state,
                                                 }
                                             }
                                          )

            if excel_team.men_nick_name != '':
                self.mongo_collection.update({"teamCode": excel_team.team_code},
                                         {"$push":
                                             {
                                                 'teamNickNames': excel_team.men_nick_name
                                             }
                                         }
                                         )

            if excel_team.women_nick_name != '':
                self.mongo_collection.update({"teamCode": excel_team.team_code},
                                         {"$push":
                                             {
                                                 'teamNickNames': excel_team.women_nick_name
                                             }
                                         }
                                         )
            print 'Record Updated successfully. Team Name: ' + excel_team.team_name + ', Team Code: ' + excel_team.team_code

    def find_team_in_mongo(self, excel_teams):
        teams_available = self.mongo_collection.find({})

        mongo_team_codes = []
        for team in teams_available:
            mongo_team_codes.append(team['teamCode'])

        excel_team_codes = []
        for excel_team in excel_teams:
            excel_team_codes.append(excel_team.team_code)

        diff_team_codes = (list(set(excel_team_codes) - set(mongo_team_codes)))
        print '-----------------------------------------'
        print 'Teams available in Excel but not in Mongo.'
        print '-----------------------------------------'
        for diff_team_code in diff_team_codes:
            for excel_team in excel_teams :
                if excel_team.team_code == diff_team_code :
                    print 'Team Code:' + diff_team_code + ', Team Name:' + excel_team.team_name

        print '\n\n-------------------------------------'
        print 'Teams available in Mongo but not in Excel.'
        print '-----------------------------------------'
        diff_team_codes = (list(set(mongo_team_codes) - set(excel_team_codes)))
        for diff_team_code in diff_team_codes:
            team_details = self.mongo_collection.find({'teamCode':diff_team_code})
            print 'Team Code:' + diff_team_code + ', Team Name: ' + team_details[0]['teamName']

excel_teams = parse_txt_file()
mongo_handler = MongoDBHandler(mongo_url, mongo_db, mongo_collection)

for excel_team in excel_teams:
    #print  'Processing for :' + excel_team.team_name + ', Team Code:' + excel_team.team_code
    mongo_handler.check_and_update_master(excel_team)

mongo_handler.find_team_in_mongo(excel_teams)