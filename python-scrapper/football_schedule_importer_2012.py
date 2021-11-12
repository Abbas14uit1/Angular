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

sport_code = "MFB"
year = "2012"
# for year 2012 - we need handle it separately bcz oppo team does not have anchor tag & result is not available
mongo_url = 'localhost:27017'
mongo_db = 'athlyte'
mongo_collection = 'GameSchedules'

db_name = 'time_cacher_db.json'
sleep_duration = 20
ncaa_url = "https://stats.ncaa.org"


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
        self.base_cache_location = "cache/"
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

    def insert_into_mongo(self, schedule_details):
        for schedule_detail in schedule_details:
            data_available = self.mongo_collection.find({"$and":[{'gameDate': schedule_detail.game_date},
                                                           {'teamCode': schedule_detail.team_code},
                                                           {'oppoTeamCode': schedule_detail.oppo_team_code}]})
            if data_available.count() == 0:
                self.mongo_collection.insert({'gameCode': schedule_detail.game_code,
                                              'gameDate': schedule_detail.game_date,
                                              'season': schedule_detail.season,
                                              'teamCode': schedule_detail.team_code,
                                              'teamName': schedule_detail.team_name,
                                              'oppoTeamName': schedule_detail.oppo_team_name,
                                              'oppoTeamCode': schedule_detail.oppo_team_code,
                                              'gameLocation': schedule_detail.game_location,
                                              'locationDetails': schedule_detail.location_details,
                                              'gameResult': {'result': schedule_detail.result,
                                                             'teamScore': schedule_detail.team_score,
                                                             'oppoScore': schedule_detail.oppo_score
                                                            },
                                              'coachDetails': {'Name': schedule_detail.coach_name,
                                                                'Uri': schedule_detail.coach_uri
                                                               },
                                              'ncaauri': schedule_detail.ncaauri
                                              })
                #print 'Record Inserted Successfully. For Data:' + schedule_detail.game_date + ', for team code:' + schedule_detail.team_code
            #else:
                #print 'Record Already available. For Data:' + schedule_detail.game_date + ', for team code:' + schedule_detail.team_code \
                #      + ', for oppo team code:' + schedule_detail.oppo_team_code

    def close_connection(self):
        if self.mongo_client is not None:
            self.mongo_client.close()


class TeamScrapper(object):

    def __init__(self, sport_code, year):
        self.sport_code = sport_code
        self.year = year
        self.url = "https://stats.ncaa.org/team/inst_team_list?academic_year=" + year + "&conf_id=-1&division=11&sport_code=" + sport_code
        self.page = None
        self.soup = None
        self.cache_store = CacheStore()
        self.cache_filename = sport_code + "_" + year + "_" + "team_mainpage.html"

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
                team_details = TeamDetails(link.get('href'), team_code, link.string)
                teams.append(team_details)

        return teams

    def scrape(self):
        self._get_page()
        self._soupify()
        return self._parse()


class TeamDetails(object):
    '''Class to store the data scrape for team'''
    def __init__(self, team_href, team_code, team_name):
        self.team_href = team_href
        self.team_code = team_code
        self.team_name = team_name


class TeamPlayHistory(object):
    """Captures data for a team """

    def __init__(self, sport_code, team_code):
        super(TeamPlayHistory, self).__init__()
        self.sport_code = sport_code
        self.team_code = str(team_code)
        # https://stats.ncaa.org/teams/history/MFB/721
        self.url = "https://stats.ncaa.org/teams/history/" + sport_code + "/" + self.team_code
        self.page = ""
        self.cache_store = CacheStore()
        self.cache_filename = self.sport_code + "_" + self.team_code + "_" + "team_historypage.html"

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
        table = self.soup.find('table', {'class': 'mytbl dataTable'})
        tbody = table.find('tbody')
        trs = tbody.findAll('tr')
        for tr in trs:
            tds = tr.findAll('td')
            link_to_year = tds[0].find('a').get('href').strip()
            year = tds[0].find('a').string.strip()
            coach = tds[1].find('a').string.strip()
            coach_link = tds[1].find('a').get('href').strip()
            division = tds[2].renderContents().strip()
            conference = tds[3].renderContents().strip()
            print link_to_year + " " + year + " " + coach_link + " " + coach + " " + division + " " + conference

    def scrape(self):
        self._get_page()
        self._soupify()
        self._parse()


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
        self.cache_filename = self.sport_code + "_" + self.team_code + "_" + year + "_" + "schedule_page.html"

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
            opponent_team = tds[1].text.strip()
            opponent_team_link = 'N/A'#tds[1].find('a').get('href').strip()
            opponent_team_code = 'N/A' #opponent_team_link.split('/')[2]
            game_result = None
            if tds[2].find('a') :
                game_result = tds[2].find('a').text.strip()
            else :
                game_result = tds[2].text.strip()

            schedule = ScheduleDetails(game_date, self.team_code, self.team_name, self.url, opponent_team, opponent_team_code,
                                       game_result, coach_name, coach_a_href, sport_code, self.year)
            schedules.append(schedule)
            #print game_date + " " + self.team_code + " " + opponent_team + " " + opponent_team_link + " " + opponent_team_code \
            #      + " " + game_result + " " + coach_name + " " + coach_a_href

        return schedules

    def scrape(self):
        self._get_page()
        self._soupify()
        return self._parse()


