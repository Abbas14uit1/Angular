import xml.etree.ElementTree as ET
import datetime
import re
import os
import sys
import getopt
import csv
import random
import json
import boto3
import traceback
import pymongo
from pymongo import MongoClient
from xml.parsers.expat import ExpatError

hv_dict = {} #home & visitor dictionary
game_date = ""
player_dict = {} #All the player

client = MongoClient('localhost', 27019)


def clean_up():
    global hv_dict
    hv_dict = {};
    global game_date
    game_date = ""    
    global player_dict
    player_dict= {}   
    

def parse_baseball_xml(filename):
    try:
        tree = ET.ElementTree()
        tree = ET.parse(filename)
        root = tree.getroot()
        return root;
    except ExpatError as ex:
        raise ValueError("Invalid XML" )

def get_team_code_from_master(team_name, team_code, team_tag):
    db = client.athlyte
    # print "Find for " + team_name
    #team_data = {}
    if team_code is None or len(team_code) == 0:
        team_data = db.TeamMaster.find_one({"teamName": team_name})        
    else:
        team_data = db.TeamMaster.find_one({"teamCode": team_code})        
    if team_data is not None:        
        team_tag.set('code', team_data['teamCode'])
        team_tag.set('name', team_data['teamName'])
        return
    modified_team_name = team_name.replace("State", "St.")
    team_data = db.TeamMaster.find_one({"teamName": modified_team_name})
    if team_data is not None:
        team_tag.set('code', team_data['teamCode'])
        team_tag.set('name', team_data['teamName'])
        return
    team_data = db.TeamMaster.find_one({"teamNickNames": team_name})
    if team_data is not None:
        team_tag.set('code', team_data['teamCode'])
        team_tag.set('name', team_data['teamName'])
        return

    raise ValueError("Team: <" + team_name + "> not found in team master") 


def set_gamedate(root):
    global game_date
    if(root.find('venue') is not None):
        for venue in root.iter('venue'):
            if('date' in venue.attrib):                
                game_date_string = venue.attrib['date']
                game_date = datetime.datetime.strptime(game_date_string,"%m/%d/%Y")                

def set_hv_dict(team):
    global hv_dict    
    if(team.attrib['vh'] == 'V'):
        hv_dict['V'] = {'id_name':team.attrib['id'],'code':team.attrib['code']}         
    if(team.attrib['vh'] == 'H'):
        hv_dict['H'] = {'id_name':team.attrib['id'],'code':team.attrib['code']}

def add_sport_code(root, sport_code):
    venue_tag = root.find('venue')
    if venue_tag != None:
        venue_tag.set('sportcode', sport_code)

    root.set('sportcode', sport_code)

def add_sport_tag(root):
    sport_element = ET.Element('sport')
    sport_element.set('sport', 'basketball')
    root.insert(0, sport_element)
    return root

def fix_team_code(root):
    for team in root.iter('team'):
        team_code = team.get('code', None)
        get_team_code_from_master(team.attrib['name'], team_code, team)        
        #team.set('code',code)
        set_hv_dict(team)
        team= fix_player_code(team)
    return root

def fix_plays_with_player_code(root_with_team_code):
    for plays in root_with_team_code.iter('plays'):
        for inning in plays.iter('inning'):
            for batting in inning.iter('batting'):
                batting_team = batting.attrib['vh']
                pitching_team = 'V' if batting_team == 'H' else 'H'
                for play in batting.iter('play'):                    
                    play = fix_play_with_player_code(play,batting_team, pitching_team)
    return root_with_team_code

def fix_play_with_player_code(play, batting_team, pitching_team):    
    batter = play.find('batter')
    if batter is not None:        
        batter = fix_play_item(batter, batting_team)
    sub = play.find('sub')
    if sub is not None:
        sub = fix_sub_play_item(sub)
    runner = play.find('runner')
    if runner is not None:
        runner = fix_play_item(runner, batting_team)
    pitcher = play.find('pitcher')
    if pitcher is not None:
        pitcher = fix_play_item(pitcher, pitching_team)
    for fielder in play.iter('fielder'):
        fielder = fix_play_item(fielder, pitching_team)
    return play


def fix_play_item(play_item, vh):    
    if 'name' in play_item.attrib:
        if play_item.attrib['name'] == "/":
            raise ValueError("Found / instead of the name ")
        code = player_dict[vh+"_"+play_item.attrib['name']]['code']
        uni = player_dict[vh+"_"+play_item.attrib['name']]['uni']        
        play_item.set('code',code)
        play_item.set('uni',uni)
    return play_item

def fix_sub_play_item(play_item):
    vh = play_item.attrib['vh']
    if 'for' in play_item.attrib:
        if play_item.attrib['for'] == "/":
            raise ValueError("Found / instead of the name ")
        for_code = player_dict[vh+"_"+play_item.attrib['for']]['code']
        for_uni = player_dict[vh+"_"+play_item.attrib['for']]['uni']
        play_item.set('forcode',for_code)
        play_item.set('foruni',for_uni)
    if 'who' in play_item.attrib:
        if play_item.attrib['who'] == "/":
            raise ValueError("Found / instead of the name ")
        who_code = player_dict[vh+"_"+play_item.attrib['who']]['code']
        who_uni = player_dict[vh+"_"+play_item.attrib['who']]['uni'] 
        play_item.set('whocode',who_code)
        play_item.set('whouni',who_uni)
    return play_item


