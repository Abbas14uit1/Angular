import xlrd
import sys
import getopt
from common.team_master_provider import TeamMasterProvider
from datetime import datetime
from pymongo import MongoClient

mongo_url = 'localhost:27017'
mongo_db = 'athlyte'
mongo_collection_team_master = 'TeamMaster'
mongo_collection_game_schedules = 'GameSchedules'

# to avoid query team master again & again for the team's we are processing.
team_codes_dict = dict()
team_codes_dict['Alabama'] = '8'
team_codes_dict['Purdue'] = '559'
team_codes_dict['Texas'] = '703'
team_codes_dict['TAMU'] = '697'

# Update below values based on input.
division = 'FBS'

sport_type_dict = {}
sport_type_dict['MFB'] = 'Football'
sport_type_dict['MBB'] = 'men\'s basketball'


def start_update(sport_code, excel_file_path, tabs_to_read):
    print "Inputted Sport Code: " + sport_code
    print "Inputted Excel File Path: " + excel_file_path
    print "Inputted Tabs to read in Excel File: " + tabs_to_read

    team_provider = TeamMasterProvider(mongo_url, mongo_db, mongo_collection_team_master)
    gs_mongo_db = MongoClient(mongo_url)[mongo_db]
    game_schedule_coll = gs_mongo_db[mongo_collection_game_schedules]

    workbook = xlrd.open_workbook(excel_file_path)
    for i in range(0, int(tabs_to_read)):
        excel_sheet = workbook.sheet_by_index(0)
        for row in range(1, excel_sheet.nrows):
            season = int(excel_sheet.cell(row, 0).value)
            game_date = str(excel_sheet.cell(row, 1).value).strip()
            team1 = str(excel_sheet.cell(row, 2).value).strip()
            team2 = str(excel_sheet.cell(row, 3).value).strip()
            result = str(excel_sheet.cell(row, 4).value).strip()
            team1_score = int(excel_sheet.cell(row, 5).value)
            team2_score = int(excel_sheet.cell(row, 6).value)

            location, oppo_team_name = get_location_team_name(team2)
            try:
                team_obj = team_provider.get_team_data_from_master(oppo_team_name, None, None)
            except Exception as ex:
                # Error continue to next file.
                print 'ERROR Querying Team Master. Message: ' + str(ex)
                continue
            conv_game_date = get_formatted_game_date(game_date)
            oppo_team_code = team_obj['teamCode']
            team_code = team_codes_dict.get(team1)
            print 'Querying for Team Code: ' + team_code + ', Oppo Team Code: ' + oppo_team_code + ', Game Date: ' + conv_game_date

            game_available = game_schedule_coll.find({'$and': [{'sportCode': sport_code}, {'gameDate': conv_game_date},
                                                              {'teamCode': team_code}, {'oppoTeamCode': oppo_team_code}]})

            if game_available.count() == 0:
                sport_type = sport_type_dict.get(sport_code)
                inserted = game_schedule_coll.insert({'sportCode': sport_code,
                                              'gameDate': conv_game_date,
                                              'season': season,
                                              'teamCode': team_code,
                                              'teamName': team1,
                                              'oppoTeamName': oppo_team_name,
                                              'oppoTeamCode': oppo_team_code,
                                              'gameLocation': location,
                                              'locationDetails': 'N/A',
                                              'gameResult': {'result': result,
                                                             'teamScore': str(team1_score),
                                                             'oppoScore': str(team2_score)
                                                             },
                                              'coachDetails': 'N/A',
                                              'ncaauri': 'N/A',
                                              'division': division,
                                              'sportType': sport_type
                                        })
                print 'Schedule Inserted Successfully. Object Id: ' + str(inserted)


def get_location_team_name(team2):

    index_of_at = 'at ' in team2.lower()
    index_of_vs = 'vs ' in team2.lower()
    index_of_vs_dot = 'vs. ' in team2.lower()
    if index_of_at:
        return 'Away', team2[3:]
    if index_of_vs:
        return 'Home', team2[3:]
    if index_of_vs_dot:
        return 'Home', team2[4:]

    return team2.lstrip()

def get_formatted_game_date(game_date):
    return datetime.strptime(game_date, '%m/%d/%Y').strftime('%m/%d/%Y')


def help():
    print 'game_schedules_updater.py -t <sportcode> -p <excel_file_path> -r <no_of_tabs_to_read>'


def main(argv):
    sport_code = ""
    excel_file_path = ""
    tabs_to_read = ""
    try:
      opts, args = getopt.getopt(argv,"ht:p:r:",["sportcode=","excelfilepath=","tabstoread="])
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-t', "--sportcode"):
            sport_code = arg
        elif opt in ('-p',"--excelfilepath"):
            excel_file_path = arg
        elif opt in ('-r',"--tabstoread"):
            tabs_to_read = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)

    if tabs_to_read == "" or excel_file_path == "" or sport_code == "":
        help()
        sys.exit(2)

    #Hard coded to football
    start_update(sport_code, excel_file_path, tabs_to_read)


if __name__ == "__main__":
    main(sys.argv[1:])
