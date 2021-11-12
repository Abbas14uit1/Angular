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
from tinydb import TinyDB, Query


hv_dict = {} #home & visitor dictionary
game_date = ""
team_dict = {} #All the teams data

def add_drive_and_play(root):
    'called adding drive and plays'
    _plays = ET.Element('plays')
    _plays.set('format', 'summary')
    _qtr1 = ET.SubElement(_plays, 'qtr')
    _qtr2 = ET.SubElement(_plays, 'qtr')
    _qtr3 = ET.SubElement(_plays, 'qtr')
    _qtr4 = ET.SubElement(_plays, 'qtr')

    _qtr1.set('number', '1')
    _qtr2.set('number', '2')
    _qtr3.set('number', '3')
    _qtr4.set('number', '4')
    _qtr1.set('text', '1st')
    _qtr2.set('text', '2nd')
    _qtr3.set('text', '3rd')
    _qtr4.set('text', '4th')

    for team in root.iter('team'):
        if(team.attrib['vh'] == 'H'):
            hometeam = team.attrib['id']
            hometeamspot = hometeam + str(35)
        if(team.attrib['vh'] == 'V'):
            visitor = team.attrib['id']
            visitorspot = visitor + str(35)

    play_dict = {}
    play_dict = {'hasball': hometeam, 
    'down': '1', 
    'togo': '1', 
    'spot': hometeamspot,
    'context': 'H,1,1,V35',
    'playid': '0,3,3',
    'type': 'K',
    'tokens': 'KO: 35',
    'text': 'Kickoff',
    'newcontext': 'H,1,1,V35'}

    _play1 = ET.SubElement(_qtr1, 'play', play_dict)
    _play2 = ET.SubElement(_qtr2, 'play', play_dict)
    _play3 = ET.SubElement(_qtr3, 'play', play_dict)
    _play4 = ET.SubElement(_qtr4, 'play', play_dict)

    _drives = ET.Element('drives')
    drive_dict = {}
    drive_dict = {
        'vh': 'H',
        'team': hometeam,
        'start': 'KO,1,15:00,35',
        'end': 'PUNT,1,14:00,61',
        'plays': '1',
        'yards': '1',
        'top': '1:00',
        'start_how': 'KO',
        'start_qtr': '1',
        'start_time': '15:00',
        'start_spot': hometeamspot,
        'end_how': 'PUNT',
        'end_qtr': '1',
        'end_time': '14:00',
        'end_spot': visitorspot,
        'drive_index': '1'}

    _drive = ET.SubElement(_drives, 'drive', drive_dict)

    root.insert(6, _plays)
    root.insert(7, _drive)
    return root

def add_sport_tag(root):
    sport_element = ET.Element('sport')
    sport_element.set('sport', 'american football')
    root.insert(0, sport_element)
    return root

def drive_check(root):
    #Checks to see if xml root has drive element
    return 'drives' in set([x.tag for x in root])

def play_check(root):
    #Checks to see if xml root has plays element
    return 'plays' in set([x.tag for x in root])
    
def play_drive_check(root):
    p_check = play_check(root)
    d_check = drive_check(root)
    if(p_check is False):
        outputstring = 'p'
    elif(p_check is True and d_check is False):
        outputstring = 'd'
    elif(p_check is True and d_check is True):
        outputstring = 'n'
    return outputstring

def set_gamedate(root):
    global game_date
    if(root.find('venue') is not None):
        for venue in root.iter('venue'):
            if('date' in venue.attrib):                
                game_date_string = venue.attrib['date']
                game_date = datetime.datetime.strptime(game_date_string,"%m/%d/%Y")                

def init_team_dict():
    if len(team_dict) != 0:
        return
    with open('team_master.csv') as csvfile:
        teamreader = csv.reader(csvfile)
        for row in teamreader:
            team_dict[row[1]] = row


