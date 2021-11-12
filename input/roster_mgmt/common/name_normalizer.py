import re
import logging


class NameNormalizer:

    def __init__(self):
        self.name_pattern = re.compile('[\W_]+')
        self.logger = logging.getLogger(__name__)

    def normalize_name(self, player_name):

        if not self._is_name(player_name):
            return NameOpts(None, None, None, None, None)

        player_name = player_name.encode("ascii", "ignore").strip()

        check_name, short_name = self._build_check_name(player_name)
        normalized_name = self.name_pattern.sub('', player_name).upper().strip()
        special_name = self._is_special_name(check_name)

        self.logger.info("Player Name: " + player_name)
        self.logger.info("Check Name : " + check_name)
        self.logger.info("Normalized Name: " + normalized_name)
        self.logger.info("Short Name: " + short_name)
        self.logger.info("Special Name: " + str(special_name))

        return NameOpts(player_name, normalized_name, check_name, short_name, special_name)

    def _build_check_name(self, player_name):

        if ',' in player_name:
            return self._split_names(player_name, ",")
        if ' ' in player_name:
            return self._split_names(player_name, " ")

        # Returning same player_name for short_name to handle TEAM or TM
        return player_name, player_name

    def _split_names(self, player_name, split_char):
        player_name_details = player_name.split(split_char)

        if len(player_name_details) == 2:
            last_name = player_name_details[0].strip()
            first_name = player_name_details[1].strip()
            if last_name and first_name:
                self.name_pattern.sub('', last_name)
                self.name_pattern.sub('', first_name)
                check_name = last_name + "," + first_name
                short_name = last_name + "," + first_name[:1]
            elif last_name:
                self.name_pattern.sub('', last_name)
                check_name = last_name
                short_name = last_name
            else:
                self.name_pattern.sub('', first_name)
                check_name = first_name
                short_name = first_name
        else:
            self.name_pattern.sub('', player_name)
            check_name = player_name
            short_name = player_name

        return check_name.upper(), short_name.upper()

    def _is_name(self, player_name):
        if re.search('[a-zA-Z]', player_name):
            if not player_name.upper() == "TEAM":
                return True
        return False

    def _is_special_name(self, check_name):

        if ',' in check_name:
            names = check_name.split(',')
            if len(names) == 2:
                return ' ' in names[0] or ' ' in names[1] or '.' in names[0] or '.' in names[1]

        if ' ' in check_name:
            names = check_name.split(' ')
            if len(names) == 2:
                return ',' in names[0] or ',' in names[1] or '.' in names[0] or '.' in names[1]

        return False

    def normalize_xml_check_name(self, check_name):

        normalized_name = self.name_pattern.sub('', check_name).upper().strip()
        special_name = self._is_special_name(check_name)
        dummy_check_name, short_name = self._build_check_name(check_name)
        self.logger.debug("Player Name (from xml Check Name): " + check_name)
        self.logger.debug("Check Name : " + check_name)
        self.logger.debug("Normalized Name: " + normalized_name)
        self.logger.debug("Short Name: " + short_name)
        self.logger.info("Is Special Name: " + str(special_name) + ', check name: <' + check_name + '>')

        return NameOpts(check_name, normalized_name, check_name, short_name, special_name)


class NameOpts(object):

    def __init__(self, player_name, normalized_name, check_name, short_name, special_name):
        self.xml_player_name = player_name
        self.normalized_name = normalized_name
        self.check_name = check_name
        self.short_name = short_name
        self.special_name = special_name
