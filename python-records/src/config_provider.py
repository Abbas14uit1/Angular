import ConfigParser

CONFIG_FILE_NAME='config.ini'

class ConfigProvider(object):

    def __init__(self, section):
        self.config = ConfigParser.ConfigParser()
        self.config.read(CONFIG_FILE_NAME)
        self.section = section

    def get_value(self, prop_key):
        prop_value = self.config.get(self.section, prop_key)

        if prop_value and len(prop_value) > 0:
            return prop_value

        raise ValueError('Property value not found for key: %s' % prop_key)
