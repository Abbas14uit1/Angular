import urllib2
from bs4 import BeautifulSoup
import requests
import os
from urlparse import urlparse
from datetime import datetime
import codecs
from tinydb import TinyDB, Query
import time
import dateutil.parser
from pymongo import MongoClient
import traceback
import logging
import boto3


logger = logging.getLogger('scrapper')
file_handler = logging.FileHandler('logs/wbb-scrapper-{:%Y-%m-%d_%H-%M-%S}.log'.format(datetime.now()))
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
logger.setLevel(logging.INFO)

sport_code = "WBB"
#division = "2"
#division_const = 'II'
game_type = "women's basketball"
team_path = '/team/'
roster_path = '/roster/'

s3_client = boto3.client('s3')
backet_name = 'athlyte-ncaa-scrap-cache'
folder_path = 'Rosters/' + sport_code + '/'

game_by_game_path = '/player/game_by_game?game_sport_year_ctl_id='
org_id = '&org_id='
stats_player_seq = '&stats_player_seq=-100'

sports_divisions = "1,2,3"
year = "2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002"
# 2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002
# for year 2012 - we need handle it separately bcz oppo team does not have anchor tag & result is not available -- FBS

mongo_url = 'localhost:27017'
mongo_db = 'athlyte'
mongo_collection = 'Rosters'

db_name = 'time_cacher_db_roster_wbb.json'
sleep_duration = 10
ncaa_url = "https://stats.ncaa.org"

division_const_dict = dict()
division_const_dict['1'] = 'I'
division_const_dict['2'] = 'II'
division_const_dict['3'] = 'III'
division_const_dict['11'] = 'FBS'
division_const_dict['12'] = 'FCS'

sport_code_name_dict = dict()
sport_code_name_dict['MFB'] = 'football'
sport_code_name_dict['MBA'] = "men's baseball"
sport_code_name_dict['MBB'] = "men's basketball"
sport_code_name_dict['WBB'] = "women's basketball"
sport_code_name_dict['WSB'] = "women's softball"


class TimeKeeper(object):

    def __init__(self):
        self.db = TinyDB(db_name)
        return

    def _time_cacher(self, domain):
        keeper_query = Query()
        result = []
        try:
            result = self.db.search((keeper_query.domain == domain))
        except:
            self.db = TinyDB(db_name)
            result = self.db.search((keeper_query.domain == domain))

        for res in result:
            return self._check_expiry(res['last_hit_time'], domain, keeper_query)
        else:
            self.db.insert({'domain': domain, 'last_hit_time': datetime.utcnow().isoformat()})
            return True

        return False

    def has_time_expired(self, url):
        parsed_url = urlparse(url)
        domain = '{uri.scheme}://{uri.netloc}/'.format(uri=parsed_url)
        return self._time_cacher(domain)

    def _check_expiry(self, time, domain, keeper_query):
        current_time = dateutil.parser.parse(datetime.utcnow().isoformat())
        time = dateutil.parser.parse(time)
        expired_interval = current_time - time
        if expired_interval.total_seconds() > sleep_duration:
            #self.db.update({'last_hit_time': datetime.utcnow().isoformat()}, keeper_query.domain == domain)
            return True

        return False

    def update_last_access_time(self, url):
        keeper_query = Query()
        parsed_url = urlparse(url)
        domain = '{uri.scheme}://{uri.netloc}/'.format(uri=parsed_url)
        self.db.update({'last_hit_time': datetime.utcnow().isoformat()}, keeper_query.domain == domain)


class CacheStore(object):
    """docstring for CacheStore"""

    def __init__(self):
        super(CacheStore, self).__init__()
        self.base_cache_location = "cache_roster_wbb/"
        if not os.path.exists(self.base_cache_location):
            os.mkdir(self.base_cache_location)

    def __get_cache_filename(self, cache_filename):
        return self.base_cache_location + cache_filename

    def get_cache(self, cache_filename):
        if os.path.exists(self.__get_cache_filename(cache_filename)):
            return self.__get_cache_filename(cache_filename)
        return None

    def store_cache(self, cache_filename, data):
        with codecs.open(self.__get_cache_filename(cache_filename), "w", "utf-8-sig") as team_data:
            team_data.write(data)
        return self.__get_cache_filename(cache_filename)

    def clear_cache(self, cache_filename):
        os.remove(self.__get_cache_filename(cache_filename))


