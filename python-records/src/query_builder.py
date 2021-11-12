from record_utils import RecordUtils
import json
from abc import ABCMeta, abstractmethod


# Hardcoded attribute NAMES here. TODO check later.
#TEAM_CODE_MATCH = '{"$match": {"teamCode":%(teamCode)s}}'
TEAM_CODE_MATCH = '{"$match": {"$and" : [{"teamCode":%(teamCode)s}, {"sportCode":"%(sportCode)s"}]}}'
UNWIND_GAMES = '{"$unwind": "$games"}'
PROJECT_START = '{"$project":{'
PROJECT_END = '}}'
SORT_START = '{"$sort":{'
SORT_END = '}}'
MATCH_START = '{"$match":'
MATCH_END = '}}'
SELECT_FLAG = ':1,'
STATS_CONT = 'stat'
LIMIT_RECORDS = '{"$limit" : %(limit)d}'
AND_OPERATOR = '{"$and" : ['
OR_OPERATOR = '{"$or" : ['
GROUP_START = '{"$group": {"count" : {"$sum" : 1}, "_id" :'
GROUP_END = '}}'
GROUP_CONT = 'group'
GROUP_PROJECT_START = '{"$project": { "_id" : 1,'
GROUP_PROJECT_END = '}}'
PLAYED_SEASON_GROUP = ',"playerSeason": {"$addToSet": "$games.season"}'
SEASON_GROUP = ['name', 'games.season']
CAREER_GROUP = ['name']
TEAM_CODE_MATCH_TEAM_ENTITY = '{"$match": {"code":%(teamCode)s}}'
# This match is required after games unwind to filter sport.
TEAM_ENTITY_MATCH = '{"$match": {"games.sportCode": "%(sportCode)s"}}'
TEAM_LOOKUP = '{"$lookup" : {"from": "games", "localField": "games.gameId", "foreignField": "_id", "as": "gamesColl"}}'
UNWIND_LOOKUP = '{"$unwind": "$gamesColl"}'

FIELDS_TO_DEFAULT_VALUE = ['rushTd', 'passTd', 'rcvTd', 'prTd', 'krTd']
IF_NULL_START = ': {"$ifNull" : ["$'
IF_NULL_END = '", 0]},'


class MongoQueryBuilder(object):

    def __init__(self, dimension, template):
        self.dimension = dimension
        self.template = template

    def build_query(self):
        if not self.template:
            raise ValueError('Template is None.')

        query_builder = None
        if self.dimension.lower() == 'game':
            query_builder = GameQueryBuilder()
        elif self.dimension.lower() == 'season':
            query_builder = SeasonQueryBuilder()
        elif self.dimension.lower() == 'career':
            query_builder = CareerQueryBuilder()
        else:
            raise ValueError('Unknown is Dimension.')

        pipeline_list = query_builder.build_query(self.template.sport_code, self.template.team_code,
                                           self.template.configuration)
        RecordUtils.print_info_log('Record Mongo Query:', str(pipeline_list))
        return pipeline_list

