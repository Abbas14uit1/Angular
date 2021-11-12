#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Tue Apr 24 23:41:32 2018

@author: srini
This code is to generalize max number of consecutive games with  at least 1 defense interception

Fields required:

Streak Entity Type, Streak Entity Name, Streak Time Bucket, Streak_Stat_Group, Streak_Stat_Value


"""

from pymongo import MongoClient
import pandas as pd
import numpy as np

client = MongoClient('localhost', 27017)

db = client.newdbs

print "Collection Names present in Db:", db.collection_names()

''' [u'plays', u'games', u'teams', u'players', u'users']'''

team_col = db['teams']

print team_col.find_one().keys()

''' [u'tidyName', u'code', u'name', u'players', u'games', u'_id'] '''

# TODO - should also keep track of start & end of streak
# TODO - also needs to find second, third, and so on(till fifth best) best streak.
# TODO - find best, second best, current streak, last known streak
# Srini will check for current streak,
# Eg:
# W W W L W W W W W L L L W W L L L L L L W
# 1 1 1 0 1 1 1 1 1 0 0 0 1 1 0 0 0 0 0 0 1
# 5 - 4,8 - is result - best streak - range
# 3 - 0,2 - is result - second best streak

def streak(binary_list):
    max_list = [0 for _ in range(len(binary_list))]

    for i, flag in enumerate(binary_list):
        if flag > 0:
            max_list[i] = max_list[i - 1] + 1
        else:
            max_list[i] = 0
    return max_list

# Entity_Type - Team or Player
# Entity_Code - Team ID or Player ID
# DefInt - DefenceInterception
# filter - by season, location,
# Batch, lambda in AWS

def game_def_int(Entity_Type, Entity_Code, SuperL="DefInt", print_seq=False):
    # Fields lists to be initiated
    game_dates = []
    game_count = 0
    game_list = []
    opp_names = []
    game_ids = []
    if Entity_Type in ['Team', 'TEAM', 'team']:
        docs = db['teams'].find({"code": Entity_Code})
    elif Entity_Type in ['Players', 'Player', 'PLAYERS', 'PLAYER', 'players', 'player']:
        docs = db['players'].find({"name": Entity_Code})
    else:
        print "Entity Type could not be resolved with Entity Code. Please re-enter"
        return

    for item in docs:
        for game in item['games']:
            if game['gameId'] in ['5a32c0715c57a67916269d91', '5a3e62475c57a6791626b3fe']:
                continue
            if SuperL == "DefInt":
                check_logic = game['totals']['defense']['dInt']
            elif SuperL == "PRTd":
                check_logic = game['totals']['puntReturn']['prTd']
            else:
                check_logic = game['totals']['punt']['puntBlocked']

            if check_logic > 0:
                game_count = 1
            else:
                game_count = 0

            game_list.append(game_count)
            game_dates.append(game['gameDate'])
            opp_names.append(game['opponentName'])
            game_ids.append(game['gameId'])

    # print "Total games played by {0}:{1}".format(Entity_Code,len(game_list))

    df = pd.DataFrame(np.column_stack([game_list, game_dates, opp_names, game_ids]),
                      columns=['Event_Flag', 'game_date', 'opp_name', 'game_id'])

    df = df.sort_values('game_date', ascending=True, axis=0)

    df.reset_index(inplace=True)

    # df['count'] = df.groupby((df['Event_Flag'] != df['Event_Flag'].shift(1)).cumsum()).cumcount()+1
    df['count'] = streak(df['Event_Flag'].tolist())

    if print_seq == True:
        print df.iloc[df['count'].values.argmax() - df['count'].max() + 1,]
        print df.iloc[df['count'].values.argmax(),]
        print df['count'].max()

    else:
        return df


# SuperLative used - DefInt , PRTd
# 5a32c0715c57a67916269d91, 5a3e62475c57a6791626b3fe

chk1_defint = game_def_int('Team', 8, "DefInt", False)
chk1_prtd = game_def_int('Team', 8, "PRTd", False)
chk1_punt_blk = game_def_int('Team', 8, "chk", False)

# Defense Interceptions
chk1_defint = game_def_int('Team', 8, "DefInt", True)
# Punt return with TD
chk1_prtd = game_def_int('Team', 8, "PRTd", True)
# Default is Punt Blocked in successive games
chk1_punt_blk = game_def_int('Team', 8, "chk", True)

chk1_defint = game_def_int('Team', 697, "DefInt", True)
chk1_prtd = game_def_int('Team', 697, "PRTd", True)
chk1_punt_blk = game_def_int('Team', 697, "chk", True)

chk1_defint = game_def_int('Team', 697, "DefInt", False)
chk1_prtd = game_def_int('Team', 697, "PRTd", False)
chk1_punt_blk = game_def_int('Team', 697, "chk", False)

