
RECORD_TEMPLATE_COLLECTION_NAME = 'recordTemplates'

class MongoTemplateReader(object):

    def __init__(self, mongo_client, db_name):
        self.mongo_db = mongo_client[db_name]


    def get_templates_from_mongo(self, searchCriteria):
        search_result = self.mongo_db[RECORD_TEMPLATE_COLLECTION_NAME].find(searchCriteria)
        return search_result