class MongoDBHandler(object):

    def __init__(self, mongo_url, db_name, collection_name):
        self.mongo_url = mongo_url
        self.db_name = db_name
        self.collection_name = collection_name
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db = self.mongo_client[db_name]
        self.mongo_collection = self.mongo_db[collection_name]

    def insert_into_mongo(self, roster_details):

        for roster_detail in roster_details:
            start_time = int(round(time.time()))
            roster_available = self.mongo_collection.find({"playerId": roster_detail.roster_seq_id})
            end_time = int(round(time.time()))
            #logger.info ('Time took to query player seq Id: ' + str(end_time - start_time))
            roster_game_details = []
            # GameDetails -- Start
            for roster_game in roster_detail.roster_games:
                roster_game_details.append({
                    'gameDate': roster_game.game_date,
                    'oppoTeamCode': roster_game.oppo_team_code,
                    'oppoTeamName': roster_game.oppo_team_name,
                    'gameLocation': roster_game.game_location,
                    'gameResult': {'result': roster_game.result,
                                   'teamScore': roster_game.team_score,
                                   'oppoScore': roster_game.oppo_score
                                   },
                    'season': roster_detail.roster_played_year,
                    'sportYearId': roster_detail.sport_year_id,
                    'playerJerseyNumber': roster_detail.roster_jersey_number,
                    'playerCollegeYear': roster_detail.roster_college_year
                })
            # GameDetails -- End
            if roster_available.count() == 0:
                start_time = int(round(time.time()))
                self.mongo_collection.insert({'division': roster_detail.division,
                                              'sportCode': roster_detail.game_code,
                                              'sportType': roster_detail.game_type,
                                              #'sportYearId': roster_detail.sport_year_id,
                                              'teamName': roster_detail.team_name,
                                              'teamCode': roster_detail.team_code,
                                              'playerId': roster_detail.roster_seq_id,
                                              'playerHeight': roster_detail.player_height,
                                              #'rosterJerseyNumber': roster_detail.roster_jersey_number,
                                              'playerName': roster_detail.roster_name,
                                              #'playerNcaaUri': roster_detail.roster_uri,
                                              #'playerPosition': roster_detail.roster_position,
                                              #'rosterCollegeYear': [roster_detail.roster_college_year],
                                              #'rosterGP': roster_detail.roster_GP,
                                              #'rosterGS': roster_detail.roster_GS,
                                              'playerPlayedDetails': [
                                                                        {
                                                                            'season': int(roster_detail.roster_played_year),
                                                                            'sportYearId': roster_detail.sport_year_id,
                                                                            'jerseyNumber': roster_detail.roster_jersey_number,
                                                                            'collegeYear': roster_detail.roster_college_year,
                                                                            'GP': roster_detail.roster_GP,
                                                                            'GS': roster_detail.roster_GS,
                                                                            'playerPosition': roster_detail.roster_position,
                                                                            'playerNcaaUri': roster_detail.roster_uri
                                                                        }
                                                                     ],
                                              'rosterGamesDetails': roster_game_details
                                              })
                end_time = int(round(time.time()))
                #logger.info('Time took to insert record in Mongo: ' + str(end_time - start_time))
                #logger.info('Record Inserted Successfully.')
                #time.sleep(10)
                #print 'Record Inserted Successfully. For Data:' + schedule_detail.game_date + ', for team code:' + schedule_detail.team_code
            elif roster_available.count() == 1:
                start_time = int(round(time.time()))
                #count should be always one.
                played_details = roster_available[0]['playerPlayedDetails']
                played_seasons = []
                for played_detail in played_details:
                    played_seasons.append(int(played_detail['season']))

                if int(roster_detail.roster_played_year) not in played_seasons:
                    self.mongo_collection.update({"playerId": roster_detail.roster_seq_id},
                                                 {"$push":
                                                      {'playerPlayedDetails':
                                                           {
                                                               'season': int(roster_detail.roster_played_year),
                                                               'sportYearId': roster_detail.sport_year_id,
                                                               'jerseyNumber': roster_detail.roster_jersey_number,
                                                               'collegeYear': roster_detail.roster_college_year,
                                                               'GP': roster_detail.roster_GP,
                                                               'playerPosition': roster_detail.roster_position,
                                                               'GS': roster_detail.roster_GS,
                                                               'playerNcaaUri': roster_detail.roster_uri
                                                           }
                                                      }
                                                 }
                                                )
                    #logger.info("Updated document successfully for played year.." + roster_detail.roster_seq_id)
                game_details = roster_available[0]['rosterGamesDetails']
                game_dates = []
                for game_detail in game_details:
                    game_dates.append(game_detail['gameDate'])

                for roster_game_detail in roster_game_details:
                    if roster_game_detail['gameDate'] not in game_dates:

                        self.mongo_collection.update({"playerId": roster_detail.roster_seq_id},
                                                     {"$push":
                                                         {'rosterGamesDetails': roster_game_detail}
                                                     }
                                                     )
                        #logger.info("Updated document successfully for games: " + roster_game_detail['gameDate'])
                end_time = int(round(time.time()))
                #logger.info('Time took to update record in Mongo: ' + str(end_time - start_time))
                #roster_col_yrs = roster_available[0]['rosterCollegeYear']
                #if roster_detail.roster_col_yr not in roster_col_yrs:
                #   self.mongo_collection.update({"rosterSeqId": roster_detail.roster_seq_id},
                #                                 {"$push": {'rosterCollegeYear': roster_detail.roster_college_year}
                #                                  }
                #                                 )
                #    print "Updated document successfully for college year.."
                #time.sleep(10)
                #print 'Record Already available. For Data:' + schedule_detail.game_date + ', for team code:' + schedule_detail.team_code \
                #      + ', for oppo team code:' + schedule_detail.oppo_team_code

    def close_connection(self):
        if self.mongo_client is not None:
            self.mongo_client.close()


