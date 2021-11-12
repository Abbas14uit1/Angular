import logging
import config


class PlayerClassValidator(object):

    def __init__(self):
        self.logger = logging.getLogger(__name__)


    def find_valid_player_class_with_master(self, master_player, xml_player_class):

        # Scenario # 1: XML has player class but no player match found in master.
        if xml_player_class is not None and master_player is None:
            self.logger.info('XML has player class and no player match found in master. So, considering it as valid class.')
            return xml_player_class.upper()

        # scenario # 2: XML does not have player class but player match found in master.
        if (xml_player_class is None or len(xml_player_class) == 0) and master_player is not None and master_player.played_details is not None:
            self.logger.info('XML does not have player class and player match found in master. So, considering it as valid class.')
            '''@@ If player class is "N/A" in master, it will return BLANK String.'''
            return master_player.played_details.player_class.upper()

        # scenario # 3: XML has player class and player match found in master.
        if xml_player_class is not None and master_player is not None and master_player.played_details is not None:
            self.logger.info('Perfect!!!. Both XML has player class and player match found in master. So, considering it as valid class.')
            '''@@ If player class is "N/A" in master, it will return BLANK String.'''
            return xml_player_class.upper()

        self.logger.info('Both Master & XML does not have player class. So, returning None.')
        return None

