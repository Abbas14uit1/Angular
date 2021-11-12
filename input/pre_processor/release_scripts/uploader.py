import requests
import sys
import getopt
import os
import traceback
import json
from pymongo import MongoClient

#http://docs.python-requests.org/en/latest/user/quickstart/#post-a-multipart-encoded-file

client = MongoClient('localhost', 27019)
url = "http://localhost:3000/"
#token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9Vc2VyIiwiYWRtaW4iOmZhbHNlLCJpYXQiOjE1MjUxMDg5MjMsImV4cCI6MTUyNTE5NTMyM30.4i86v9uyNYsdSFYpK1EbaPci_9kes2BmgvZ0jD4ZfcA"
token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9Vc2VyIiwiYWRtaW4iOnRydWUsImlhdCI6MTUzNjMwMzQ2MCwiZXhwIjoxNTM2Mzg5ODYwfQ.EGCihtRtdSyuEFAdVkL1PEwDB_-Jifgtq2T7yqjwcio"


def process(file):
	fin = open(file, 'rb')	
	files = {'file': fin}
	headers = {    
    'Authorization': token,
    'Cache-Control': "no-cache",    
    }
	try:
		r = requests.post(url+"api_v1/upload/games", files=files, headers=headers)		
	finally:
		fin.close()
	if r.status_code == requests.codes.ok or r.status_code == 201:
		return True
	else:		
		print "Code: " + str(r.status_code) + " Text: " +r.text	
		raise ValueError("HTTP Error: " + r.text)


def batch_process(dir_names):    
    file_names = []
    pass_cnt = 0
    failed_cnt = 0
    not_bb_file = 0
    play_not_available = 0
    team_not_found = 0
    #init_mongo()
    db = client.uploadDB 
    #for dir_name in dir_names.split(","):
    #    print dir_name.strip()
    #sys.exit(1)
    for dir_name in dir_names.split(","):
        print "Processing "+ dir_name.strip()
        for root, dirs, files in os.walk(dir_name.strip()):
            for name in files:
                 if name.endswith('.xml') or name.endswith(".XML"):
                    _file = os.path.join(root,name)
                    file_data = db.upload.find_one({"fileName": _file})
                    if file_data is not None and file_data['status'] == "Completed":
                        continue
                    if file_data is None:
                        db.upload.insert_one({"fileName": _file, "status": "Started"})
                        file_data = db.upload.find_one({"fileName": _file})
                    else:
                        file_data['status'] = "Started"
                        db.upload.update({"_id": file_data["_id"]}, file_data, True)
                    print("Processing " + _file)  
                    try:
                        result = process(_file)                         
                    except TypeError as ex:
                        file_data['status'] = "Failed"
                        db.upload.update({"_id": file_data["_id"]}, file_data, True) 
                        print "Error File Failed to upload " + _file
                        continue
                    except Exception as exp:
                        file_data['status'] = "Failed"
                        db.upload.update({"_id": file_data["_id"]}, file_data, True)
                        print ",".join(exp.args) + " \nFailed processing file: <" + _file + ">, Skipping the file."
                        traceback.print_exc()
                        failed_cnt = failed_cnt + 1
                        continue
                    if(result is False):
                        file_data['status'] = "Failed"
                        db.upload.update({"_id": file_data["_id"]}, file_data, True)
                        print("Not a proper file " + _file)                    
                    else:
                        file_data['status'] = "Completed"
                        db.upload.update({"_id": file_data["_id"]}, file_data, True)
                        print("Completed Processing "+ _file)



def help():
    print 'uploader.py -u <url> -f <folder path> '
    #print 'batch_add_drive_play.py -r <team_id>'

def main(argv):
    #dir_name = "../UA/Football_Preprocessed/,  ../UA/Softball_Preprocessed/, ../UA/MenBasketball_Preprocessed, ../TAMU/Baseball_Preprocessed/, ../TAMU/Softball_Preprocessed/, ../TAMU/WomenBasketball_Preprocessed/, ../TAMU/MenBasketball_Preprocessed, ../TAMU/Football_Preprocessed/" 
    dir_name = "/home/sasikumar/Desktop/Texas_Failed_Files/"   
    try:
      opts, args = getopt.getopt(argv,"hu:f:",["url=","file="])      
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)        
    for opt, arg in opts:        
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-u', "--url"):
        	global url
        	url = arg
        elif opt in ('-f',"--folder"):
            dir_name = arg        
        else:
            print "Error invalid options"
            help()
            sys.exit(2)
    if dir_name == "" :
        help()
        sys.exit(2)
    #Hard coded to football
    batch_process(dir_name)



if __name__ == "__main__":
    main(sys.argv[1:])
