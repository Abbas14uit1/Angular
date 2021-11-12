from pymongo import MongoClient
import pandas as pd
import numpy as np
from collections import Counter

client = MongoClient('localhost', 27017)

db = client.athlyte

print("Collection Names present in Db:", db.collection_names())

player_col = db['Rosters']

print(player_col.find_one().keys())

print("\nTotal players in collection:{0:,}".format(player_col.count()))

docs = player_col.find()
names = []
teamCode = []
teamName = []
tidyName = []
playerId = []

classes = []
class_count = []
seasons = []
game_count = []
season_count = []
max_season = []
min_season = []

for doc in docs:
    names.append(doc['name'])
    teamCode.append(doc['teamCode'])
    teamName.append(doc['teamName'])
    tidyName.append(doc['tidyName'])
    playerId.append(doc['_id'])

    no_games = 0
    class_list = []
    season_list = []

    for game in doc['games']:
        season_list.append(game['season'] if np.isnan(game['season']) else int(game['season']))
        no_games += 1
        class_list.append(game['playerClass'])

player_data = pd.DataFrame(np.column_stack(
    [names, teamCode, teamName, tidyName, playerId, seasons, season_count, max_season, min_season, game_count, classes,
     class_count]),
                           columns=['names', 'teamCode', 'teamName', 'tidyName', 'playerId', 'seasons', 'season_count',
                                    'max_season', 'min_season', 'total_games', 'uniq_class', 'class_count'])

print("Total names extracted:{0:,}".format(len(player_data)))