class ScheduleDetails(object) :
    '''Class to store the data scrape for team'''
    def __init__(self, game_date, team_code, team_name, team_schedule_uri, opponent_team, opponent_team_code, game_result,
                 coach_name, coach_a_href, sport_code, season):
        self.game_code = sport_code
        self.game_date = game_date
        self.season = season
        self.team_code = team_code
        self.team_name = team_name
        self.oppo_team_name = self._get_oppo_team_name(opponent_team) # get Name.
        self.oppo_team_code = opponent_team_code
        self.game_location = self._get_game_location(opponent_team) # get Location.
        self.location_details = 'N/A' # get location details.
        self.result = self._get_game_result(game_result) # get result
        self.team_score = self._get_team_score(game_result) # get team score
        self.oppo_score = self._get_oppo_score(game_result) # get oppp score
        self.coach_name = coach_name
        self.coach_uri = ncaa_url + coach_a_href
        self.ncaauri = team_schedule_uri

    def _get_oppo_team_name(self, opponent_team):
        if '@' not in opponent_team:
            return opponent_team
        index = opponent_team.index('@')
        if index == 0:
            return opponent_team[1:].strip()

        return opponent_team[:index].strip()

    def _get_game_location(self, opponent_team):
        if '@' not in opponent_team:
            return 'Home'
        index = opponent_team.index('@')
        if index == 0:
            return 'Away'

        return 'Neutral'

    def _get_game_result(self, game_result):
        if len(game_result) < 6 :
            return ''

        if game_result[:1].strip() == 'W':
            return 'Win'

        return 'Lose'

    def _get_team_score(self, game_result):
        h_index = game_result.index('-')
        return game_result[2:h_index].strip()

    def _get_oppo_score(self, game_result):
        h_index = game_result.index('-')
        return game_result[h_index+1 : len(game_result)].strip()


# TODO: Has to do for all the teams one by one and slow.
# TODO: the number 721 should come from the previous scrape.
years = year.split(",")
cache_store = CacheStore()
file_exists_in_cache = True
for yr in years:
    team_scrapper = TeamScrapper(sport_code, yr)
    teams = team_scrapper.scrape()
    time_keeper = TimeKeeper()
    mongo_handler = MongoDBHandler(mongo_url, mongo_db, mongo_collection)
    print "Total Teams found: " + str(len(teams)) + " for year: " + yr
    i = 0
    for team in teams:
        try:
            if not time_keeper.has_time_expired(ncaa_url):
                print "****** sleep for " + str(sleep_duration) + " seconds."
                time.sleep(sleep_duration)

            #history_scrapper = TeamPlayHistory(sport_code, 721)
            #history_scrapper.scrape()
            cache_filename = sport_code + "_" + team.team_code + "_" + yr + "_" + "schedule_page.html"

            if cache_store.get_cache(cache_filename) is None:
                file_exists_in_cache = False

            team_url = ncaa_url + team.team_href
            print "scraping for team href: " + team.team_href + " & team code: " + team.team_code + ", full URL: " + team_url
            schedule_scrapper = ScheduleScrapper(team_url, team.team_code, yr, sport_code, team.team_name)
            schedules = schedule_scrapper.scrape()
            mongo_handler.insert_into_mongo(schedules)
            i += 1
            print "Completed data insertion in Mongo DB for index: " + str(i) + ", Total Schedules: " + str(len(schedules)) + "\n"

            if not file_exists_in_cache:
                time_keeper.update_last_access_time(ncaa_url)
            #for schedule in schedules :
            #    print schedule.oppo_team_name + " " + schedule.game_location + " " + schedule.result + " " + schedule.team_score + " " + schedule.oppo_score
        except Exception as e:
            print "%%%%%%%%%%% Not able to complete process for URL: " + team_url
            traceback.print_exc()
            print e
            time.sleep(60) # wait for 1 min in case of errors.
    else:
        print "\n\n>>>>>>> No Teams found for the given year: " + yr

    mongo_handler.close_connection()