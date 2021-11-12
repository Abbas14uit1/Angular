import batch_add_drive_play
import shutil
import os
import csv
import xml.etree.ElementTree as ET


class TestFootBallXML:

	test_files = "./test_files"
	output_files = "./test_output"
	team_dict = {}

	def setup(self):
		print ("setup             class:TestFootBallXML")
		#shutil.rmtree(TestFootBallXML.output_files)
		# if not os.path.exists(TestFootBallXML.output_files):
		# 	os.makedirs(TestFootBallXML.output_files)	
		

	def teardown(self):
		print ("teardown          class:TestFootBallXML")
		# if not os.path.exists(TestFootBallXML.output_files):
		# 	return
		#shutil.rmtree(TestFootBallXML.output_files)

	def setup_class(cls):
		print ("setup_class       class:%s" % cls.__name__)
		if not os.path.exists(TestFootBallXML.output_files):
			os.makedirs(TestFootBallXML.output_files)
		with open('team_master.csv') as csvfile:
			teamreader = csv.reader(csvfile)
			for row in teamreader:
				TestFootBallXML.team_dict[row[1]] = row

	def teardown_class(cls):
		print ("teardown_class    class:%s" % cls.__name__)
		if not os.path.exists(TestFootBallXML.output_files):
			return
		print "Delete all "
		shutil.rmtree(TestFootBallXML.output_files)

	def setup_method(self, method):
		print ("setup_method      method:%s" % method.__name__)

	def teardown_method(self, method):
		print ("teardown_method   method:%s" % method.__name__)

	def test_run_cycle(self):
	 	print ('Test run the batch_add_drive_play')
	 	global hv_dict 
	 	global game_date 
	 	#global team_dict 
	 	assert batch_add_drive_play.batch_process_drives(TestFootBallXML.test_files, TestFootBallXML.output_files) == None

	def test_all_files_processed(self):
		print "Test if all files are processed"
		path, dirs, files = os.walk(TestFootBallXML.test_files).next()
		input_file_count = len(files)
		path, dirs, files = os.walk(TestFootBallXML.output_files).next()
		output_file_count = len(files)
		assert input_file_count==output_file_count

	def test_xml_isvalid(self):
		print "Test if the xml is valid"
		path, dirs, files = os.walk(TestFootBallXML.output_files).next()
		success = 0
		failure = 0
		total = 0
		for file in files:
			++total
			tree = ET.ElementTree()
			try:
				tree = ET.parse(path+"/"+file)
				_root = tree.getroot()
				++success
			except:
				++failure
				print "File " + file + " contains invalid XML"
			assert failure == 0 and success == total 

	def test_drive_present_in_output(self):
		print "Test if the output files have drive information"
		failure = 0
		path, dirs, files = os.walk(TestFootBallXML.output_files).next()
		for file in files:			
			tree = ET.ElementTree()
			tree = ET.parse(path+"/"+file)
			_root = tree.getroot()
			result = batch_add_drive_play.drive_check(_root)
			if result == False:
				print "File " + file + " contains no drive information"
				++failure
			continue

		assert failure == 0

#
	def test_if_school_name_is_correct(self):
		print "Check if school names are standardized in the processed document"		
		name_failure = 0
		nickname_failure = 0
		org_failure = 0
		division_failure = 0
		path, dirs, files = os.walk(TestFootBallXML.output_files).next()
		for file in files:
			tree = ET.ElementTree()
			tree = ET.parse(path+"/"+file)			
			_root = tree.getroot()
			result = None
			for team in _root.iter('team'):
				if team.attrib['name'] != TestFootBallXML.team_dict[team.attrib['code']][0]:
					++name_failure
					print "File " + file + " not matching the team master name"
				if team.attrib['nickname'] != TestFootBallXML.team_dict[team.attrib['code']][4]:
					++nickname_failure
					print "File " + file + " not matching the team master nickname"
				if team.attrib['org'] != TestFootBallXML.team_dict[team.attrib['code']][2]:
					++org_failure
					print "File " + file + " not matching the team master org"
				if team.attrib['division'] != TestFootBallXML.team_dict[team.attrib['code']][3]:
					++division_failure
					print "File " + file + " not matching the team master division"
				continue
			continue
		assert name_failure == 0
		assert  nickname_failure == 0
		assert org_failure == 0
		assert division_failure == 0


	def test_if_team_attribute1_updated_in_output(self):
		print "Check if all the added atributes exist in the processed document"
		name_failure = 0
		nickname_failure = 0
		org_failure = 0
		division_failure = 0
		path, dirs, files = os.walk(TestFootBallXML.output_files).next()
		for file in files:
			tree = ET.ElementTree()
			tree = ET.parse(path+"/"+file)
			_root = tree.getroot()
			result = None
			for team in _root.iter('team'):
				if 'name' not in team.attrib:
					++name_failure
					print "File " + file + " missing name attribute in team element"		
				if 'nickname' not in team.attrib:
					++nickname_failure
					print "File " + file + " missing nickname attribute in team element"
				if 'org' not in team.attrib:
					++org_failure
					print "File " + file + " missing org attribute in team element"
				if 'division' not in team.attrib:
					++division_failure
					print "File " + file + " missing division attribute in team element"
			
			assert name_failure ==0
			assert  nickname_failure ==0
			assert org_failure == 0
			assert division_failure == 0

			print "File " + file + " missing team attribute"

	
			



	