class AbstractQueryBuilder(object):

    __metaclass__ = ABCMeta
    pipeline_list = None

    def __init__(self, arg1):
        self.arg1 = arg1
        pass

    def _build_divide_clause(self, divide_value, output_key):
        divide_list = []
        for divide_item in divide_value:
            if isinstance(divide_item, dict):
                for (divide_item_key, divide_item_value) in divide_item.items():
                    if divide_item_key == 'sum':
                        divide_list.append(self._build_sum(divide_item_value))
                    else:
                        value_item = '{"$' + divide_item_key + '" :' + '"$' + divide_item_value + '"}'
                        divide_list.append(value_item)
            else:
                divide_list.append('"$' + divide_item + '"')

        if len(divide_list) > 2:
            raise ValueError('Divide clause has more than 2 arguments')

        # TODO Need to add more scenario's like size/sum, size/one attribute, sum/one attribute etc
        divide_clause = '"' + output_key + '":' + '{"$cond": [ { "$eq": ['
        divide_clause = divide_clause + divide_list[1] + ', 0 ] },'
        divide_clause = divide_clause + divide_list[0] + ','
        divide_clause = divide_clause + '{"$divide" : [' + divide_list[0] + ',' + divide_list[1] + ']}]},'
        return divide_clause

    def _build_multiply_clause(self, multiply_value, output_key):
        multiply_list = []
        for multiply_item in multiply_value:
            if isinstance(multiply_item, dict):
                for (multiply_item_key, multiply_item_value) in multiply_item.items():
                    if multiply_item_key == 'sum':
                        multiply_list.append(self._build_sum(multiply_item_value))
                    else:
                        value_item = '{"$' + multiply_item_key + '" :' + '"$' + multiply_item_value + '"}'
                        multiply_list.append(value_item)
            elif isinstance(multiply_item, int):
                multiply_list.append(multiply_item)
            else:
                multiply_list.append('"$' + multiply_item + '"')

        # adding support only to 2 numbers.. TODO later increase the numbers.
        if len(multiply_list) > 2:
            raise ValueError('multiply clause has more than 2 arguments')

        # TODO Need to add more scenario's like size/sum, size/one attribute, sum/one attribute etc
        multiply_clause = ''
        if output_key:
            multiply_clause = '"' + output_key + '":' + '{"$multiply" : [' + multiply_list[0] + ',' + str(multiply_list[1]) + ']},'
        else:
            multiply_clause = '{"$multiply" : [' + multiply_list[0] + ',' + str(multiply_list[1]) + ']},'

        return multiply_clause

    def _build_add_clause(self, add_value, output_key):
        add_list = []
        for add_item in add_value:
            if isinstance(add_item, dict):
                for (add_item_key, add_item_value) in add_item.items():
                    if add_item_key == 'multiply':
                        add_list.append(self._build_multiply_clause(add_item_value, None)[:-1])
                    else:
                        value_item = '{"$' + add_item_key + '" :' + '"$' + add_item_value + '"}'
                        add_list.append(value_item)
            elif isinstance(add_item, int):
                add_list.append(add_item)
            else:
                add_list.append('"$' + add_item + '"')

        add_clause = '"' + output_key + '":' + '{"$add" : ['
        for add_item in add_list:
            add_clause = add_clause + add_item + ','

        add_clause = add_clause[:-1] + ']},'
        return add_clause

    def _build_sum(self, sum_item):
        sum_value = '{"$sum" :'
        if isinstance(sum_item, list):
            sum_value += '['
            for inner_items in sum_item:
                sum_value += '"$' + inner_items + '",'
            sum_value = sum_value[:-1] + ']'
        elif isinstance(sum_item, dict):
            (key, value), = sum_item.items() # TODO for now assuming only one item in dict.
            if isinstance(value, list):
                sum_value += '{"$' + key + '" :['
                for value_items in value:
                    sum_value += '"$' + value_items + '",'
                sum_value = sum_value[:-1] + ']}'
            else:
                sum_value += '{"$' + key + '" : "$' + value + '"}'
        else:
            sum_value += '"$' + sum_item + '"'

        sum_value = sum_value + '}'
        return sum_value

    def _build_stats_clause(self, stats_list, required_double_sum):
        stat_idx = 1
        stat_value = ''
        for stat_item in stats_list:
            if stat_item.key == 'sum':
                if required_double_sum:
                    stat_item_dict = dict()
                    stat_item_dict['sum'] = stat_item.value
                    stat_value = stat_value + '"' + STATS_CONT + str(stat_idx) + '":' + self._build_sum(stat_item_dict) \
                                 + ','
                else:
                    stat_value = stat_value + '"' + STATS_CONT + str(stat_idx) + '":' + self._build_sum(stat_item.value) \
                             + ','
            else:
                stat_value = stat_value + '"' + STATS_CONT + str(stat_idx) + '": {"$' + stat_item.key + '" : "$' \
                             + stat_item.value + '"},'
            stat_idx += 1
        return stat_value[:-1]

    def _build_and_clause(self, match_value):
        and_clause = AND_OPERATOR
        for inner_items in match_value:
            for (inner_items_key, inner_items_value) in inner_items.items():
                if isinstance(inner_items_value, dict):
                    for (match_inner_key, match_inner_value) in inner_items_value.items():
                        and_clause += '{"' + inner_items_key + '":{ "$' + match_inner_key + '":' + \
                                      self._add_quotes_str(match_inner_value) + '}},'
                else:
                    and_clause += '{"' + inner_items_key + '": ' + self._add_quotes_str(inner_items_value) + '},'
        and_clause = and_clause[:-1] + ']'

        return and_clause

    def _build_or_clause(self, match_value):
        or_clause = OR_OPERATOR
        for inner_items in match_value:
            for (inner_items_key, inner_items_value) in inner_items.items():
                if isinstance(inner_items_value, dict):
                    for (match_inner_key, match_inner_value) in inner_items_value.items():
                        or_clause += '{"' + inner_items_key + '":{ "$' + match_inner_key + '":' + \
                                      self._add_quotes_str(match_inner_value) + '}},'
                else:
                    or_clause += '{"' + inner_items_key + '": ' + self._add_quotes_str(inner_items_value) + '},'
        or_clause = or_clause[:-1] + ']'

        return or_clause

    def _build_match_clause(self, match):
        match_pl = MATCH_START
        for (match_key, match_value) in match.items():
            if match_key == 'and':
                and_clause = self._build_and_clause(match_value)
                match_pl += and_clause
            elif match_key == 'or':
                and_clause = self._build_or_clause(match_value)
                match_pl += and_clause
            elif isinstance(match_value, dict):
                for (match_inner_key, match_inner_value) in match_value.items():
                    match_pl += '{"' + match_key + '":{ "$' + match_inner_key + '":' + \
                                self._add_quotes_str(match_inner_value) + '}'
            else:
                match_pl += '"' + match_key + '":' + self._add_quotes_str(match_value)

        match_pl += MATCH_END
        return match_pl

    def _add_quotes_str(self, any_str):
        if isinstance(any_str, int):
            return str(any_str)

        return '"' + any_str + '"'

    def _build_sort_clause(self, sort_dict):
        sort_pl = SORT_START
        sort_keys = sort_dict.keys()
        for sort_key in sort_keys:
            sort_value = sort_dict.get(sort_key)
            sort_pl += '"' + sort_key + '":' + (str(-1) if sort_value == 'dsc' else str(1))
            sort_pl += ','

        sort_pl = sort_pl[:-1] + SORT_END
        return sort_pl

    def _build_output_clause(self, output_list):
        output_clause = ''
        # required to filter with opponent code.
        #output_clause = output_clause + '"games.opponentCode"' + SELECT_FLAG
        for output_item in output_list:
            (key, value), = output_item.items()
            if key != 'Algorithm':
                if not self._get_field_requires_default_value(key):
                    output_clause = output_clause + '"' + key + '"' + SELECT_FLAG
                else:
                    output_clause = output_clause + '"' + key + '"' + IF_NULL_START + key + IF_NULL_END
            else: # Repeated code.
                for (algo_key, algo_value) in value.items():
                    if algo_key == 'label':
                        continue
                    elif algo_key == 'divide':
                        divide_clause = self._build_divide_clause(algo_value, key)
                        output_clause = output_clause + divide_clause
                    elif algo_key == 'multiply':
                        multiply_clause = self._build_multiply_clause(algo_value, key)
                        output_clause = output_clause + multiply_clause
                    elif algo_key == 'add':
                        add_clause = self._build_add_clause(algo_value, key)
                        output_clause = output_clause + add_clause

        return output_clause

    def _get_field_requires_default_value(self, field_name):

        for fields in FIELDS_TO_DEFAULT_VALUE:
            if field_name.endswith(fields):
                return True

        return False

    @abstractmethod
    def build_query(self, sport_code, team_code, configuration):
        pass

    def _add_init_filter(self, team_code, sport_code, entity):
        if entity.lower() == 'player':
            team_code_match_pl = TEAM_CODE_MATCH % dict(teamCode=team_code, sportCode=sport_code)
            self.pipeline_list.append(json.loads(team_code_match_pl))
            self.pipeline_list.append(json.loads(UNWIND_GAMES))
        elif entity.lower() == 'team':
            team_code_match_pl = TEAM_CODE_MATCH_TEAM_ENTITY % dict(teamCode=team_code)
            self.pipeline_list.append(json.loads(team_code_match_pl))
            self.pipeline_list.append(json.loads(UNWIND_GAMES))
            team_entity_match = TEAM_ENTITY_MATCH % dict(sportCode=sport_code)
            self.pipeline_list.append(json.loads(team_entity_match))
            self.pipeline_list.append(json.loads(TEAM_LOOKUP))
            self.pipeline_list.append(json.loads(UNWIND_LOOKUP))
        else:
            raise ValueError('No Entity Found.')

    def _add_sort_limit(self, configuration):
        if configuration.bonder.sorting:
            sort_clause = self._build_sort_clause(configuration.bonder.sorting)
            self.pipeline_list.append(json.loads(sort_clause))

        limit_docs_pl = LIMIT_RECORDS % dict(limit=(int(configuration.bonder.selection) * 2))
        self.pipeline_list.append(json.loads(limit_docs_pl))

    def _build_group_clause(self, group, stat_clause, player_season_clause):
        group_clause = GROUP_START + '{'
        grp_ind = 1
        for group_items in group:
            grp = '"' + GROUP_CONT + str(grp_ind) + '" : "$' + group_items + '",'
            group_clause += grp
            grp_ind += 1
        group_clause = group_clause[:-1] + '}'

        if len(stat_clause) > 0:
            group_clause += ',' + stat_clause
        if player_season_clause:
            group_clause += player_season_clause

        group_clause += GROUP_END
        return group_clause

    def _build_group_project_clause(self, stats_size, output, player_season):

        project_clause = GROUP_PROJECT_START
        for idx in range(stats_size):
            project_clause += '"' + STATS_CONT + str(idx + 1) + '"' + SELECT_FLAG

        project_clause += self._append_additional_output(output)
        if player_season:
            project_clause += '"playerSeason"' + SELECT_FLAG

        project_clause = project_clause[:-1] + GROUP_PROJECT_END
        return project_clause

    def _append_additional_output(self, output):
        additional_output_items = []
        for output_item in output:
            (key, value), = output_item.items()
            if not key.startswith('group') and not key.startswith('stat'):
                RecordUtils.print_info_log('INFO', 'Additional output is required for field: ' + key)
                additional_output_items.append(output_item)

        return self._build_output_clause(additional_output_items)

    def _add_group_clause(self, group, stat_value, played_season):
        if group:
            # not  sure why i have added the condition. commenting to retest again.
            # commented when got error for record type '100-YARD RUSHING PERFORMANCES - SEASON(page # 21)'
            stat_clause = ''
            if stat_value:
                #raise ValueError('StatValue not found.')
                stat_clause = self._build_stats_clause(stat_value, True)
            group_clause = self._build_group_clause(group, stat_clause, played_season)
            self.pipeline_list.append(json.loads(group_clause))

    def _has_algorithm_projection(self, double_proj_req):
        if double_proj_req:
            return True

        return False


