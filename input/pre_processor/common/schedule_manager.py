from pymongo import MongoClient
from ast import literal_eval
import logging

class ScheduleManager:
	"This is a ScheduleManager class to manage the game schedule"
	
	def __init__(self,mongo_host = "localhost",port = 27017, database = "athlyte", user="", password="",schedule_collection="GameSchedules",):
		self.logger= logging.getLogger(__name__)
		self.mongo_host = mongo_host
		self.mongo_port = port
		self.database = database
		self.collection = schedule_collection
		self.user = user
		self.password = password

	def _get_client(self):
		#print "Connecting to " + self.mongo_host + " PORT " + str(self.mongo_port)
		client = MongoClient(self.mongo_host, self.mongo_port)
		if self.user and self.password:
			client.athlyte_shared.authenticate(self.user, self.password)
		return client.athlyte_shared

	def _insert_game_schedule(self, sport_code, team_code, team_name, team_score, opponent_team_code, opponent_team_name, opponent_score, game_date, season):
		db = self._get_client()
		sport_type = "N/A"
		if sport_code == "MFB":
			sport_type = "Football"

		data = {"ncaauri": "schedule", "season": str(season), "oppoTeamCode": opponent_team_code, "oppoTeamName": opponent_team_name, "gameResult": {"teamScore": team_score, "oppoScore": opponent_score}, "locationDetails": "N/A", "teamName": team_name, "teamCode": team_code, "gameDate": str(game_date.strftime("%m/%d/%Y")), "sportCode": sport_code, "sportType": sport_type }
		result = db[self.collection].insert(data)

	def _update_game_schedule(self, sport_code, team_code, opponent_team_code, game_date, status):
		db = self._get_client()
		#print "Attempting to update schedule  with status " + status
		update = 2
		result = db[self.collection].find_and_modify({"$and": [{"teamCode":str(team_code)}, {"oppoTeamCode":str(opponent_team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {'$set': {'status': status}})
		#some times the opponent team info does not exist. So we need to take care of this condition as well.

		if result is None:
			result = db[self.collection].find_and_modify({"$and": [{"teamCode":str(team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {'$set': {'status': status, "oppoTeamCode":str(opponent_team_code)}})

		if result is None:
			update -=1
			self.logger.info("Main game not found in schedule " +sport_code + " " + str(team_code) + " " + str(opponent_team_code) + " " + str(game_date.strftime("%m/%d/%Y")))
		
		result1 = db[self.collection].find_and_modify({"$and": [{"teamCode":str(opponent_team_code)}, {"oppoTeamCode":str(team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {'$set': {'status': status}})	
		
		if result1 is None:
			result1 = db[self.collection].find_and_modify({"$and": [{"teamCode":str(opponent_team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {'$set': {'status': status, "oppoTeamCode":str(team_code)}})
		
		if result1 is None:
			update -=1
			self.logger.info("Opponent game not found in schedule " +sport_code + " " + str(team_code) + " " + str(opponent_team_code) + " " + str(game_date.strftime("%m/%d/%Y")))
		
		if update == 2:
			#print "Completed updating schedule"
			return True

		if update == 1:
			#print "Warining updated only one schedule"
			return True

		return False


	def _update_game_type(self, sport_code, team_code, opponent_team_code, game_date, game_type_array):
		db = self._get_client()
		
		update = 2
		result = db[self.collection].find_and_modify({"$and": [{"teamCode":str(team_code)}, {"oppoTeamCode":str(opponent_team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {'$addToSet': {'gameType': {"$each": game_type_array } }})
		
		if result is None:
			result = db[self.collection].find_and_modify({"$and": [{"teamCode":str(team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {"$addToSet": {"gameType": {"$each": game_type_array } }})

		if result is None:
			update -=1
			self.logger.info("Main game not found in schedule " +sport_code + " " + str(team_code) + " " + str(opponent_team_code) + " " + str(game_date.strftime("%m/%d/%Y")))
		
		result1 = db[self.collection].find_and_modify({"$and": [{"teamCode":str(opponent_team_code)}, {"oppoTeamCode":str(team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {"$addToSet": {"gameType": {"$each": game_type_array } }})	
		
		if result1 is None:
			result1 = db[self.collection].find_and_modify({"$and": [{"teamCode":str(opponent_team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]}, {"$addToSet": {"gameType": {"$each": game_type_array } }})
		
		if result1 is None:
			update -=1
			self.logger.info("Opponent game not found in schedule " +sport_code + " " + str(team_code) + " " + str(opponent_team_code) + " " + str(game_date.strftime("%m/%d/%Y")))
		
		if update == 2:
			#print "Completed updating schedule"
			return True

		if update == 1:
			#print "Warining updated only one schedule"
			return True

		return False


	def _find_schedule(self, sport_code, team_code, opponent_team_code, game_date):
		db = self._get_client()
		schedule_list = []
		result = db[self.collection].find_one({"$and": [{"teamCode":str(team_code)}, {"oppoTeamCode":str(opponent_team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]})
		if not result:
			result = db[self.collection].find_one({"$and": [{"teamCode":str(opponent_team_code)}, {"oppoTeamCode":str(team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]})
		if not result:
			result = db[self.collection].find_one({"$and": [{"teamCode":str(team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]})
		if not result:
			result = db[self.collection].find_one({"$and": [{"teamCode":str(opponent_team_code)}, {"sportCode": sport_code}, {"gameDate": str(game_date.strftime("%m/%d/%Y"))}]})

		return result

	def find_missing_team_code(self):
		db = self._get_client()
		return db[self.collection].find({"$or": [{"teamCode": "N/A"},{"oppoTeamCode": "N/A"}]})
		

	def update_team_code(self, id, team_code, opponent_team_code):
		db = self._get_client()
		result = db[self.collection].find_and_modify({"_id": id}, {"$set": {"oppoTeamCode": opponent_team_code, "teamCode": team_code}})

	def get_team_code(self, team_name):
		db = self._get_client()
		result = db[self.collection].find_one({"teamName": team_name})
		if result is None:
			return "N/A"
		return result['teamCode']

	def got_file(self, sport_code, team_code, opponent_team_code, game_date):
		self._update_game_schedule(sport_code, team_code, opponent_team_code, game_date, "started")

	def preprocess_success(self, sport_code, team_code, opponent_team_code, game_date):
		self._update_game_schedule(sport_code, team_code, opponent_team_code, game_date, "preprocess_success")

	def preprocess_failed(self, sport_code, team_code, opponent_team_code, game_date):
		self._update_game_schedule(sport_code, team_code, opponent_team_code, game_date, "preprocess_failed")

	def upload_success(self, sport_code, team_code, opponent_team_code, game_date):
		self._update_game_schedule(sport_code, team_code, opponent_team_code, game_date, "upload_success")

	def upload_failed(self, sport_code, team_code, opponent_team_code, game_date):
		self._update_game_schedule(sport_code, team_code, opponent_team_code, game_date, "upload_failed")


	def get_schedule_data_with_season(self, sport_type, team_code, season):
		db = self._get_client()
		result = db[self.collection].find({"$and":[{"sportCode": sport_type } , {"season": int(season)} , {"$or": [{"teamCode": team_code}, {"oppoTeamCode": team_code}] } ]})
		return result

	def get_schedule_data_with_status(self, team_code, status = None):
		db = self._get_client()
		result = None
		if status is None:
			result = db[self.collection].find({"$and":[{"teamCode": team_code, "status": { "$exists": False }} ]})
		else:
			result = db[self.collection].find({"$and":[{"teamCode": team_code, "status": status} ]})

		return result

	def get_game_type(self, sport_code, team_code, opponent_team_code, game_date):
		schedule = self._find_schedule(sport_code, team_code, opponent_team_code, game_date)
		if not schedule:
			schedule = self._find_schedule(sport_code, opponent_team_code, team_code, game_date)

		if schedule and "gameType" in schedule:
			return schedule["gameType"]
		else:
			return ["Regular Season"]

	def update_game_type(self, sport_code, team_code, team_name, team_score, opponent_team_code, opponent_team_name, opponent_score, game_date, season, game_type_array):
		if not game_type_array:
			return
		if len(game_type_array) == 0:
			return

		schedule = self._find_schedule(sport_code, team_code, opponent_team_code, game_date)
		if not schedule :
			self._insert_game_schedule(sport_code, team_code, team_name, team_score, opponent_team_code, opponent_team_name, opponent_score, game_date, season)

		self._update_game_type(sport_code, team_code, opponent_team_code, game_date, game_type_array)