def fix_player_code(team):
    counter =1
    global player_dict
    for player in team.iter('player'):        
        vh = team.attrib['vh']
        player.set('code',vh+str(counter))
        counter = counter+1        
        
        if vh + "_" + player.attrib['shortname'] in player_dict:
            print "Error: Multiple players with the same shortname "+ vh + " " + player.attrib['shortname'] +". File can not be auto processed. Please fix it manually "
            raise ValueError("Error: Multiple players with the same shortname "+ vh + " " + player.attrib['shortname'] +". File can not be auto processed. Please fix it manually ")
            #sys.exit(2)
        player_dict[vh+"_"+player.attrib['shortname']] = {
            'name': player.attrib['name'],
            'code': player.attrib['code'],
            'uni': player.attrib['uni'],
        }
    return team

def check_if_play_exist(root):
    plays = root.find("plays")
    if plays != None:
        return True
    raise ValueError("Play not found")

'''
This is the first function that starts the file processing. 
'''    

def process(filename,sport_code):
    _root = parse_baseball_xml(filename)
    if(_root.tag != 'bsgame'): 
        return False
    check_if_play_exist(_root)        
    clean_up()
    #TODO: we need to change it later
    set_gamedate(_root)
    add_sport_code(_root, sport_code)
    root_with_sport = add_sport_tag(_root)    
    root_with_team_code=fix_team_code(root_with_sport)    
    root = fix_plays_with_player_code(root_with_team_code)
    return root
    
    
    
    
    #root = update_team_names(root_with_sport)

def update_team_names(root):
    venue = root.find('venue')
    home_code = hv_dict['H']['code']
    visitor_code = hv_dict['V']['code']
    venue.set('homename',team_dict[home_code][0])
    venue.set('visname',team_dict[visitor_code][0])
    for team in root.iter('team'):
        team.set('name',team_dict[team.attrib['code']][0])
        team.set('nickname',team_dict[team.attrib['code']][5])
        team.set('org',team_dict[team.attrib['code']][2])
        team.set('division',team_dict[team.attrib['code']][3])
    return root

def batch_process(input_dir_name, output_dir_name,sport_code):    
    file_names = []
    pass_cnt = 0
    failed_cnt = 0
    not_bb_file = 0
    play_not_available = 0
    team_not_found = 0
    for root, dirs, files in os.walk(input_dir_name):
        for name in files:
             if name.endswith('.xml') or name.endswith(".XML"):
                _file = os.path.join(root,name)
                print("Processing " + _file)
                try:                
                    result = process(_file,sport_code)
                except ValueError as e:                    
                    #print(e.args, "error")
                    errMsg = ",".join(e.args)
                    print errMsg + " :failed processing file " + _file + " failed. skipping the file"
                    if errMsg.startswith('Play not found'):
                        play_not_available = play_not_available + 1
                    elif errMsg.startswith('Team: '):
                        team_not_found = team_not_found + 1
                    else:
                        failed_cnt = failed_cnt + 1
                    continue
                except ExpatError as ex:
                    print "Failed processing file: <" + _file + ">"
                    failed_cnt = failed_cnt +1
                    continue
                except Exception as exp:
                    try:
                        print ",".join(exp.args) + " \nFailed processing file: <" + _file + ">, Skipping the file."
                    except Exception as final_ex: 
                        print "Failed processing file: <" + _file + ">, Skipping the file."
                    traceback.print_exc()
                    failed_cnt = failed_cnt + 1
                    continue

                if(result is False):
                    print("Not a baseball file " + _file)
                    pass
                else:                    
                    #str(team_name + "_" + game_date + "_" + game_num + '.xml')        
                    #print "Here is the date" + game_date            
                    new_filename = str(hv_dict['H']['id_name'] + "_" + hv_dict['V']['id_name'] + "_" + str(game_date.strftime("%m-%d-%Y")) +".xml")
                    #new_filename = "test.xml"
                    new_destination = output_dir_name + "/" + new_filename
                    tree = ET.ElementTree(result)
                    tree.write(new_destination)
                    #store_preprocessed(new_destination,_file)
                    #map_schedule(game_date.strftime("%Y"),_file,new_destination)
                    print("Completed Processing "+ _file)
                    pass_cnt = pass_cnt + 1

    print "\n\nTotal Files Passed: " + str(pass_cnt)
    print "Total Files Failed: " + str(failed_cnt)
    print "Total Files Failed(play tags not available): " + str(play_not_available)
    print "Total Files Failed(Team not found in Master): " + str(team_not_found)
    print "Total Files Failed(Not a baseball): " + str(not_bb_file)

def help():
    print 'preprocess_baseball.py -u <uncorrected folder path> -o <output folder path> -t <sport code>'

def main(argv):
    dir_name = ""
    output_dir_name=""
    sport_code=""
    try:
      opts, args = getopt.getopt(argv,"hu:o:t:",["uncorrected=","output=","sportcode="])      
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)        
    for opt, arg in opts:        
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-u', "--uncorrected"):
            dir_name = arg
        elif opt in ('-o',"--output"):
            output_dir_name = arg
        elif opt in ('-t',"--sportcode"):
            sport_code = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)
    if output_dir_name == "" or dir_name == "" or sport_code == "":
        help()
        sys.exit(2)
    batch_process(dir_name, output_dir_name, sport_code)



if __name__ == "__main__":
    main(sys.argv[1:])
    
