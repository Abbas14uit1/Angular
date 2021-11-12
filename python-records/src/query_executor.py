
from record_utils import RecordUtils
from datetime import datetime
from operator import itemgetter
import traceback

PLAYERS_COLLECTION_NAME = 'players'
TEAMS_COLLECTION_NAME = 'teams'

RECORDS_COLLECTION_NAME = 'records'
RECORD_HISTORY_COLLECTION_NAME = 'recordHistory'

CROSS_DICT = dict()
CROSS_DICT['Visitor Code'] = 'Home Score'
CROSS_DICT['Home Code'] = 'Visitor Score'

class MongoQueryExecutor(object):

    def __init__(self, mongo_client, db_name):
        self.mongo_db = mongo_client[db_name]

    def execute_query(self, pipeline, entity):
        coll_name = PLAYERS_COLLECTION_NAME if entity.lower() == 'player' else TEAMS_COLLECTION_NAME
        record_output = self.mongo_db[coll_name].aggregate(pipeline)
        #RecordUtils.print_info_log("INFO", "Query-Result" + str(list(record_output)))
        return record_output

    def upsert_record(self, input_template, query_result, template_obj):
        record_coll_name = RECORDS_COLLECTION_NAME
        record_hist_coll_name = RECORD_HISTORY_COLLECTION_NAME
        team_code = template_obj.team_code
        record_type = template_obj.record_type
        input_template.pop('_id', None)
        input_template['teamCode'] = int(team_code)
        input_template['teamName'] = template_obj.team_name

        db_record = self.mongo_db[record_coll_name].find({"$and": [{'teamCode': int(team_code)},
                                                            {'recordType': record_type },
                                                            {"configuration.entity": template_obj.configuration.entity}]})

        if db_record.count() > 1:
            raise ValueError('Found more than one record for the given template.')

        mongo_cursor_list = list(query_result)
        query_result_list = self._build_output_dict(mongo_cursor_list, template_obj)
        input_template['intermediateResults'] = mongo_cursor_list
        #  record available delete it to create fresh record.
        if db_record.count() == 1:
            RecordUtils.print_info_log("INFO", "Record already exists. So deleting to create fresh record.")
            self.mongo_db[record_coll_name].delete_one({"$and": [{'teamCode': int(team_code)},
                                                       {'recordType': record_type},
                                                       {"configuration.entity":template_obj.configuration.entity}]})
            RecordUtils.print_info_log("INFO", "Record deleted successfully.")

        history_record = self.mongo_db[record_hist_coll_name].find({"$and": [{'teamCode': int(team_code)},
                                                                   {'recordType': record_type}]})
        formatted_list = self._derive_result_team(query_result_list, template_obj)
        # merging logic with history data.
        if history_record.count() == 0:
            RecordUtils.print_info_log("WARN", "History data not found, continuing with mongo result.")
            input_template['results'] = self._sort_limit_list(formatted_list, template_obj)
        else:
            RecordUtils.print_info_log("INFO", "History data found, Merging with mongo result.")
            history_record_list = history_record[0]['historyRecords']
            change_found, merged_list = self._merge_existing_result(history_record_list, formatted_list)
            input_template['results'] = self._sort_limit_list(merged_list, template_obj)

        self.mongo_db[record_coll_name].insert(input_template, check_keys=False)
        RecordUtils.print_info_log('INSERTER', 'Record inserted successfully')

        '''else: # Record is available update record iff changes in record.
            results_exists = db_record[0]['results']
            formatted_list = self._derive_result_team(query_result_list, template_obj)
            change_found, updated_list = self._merge_existing_result(results_exists, formatted_list)
            if change_found:
                self.mongo_db[record_coll_name].update({"$and": [{'configuration.entityCode': team_code},
                                                                 {'recordType': record_type }]},
                                                       {"$set":
                                                            {'intermediateResults': mongo_cursor_list,
                                                             'results': self._sort_limit_list(updated_list,
                                                                                              template_obj)}
                                                       }
                                                      )
                RecordUtils.print_info_log('UPDATER', 'Record updated successfully')
            else:
                RecordUtils.print_info_log('UPDATER', 'No Change found.')'''

        return True

    def _build_output_dict(self, query_result_list, template_obj):

        labels_dict = self._build_field_labels_dict(template_obj)
        result_list = []
        for query_result in query_result_list:
            result_dict = {}
            for (key, value) in query_result.items():
                output_key = ''
                if key == '_id' and not isinstance(value, dict):
                    continue
                output_key += key
                if isinstance(value, (str, unicode, int)):
                    result_dict[labels_dict[output_key]] = value
                elif isinstance(value, float):
                    label = labels_dict[output_key]
                    if label.lower() == 'percentage':
                        result_dict[label] = round(value * 100, 1)
                    else:
                        result_dict[label] = round(value, 1)
                elif isinstance(value, list):
                    result_dict[labels_dict[output_key]] = self._get_seasons_sorted_list(value)
                elif isinstance(value, datetime):
                    result_dict[labels_dict[output_key]] = self._format_game_date(value)
                elif isinstance(value, dict): # games
                    for (key_d1, value_d1) in value.items():
                        output_key = ('' if key == '_id' else key + '.') + key_d1
                        if isinstance(value_d1, (str, unicode, int)):
                            result_dict[labels_dict[output_key]] = value_d1
                        elif isinstance(value_d1, float):
                            result_dict[labels_dict[output_key]] = round(value_d1, 1)
                        elif isinstance(value_d1, list):
                            result_dict[labels_dict[output_key]] = self._get_seasons_sorted_list(value_d1)
                        elif isinstance(value_d1, datetime):
                            result_dict[labels_dict[output_key]] = self._format_game_date(value_d1)
                        elif isinstance(value_d1, dict): # stats
                            for (key_d2, value_d2) in value_d1.items():
                                output_key = ('' if key == '_id' else key + '.') + key_d1 + '.' + key_d2
                                if isinstance(value_d2, (str, unicode, int)):
                                    result_dict[labels_dict[output_key]] = value_d2
                                elif isinstance(value_d2, float):
                                    result_dict[labels_dict[output_key]] = round(value_d2, 1)
                                elif isinstance(value_d2, list):
                                    result_dict[labels_dict[output_key]] = self._get_seasons_sorted_list(value_d2)
                                elif isinstance(value_d2, datetime):
                                    result_dict[labels_dict[output_key]] = self._format_game_date(value_d2)
                                elif isinstance(value_d2, dict): # rushing, passing
                                    for (key_d3, value_d3) in value_d2.items():
                                        output_key = ('' if key == '_id' else key + '.') + key_d1 + '.' + \
                                                     key_d2 + '.' + key_d3
                                        if isinstance(value_d3, (str, unicode, int)):
                                            result_dict[labels_dict[output_key]] = value_d3
                                        elif isinstance(value_d3, float):
                                            result_dict[labels_dict[output_key]] = round(value_d3, 1)
                                        elif isinstance(value_d3, datetime):
                                            result_dict[labels_dict[output_key]] = self._format_game_date(value_d3)
                                        elif isinstance(value_d3, list):
                                            result_dict[labels_dict[output_key]] = self._get_seasons_sorted_list\
                                                                                (value_d3)
            # Adding the output dict to the result list.
            result_list.append(result_dict)

        return result_list

    '''def _build_result_list(self, query_result_list, template_obj):

        result_list = []
        for query_result_items in query_result_list:
            result_item_dict = {}
            for query_result_item in query_result_items:
                (query_result_item_key, query_result_item_value), = query_result_item.items()
                if query_result_item_key == '_id':
                    continue
                if isinstance(query_result_item_value, str):
                    label = self._get_field_label(query_result_item_key, template_obj)
                    result_item_dict[label] = query_result_item_value
                elif isinstance(query_result_item_value, dict): # games
                    output_key = query_result_item_key + '.'
                    for (query_result_item_kvalue, query_result_item_vvalue) in query_result_item_value.items():
                        if isinstance(query_result_item_vvalue, str):
                            label = self._get_field_label(output_key + query_result_item_kvalue, template_obj)
                            result_item_dict[label] = query_result_item_vvalue
                        elif isinstance(query_result_item_vvalue, dict): # stats
                            for (query_result_item_kkvalue, query_result_item_vvvalue) in query_result_item_vvalue.items():

            for output_item in template_obj.output:

            output_sub_item = output_item.split('.')
    '''

    def _build_field_labels_dict(self, template_obj):

        labels_dict = {}
        for output_item in template_obj.configuration.output:
            (key, value), = output_item.items()
            for (label_key, label_value) in value.items():
                if label_key == 'label':
                    labels_dict[key] = label_value

        return labels_dict

    def _get_seasons_sorted_list(self, seasons):
        if not seasons:
            return seasons
        seasons.sort()
        # TODO check how to calculate 'present' as year.
        return str(seasons[0]) + '-' + str(seasons[len(seasons) - 1])[2:] if len(seasons) > 1 else str(seasons[0])[2:]

    def _merge_existing_result(self, existing_results, new_results):

        new_results_list = list(existing_results)
        change_found = False
        for new_result in new_results:
            found_record = False
            for existing_result in existing_results:
                existing_result_keys = existing_result.keys()
                match_count = 0
                for existing_result_key in existing_result_keys:
                    if existing_result_key.lower() == 'season':
                        if int(existing_result.get(existing_result_key)) == new_result.get(existing_result_key):
                            match_count += 1
                    # To Handle space in name in record history adding below condition.
                    elif isinstance(existing_result.get(existing_result_key), (str, unicode)):
                        if existing_result.get(existing_result_key).strip() == new_result.get(existing_result_key):
                            match_count += 1
                    else:
                        if existing_result.get(existing_result_key) == new_result.get(existing_result_key):
                            match_count += 1
                if len(existing_result_keys) == match_count:
                    found_record = True

            if not found_record:
                change_found = True
                new_results_list.append(new_result)
        return change_found, new_results_list

    def _format_game_date(self, any_date):

        month = any_date.month
        if month == 9:
            return 'Sept.' + any_date.strftime(' %d, %Y')
        else:
            return any_date.strftime('%b. %d, %Y')

    def _sort_limit_list(self, result_list, template_obj):
        # Considering only one sorting key for now.
        sorting = template_obj.configuration.bonder.sorting
        (sorting_key, sorting_value), = sorting.items()
        output_dict = self._build_field_labels_dict(template_obj)
        dict_sort_key = output_dict.get(sorting_key, None)
        sorted_result_list = []
        if dict_sort_key is None:
            sorted_result_list = result_list

        try :
            if sorting_value == 'dsc':
                sorted_result_list = sorted(result_list, key=itemgetter(dict_sort_key), reverse=True)
            else:
                sorted_result_list = sorted(result_list, key=itemgetter(dict_sort_key))
        except Exception as exp:
            RecordUtils.print_info_log("ERROR", "While Sorting records got error.")
            RecordUtils.print_info_log("ERROR", str(exp))
            sorted_result_list = []
            traceback.print_exc()

        limit = int(template_obj.configuration.bonder.selection) * 2
        return sorted_result_list[:limit]

    def _derive_result_team(self, result_list, template_obj):
        if template_obj.configuration.entity.lower() != 'team':
            return result_list

        for result in result_list:
            oppo_score = 0
            team_score = 0
            for (key, value) in result.items():
                if key == 'Visitor Code' and value == int(template_obj.team_code):
                    oppo_score = result['Home Score']
                    team_score = result['Visitor Score']
                    break
                elif key == 'Home Code' and value == int(template_obj.team_code):
                    oppo_score = result['Visitor Score']
                    team_score = result['Home Score']
                    break
            game_result = 'W' if (team_score - oppo_score) > 0 else 'L'
            result['Result'] = str(team_score) + '-' + str(oppo_score) + ' ' + game_result
            result.pop('Visitor Code', None)
            result.pop('Home Code', None)
            result.pop('Visitor Score', None)
            result.pop('Home Score', None)

        return result_list