#!/usr/bin/python
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi
import json
import sys
from bson.json_util import dumps, loads

sys.path.append("../common")
from schedule_manager import ScheduleManager
from teammaster_manager import TeamMasterManager
from roster_manager import StageRoster


PORT_NUMBER = 8080

#This class will handles any incoming request from
#the browser
class myHandler(BaseHTTPRequestHandler):

	#Handler for the GET requests
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
				self.send_header('Content-type',mimetype)
				self.end_headers()
				self.wfile.write(f.read())
				f.close()
			return

		except IOError:
			self.send_error(404,'File Not Found: %s' % self.path)

	#Handler for the POST requests
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
			staged_roster = StageRoster()
			response_data = staged_roster.get_all_staged_unverified()
			#response_data = [{"test1":"ok"}]
			#get_all_staged()
			return dumps(response_data)

		if "/api/missing" == self.path:
			staged_roster = StageRoster()
			response_data = staged_roster.get_all_staged_missing()
			return dumps(response_data)

	def handle_api_POST(self):
		if "/api/verify" == self.path:
			data_string = self.rfile.read(int(self.headers['Content-Length']))
			print dumps(data_string)
			staged_roster = StageRoster()
			staged_roster.upsert_player(loads(data_string))
			resp = [{"result": "ok"}]
			return dumps(resp)
		return


try:
	#Create a web server and define the handler to manage the
	#incoming request
	server = HTTPServer(('', PORT_NUMBER), myHandler)
	print 'Started httpserver on port ' , PORT_NUMBER
	print "Visit http://localhost:" + str(PORT_NUMBER) +"/pages/Unverified-football-players.html"

	#Wait forever for incoming htto requests
	server.serve_forever()

except KeyboardInterrupt:
	print '^C received, shutting down the web server'
	server.socket.close()