class TeamScrapper(object):

    def __init__(self, sport_code, year, division):
        self.sport_code = sport_code
        self.year = year
        # divisions - division=2 => II
        #             division=3 => III
        #             division=11 => FBS
        #             division=12 => FCS
        self.url = "https://stats.ncaa.org/team/inst_team_list?academic_year=" + year + "&conf_id=-1&division=" + division + "&sport_code=" + sport_code
        logger.info("Teams List URL: " + self.url)
        self.page = None
        self.soup = None
        self.cache_store = CacheStore()
        self.cache_filename = sport_code + "_" + year + "_div-" + division + "_" + "team_mainpage.html"

    def _get_page(self):
        cache_file_path = self.cache_store.get_cache(self.cache_filename)
        if cache_file_path:
            self.page = cache_file_path
            return

        r = requests.get(self.url)
        self.page = self.cache_store.store_cache(self.cache_filename, r.text)

    def _soupify(self):
        self.soup = BeautifulSoup(open(self.page), "html.parser", from_encoding="utf-8")

    def _parse(self):
        tables = self.soup.findAll('table', {'width': '100%'})
        teams = []
        for table in tables:
            trs = table.findAll('tr')
            for tr in trs:
                td = tr.find('td')
                link = td.find('a')
                team_code = link.get('href').split('/')[2]
                sports_year_code = link.get('href').split('/')[3]
                team_details = TeamDetails(link.get('href'), team_code, link.string, sports_year_code)
                teams.append(team_details)

        return teams

    def scrape(self):
        self._get_page()
        self._soupify()
        return self._parse()


class TeamDetails(object):
    '''Class to store the data scrape for team'''
    def __init__(self, team_href, team_code, team_name, sports_year_code):
        self.team_href = team_href
        self.team_code = team_code
        self.team_name = team_name
        self.sports_year_code = sports_year_code


