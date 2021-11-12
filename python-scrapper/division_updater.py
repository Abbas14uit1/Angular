from bs4 import BeautifulSoup
import requests
import os
from urlparse import urlparse
from datetime import datetime
import codecs
from tinydb import TinyDB, Query
import time
import dateutil.parser
from pymongo import MongoClient
import traceback


mongo_url = 'localhost:27017'
mongo_db_old = 'athlyte-old'
mongo_collection = 'GameSchedules'
mongo_db = 'athlyte'

class MongoDBHandler(object):

    def __init__(self, mongo_url, db_name_old, collection_name, db_name_new):
        self.mongo_url = mongo_url

        self.collection_name = collection_name
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db_old = self.mongo_client[db_name_old]
        self.mongo_collection_old = self.mongo_db_old[collection_name]
        self.mongo_db_new = self.mongo_client[db_name_new]
        self.mongo_collection_new = self.mongo_db_new[collection_name]

    def update_division_mongo(self):
        data_available = self.mongo_collection_old.find({})
        print data_available.count()
        for da in data_available:
            self.mongo_collection_new.update({"_id": da['_id']}, {"$set" : {"division": "FBS"}})
            print "Updated division for ID: " + str(da['_id'])

    def close_connection(self):
        if self.mongo_client is not None:
            self.mongo_client.close()


mongo_handler = MongoDBHandler(mongo_url, mongo_db_old, mongo_collection, mongo_db)
mongo_handler.update_division_mongo()
mongo_handler.close_connection()