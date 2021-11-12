import os
import sys
import getopt
from pymongo import MongoClient

sys.path.append("../common")  

from roster_manager import StageRoster


roster_manager = StageRoster()

client = roster_manager._get_client()

# players_who_need_fix = client.ActiveRoster.find({"playerClass": None})

# player_not_found = 0
# player_found_next_year = 0
# player_found_FR = 0
# for player in players_who_need_fix:
# 	#print "Player " + player["playerName"][0] + "  " + str(player["season"]) + " team code " + str(player["teamCode"])
# 	player_list = roster_manager._player_exists_master_roster("MFB", player["playerName"][0], player["teamCode"], None, player["season"], player["jerseyNumber"], player["jerseyNumber"])
# 	if len(player_list) == 0:
# 		season = player["season"] + 1
# 		player_list = roster_manager._player_exists_master_roster("MFB", player["playerName"][0], player["teamCode"], None, season, player["jerseyNumber"], player["jerseyNumber"])
# 		player_found_next_year += 1
# 	if len(player_list) == 0:
# 		player_not_found += 1
# 		player_found_next_year -=1
# 	if len(player_list) == 1:
# 		for playedDetails in player_list[0]["playerPlayedDetails"]:
# 			if player["season"] == playedDetails["season"]:
# 				print "updating " + player["playerName"][0] 
# 				player_class = playedDetails["collegeYear"]
# 				if player_class == None or player_class == "N/A" or player_class == "":
# 					continue
# 				player_class = player_class.upper()
# 				print "breaking "
# 				client.ActiveRoster.update({"_id": player["_id"]}, {"playerClass": player_class})
# 				break
# 				print "So not here !!!"
# 			if player["season"] + 1 == playedDetails["season"]:
# 				print "update " + player["playerName"][0] + " class " + playedDetails["collegeYear"].upper()
# 				if playedDetails["collegeYear"].upper() == "FR" or playedDetails["collegeYear"].upper() == "SO":
# 					client.ActiveRoster.update({"_id": player["_id"]}, {"playerClass": "FR"})
					
# 				if playedDetails["collegeYear"].upper() == "JR":
# 					client.ActiveRoster.update({"_id": player["_id"]}, {"playerClass": "SO"})
# 				if playedDetails["collegeYear"].upper() == "SR":
# 					client.ActiveRoster.update({"_id": player["_id"]}, {"playerClass": "JR"})
# 		continue
# 	if len(player_list) > 1:
# 		#print player["playerName"][0] + " " + str(len(player_list))
# 		continue
	
	
#print "player not found " + str(player_not_found)
#print "player found next year " + str(player_found_next_year)


players_who_need_fix = client.StageActiveRoster.find({"playerClass": None})
player_found_in_active = 0
player_found_multiple = 0
player_found_FR = 0
for player in players_who_need_fix:
	print "Player " + player["playerName"][0] + "  " + str(player["season"]) + " team code " + str(player["teamCode"])
	
	player_list = roster_manager._player_exists_active_roster("MFB", player["playerName"][0], player["teamCode"], None, player["season"])
	if len(player_list) == 0:
		season = player["season"] + 1
		player_list = roster_manager._player_exists_active_roster("MFB", player["playerName"][0], player["teamCode"], None, season)
		#player_found_next_year += 1
	if len(player_list) == 0:
		continue
		#player_found_next_year -=1
	if len(player_list) == 1:
		player_class = player_list[0]['playerClass']
		uid = player['playerId']
		player_found_in_active += 1
		#active_player_id = player_list[0]['playerClass']
		#roster_manager._update_staged_player_class(uid, player_class)
		#roster_manager._update_active_roster_mapping(player, active_player_id)
		#roster_manager._update_staged_player_status(uid, status, StageRoster.VERIFIED, StageRoster.ACTIVE_CATEFOGY)

		continue
	if len(player_list) > 1:
		player_found_multiple +=1
		#print player["playerName"][0] + " " + str(len(player_list))
		continue

print "Players found " + str(player_found_in_active)
print "Players found multiple " + str(player_found_multiple)