def return_drive_start(root):
    #Checks to see if code attribute exists in team subelement
    #And uses dictionary lookup to find team code if missing
    # team_dict = {}
    # conf_dict = {}
    # with open('team_id.csv') as csvfile:
    #     teamreader = csv.reader(csvfile)
    #     for row in teamreader:
    #         team_dict[row[0]] = row[1]
    #         conf_dict[row[0]] = row[2]

    #Parses through parsed root XML and returns list of drive starts
    drive_starts = []
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for drivestart in qtr.iter('drivestart'):
                drive_starts.append(drivestart.attrib)
    return drive_starts

def return_drive_sum(root):
    #Parses through parsed root XML and returns list of drive summaries
    drive_summaries = []
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for drivesum in qtr.iter('drivesum'):
                drive_summaries.append(drivesum.attrib)
    return drive_summaries

def add_missing_play_attrib(play,qtr_number):
    if 'quarter' not in play.attrib:
        play.set('quarter', qtr_number)
    if 'hasball' not in play.attrib:         
        play.set('hasball',hv_dict[play.attrib['context'][0]]['id_name'])
    if 'spot' not in play.attrib:         
        play.set('spot',hv_dict[play.attrib['context'][0]]['id_name']) #+ play.attrib['context'].replace(","," ").split()[3][1] + play.attrib['context'].replace(","," ").split()[3][2] )
    if 'down' not in play.attrib:
        play.set('down', play.attrib['context'].replace(","," ").split()[3][1] )
    if 'togo' not in play.attrib:
        play.set('togo', play.attrib['context'].replace(","," ").split()[3][2] )
    return play

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

def return_plays(root):
    #Returns last play of previous drive and last play of current drive in list of lists   
    drive_tuple_dict = {}
    first_and_last = []
    previous_play = previous_drive_last_play = None           
    previous_drive_counter = 0    
    
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            temp_hold_play = None
            
            for play in qtr.iter('play'):
                #Setting quarter key-value pair in play
                play = add_missing_play_attrib(play,qtr.attrib['number'])
                drive_counter = int(play.attrib['playid'].replace(",", " ").split()[0])
                play_counter = int(play.attrib['playid'].replace(",", " ").split()[1])
                if previous_drive_last_play == None:
                    previous_drive_last_play = play
                
                if previous_drive_counter != drive_counter:                    
                    first_and_last.append([previous_drive_last_play,previous_play]) 
                    previous_drive_last_play = previous_play                   
                    temp_hold_play = previous_play = None
                            
                if drive_counter not in drive_tuple_dict:
                    drive_tuple_dict[str(drive_counter)] = {}
                    drive_tuple_dict[str(drive_counter)]['previous_drive_last_play'] = previous_drive_last_play 
                                
                if 'type' in play.attrib and play.attrib["type"] == 'X':
                    temp_hold_play = play
                    #we should not update the previous play. Also drives cant end with X so we are safe to continue.
                    continue
                if 'type' in play.attrib and play.attrib["type"] == 'K' and temp_hold_play !=None and previous_play != None:
                    drive_tuple_dict[str(drive_counter)]['current_last'] = previous_play
                else:
                    drive_tuple_dict[str(drive_counter)]['current_last'] = play
                #always in the last
                previous_play = play
                previous_drive_counter = drive_counter
    #Prepare for the last drive 
    first_and_last.append([previous_drive_last_play,previous_play])

    return first_and_last

def set_team_dict(root):
    global hv_dict
    for team in root.iter('team'):
        if(team.attrib['vh'] == 'V'):
            hv_dict['V'] = {'id_name':team.attrib['id'],'code':team.attrib['code']}
        if(team.attrib['vh'] == 'H'):
            hv_dict['H'] = {'id_name':team.attrib['id'],'code':team.attrib['code']}


def return_team_start_spot_array(root):
    #returns an array with the team id + starting position of each drive
    #hv_dict = {}
    team_start_spot_array = []    

    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for drivestart in qtr.iter('drivestart'):
                team_start_spot_array.append(hv_dict[drivestart.attrib['spot'][0]]['id_name'] + drivestart.attrib['spot'][1:])    
    return team_start_spot_array

