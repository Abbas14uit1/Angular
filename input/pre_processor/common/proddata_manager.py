from pymongo import MongoClient
from ast import literal_eval
import logging

class ProductionDataManager:
	"This is a ScheduleManager class to manage the game schedule"
	
	def __init__(self,mongo_host='ec2-52-15-134-248.us-east-2.compute.amazonaws.com',port = 27017, database = "athlyte", user=None, password=None):
		self.logger= logging.getLogger(__name__)
		self.mongo_host = mongo_host
		self.mongo_port = port
		self.database = database
		self.game_collection = 'games'
		self.play_collection = 'plays'
		self.player_collection = 'players'
		self.team_collection = 'teams'
		self.user = user
		self.password = password

	def _get_client(self):
		#print "Connecting to " + self.mongo_host + " PORT " + str(self.mongo_port)
		client = MongoClient(self.mongo_host, self.mongo_port)
		if self.user and self.password:
			client.athlyte.authenticate(self.user, self.password)
		return client.athlyte

	def get_available_game_schedule(self, sport_code, team_code, season):
		schedule = []
		query = { '$and': [{"sportCode": sport_code}, {'season': int(season)}, {'$or': [{'team.visitor.code': int(team_code)},{'team.home.code': int(team_code)}] } ] }
		#print dumps(query)
		db = self._get_client()
		schedule_data = db[self.game_collection].find(query)
		for game in schedule_data:
			game_data = {}
			game_data['date'] = game['actualDate']
			game_data['visitorCode'] = str(game['team']['visitor']['code'])
			game_data['homeCode'] = str(game['team']['home']['code'])
			game_data['file'] = game['_id']
			game_data['season'] = game['season']
			game_data['home'] = game['team']['home']['name']
			game_data['homeId'] = game['team']['home']['id']
			game_data['visitor'] = game['team']['visitor']['name']
			game_data['visitorId'] = game['team']['visitor']['name']
			schedule.append(game_data)

		return schedule


	def delete_game(self, gameid):
		db = self._get_client()
		db[self.team_collection].update({}, {'$pull': {'games': {'gameId': gameid}} }, multi=True)
		db[self.player_collection].update({}, { '$pull': { 'games': { 'gameId': gameid } } }, multi=True)
		db[self.play_collection].remove({'gameId': gameid}, multi=True)
		db[self.game_collection].remove({'_id': gameid})
