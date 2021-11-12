import xml.etree.ElementTree as ET
import datetime
import re
import os
import sys
import getopt
import glob

def log_file_time():
    now = datetime.datetime.now()
    z = str(now.strftime("%Y-%m-%d-%H-%M"))
    return z

def bad_xml_file(filename):
    a = False
    try:
        ET.parse(filename)
    except:
        a = True
    return a

def fbgame_check(root):
    if(root.tag == 'fbgame'):
        return True
    else:
        return False

def get_venue(root):
    return 'venue' in set([x.tag for x in root])

def date_check(root):
    a = True
    if(root.find('venue') is not None):
        for venue in root.iter('venue'):
            if('date' not in venue.attrib):
                a = None
            else:
                try:
                    datetime.datetime.strptime(venue.attrib['date'], "%m/%d/%Y")
                except:
                    a = False
    elif(root.find('venue') is None):
        a = None
    return a

def team_id_list(root):
    some_list = [None, None]
    for _counter, _team in enumerate(root.iter('team')):
        if(_team.attrib['code'] == '' or 'code' not in _team.attrib):
            some_list[_counter] = _team.attrib['name']
    return some_list

def team_count_check(root):
    tags = [x.tag for x in root]
    if(tags.count('team') == 2):
        return True
    else:
        return False

def scores_check(root):
    #Checks to see if xml root has scores element
    return 'scores' in set([x.tag for x in root])

def drives_check(root):
    #Checks to see if xml root has drive element
    return 'drives' in set([x.tag for x in root])

def plays_check(root):
    #print(set(x.tag for x in root))
    return 'plays' in set([x.tag for x in root])

def dnp_check(root):
    #Checks to see if xml root has dnp element
    return 'dnp' in set([x.tag for x in root])

def dnp_count_check(root):
    tags = [x.tag for x in root]
    if(tags.count('dnp') == 2):
        return True
    else:
        return False

def gametracker_check(root):
    #print(set(x.tag for x in root))
    return 'gametracker' in set([x.tag for x in root])  

def number_check(_list):
    c = set(_list)
    d = set([x for x in range(min(_list), max(_list) + 1)])
    return not list(d-c)

def drivestart_drivesum_indexcheck(root):
    if('drives' in set([x.tag for x in root])):
        return True
    
    if('plays' not in set([x.tag for x in root])):
        return None
    else:
        drive_starts = []
        drive_summaries = []
        index1 = []
        for plays in root.iter('plays'):
            for qtr in plays.iter('qtr'):
                for drivestart in qtr.iter('drivestart'):
                    _dstart = int(drivestart.attrib['driveindex'].split(',')[0])
                    drive_starts.append(_dstart)

        for plays in root.iter('plays'):
            for qtr in plays.iter('qtr'):
                for drivesum in qtr.iter('drivesum'):
                    _dsum = int(drivesum.attrib['driveindex'])
                    drive_summaries.append(_dsum)

        for plays in root.iter('plays'):
            for qtr in plays.iter('qtr'):
                for _play in qtr.iter('play'):
                    _p = int(_play.attrib['playid'].split(',')[0])
                    index1.append(_p)
        
        a = number_check(drive_starts)
        b = number_check(drive_summaries)
        c = number_check(index1)

        if(a is False or b is False or c is False):
            return False
        else:
            return True

def output(filename):    
    bad_xml = bad_xml_file(filename)

    if(bad_xml is True):
        print(filename + " Status - BAD cant be repaired"  )
        return 'BAD'
    else:
        tree = ET.ElementTree()
        tree = ET.parse(filename)
        root = tree.getroot()
        #fbgame_check(root)
        if(fbgame_check(root) is False):
            print(filename + " Status - NOTFOOTBALL")
            #TODO: Have to hangle later
            return 'NOT FOOTBALL'
        else:
            print(filename + " Status - OK")
            bad_xml = 'NO'
            sport = "American Football"#str(fbgame_check(root))
            venue = str(get_venue(root))
            date_c = str(date_check(root))
            teamid_c0 = str(team_id_list(root)[0])
            teamid_c1 = str(team_id_list(root)[1])
            teamcount_c = str(team_count_check(root))
            scores_c = str(scores_check(root))
            drives_c = str(drives_check(root))
            plays_c = str(plays_check(root))
            dnp_c = str(dnp_check(root))
            dnpcount_c = str(dnp_count_check(root))
            gametracker_c = str(gametracker_check(root))
            driveindex_c = str(drivestart_drivesum_indexcheck(root))
            return bad_xml + ',' + sport + ',' + venue + ',' + date_c  + ',' + teamid_c0 + ',' + teamid_c1 + ',' + teamcount_c + ',' + scores_c + ',' + drives_c \
            + ',' + plays_c + ',' + dnp_c + ',' + dnpcount_c + ',' + gametracker_c + ',' + driveindex_c

##single dir -- use after batch renaming
def missing_element_files_all(dir_name):
    missing_array = []
    file_time = log_file_time()
    for root, dirs, files in os.walk(dir_name):
        for _file in files:
            if _file.endswith(".xml") or _file.endswith(".XML"):
                file_name = root + '/' + _file
                missing_value = output(file_name)
                missing_array.append(str(_file) + ',' + str(missing_value))
    return [missing_array, file_time]

#mutiple dirs
# def missing_element_files(dir_name):
#     missing_array = []
#     file_time = log_file_time()
#     for root, dirs, files in os.walk(dir_name):
#         for name in dirs:
#             file_date_array = []
#             dir_name = os.path.join(root, name)
#             for xml_file in os.listdir(dir_name):
#                 if xml_file.endswith(".xml") or xml_file.endswith(".XML"):
#                     xml_file_name = dir_name + '/' + xml_file
#                     file_date_array.append(xml_file_name)
#             for xml_file in file_date_array:
#                 missing_value = output(xml_file)
#                 missing_array.append(str(xml_file) + ',' + missing_value)
#     return [missing_array, file_time]

'''
'file_name,bad_xml,fbgame,venue,date,missing_id_1,missing_id_2,team_count,scores,drives,plays,dnp,dnp_count,gametracker,driveindex_number'
'''

def write_log_file(file_array):
    log_file_name = file_array[1] + '.csv'
    log_file = open(log_file_name, 'w')
    log_file.write('file_name,bad_xml,sport,venue_c,date,missing_id_1,missing_id_2,team_count_c,scores_c,drives_c,plays_c,dnp_c,dnp_count_c,gametracker_c,driveindex_number' + '\n')
    for line in file_array[0]:
        log_file.write(line + '\n')
    log_file.close()


def help():
    print 'batch_drive_play_check.py -u <uncorrected folder path>'



def main(argv):
    dir_name = ""
    try:
      opts, args = getopt.getopt(argv,"hu:",["uncorrected="])      
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
        else:
            print "Error invalid options"
            help()
            sys.exit(2)

    file_elements = missing_element_files_all(dir_name)
    #file_elements = missing_element_files(dir_name)
    #this line writes the time stamped log file
    write_log_file(file_elements)

    #run these two lines when all files are in multiple directories inside one root directory
    # single_dir_name = ''
    # file_elements = missing_element_files_all(multiple_dir_name)

    #run these two lines when all files are in multiple directories inside one root directory
    
    

    


if __name__ == "__main__":
    #print "Welcome sasi"
    main(sys.argv[1:])