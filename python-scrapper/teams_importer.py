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

logger = logging.getLogger('scrapper')
file_handler = logging.FileHandler('logs/team-master-{:%Y-%m-%d_%H-%M-%S}.log'.format(datetime.now()))
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
logger.setLevel(logging.INFO)

#sport_code = "MFB"

#division = "2"
#division_const = 'II'
#game_type = "football"
#team_path = '/team/'
#roster_path = '/roster/'

sport_codes = "MBA,MBB,WBB,WSB"
# MFB,MBA,MBB,WBB,WSB
sports_divisions = "1,2,3"
# 1,2,3
# 2,3,11,12
years = "2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002"
# 2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002

# for year 2012 - we need handle it separately bcz oppo team does not have anchor tags & result is not available -- FBS
mongo_url = 'localhost:27017'
mongo_db = 'athlyte'
mongo_collection = 'TeamMaster'

db_name = 'time_cacher_db_team_master.json'
sleep_duration = 15
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
        self.base_cache_location = "cache_teams/"
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

    def insert_into_mongo(self, team_details):

        for team_detail in team_details:
            team_available = self.mongo_collection.find({"teamCode": team_detail.team_code})
            if team_available.count() == 0:
                self.mongo_collection.insert({'teamCode': team_detail.team_code,
                                              'teamName': team_detail.team_name,
                                              #'teamNcaaUri': team_detail.team_href,
                                              #'divisions': [
                                              #              {
                                              #                  'divisionCode': team_detail.division,
                                              #                  'divisionConstant': team_detail.division_const
                                              #              }
                                              #            ],
                                              'sportDetails': [
                                                                {
                                                                    'sportType': team_detail.sport_type,
                                                                    'sportCode': team_detail.sport_code,
                                                                    'divisionCode': team_detail.division,
                                                                    'divisionConstant': team_detail.division_const,
                                                                    #'ncaaUri': team_detail.team_href
                                                                }
                                                            ]
                                              })

                #logger.info('Record Inserted Successfully.')
                #time.sleep(10)
            elif team_available.count() == 1:
                #count should be always one.
                mongo_divisions = team_available[0]['sportDetails']
                divisions = []
                for mongo_division in mongo_divisions:
                    divisions.append(mongo_division['divisionCode'])

                sport_details = []
                for mongo_sport_detail in mongo_divisions:
                    sport_details.append(mongo_sport_detail['sportCode'])

                if team_detail.division not in divisions or team_detail.sport_code not in sport_details:
                    self.mongo_collection.update({"teamCode": team_detail.team_code},
                                                 {"$push":
                                                      {'sportDetails':
                                                           {
                                                                'sportType': team_detail.sport_type,
                                                                'sportCode': team_detail.sport_code,
                                                                'divisionCode': team_detail.division,
                                                                'divisionConstant': team_detail.division_const,
                                                                #'ncaaUri': team_detail.team_href
                                                           }
                                                      }
                                                 }
                                                )
                    #logger.info("Updated document successfully for played year.." + roster_detail.roster_seq_id)
                #mongo_sport_details = team_available[0]['sportDetails']
                #sport_details = []
                #for mongo_sport_detail in mongo_sport_details:
                #    sport_details.append(mongo_sport_detail['sportCode'])

                #if team_detail.sport_code not in sport_details:
                #    self.mongo_collection.update({"teamCode": team_detail.team_code},
                #                                 {"$push":
                #                                     {'sportDetails':
                #                                         {
                #                                             'sportType': team_detail.sport_type,
                #                                             'sportCode': team_detail.sport_code
                #                                         }
                #                                     }
                #                                 }
                #                                 )
                #time.sleep(10)

    def close_connection(self):
        if self.mongo_client is not None:
            self.mongo_client.close()


class TeamScrapper(object):

    def __init__(self, sport_code, year, division):
        self.sport_code = sport_code
        self.year = year
        self.division = division
        # divisions - division=2 => II
        #             division=3 => III
        #             division=11 => FBS
        #             division=12 => FCS
        self.url = "https://stats.ncaa.org/team/inst_team_list?academic_year=" + year + "&conf_id=-1&division=" + division + "&sport_code=" + sport_code
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
                team_details = TeamDetails(link.get('href'), team_code, link.string, self.sport_code, self.division)
                teams.append(team_details)

        return teams

    def scrape(self):
        self._get_page()
        self._soupify()
        return self._parse()


class TeamDetails(object):
    '''Class to store the data scrape for team'''
    def __init__(self, team_href, team_code, team_name, sport_code, division):
        self.team_href = team_href
        self.team_code = team_code
        self.team_name = team_name
        self.sport_code = sport_code
        self.division = division
        self.division_const = division_const_dict.get(division)
        self.sport_type = sport_code_name_dict.get(sport_code)