def end_time_element(zipped_element):
    '''
    Calculates the end time for each drive by subtracting the time
    of possesion from the starting time for each drive
    Called for each element of zipped list when assembling drive dictionary
    '''
    start_time = zipped_element[0]['clock']
    top = zipped_element[1]['top']
    quarter_start_time = '15:00'

    t1 = datetime.datetime.strptime(start_time, "%M:%S")
    t2 = datetime.datetime.strptime(top, "%M:%S")
    quarter_time = datetime.datetime.strptime(quarter_start_time, "%M:%S")

    #datetime.datetime.strftime(quarter_time - (t2-t1), "%M:%S")
    if(t2 > t1):
        t3 = datetime.datetime.strftime(quarter_time - (t2-t1), "%M:%S")
        return t3
    elif(t1 > t2):
        t3 = (t1 - t2)
        s = (t3.seconds)
        return str(datetime.timedelta(seconds=s))[2:]
    else: #Called when time of possesion == start time. Only encountered in a few cases
        t3 = (t1 - t2)
        s = t3.seconds
        return(str(datetime.timedelta(seconds=s))[2:])

def start_end_how(zipped_element):
    '''
    Parses the tokens from the last play of the previous drive
    and the last play of the current drive using a regular expression
    For example: PUNT:23 returns PUNT
    May need to update this later
    '''
    s = zipped_element[2][0].attrib['tokens'] #take first group before colon
    e = zipped_element[2][1].attrib['tokens'] #take first group before colon
    p = re.compile('^(.*?):')
    start_how = p.search(s).group(0)[:-1]
    end_how = p.search(e).group(0)[:-1]
    return [start_how, end_how]

def assemble_drive_dict(zipped):
    '''
    Assembles drive dictionary that is written into the xml element
    Reads through the zipped list of drive information and assembles each drive element
    '''
    dict_array = []
    temp_dict = dict()

    for i in range(0,len(zipped)):

        '''
        Commented out lines are updated in the next paragraph
        Need to reset dictionary after every loop otherwise interal pointer
        references are not updated
        ''' 
        
        temp_dict = {}
        vh = zipped[i][0]['vh']        
        team = hv_dict[vh]['id_name']
        plays = zipped[i][1]['plays']
        yards = zipped[i][1]['yards']
        top = zipped[i][1]['top']
        start_qtr = zipped[i][2][0].attrib['quarter']
        start_time = zipped[i][0]['clock']
        end_qtr = zipped[i][2][1].attrib['quarter']
        end_spot = zipped[i][2][1].attrib['spot'] #need to parse with team name and position
        drive_index = zipped[i][1]['driveindex']

        #Updated attributes with drive. 
        start_yard = zipped[i][3][-2:]
        end_yard = end_spot[-2:]
        start = start_end_how(zipped[i])[0] + ',' +  start_qtr + ',' + zipped[i][0]['clock'] + ',' + start_yard
        start_how = start_end_how(zipped[i])[0]
        start_spot = zipped[i][3]
        end = start_end_how(zipped[i])[1] +  ',' +  end_qtr + ',' + end_time_element(zipped[i]) + ',' + end_yard
        end_how = start_end_how(zipped[i])[1]
        end_time = end_time_element(zipped[i])

        temp_dict['vh'] = vh
        temp_dict['team'] = team
        temp_dict['start'] = start
        temp_dict['end'] = end
        temp_dict['plays'] = plays
        temp_dict['yards'] = yards
        temp_dict['top'] = top
        temp_dict['start_how'] = start_how
        temp_dict['start_qtr'] = start_qtr
        temp_dict['start_time'] = start_time
        temp_dict['start_spot'] = start_spot
        temp_dict['end_how'] = end_how
        temp_dict['end_qtr'] = end_qtr
        temp_dict['end_time'] = end_time
        temp_dict['end_spot'] = end_spot
        temp_dict['drive_index'] = drive_index
        dict_array.append(temp_dict)

    return dict_array

