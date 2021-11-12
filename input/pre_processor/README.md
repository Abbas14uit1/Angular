# Pre-processing XML files

The pre-processors work is to ensure that the XML files are in good shape before they can be uploaded to the athlyte node js server


#Dependencies
Install boto3
Install pymongo


# Test

Install python-pytest
Install pip install pytest
py.test <test file>
	eg: py.test test_batch_add_drive_play.py
if you want to run a single test then 
py.test <test file> -k <test method name>
	eg: py.test test_batch_add_drive_play.py -k test_if_school_name_is_correct
Note: test case designed in an order. So when running one by one ensure to have required files.
