import re

class NameNormalizer:
    def __init__(self):                
        self.name_pattern = re.compile('[\W_]+')
        

    def normalize_name(self, player_name):        
        if not self._is_name(player_name):
            return None, None
        player_name = player_name.encode("ascii", "ignore").strip()
        print "Player Name: " + player_name
        check_name = self._get_check_name(player_name)
        s1_player_name = self.name_pattern.sub('', player_name)
        s2_player_name = s1_player_name.upper()
        s3_player_name = s2_player_name.strip()
        return s3_player_name, check_name

    def _get_check_name(self, player_name):

        if ',' in player_name:            
            return self._split_names(player_name, ",")

        if ' ' in player_name:
            return self._split_names(player_name, " ")

        return player_name

    def _split_names(self, player_name, split_char):
        player_name_details = player_name.split(split_char)
        if len(player_name_details) == 2:
            lastname = player_name_details[0].strip()
            firstname = player_name_details[1].strip()
            if lastname and firstname:
                self.name_pattern.sub('', lastname)
                self.name_pattern.sub('', firstname)
                checkname = lastname + "," + firstname
            elif lastname:
                self.name_pattern.sub('', lastname)
                checkname = lastname
            else:
                self.name_pattern.sub('', firstname)
                checkname = firstname
        else:
            self.name_pattern.sub('', player_name)
            checkname = player_name
        return checkname.upper()

    def _is_name(self, player_name):
        if re.search('[a-zA-Z]', player_name):
            if not player_name.upper() == "TEAM":
                return True
        return False