class ScheduleScrapper(object):
    """Captures data for a team """

    def __init__(self, team_url, team_code, year, sport_code, team_name):
        super(ScheduleScrapper, self).__init__()
        self.sport_code = sport_code
        self.team_code = str(team_code)
        self.year = year
        self.url = team_url
        self.team_name = team_name
        # https://stats.ncaa.org/teams/113638
        # The url is constructed from the history
        self.page = ""
        self.cache_store = CacheStore()
        self.cache_filename = self.sport_code + "_" + self.team_code + "_" + year + "_div-" + division + "_" + "schedule_page.html"

    def _get_page(self):

        if self.cache_store.get_cache(self.cache_filename):
            self.page = self.cache_store.get_cache(self.cache_filename)
            print "Got Page from Cache: " + self.cache_filename
            return

        print "Getting page from NCAA Site: " + self.url
        r = requests.get(self.url)
        self.page = self.cache_store.store_cache(self.cache_filename, r.text)

    def _soupify(self):
        self.soup = BeautifulSoup(open(self.page), "html.parser", from_encoding="utf-8")

    def _parse(self):
        # parsing Head coach information.
        coach_div = self.soup.find("div", {"id": "head_coaches_div"})
        coach_name = coach_a_href = 'N/A'
        if coach_div is not None:
            coach_name = coach_div.find('a').text.strip()
            coach_a_href = coach_div.find('a').get('href').strip()
        # we will get the first table
        table = self.soup.find('table', {'class': 'mytable'})
        # tbody = table.find('tbody')
        trs = table.findAll('tr')
        #print "Length " + str(len(trs))
        counter = 0
        schedules = []
        for tr in trs:
            if counter < 2:  # first two rows are just headers
                counter = counter + 1
                continue
            tds = tr.findAll('td')
            game_date = tds[0].renderContents().strip()
            opponent_team = None
            opponent_team_code = 'N/A'
            if tds[1].find('a') :
                opponent_team = self._get_oppoent_team_name(tds[1].find('a').text.strip())
                opponent_team_link = tds[1].find('a').get('href').strip()
                opponent_team_code = opponent_team_link.split('/')[2]
            else :
                opponent_team = self._get_oppoent_team_name(tds[1].text.strip())


            game_result = None
            if tds[2].find('a') :
                game_result = tds[2].find('a').text.strip()
            else :
                game_result = tds[2].text.strip()



            #print game_date + " " + self.team_code + " " + opponent_team + " " + opponent_team_link + " " + opponent_team_code \
            #      + " " + game_result + " " + coach_name + " " + coach_a_href

        return schedules

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

# TODO: Has to do for all the teams one by one and slow.
# TODO: the number 721 should come from the previous scrape.


sport_codes = sport_codes.split(",")
time_keeper = TimeKeeper()
mongo_handler = MongoDBHandler(mongo_url, mongo_db, mongo_collection)

for sc in sport_codes:
    divisions = sports_divisions.split(",")
    start_time = int(round(time.time()))
    for div in divisions:
        sport_years = years.split(",")
        cache_store = CacheStore()
        file_exists_in_cache = True
        logger.info("\n\n")
        for yr in sport_years:
            try:
                if not time_keeper.has_time_expired(ncaa_url):
                    logger.info("****** sleep for " + str(sleep_duration) + " seconds.")
                    time.sleep(sleep_duration)

                cache_filename = sc + "_" + yr + "_div-" + div + "_" + "team_mainpage.html"
                if cache_store.get_cache(cache_filename) is None:
                    file_exists_in_cache = False

                team_scrapper = TeamScrapper(sc, yr, div)
                teams = team_scrapper.scrape()

                logger.info("Total Teams found: " + str(len(teams)) + " for year: " + yr + ", for division: " + div + ", for sport code: " + sc)
                for team_details in teams:
                    team_url = ncaa_url + team_details.team_href
                    schedule_scrapper = ScheduleScrapper(team_url, team_details.team_code, yr, sc, team_details.team_name)
                    schedules = schedule_scrapper.scrape()


                #mongo_handler.insert_into_mongo(teams)

                if not file_exists_in_cache:
                    time_keeper.update_last_access_time(ncaa_url)
                    file_exists_in_cache = True

            except Exception as e:
                logger.error(e.message)
                logging.exception("%%%%%%%%%%% Not able to complete process for SC: " + sc + ", year:" + yr + ", division:" + div)
                logging.error("%%%%%%%%%%% Not able to complete process for SC: " + sc + ", year:" + yr + ", division:" + div)
                logging.error(e, exc_info=True)
                if not file_exists_in_cache:
                    time.sleep(30)  # wait for 1 min in case of errors.
        #else:
         #   logger.info("\n\n>>>>>>> No Teams found for the given year: " + yr)

        end_time = int(round(time.time()))
        logger.info("Time took to complete division: " + div + ", seconds: " + str(end_time - start_time) + "\n")

mongo_handler.close_connection()