import xml.etree.ElementTree as ET
import datetime
import re
import os
import sys
import getopt
import csv
import random


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

def return_drive_start(root):
    #Checks to see if code attribute exists in team subelement
    #And uses dictionary lookup to find team code if missing
    team_dict = {}
    conf_dict = {}
    with open('team_id.csv') as csvfile:
        teamreader = csv.reader(csvfile)
        for row in teamreader:
            team_dict[row[0]] = row[1]
            conf_dict[row[0]] = row[2]

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

def return_plays(root):
    #Returns last play of previous drive and last play of current drive in list of lists
    temp_play_count = -1
    temp_drives_count = -1
    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for play in qtr.iter('play'):
                drive_counter = int(play.attrib['playid'].replace(",", " ").split()[0])
                play_counter = int(play.attrib['playid'].replace(",", " ").split()[1])
                if(play_counter>temp_play_count):
                    temp_play_count = play_counter
                if(drive_counter>temp_drives_count):
                    temp_drives_count = drive_counter

    w, h = temp_play_count + 1, temp_drives_count + 1
    matrix = [[None for x in range(w)] for y in range(h)] 

    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for play in qtr.iter('play'):
                #Setting quarter key-value pair in play
                play.set('quarter', qtr.attrib['number'])
                drive_counter = int(play.attrib['playid'].replace(",", " ").split()[0])
                play_counter = int(play.attrib['playid'].replace(",", " ").split()[1])
                matrix[drive_counter][play_counter] = play

    #https://stackoverflow.com/questions/27436159/how-can-i-remove-none-elements-from-list-of-lists#
    new_matrix = []
    for sublist in matrix:
        cleaned = [elem for elem in sublist if elem is not None]
        if len(cleaned):  # anything left?
            new_matrix.append(cleaned)

    first_and_last = []

    for a in range(1, temp_drives_count + 1):
        last_previous = new_matrix[a-1][-1]
        '''
        If the last play in a drive is a kickoff, then use the 
        second to last play as the last play of that drive 
        '''

        '''
        If the drive has 3 or more plays AND the last play is a kickoff
        AND the second to last play is an extra point attempt "X"
        then the last play of the drive is the third to last play 
        (usually a touchdown)
        '''

        if (len(new_matrix[a]) >= 3 and new_matrix[a][-1].attrib['type'] == 'K' and new_matrix[a][-2].attrib['type'] == 'X'):
            last_current = new_matrix[a][-3]
        elif(new_matrix[a][-1].attrib['type'] == 'K'):
            last_current = new_matrix[a][-2]
        else:
            last_current = new_matrix[a][-1]
        #if previous_drive_last_play != None:
        print last_previous.attrib['context']
        first_and_last.append([last_previous, last_current])

    '''
    First part of each element is the last play of the previous drive
    Second part of each element is the last play of the current drive
    '''
    return first_and_last

def return_team_start_spot_array(root):
    #returns an array with the team id + starting position of each drive
    hv_dict = {}
    team_start_spot_array = []
    
    for team in root.iter('team'):
        if(team.attrib['vh'] == 'V'):
            hv_dict['V'] = team.attrib['id']
        if(team.attrib['vh'] == 'H'):
            hv_dict['H'] = team.attrib['id']

    for plays in root.iter('plays'):
        for qtr in plays.iter('qtr'):
            for drivestart in qtr.iter('drivestart'):
                team_start_spot_array.append(hv_dict[drivestart.attrib['spot'][0]] + drivestart.attrib['spot'][1:])
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
        team = zipped[i][2][1].attrib['hasball']
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

    root = add_sport_tag(_root)
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
                new_destination = output_dir_name + "/" + _file.split('/')[-1]
                if(output(_file) is False):
                    pass
                else:
                    print(_file)
                    tree = ET.ElementTree(output(_file))
                    tree.write(new_destination)
                #file_names.append(os.path.join(root, name))
        
    # for _file in file_names:
    #     new_destination = output_dir_name + '/' +  _file.split('/')[-1]
    #     if(output(_file) is False):
    #         pass
    #     else:
    #         print(_file)
    #         tree = ET.ElementTree(output(_file))
    #         tree.write(new_destination)


def help():
    print 'batch_add_drive_play.py -u <uncorrected folder path> -o <output folder path>'

def main(argv):
    dir_name = ""
    output_dir_name=""
    try:
      opts, args = getopt.getopt(argv,"hu:o:",["uncorrected=","output="])      
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