def create_drive_element(zipped):
    '''
    Creates "drives" element, assembles list of drive elements, and the inserts into
    root xml file after 'FGA' tag
    '''

    drives = ET.Element('drives')

    #call assemble_drive_dict function which returns array of dictionaries corresponding to drives
    drive_dict = assemble_drive_dict(zipped)

    for i in range(len(zipped)):
        drive = ET.SubElement(drives, 'drive', drive_dict[i])

    return drives

def output(filename):
    tree = ET.ElementTree()
    tree = ET.parse(filename)
    _root = tree.getroot()
    
    #############
    if(_root.tag != 'fbgame'): 
        return False
    ##############t
    store_input(filename)
    set_team_dict(_root)
    init_team_dict()
    set_gamedate(_root)
    root_with_sport = add_sport_tag(_root)
    root = update_team_names(root_with_sport)
    
    play_drive_result = play_drive_check(root)
    if play_drive_result == 'n':
        pass #don't do anything if plays and drives are present
    elif play_drive_result == 'p':
        root = add_drive_and_play(root)
    elif play_drive_result == 'd':
        drive_starts = return_drive_start(root)
        drive_summaries = return_drive_sum(root)
        first_and_last = return_plays(root)
        team_start_spot_array = return_team_start_spot_array(root)
        zipped = list(zip(drive_starts, drive_summaries, first_and_last, team_start_spot_array))
        elements_to_insert = create_drive_element(zipped)
        root.insert(6, elements_to_insert)    
    return root

def batch_process_drives(dir_name, output_dir_name):
    file_names = []
    for root, dirs, files in os.walk(dir_name):
        for name in files:
             if name.endswith('.xml') or name.endswith(".XML"):
                _file = os.path.join(root,name)
                print("Processing " + _file)                
                result = output(_file)                
                if(result is False):
                    print("Not a football file " + _file)
                    pass
                else:                    
                    #str(team_name + "_" + game_date + "_" + game_num + '.xml')        
                    #print "Here is the date" + game_date            
                    new_filename = str(team_dict[hv_dict['H']['code']][0] + "_" + team_dict[hv_dict['V']['code']][0] + "_" + str(game_date.strftime("%m-%d-%Y")) +".xml")
                    new_destination = output_dir_name + "/" + new_filename
                    tree = ET.ElementTree(result)
                    tree.write(new_destination)
                    store_preprocessed(new_destination,_file)
                    map_schedule(game_date.strftime("%Y"),_file,new_destination)
                    print("Completed Processing "+ _file)
                #file_names.append(os.path.join(root, name))
        
    # for _file in file_names:
    #     new_destination = output_dir_name + '/' +  _file.split('/')[-1]
    #     if(output(_file) is False):
    #         pass
    #     else:
    #         print(_file)
    #         tree = ET.ElementTree(output(_file))
    #         tree.write(new_destination)

def map_schedule(year,source_file,final_file):
    filename = "schedule/game_" + str(year) +".json"
    print "processing " +filename
    if not os.path.exists(filename):
        print "Failed to find the schedule file"
        update_schedule_info(year,source_file,final_file,False)
        return 


    schedule_array = json.load(open(filename))
    for game in schedule_array:
        if(game['AwayTeam'] == hv_dict['V']['id_name'] and game['HomeTeam'] == hv_dict['H']['id_name']):
             #print "Found the game"
             update_schedule_info(year,source_file,final_file,True)
    return 
 
def update_schedule_info(year,source_file,final_file,schedule_info_available):
    db = TinyDB('schedule/schedule_db.json')
    schedule = Query()    

    #hv_dict_1['V'] = {'id_name':"HAWAII",'code':8}
    #hv_dict_1['H'] = {'id_name':"UMASS",'code':736}

    result = db.search((schedule.visitorteam_id_name == hv_dict['V']['id_name']) & (schedule.hometeam_id_name == hv_dict['H']['id_name']))
    print "Found a total of " + str(len(result)) + " records found in the db"
    #if result == []:
    today = datetime.datetime.utcnow().isoformat()
    db.insert({'visitorteam_id_name':hv_dict['V']['id_name'],'hometeam_id_name':hv_dict['H']['id_name'],'visitorteam_code':hv_dict['V']['code'],'hometeam_code':hv_dict['H']['code'],'year':year,'date_preprocessed':today,'source_file':source_file,'final_file':final_file,'schedule_info_available':schedule_info_available})
    #print json.dumps(result)

