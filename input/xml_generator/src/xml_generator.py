import os
from bs4 import BeautifulSoup


XML_HEADER = '<?xml version="1.0" encoding="utf-8"?>'


class XMLGenerator(object):

    def __init__(self):
        pass

    def generate_xml(self, basic_fields, home_team_tag_obj, visitor_team_tag_obj, home_team_player_tag_objs, visitor_team_player_tag_objs,
                     output_dir, sub_dir, input_file_name, plays_tag_obj):

        fbgame_tag = basic_fields.fbgame_tag

        venue_tag = basic_fields.venue_tag
        venue_tag['officials'] = basic_fields.venue_officials_tag
        venue_tag['rules'] = basic_fields.venue_rules_tag
        fbgame_tag['venue'] = venue_tag

        team_list = list()
        home_team_tag = self._build_team_dict(home_team_tag_obj, home_team_player_tag_objs)
        visitor_team_tag = self._build_team_dict(visitor_team_tag_obj, visitor_team_player_tag_objs)
        team_list.append(home_team_tag)
        team_list.append(visitor_team_tag)

        fbgame_tag['team'] = team_list
        fbgame_tag['plays'] = plays_tag_obj.plays

        xml = self.dict2xml(fbgame_tag, 'fbgame')
        bs = BeautifulSoup(xml, 'xml')
        # Not sure from where xml header is getting added so removing it for now.
        xml_formatted_txt = bs.prettify().replace(XML_HEADER, '')
        output_file_path = self._get_output_file_path(output_dir, sub_dir, input_file_name)
        with open(output_file_path, 'w') as xml_file:
            xml_file.write(xml_formatted_txt)

        print 'Generated XML file successfully: <' + output_file_path + '>'


    def _build_team_dict(self, team_tag_obj, team_player_tag_objs):
        team_tag = team_tag_obj.team_tag

        team_linescore_tag = team_tag_obj.team_linescore_tag
        lineprd_list = list()
        for key, value in team_tag_obj.team_linescore_lineprd_tag.items():
            if key == 'ot' and len(value) == 0:
                continue
            lineprd_tag = dict()
            lineprd_tag['prd'] = key
            lineprd_tag['score'] = value
            lineprd_list.append(lineprd_tag)

        team_linescore_tag['lineprd'] = lineprd_list
        team_tag['linescore'] = team_linescore_tag

        team_totals_tag = team_tag_obj.team_totals_tag
        team_totals_tag['firstdowns'] = team_tag_obj.team_totals_firstdowns_tag
        team_totals_tag['penalties'] = team_tag_obj.team_totals_penalties_tag
        team_totals_tag['conversions'] = team_tag_obj.team_totals_conversions_tag
        team_totals_tag['fumbles'] = team_tag_obj.team_totals_fumbles_tag
        team_totals_tag['misc'] = team_tag_obj.team_totals_misc_tag
        team_totals_tag['redzone'] = team_tag_obj.team_totals_redzone_tag
        team_totals_tag['rush'] = team_tag_obj.team_totals_rush_tag
        team_totals_tag['pass'] = team_tag_obj.team_totals_pass_tag
        team_totals_tag['rcv'] = team_tag_obj.team_totals_rcv_tag
        team_totals_tag['punt'] = team_tag_obj.team_totals_punt_tag
        team_totals_tag['ko'] = team_tag_obj.team_totals_ko_tag
        team_totals_tag['fg'] = team_tag_obj.team_totals_fg_tag
        team_totals_tag['pat'] = team_tag_obj.team_totals_pat_tag
        team_totals_tag['kr'] = team_tag_obj.team_totals_kr_tag
        team_totals_tag['pr'] = team_tag_obj.team_totals_pr_tag
        team_totals_tag['ir'] = team_tag_obj.team_totals_ir_tag
        team_totals_tag['scoring'] = team_tag_obj.team_totals_scoring_tag
        team_totals_tag['defense'] = team_tag_obj.team_totals_defense_tag
        team_tag['totals'] = team_totals_tag

        players_list = list()
        for key, value in team_player_tag_objs.items():
            players_list.append(value.player_tag)

        team_tag['player'] = players_list
        return team_tag

    def dict2xml(self, d, root_node=None):
        wrap = False if None == root_node or isinstance(d, list) else True
        root = 'objects' if None == root_node else root_node
        root_singular = root[:-1] if 's' == root[-1] and None == root_node else root
        xml = ''
        children = []

        if isinstance(d, dict):
            for key, value in dict.items(d):
                if isinstance(value, dict):
                    children.append(self.dict2xml(value, key))
                elif isinstance(value, list):
                    children.append(self.dict2xml(value, key))
                else:
                    xml = xml + ' ' + key + '="' + str(value) + '"'
        else:
            for value in d:
                children.append(self.dict2xml(value, root_singular))

        end_tag = '>' if 0 < len(children) else '/>'

        if wrap or isinstance(d, dict):
            xml = '<' + root + xml + end_tag

        if 0 < len(children):
            for child in children:
                xml = xml + child

            if wrap or isinstance(d, dict):
                xml = xml + '</' + root + '>'
        return xml

    def _get_output_file_path(self, output_dir, sub_dir, input_file_name):

        output_file_name = os.path.splitext(input_file_name)[0] + '.xml'
        dirs = output_dir + '' if len(sub_dir) == 0 else '/' + sub_dir
        if not os.path.exists(dirs):
            os.makedirs(dirs)
        return dirs + '/' + output_file_name