class RosterScrapper(object):
    """Captures data for a team """

    def __init__(self, rosters_url, game_by_game_url, team_code, year, sport_code, team_name, sport_year_id, division):
        super(RosterScrapper, self).__init__()
        self.sport_code = sport_code
        self.team_code = str(team_code)
        self.year = year
        self.rosters_url = rosters_url
        self.game_by_game_url = game_by_game_url
        self.team_name = team_name
        self.sport_year_id = sport_year_id
        self.division = division
        # https://stats.ncaa.org/teams/113638
        # The url is constructed from the history
        self.rosters_page = ""
        self.game_by_game_page = ""
        self.cache_store = CacheStore()
        self.rosters_cache_filename = sport_code + "_" + team.team_code + "_" + yr + "_div-" + division + "_" + "rosters_page.html"
        self.game_by_game_cache_filename = sport_code + "_" + team.team_code + "_" + yr + "_div-" + division + "_" + "gameByGame_page.html"

    def _get_page(self):

        roster_cache_available = False
        game_by_game_cache_available = False
        if self.cache_store.get_cache(self.rosters_cache_filename):
            self.rosters_page = self.cache_store.get_cache(self.rosters_cache_filename)
            logger.info("Got Page from Cache: " + self.rosters_cache_filename)
            roster_cache_available = True

        if self.cache_store.get_cache(self.game_by_game_cache_filename):
            self.game_by_game_page = self.cache_store.get_cache(self.game_by_game_cache_filename)
            logger.info("Got Page from Cache: " + self.game_by_game_cache_filename)
            game_by_game_cache_available = True

        if roster_cache_available and game_by_game_cache_available:
            return

        if not roster_cache_available:
            logger.info("Getting page from NCAA Site(Roster): " + self.rosters_url)
            roster = requests.get(self.rosters_url)
            self.rosters_page = self.cache_store.store_cache(self.rosters_cache_filename, roster.text)
            if not game_by_game_cache_available: # check if game by game is not available in cache then we have to wait for 15 seconds.
                logger.info("****** sleep for " + str(sleep_duration) + " seconds. After Roster page.")
                time.sleep(sleep_duration)

        if not game_by_game_cache_available:
            logger.info("Getting page from NCAA Site(Game By Game): " + self.game_by_game_url)
            gbg = requests.get(self.game_by_game_url)
            self.game_by_game_page = self.cache_store.store_cache(self.game_by_game_cache_filename, gbg.text)

    def _soupify(self):
        self.rosters_soup = BeautifulSoup(open(self.rosters_page), "html.parser", from_encoding="utf-8")
        self.game_by_game_soup = BeautifulSoup(open(self.game_by_game_page), "html.parser", from_encoding="utf-8")

    def _parse(self):
        players_select = self.game_by_game_soup.find("select", id="stats_player_person_id")
        players_options = players_select.findAll('option')
        player_ids_dict = dict()
        for players_option in players_options:
            player_id = players_option.get('value').strip()
            unique_player_const = players_option.renderContents().strip()
            player_ids_dict[unique_player_const] = str(player_id)

        game_details = self._get_game_details()

        #rosters_table = self.rosters_soup.find("table",  {'id': 'stat_grid'})
        # Not sure.. Trying reading table but it's not returing all the trs, return in only headers.
        roster_details = []
        rosters_tbody = self.rosters_soup.find("tbody") #,  {'id': 'stat_grid'}
        rosters_trs = rosters_tbody.findAll('tr')
        for rosters_tr in rosters_trs:
            rosters_tds = rosters_tr.findAll('td')
            jersey_number = rosters_tds[0].renderContents().strip()
            player_name = player_link = player_seq_id = None
            if rosters_tds[1].find('a') :
                player_link = rosters_tds[1].find('a').get('href').strip()
                player_name = rosters_tds[1].find('a').text.strip()
                player_seq_id = self._get_player_seq_id(player_link)
                player_link = ncaa_url + player_link
            else :
                player_name = rosters_tds[1].text.strip()
                player_link = 'N/A'

            player_pos = rosters_tds[2].renderContents().strip()
            player_height = rosters_tds[3].renderContents().strip()
            player_college_yr = rosters_tds[4].renderContents().strip()
            player_gp = rosters_tds[5].renderContents().strip()
            player_gs = rosters_tds[6].renderContents().strip()

            if player_seq_id is None:
                unique_player_key = player_name + ' #' + jersey_number + ' ' + player_pos
                player_seq_id = player_ids_dict.get(unique_player_key, '-9999999')

            #print jersey_number + ", " + player_name + ", " + player_link + ", " + player_seq_id + ", " + player_pos \
            #      + ", " + player_college_yr + ", " + player_gp + ", " + player_gs
            if player_pos is None or len(player_pos) == 0:
                player_pos = 'N/A'
            division_const = division_const_dict.get(self.division)
            #player_height = 'N/A'
            roster_detail = RosterDetails(division_const, sport_code, game_type, self.sport_year_id,
                                          self.team_code, self.team_name, player_seq_id, jersey_number,
                                          player_name, player_link, player_pos, player_college_yr,
                                          player_gp, player_gs, self.year, game_details, player_height)

            roster_details.append(roster_detail)

        return roster_details

    def _get_game_details(self):
        schedules_table = self.game_by_game_soup.find('table', {'class': 'mytable', 'align': 'center'})
        schedules_trs = schedules_table.findAll('tr')
        counter = 0
        game_details = []
        for schedules_tr in schedules_trs:
            if counter < 2:  # first two rows are just headers
                counter = counter + 1
                continue

            attrs_dict = schedules_tr.attrs
            if len(attrs_dict) > 0:
                continue

            schedules_tds = schedules_tr.findAll('td')
            game_date = schedules_tds[0].renderContents().strip()

            opponent_team = None
            opponent_team_code = 'N/A'
            a_tags = schedules_tds[1].findAll('a')

            for a_tag in a_tags:
                if a_tag.text is None or len(a_tag.text.strip()) == 0:
                    continue

                opponent_team = self._get_oppoent_team_name(a_tag.text.strip())
                opponent_team_link = a_tag.get('href').strip()
                opponent_team_code = opponent_team_link.split('/')[2]
            if opponent_team is None:
                opponent_team = schedules_tds[1].text.strip()

            game_result = None
            if schedules_tds[2].find('a'):
                game_result = schedules_tds[2].find('a').text.strip()
            else:
                game_result = schedules_tds[2].text.strip()

            game_detail = GameDetails(game_date, opponent_team_code, opponent_team, game_result)
            game_details.append(game_detail)

        return game_details

    def _get_player_seq_id(self, player_link):
        if player_link is None:
            return -999999

        index = player_link.rindex('=')
        return player_link[index + 1:]

    def _get_oppoent_team_name(self, opponent_team):
        if opponent_team is None:
            return 'N/A'

        if '@' not in opponent_team:
            return opponent_team

        at_cnt = opponent_team.count('@')
        if at_cnt == 1:
            return opponent_team

        index = opponent_team.rindex('@')
        return opponent_team[:index].strip()

    def scrape(self):
        self._get_page()
        self._soupify()
        return self._parse()


