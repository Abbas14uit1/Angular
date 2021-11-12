
import getopt
import sys
import os
from excel_parser import ExcelParser
from xml_generator import XMLGenerator
import traceback


def start_xml_creation(input_dir, output_dir):

    xls_parser = ExcelParser()
    xml_gen = XMLGenerator()
    for root, dirs, files in os.walk(input_dir):
        for name in files:
            if name.startswith('.'):
                continue
            if name.endswith('.xlsx') or name.endswith(".xls"):
                input_file = os.path.join(root, name)
                print "\nProcessing " + input_file
                temp_root = root
                sub_dir = temp_root.replace(input_dir, '') # TODO to find the sub-directory properly.

                basic_fields, home_team_tag, visitor_team_tag, home_team_player_tag_objs, visitor_team_player_tag_objs, \
                        plays_tag_obj = xls_parser.start_parsing(input_file)
                xml_gen.generate_xml(basic_fields, home_team_tag, visitor_team_tag, home_team_player_tag_objs,
                                     visitor_team_player_tag_objs, output_dir, sub_dir, name, plays_tag_obj)


def help():
    print 'xml_file_creator.py -u <uncorrected folder path> -o <output folder path> -c <sportcode>'


def main(argv):
    dir_name = ""
    output_dir_name = ""
    try:
        opts, args = getopt.getopt(argv, "hi:o:", ["input=", "output="])
    except getopt.GetoptError:
        print "Error invald options"
        help()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print "Help Usage: "
            help()
            sys.exit()
        elif opt in ('-i', "--uncorrected"):
            dir_name = arg
        elif opt in ('-o', "--output"):
            output_dir_name = arg
        else:
            print "Error invalid options"
            help()
            sys.exit(2)

    if output_dir_name == "" or dir_name == "":
        help()
        sys.exit(2)

    start_xml_creation(dir_name, output_dir_name)


if __name__ == "__main__":
    main(sys.argv[1:])
