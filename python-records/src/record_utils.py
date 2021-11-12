
enable = True


class RecordUtils(object):

    @staticmethod
    def print_debug_log(indicator, message):
        if enable:
            print 'DEBUG : <' + indicator + '> :' + message


    @staticmethod
    def print_info_log(indicator, message):
        print 'INFO : <' + indicator + '> ' + message
