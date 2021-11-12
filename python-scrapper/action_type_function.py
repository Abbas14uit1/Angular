
action_type_event_points_dict = dict()
action_type_event_points_dict['SUB.OUT'] = ''
action_type_event_points_dict['TURNOVER.None'] = 'to:1'
action_type_event_points_dict['STEAL.None'] = 'stl:1'
action_type_event_points_dict['GOOD.3PTR'] = 'fgm3:3,fga3:1'
action_type_event_points_dict['ASSIST.None'] = 'ast:1'
action_type_event_points_dict['MISS.3PTR'] = 'fga3:1'
action_type_event_points_dict['REBOUND.OFF'] = 'oreb:1'
action_type_event_points_dict['FOUL.None'] = 'pf:1'
action_type_event_points_dict['MISS.JUMPER'] = 'fga:1'
action_type_event_points_dict['REBOUND.DEF'] = 'dreb:1'
action_type_event_points_dict['GOOD.LAYUP'] = 'fgm:2,fga:1'
action_type_event_points_dict['GOOD.FT'] = 'ftm:1,fta:1'
action_type_event_points_dict['TIMEOUT.MEDIA'] = ''
action_type_event_points_dict['SUB.IN'] = ''
action_type_event_points_dict['GOOD.DUNK'] = 'fgm:2,fga:1'
action_type_event_points_dict['BLOCK.None'] = 'blk:1'
action_type_event_points_dict['GOOD.JUMPER'] = 'fgm:2,fga:1'
action_type_event_points_dict['MISS.FT'] = 'fta:1'
action_type_event_points_dict['REBOUND.DEADB'] = 'Deadball:1'
action_type_event_points_dict['TIMEOUT.30SEC'] = ''
action_type_event_points_dict['MISS.LAYUP'] = 'fga:1'
action_type_event_points_dict['TIMEOUT.TEAM'] = ''
action_type_event_points_dict['GOOD.TIPIN'] = 'fgm:2,fga:1'
action_type_event_points_dict['MISS.DUNK'] = 'fga:1'
action_type_event_points_dict['MISS.TIPIN'] = 'fga:1'
action_type_event_points_dict['FOUL.TECH'] = 'tf:1'
action_type_event_points_dict['TIMEOUT.20SEC'] = ''

class ActionType(object):

    def __init__(self, event, points):
        self.event = event
        self.points = points


def get_event_points(action, type):
    
    action_type = action + '.' + type
    event_points = action_type_event_points_dict.get(action_type, None)
    if event_points and len(event_points) > 1: # checking length because value is empty in dict.
        event_points_list = []
        event_points_arrs = event_points.split(',')
        for event_points_arr in event_points_arrs:
            event_points_colon_arr = event_points_arr.split(':')
            action_type_obj = ActionType(event_points_colon_arr[0], event_points_colon_arr[1])
            event_points_list.append(action_type_obj)

        return event_points_list

    return None

#----- Test -----------
temp_list = get_event_points('GOOD', 'FT')
if temp_list:
    for temp in temp_list:
        print temp.event + "<->" + temp.points
else:
    print temp_list

print '-------------------------'
keys = action_type_event_points_dict.keys()
for key in keys:
    print key
    action = key.split('.')[0]
    type = key.split('.')[1]
    temp_list = get_event_points(action, type)
    if temp_list:
        for temp in temp_list:
            print temp.event + "<->" + temp.points
    else:
        print temp_list

    print '\n'
    