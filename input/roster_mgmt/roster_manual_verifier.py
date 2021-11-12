#!/usr/bin/python
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi
from bson.json_util import dumps, loads

from common.stage_roster_manager import StageRosterManager
from common.active_roster_manager import ActiveRosterManager
from common.roster_master_provider import MasterRosterProvider
import config

PORT_NUMBER = 8080


# This class will handles any incoming request from the browser
class myHandler(BaseHTTPRequestHandler):
    # Handler for the GET requests

    def do_GET(self):
        api = False
        if self.path=="/":
            self.path="/pages/index.html"

        try:
            #Check the file extension required and
            #set the right mime type

            sendReply = False
            if "/api/" in self.path:
                api = True
            if self.path.endswith(".html"):
                mimetype='text/html'
                sendReply = True
            if self.path.endswith(".jpg"):
                mimetype='image/jpg'
                sendReply = True
            if self.path.endswith(".gif"):
                mimetype='image/gif'
                sendReply = True
            if self.path.endswith(".js"):
                mimetype='application/javascript'
                sendReply = True
            if self.path.endswith(".css"):
                mimetype='text/css'
                sendReply = True

            if api:
                json_resp = self.do_api()
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json_resp)


            if sendReply == True:
                #Open the static file requested and send it
                f = open(curdir + sep + self.path)
                self.send_response(200)
                self.send_header('Content-type', mimetype)
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
            return

        except IOError:
            self.send_error(404,'File Not Found: %s' % self.path)



    # Handler for the POST requests
    def do_POST(self):
        if self.path=="/send":
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD':'POST',
                         'CONTENT_TYPE':self.headers['Content-Type'],
            })
        if 'api' in self.path:
            result = self.handle_api_POST()
            self.send_response(200)
            self.send_header('Content-type',"application/json")
            self.end_headers()
            self.wfile.write(result)
            return


    def do_api(self):
        if "/api/unverified" == self.path:
            staged_roster_mgr = StageRosterManager(config.stage_mongo_url, config.stage_mongo_db_name, config.stage_mongo_collection)
            response_data = staged_roster_mgr.get_all_staged_unverified_master()
            # TODO Need to find way to close the mongo connection
            return dumps(response_data)

        if "/api/missing" == self.path:
            active_roster_manager = ActiveRosterManager(config.active_mongo_url, config.active_mongo_db_name,
                                                        config.active_mongo_collection)
            response_data = active_roster_manager.get_all_active_player_class_blank_null()
            if len(response_data) > 0:
                print 'Found Active Rosters with Player Class blank or null: ' + str(len(response_data))
                return dumps(response_data)

            staged_roster_mgr = StageRosterManager(config.stage_mongo_url, config.stage_mongo_db_name, config.stage_mongo_collection)
            response_data = staged_roster_mgr.get_all_staged_player_class_blank_null()
            print 'Found Stage Rosters with Player Class blank or null: ' + str(len(response_data))
            # TODO Need to find way to close the mongo connection
            return dumps(response_data)

    def handle_api_POST(self):
        if "/api/verify" == self.path:
            data_string = self.rfile.read(int(self.headers['Content-Length']))
            # print dumps(data_string)
            staged_roster_mgr = StageRosterManager(config.stage_mongo_url, config.stage_mongo_db_name, config.stage_mongo_collection)
            active_roster_manager = ActiveRosterManager(config.active_mongo_url, config.active_mongo_db_name,
                                                        config.active_mongo_collection)
            master_roster_provider = MasterRosterProvider(config.master_mongo_url, config.master_mongo_db_name,
                                                          config.master_mongo_collection)
            call_active_update = staged_roster_mgr.update_manual_verification(loads(data_string), active_roster_manager,
                                                                              master_roster_provider)
            if call_active_update:
                print 'Calling active roster manager to update!!'
                active_roster_manager.move_roster_stage_to_active(staged_roster_mgr)
            resp = [{"result": "ok"}]
            return dumps(resp)
        return


try:
    # Create a web server and define the handler to manage the
    # incoming request
    server = HTTPServer(('', PORT_NUMBER), myHandler)
    print 'Started httpserver on port ' , PORT_NUMBER
    print "Visit http://localhost:" + str(PORT_NUMBER) +"/pages/Unverified-players.html"

    #Wait forever for incoming htto requests
    server.serve_forever()

except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()