class GameDetails(object):

    def __init__(self, game_date, opponent_team_code, opponent_team, game_result):
        self.game_date = game_date
        self.oppo_team_name = self._get_oppo_team_name(opponent_team)  # get Name.
        self.oppo_team_code = opponent_team_code
        self.game_location = self._get_game_location(opponent_team)  # get Location.
        self.result = self._get_game_result(game_result)  # get result
        self.team_score = self._get_team_score(game_result)  # get team score
        self.oppo_score = self._get_oppo_score(game_result)  # get oppp score

    def _get_game_location(self, opponent_team):
        if '@' not in opponent_team:
            return 'Home'
        index = opponent_team.index('@')
        if index == 0:
            temp_oppo_team = opponent_team[index + 1:].strip()
            if '@' not in temp_oppo_team:
                return 'Away'

            inner_index = temp_oppo_team.index('@')
            if inner_index > 0:
                return 'Neutral'

        return 'Neutral'

    def _get_game_result(self, game_result):
        if game_result[:1].strip() == 'W':
            return 'Win'

        return 'Lose'

    def _get_team_score(self, game_result):
        h_index = game_result.index('-')
        return game_result[2:h_index].strip()

    def _get_oppo_score(self, game_result):
        h_index = game_result.index('-')
        return game_result[h_index+1 : len(game_result)].strip()

    def _get_oppo_team_name(self, opponent_team):
        if '@' not in opponent_team:
            return opponent_team
        index = opponent_team.index('@')
        if index == 0:
            return opponent_team[1:].strip()

        return opponent_team[:index].strip()

class RosterDetails(object) :
    '''Class to store the data scrape for team'''

    def __init__(self, division_const, sport_code, game_type, sport_year_id, team_code, team_name,
                 roster_seq_id, roster_jersey_number, roster_name, roster_uri, roster_position, roster_college_year,
                 roster_GP, roster_GS, roster_played_year, roster_games, player_height):
        self.division = division_const
        self.game_code = sport_code
        self.game_type = game_type
        self.sport_year_id = sport_year_id
        self.team_code = team_code
        self.team_name = team_name
        self.roster_seq_id = roster_seq_id
        self.roster_jersey_number = roster_jersey_number
        self.roster_name = roster_name
        self.roster_uri = roster_uri
        self.roster_position = roster_position
        self.roster_college_year = roster_college_year
        self.roster_GP = roster_GP
        self.roster_GS = roster_GS
        self.roster_played_year = roster_played_year #2017 #roster_played_year
        self.roster_games = roster_games
        self.player_height = player_height


