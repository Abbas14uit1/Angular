from pymongo import MongoClient
from config_provider import ConfigProvider

AUTH_MECHANISM = 'SCRAM-SHA-1'

MONGO_HOST='mongo.host'
MONGO_PORT='mongo.port'
MONGO_AUTH_REQUIRED='mongo.auth.required'
MONGO_USER='mongo.user'
MONGO_PASSWORD='mongo.password'
MONGO_AUTH_SOURCE='mongo.auth.source'

class MongoDbConnectionProvider(object):

    def __init__(self, prop_section):
        self.config_provider = ConfigProvider(prop_section)

    def get_connection(self):
        client = None
        mongo_host_ip = self.config_provider.get_value(MONGO_HOST)
        mongo_host_port = self.config_provider.get_value(MONGO_PORT)
        mongo_auth_required = self.config_provider.get_value(MONGO_AUTH_REQUIRED)
        if mongo_auth_required.lower() == 'true':
            mongo_user = self.config_provider.get_value(MONGO_USER)
            mongo_password = self.config_provider.get_value(MONGO_PASSWORD)
            mongo_auth_source = self.config_provider.get_value(MONGO_AUTH_SOURCE)
            client = MongoClient(host=mongo_host_ip, port=int(mongo_host_port), username=mongo_user,
                             password=mongo_password, authSource=mongo_auth_source,
                             authMechanism=AUTH_MECHANISM)
        else:
            client = MongoClient(host=mongo_host_ip, port=int(mongo_host_port))

        return client