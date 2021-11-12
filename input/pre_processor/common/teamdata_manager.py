from pymongo import MongoClient
from ast import literal_eval
from os import environ
import os
import re
import datetime
import logging
from bson.json_util import dumps
import xml.etree.ElementTree as ET
from pprint import pprint


class TeamDataManager:
    "This is a TeamDataManager class to read information from the team xml data"


    def __init__(self, location, team_master):
        self.logger= logging.getLogger(__name__)
        self.location = location
        self.team_master = team_master
        

    def get_sorted_by_year_folders(self):
        dirs = os.walk(self.location).next()[1]
        #pprint.pprint(dirs, width = 1)
        sorted_dirs = sorted(dirs,key=lambda x: int(x))
        return sorted_dirs

    def _get_game_date(self, root):
        if root.find('venue') is not None:
            for venue in root.iter('venue'):
                if 'date' in venue.attrib:
                    game_date_string = venue.attrib['date']
                    if re.match('\d+/\d+/\d+', game_date_string) is None:
                        raise ValueError("Invalid xml: Date Format invalid ")
                    game_date = datetime.datetime.strptime(game_date_string, "%m/%d/%Y")
        return (game_date, game_date_string)

    def _get_season(self, game_date):
        month = game_date.strftime("%m")
        year = game_date.strftime("%Y")
        if(int(month)<3):
            return int(year) - 1
        return int(year)

    def _parse_game(self, filename):
        tree = ET.ElementTree()
        tree = ET.parse(filename)
        _root = tree.getroot()
        return _root

    def _get_team_data(self, root):
        team_data = {}
        for team in root.iter('team'):
            team_code = team.get('code', None)
            team_id = team.get('id', None)
            team_info = self.team_master.get_team_data_from_master(team.attrib['name'], team_id, team_code)
            if team.attrib['vh'] == 'V':
                team_data['V'] = {'name': str(team_info['teamName']), 'id': str(team.attrib['id']), 'code': str(team_info['teamCode'])}
            if team.attrib['vh'] == 'H':
                team_data['H'] = {'name': str(team_info['teamName']), 'id': str(team.attrib['id']), 'code': str(team_info['teamCode'])}
        return team_data

    def process_xml(self, file, schedule):
        try:        
            _xmlroot = self._parse_game(file)
            (game_date, game_date_string) = self._get_game_date(_xmlroot)
            season = self._get_season(game_date)
            team_data = self._get_team_data(_xmlroot)
           # pprint(team_data, indent=4)
            info = {'file': file, 'date': game_date_string, 'season': season, 'home': team_data['H']['name'], 'homeId': team_data['H']['id'], 'homeCode': team_data['H']['code'], 'visitor': team_data['V']['name'], 'visitorId': team_data['V']['id'], 'visitorCode': team_data['V']['code'] }
            schedule.append(info)
        except:
            print("Error file " + file)
            self.logger.info("Error file " + file)
        return schedule


    '''
        will get the game info of all the files that are in the given folder.
        will accept only the xml or XML extention.
    '''
    def get_schedule(self, folder):
        schedule = []
        for root, dirs, files in os.walk(self.location+"/"+folder):
            for name in files:
                if name.endswith('.xml') or name.endswith(".XML"):
                    _file = os.path.join(root, name)
                    self.logger.info("Processing " + _file)
                    schedule = self.process_xml(_file,schedule)
        return schedule

    def get_schedule_pre_processed(self, season):
        location = self.location + "_Preprocessed"
        schedule = []
        for root, dirs, files in os.walk(location):
            for name in files:
                if name.endswith('.xml') or name.endswith(".XML"):
                    if season in name:
                        _file = os.path.join(root, name)
                        self.logger.info("PreProcessing " + _file)
                        schedule = self.process_xml(_file, schedule)
        return schedule