# TODO: Has to do for all the teams one by one and slow.
# TODO: the number 721 should come from the previous scrape.
divisions = sports_divisions.split(",")
#start_time = int(round(time.time()))
cache_store = CacheStore()
for div in divisions:
    years = year.split(",")
    file_exists_in_cache = True
    for yr in years:
        team_scrapper = TeamScrapper(sport_code, yr, div)
        teams = team_scrapper.scrape()
        time_keeper = TimeKeeper()
        mongo_handler = MongoDBHandler(mongo_url, mongo_db, mongo_collection)
        logger.info("Total Teams found: " + str(len(teams)) + " for year: " + yr + "\n\n")
        i = 0
        start_time = int(round(time.time()))
        for team in teams:
            try:
                if not time_keeper.has_time_expired(ncaa_url):
                    logger.info("****** sleep for " + str(sleep_duration) + " seconds.")
                    time.sleep(sleep_duration)

                rosters_cache_filename = sport_code + "_" + team.team_code + "_" + yr + "_div-" + div + "_" + "rosters_page.html"
                game_by_game_cache_filename = sport_code + "_" + team.team_code + "_" + yr + "_div-" + div + "_" + "gameByGame_page.html"

                if cache_store.get_cache(rosters_cache_filename) is None or cache_store.get_cache(game_by_game_cache_filename) is None:
                    file_exists_in_cache = False

                roster_url = ncaa_url + team_path + team.team_code + roster_path + team.sports_year_code
                game_by_game_url = ncaa_url + game_by_game_path + team.sports_year_code + org_id + team.team_code + stats_player_seq
                #now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                logger.info("scraping for team: " + team.team_name + " & team code: " + team.team_code + ", full URL: " + roster_url)
                logger.info("scraping for Game By Game: " + team.team_name + " & team code: " + team.team_code + ", full URL: " + game_by_game_url)
                roster_scrapper = RosterScrapper(roster_url, game_by_game_url, team.team_code, yr, sport_code,
                                                   team.team_name, team.sports_year_code, div)
                rosters = roster_scrapper.scrape()
                logger.info("Total players: " + str(len(rosters)))
                mongo_handler.insert_into_mongo(rosters)
                i += 1
                logger.info("Completed data insertion in Mongo DB for index: " + str(i) + ", Total players: " + str(len(rosters)) + \
                      ", For Year: " + yr + ", For Division: (" + div + "), remaining teams: " + str(len(teams) - i))

                rosters_file_path = cache_store.get_cache(rosters_cache_filename)
                game_by_game_file_path = cache_store.get_cache(game_by_game_cache_filename)
                s3_client.upload_file(rosters_file_path, backet_name, folder_path + rosters_cache_filename)
                s3_client.upload_file(game_by_game_file_path, backet_name, folder_path + game_by_game_cache_filename)
                logger.info("Uploaded both files to S3 Bucket.\n")

                if not file_exists_in_cache:
                    time_keeper.update_last_access_time(ncaa_url)
                    file_exists_in_cache = True
                #for schedule in schedules :
                #    print schedule.oppo_team_name + " " + schedule.game_location + " " + schedule.result + " " + schedule.team_score + " " + schedule.oppo_score
            except Exception as e:
                logger.error(e.message)
                logging.exception("%%%%%%%%%%% Not able to complete process for URL: " + roster_url)
                logging.error(e, exc_info=True)
                i += 1
                #logger.info("%%%%%%%%%%% Not able to complete process for URL: " + roster_url)
                #traceback.print_exc()
                if not file_exists_in_cache:
                    time.sleep(30) # wait for 1 min in case of errors.
        else:
            logger.info("\n\n>>>>>>> No Teams found for the given year: " + yr)

        end_time = int(round(time.time()))
        logger.info( "Time took to complete year: " + yr + ", seconds: " + str(end_time - start_time) + "\n")
        mongo_handler.close_connection()