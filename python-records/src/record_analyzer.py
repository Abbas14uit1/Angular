
from template_provider import TProvider
from record_utils import RecordUtils
from query_builder import MongoQueryBuilder
from mongo_conn_provider import MongoDbConnectionProvider
from query_executor import MongoQueryExecutor
from mongo_template_reader import MongoTemplateReader
from config_provider import ConfigProvider
import traceback
import time
import sys
import getopt

MONGO_DB_NAME='mongo.db.name'

class RecordAnalyzer(object):

    def __init__(self, mongo_conn):
        self.mongo_conn = mongo_conn

    def start_r_anlyzr(self, mongo_db_name, input_template, team_code, team_name):
        RecordUtils.print_info_log('START', 'Started record analyzer')
        tempProvider = TProvider(None, json_data=input_template)
        template_obj = tempProvider.get_template(team_code, team_name)

        #for dimension in template.configuration.dimensions:
        mongo_query_builder = MongoQueryBuilder(template_obj.configuration.dimensions, template_obj)
        mongo_query = mongo_query_builder.build_query()

        query_exec = MongoQueryExecutor(self.mongo_conn, mongo_db_name)
        query_result = query_exec.execute_query(mongo_query, template_obj.configuration.entity)
        upsert_flag = query_exec.upsert_record(input_template, query_result, template_obj)


def _start_process(prop_section, team_code, team_name):
    # get Mongo connection
    mongo_conn_provider = MongoDbConnectionProvider(prop_section)
    mongo_conn = mongo_conn_provider.get_connection()

    config_provider = ConfigProvider(prop_section)
    mongo_db_name = config_provider.get_value(MONGO_DB_NAME)

    template_reader = MongoTemplateReader(mongo_conn, mongo_db_name)
    record_analyzer = RecordAnalyzer(mongo_conn)
    #"recordType" : "Player_Total_Offense_Most_Plays_Game"
    #"status":"Active"
    template_list = template_reader.get_templates_from_mongo({})
    proc_count = 0
    for template in template_list:
        try:
            RecordUtils.print_info_log('START', 'Start for template: ' + template['recordType'])
            RecordUtils.print_info_log('DECOR', '-------------------------------------------------------')
            record_analyzer.start_r_anlyzr(mongo_db_name, template, team_code, team_name)
            proc_count += 1
            RecordUtils.print_info_log('DECOR', '-------------------------------------------------------')
        except Exception, e:
            print e.message
            traceback.print_exc()
            time.sleep(5)
    print ("\nCOMPLETED PROCESSING, Processed Count: " + str(proc_count))

    mongo_conn.close()


def help():
    print 'record_analyzer.py -e <mongo environment name> -c <team code> -n <team name>'


def main(argv):
    prop_section = ''
    team_code = ''
    team_name = ''
    try:
      opts, args = getopt.getopt(argv, "he:c:n:", ["environ_name=","team_code=","team_name="])
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-e', "--environ_name"):
            prop_section = arg
        elif opt in ('-c',"--team_code"):
            team_code = arg
        elif opt in ('-n', "--team_name"):
            team_name = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)

    if prop_section == '' or team_code == '' or team_name == '':
        help()
        sys.exit(2)

    _start_process(prop_section, team_code, team_name)


if __name__ == "__main__":
    main(sys.argv[1:])