class GameQueryBuilder(AbstractQueryBuilder):

    def __init__(self):
        self.pipeline_list = list()

    def build_query(self, sport_code, team_code, configuration):
        self._add_init_filter(team_code, sport_code, configuration.entity)

        project_pl = PROJECT_START
        if configuration.output:
            output_clause = self._build_output_clause(configuration.output)
            project_pl = project_pl + output_clause

        if configuration.stat_value:
            stats_value = self._build_stats_clause(configuration.stat_value, False)
            project_pl += stats_value

        project_pl = (project_pl[:-1] if project_pl.endswith(',') else project_pl) + PROJECT_END
        project_dict = json.loads(project_pl)
        self.pipeline_list.append(json.loads(project_pl))
        # after json.loads the order is not preserving. so adding another projection of same fields to get the result.
        # hack to get the result. :-)
        if self._has_algorithm_projection(configuration.bonder.double_projection_required):
            self.pipeline_list.append(project_dict)

        # TODO move to proper function such that it will be used by other categories.
        if configuration.match_after:
            match_clause = self._build_match_clause(configuration.match_after)
            self.pipeline_list.append(json.loads(match_clause))

        self._add_sort_limit(configuration)
        return self.pipeline_list


class SeasonQueryBuilder(AbstractQueryBuilder):

    def __init__(self):
        self.pipeline_list = list()

    def build_query(self, sport_code, team_code, configuration):
        self._add_init_filter(team_code, sport_code, configuration.entity)
        self._add_group_clause(configuration.group, configuration.stat_value, None)

        stat_len = len(configuration.stat_value) if configuration.stat_value else 0
        project_clause = self._build_group_project_clause(stat_len, configuration.output, False)
        self.pipeline_list.append(json.loads(project_clause))

        if configuration.match_after:
            match_clause = self._build_match_clause(configuration.match_after)
            self.pipeline_list.append(json.loads(match_clause))
        if configuration.match_before:
             RecordUtils.print_info_log("INFO", "Adding match clause before grouping the values.")
             match_clause = self._build_match_clause(configuration.match_before)
             self.pipeline_list.insert(2, json.loads(match_clause))

        self._add_sort_limit(configuration)

        return self.pipeline_list


