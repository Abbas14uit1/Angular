import xml.etree.ElementTree as ET
import datetime
import re
import os
import csv

dir_name = "/Users/v/data_test/Uncorrected copy"
dest_dir = "/Users/v/data_test/test_output"

def return_date(root):
    if(root.find('venue') is not None):
        for venue in root.iter('venue'):
            if('date' in venue.attrib):
                return venue.attrib['date']

def batch_date(filename):
    print(filename)
    tree = ET.ElementTree()
    tree = ET.parse(filename)
    root = tree.getroot()
    if(root.tag != 'fbgame'):
        d = False
    else:
        d = return_date(root)
    return d

def batch_rename_files(dir_name):
    for root, dirs, files in os.walk(dir_name):
        for name in dirs:
            file_date_array = []
            dir_name = os.path.join(root, name)
            for xml_file in os.listdir(dir_name):
                if xml_file.endswith(".xml") or xml_file.endswith(".XML"):
                    xml_file_name = dir_name + '/' + xml_file
                    
                    t = batch_date(xml_file_name)
                    if(t is not False):
                        xml_file_date = t
                        file_date_array.append([xml_file_name, xml_file_date])
            
                new_matrix = []
            for sublist in file_date_array:
                if(sublist[1] is not None):
                    new_file_name = sublist[0]
                    new_date = datetime.datetime.strptime(sublist[1],"%m/%d/%Y")
                    new_matrix.append([new_file_name, new_date])

            sorted_dates = sorted(new_matrix, key= lambda x: x[1])
            
            for i in range(len(sorted_dates)):
                team_name = str(sorted_dates[i][0].split('/')[-3])
                season = str(sorted_dates[i][0].split('/')[-2])
                game_num = str(i+1)
                original_file = sorted_dates[i][0]
                new_file_name = str(team_name + "_" + season + "_" + game_num + '.xml')
                dest = dest_dir + '/' + new_file_name
                os.rename(original_file, dest)

def batch_process_drives(dir_name):
    batch_rename_files(dir_name)

batch_process_drives(dir_name)