def get_schedule_report(team_id_name):
    start_year = 1890
    end_year = int(datetime.datetime.utcnow().strftime('%Y'))
    for year in range(start_year,end_year):
        filename = "schedule/game_" + str(year) +".json"
        if not os.path.exists(filename):
           # print "Schedule information not found for year " + str(year)
           print_schedule(None,team_id_name,year)
           continue
        schedule_array = json.load(open(filename))
        for game in schedule_array:
            if(game['AwayTeam'] == team_id_name or game['HomeTeam']==team_id_name):
                print_schedule(game,team_id_name,str(year))

def print_schedule(game,team_id_name,year):
    db = TinyDB('schedule/schedule_db.json')
    schedule = Query()
    result = []
    if game != None:
        result = db.search(((schedule.visitorteam_id_name == game['AwayTeam']) | (schedule.hometeam_id_name == game['HomeTeam'])) & (schedule.year == year))
        if(result):
            print str(year) + " | " + result[0]['visitorteam_id_name'] + " | at " + result[0]['hometeam_id_name'] + " | " + "Preprocessed | " + result[0]['final_file'] 
        else:
            print str(year) + " | " + game['AwayTeam'] + " | at " + game['HomeTeam'] + " | " + "Not Preprocessed | NA" 
    else:
        result = db.search(((schedule.visitorteam_id_name == team_id_name) | (schedule.hometeam_id_name == team_id_name)) & (schedule.year == year))
        if(result):
            print str(year) + " | " + result[0]['visitorteam_id_name'] + " | at " + result[0]['hometeam_id_name'] + " | " + "Not Preprocessed | NA" 


def store_input(filename):
    stage = "football/input"
    upload_to_s3(filename,stage)

def store_preprocessed(filename,original_filename=None):
    stage = "football/pre-processed"
    if original_filename== None:
        upload_to_s3(filename,stage)
        return
    upload_to_s3(filename,stage,{'Key':'original_filename','Value':original_filename} )

def store_uploaded(filename,original_filename=None):
    stage = "football/uploaded"
    if original_filename== None:
        upload_to_s3(filename,stage)
        return
    upload_to_s3(filename,stage,{'Key':'original_filename','Value':original_filename})

def store_upload_failed(filename,original_filename=None):
    stage = "football/upload-failed"
    if original_filename== None:
        upload_to_s3(filename,stage)
        return
    upload_to_s3(filename,stage,{'Key':'original_filename','Value':original_filename})

def upload_to_s3(filename,foldername,tagdict=None):
    # Create an S3 client
    s3 = boto3.client('s3')    
    bucket_name = 'test-gamefiles'
    print "uploading file " + filename + " to " + foldername + "/" + filename.split('/')[-1]
    # Uploads the given file using a managed uploader, which will split up large
    # files automatically and upload parts in parallel.
    s3.upload_file(filename, bucket_name, foldername+"/"+filename.split('/')[-1])
    if tagdict != None:
        s3.put_object_tagging(Bucket=bucket_name, Key=foldername+"/"+filename.split('/')[-1],Tagging={"TagSet":[tagdict]})


def help():
    print 'batch_add_drive_play.py -u <uncorrected folder path> -o <output folder path>  or'
    print 'batch_add_drive_play.py -r <team_id>'

def main(argv):
    dir_name = ""
    output_dir_name=""
    try:
      opts, args = getopt.getopt(argv,"hu:o:r:",["uncorrected=","output=","report="])      
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
        elif opt in ('-r',"--report"):
            get_schedule_report(arg)
            sys.exit(0)
        else:
            print "Error invalid options"
            help()
            sys.exit(2)
    if output_dir_name == "" or dir_name == "" :
        help()
        sys.exit(2)
    batch_process_drives(dir_name, output_dir_name)



if __name__ == "__main__":
    main(sys.argv[1:])
    