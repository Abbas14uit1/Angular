import json
from record_utils import RecordUtils


class TProvider(object):

    def __init__(self, type, template_file_path=None, json_data=None):
        self.type = type # not sure type is required here.
        self.template_file_path = template_file_path
        self.json_data = json_data

    def get_template(self, team_code, team_name):
        json_obj = None
        if self.json_data:
            json_obj = self.json_data
        else:
            json_obj = self._read_template_file()

        RecordUtils.print_debug_log('input-template', str(json_obj))
        if not json_obj:
            raise ValueError('Template Json not available.')

        return self._build_template_object(json_obj, team_code, team_name)

    def _read_template_file(self):
        if not self.template_file_path:
            return None

        json_obj = None
        with open(self.template_file_path) as json_file:
            json_obj = json.load(json_file)

        return json_obj

    def _build_template_object(self, json_obj, t_code, t_name):
        record_type = self._get_json_attrib_value(json_obj, 'recordType')
        record_title = self._get_json_attrib_value(json_obj, 'recordTitle')
        team_name = t_name # self._get_json_attrib_value(json_obj, 'teamName')
        team_code = t_code # self._get_json_attrib_value(json_obj, 'teamCode')
        query_template = self._get_json_attrib_value(json_obj, 'queryTemplate')
        #category = self._get_json_attrib_value(json_obj, 'category')
        sport_code = self._get_json_attrib_value(json_obj, 'sportCode')
        configuration = self._get_json_attrib_value(json_obj, 'configuration')

        if not configuration:
            raise ValueError("No configuration provided in given template.")

        #if not configuration['statvalue']:
        #    raise ValueError("No statvalue provided in given template.")

        template = Template(record_type, record_title, team_name, team_code, query_template, configuration, sport_code)
        return template

    def _get_json_attrib_value(self, json_obj, json_attrib):
        if json_attrib in json_obj:
            return json_obj[json_attrib]

        return None


class Template(object):

    def __init__(self, record_type, record_title, team_name, team_code, query_template, configuration, sport_code):
        self.record_type = record_type
        self.record_title = record_title
        self.team_name = team_name
        self.team_code = team_code
        self.query_template = query_template
        #self.category = category
        self.sport_code = sport_code
        self.configuration = self._build_configuration(configuration)

    def _build_configuration(self, configuration):
        entity = self._get_json_attrib_value(configuration, 'entity')
        #entity_code = self._get_json_attrib_value(configuration, 'entityCode')
        oppo_entity_code = self._get_json_attrib_value(configuration, 'opponentEntityCode')
        organization = self._get_json_attrib_value(configuration, 'organization')
        stat_value = self._get_json_attrib_value(configuration, 'statvalue')
        match_after = self._get_json_attrib_value(configuration, 'matchAfter')
        match_before = self._get_json_attrib_value(configuration, 'matchBefore')
        dimensions = self._get_json_attrib_value(configuration, 'dimensions')
        group = self._get_json_attrib_value(configuration, 'group')
        bonder = self._get_json_attrib_value(configuration, 'bonder')
        output = self._get_json_attrib_value(configuration, 'output')
        configuration = TemplateConfiguration(entity, oppo_entity_code,
                                              organization, stat_value, match_after, match_before, dimensions,
                                              group, bonder, output)
        return configuration

    def _get_json_attrib_value(self, json_obj, json_attrib):
        if json_attrib in json_obj:
            return json_obj[json_attrib]

        return None


class TemplateConfiguration(object):

    def __init__(self, entity, oppo_entity_code, organization, stat_value, match_after, match_before, dimensions,
                 group, bonder, output):
        self.entity = entity
        #self.entity_code = entity_code
        self.oppo_entity_code = oppo_entity_code
        self.organization = organization
        self.stat_value = self._build_stat_value(stat_value)
        self.match_after = match_after
        self.match_before = match_before
        self.dimensions = dimensions
        self.group = group
        self.bonder = self._build_bonder(bonder)
        self.output = output


    def _build_stat_value(self, stat_value):
        if not stat_value:
            return

        stat_value_obj_list = []
        for stat in stat_value:
            key = stat.keys()[0] # there should always be only one key in the statvalue list dict
            value = stat.get(key)
            stat_value_obj = StatValue(key, value)
            stat_value_obj_list.append(stat_value_obj)
        return stat_value_obj_list

    def _build_bonder(self, bonder):
        history_compare = self._get_json_attrib_value(bonder, 'historyCompare')
        sorting = self._get_json_attrib_value(bonder, 'sorting')
        selection = self._get_json_attrib_value(bonder, 'selection')
        tie = self._get_json_attrib_value(bonder, 'tie')
        #match_before_group = self._get_json_attrib_value(bonder, 'matchBeforeGroup')
        double_projection_required = self._get_json_attrib_value(bonder, 'doubleProjectionRequired')
        bonder = ConfigurationBonder(history_compare, sorting, selection, tie,
                                     double_projection_required)
        return bonder

    def _get_json_attrib_value(self, json_obj, json_attrib):
        if json_attrib in json_obj:
            return json_obj[json_attrib]

        return None


class ConfigurationBonder(object):

    def __init__(self, history_compare, sorting, selection, tie, double_projection_required):
        self.history_compare = history_compare
        self.sorting = sorting
        self.selection = selection
        self.tie = tie
        #self.match_before_group = match_before_group
        self.double_projection_required = double_projection_required


class StatValue(object):

    def __init__(self, key, value):
        self.key = key
        self.value = value