class CareerQueryBuilder(AbstractQueryBuilder):

    def __init__(self):
        self.pipeline_list = list()

    def build_query(self, sport_code, team_code, configuration):
        self._add_init_filter(team_code, sport_code, configuration.entity)
        self._add_group_clause(configuration.group, configuration.stat_value, PLAYED_SEASON_GROUP)

        stat_len = len(configuration.stat_value) if configuration.stat_value else 0
        project_clause = self._build_group_project_clause(stat_len, configuration.output, True)
        self.pipeline_list.append(json.loads(project_clause))

        if configuration.match_after:
            match_clause = self._build_match_clause(configuration.match_after)
            self.pipeline_list.append(json.loads(match_clause))
        if configuration.match_before:
            RecordUtils.print_info_log("INFO", "Adding match clause before grouping the values.")
            match_clause = self._build_match_clause(configuration.match_before)
            self.pipeline_list.insert(2, json.loads(match_clause))

        # Not sure, forgot to call the function available in abstract class.
        # commenting on 26-09-2018 to call abstract function.
        '''if configuration.bonder.sorting:
            sort_clause = self._build_sort_clause(configuration.bonder.sorting)
            self.pipeline_list.append(json.loads(sort_clause))

        limit_docs_pl = LIMIT_RECORDS % dict(limit=int(configuration.bonder.selection))
        self.pipeline_list.append(json.loads(limit_docs_pl))'''

        self._add_sort_limit(configuration)

        return self.pipeline_list