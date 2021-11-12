from datetime import datetime
import re

FB_GAME_SOURCE = 'Scanned PDF'
FB_GAME_VERSION = '2.0'

NITE_GAME_HOURS = 18
NA_DEF_VALUE = 0
NA_CHAR = '#'


class BasicFieldsStore(object):

    def __init__(self):
        self.fbgame_tag = dict()
        self.venue_tag = dict()
        self.venue_officials_tag = dict()
        self.venue_rules_tag = dict()

    def fill_fbgame_tag(self):
        curr_date = datetime.now().strftime('%m/%d/%Y')
        self.fbgame_tag['source'] = FB_GAME_SOURCE
        self.fbgame_tag['version'] = FB_GAME_VERSION
        self.fbgame_tag['generated'] = curr_date


    def fill_venue_tag(self, home_team_name, home_team_id, visitor_team_name, visitor_team_id, game_id, game_date,
                       stadium, location, attendance, kick_off_time, game_end_time, total_elapsed_time, temperature, wind, weather):
        self.venue_tag['gameid'] = game_id
        self.venue_tag['visid'] = visitor_team_id
        self.venue_tag['homeid'] = home_team_id
        self.venue_tag['visname'] = visitor_team_name
        self.venue_tag['homename'] = home_team_name
        self.venue_tag['date'] = self._conv_game_date(game_date)
        self.venue_tag['location'] = location
        self.venue_tag['stadium'] = stadium
        self.venue_tag['start'] = kick_off_time
        self.venue_tag['end'] = game_end_time
        self.venue_tag['neutralgame'] = 'N'  # TODO we will calculate later the neutral Game
        self.venue_tag['nitegame'] = self._is_nite_game(kick_off_time)
        self.venue_tag['duration'] = total_elapsed_time
        self.venue_tag['attend'] = attendance
        self.venue_tag['temp'] = temperature
        self.venue_tag['wind'] = wind
        self.venue_tag['weather'] = weather


    def fill_venue_official_tag(self, referee, umpire, head_linesman, line_judge, field_judge, side_judge, back_judge):
        self.venue_officials_tag['ref'] = referee
        self.venue_officials_tag['ump'] = umpire
        self.venue_officials_tag['line'] = head_linesman
        self.venue_officials_tag['lj'] = line_judge
        self.venue_officials_tag['bj'] = back_judge
        self.venue_officials_tag['fj'] = field_judge
        self.venue_officials_tag['sj'] = side_judge
        # cj = "Bryan Banks"
        # alt = "Bryan Banks"
        self.venue_tag['officials'] = self.venue_officials_tag


    def fill_venue_rules_tag(self):
        self.venue_rules_tag['qtrs'] = '4'
        self.venue_rules_tag['mins'] = '15'
        self.venue_rules_tag['downs'] = '4'
        self.venue_rules_tag['yds'] = '10'
        self.venue_rules_tag['kospot'] = '35'
        self.venue_rules_tag['tbspot'] = '20'
        self.venue_rules_tag['kotbspot'] = '25'
        self.venue_tag['rules'] = self.venue_rules_tag

    def _conv_game_date(self, game_date):
        try:
            return datetime.strptime(game_date, '%b %d,%Y').strftime('%m/%d/%Y')
        except Exception as e:
            print 'ERROR. Game Date is not correct Format. Should be <Mon DD,YYYY>Message: ' + str(e.message)
            raise e

    def _is_nite_game(self, kick_off_time):
        if kick_off_time == NA_CHAR:
            return NA_DEF_VALUE
        try:
            game_time_24hrs = datetime.strptime(kick_off_time, '%I:%M %p').strftime('%H:%M')
        except Exception as e:
            print 'ERROR: Incorrect <Time Of Game Kickoff>. \n'
            raise e
        hrs = game_time_24hrs.split(':')[0]
        if int(hrs) >= NITE_GAME_HOURS:
            return 'Y'
        return 'N'


class TeamTagsFieldsStore(object):

    def __init__(self, vh):
        self.vh = vh
        self.team_tag = dict()
        self.team_linescore_tag = dict()
        self.team_linescore_lineprd_tag = dict()
        self.team_totals_tag = dict()
        self.team_totals_firstdowns_tag = dict()
        self.team_totals_penalties_tag = dict()
        self.team_totals_conversions_tag = dict()
        self.team_totals_fumbles_tag = dict()
        self.team_totals_misc_tag = dict()
        self.team_totals_redzone_tag = dict()
        self.team_totals_rush_tag = dict()
        self.team_totals_pass_tag = dict()
        self.team_totals_rcv_tag = dict()
        self.team_totals_punt_tag = dict()
        self.team_totals_ko_tag = dict()
        self.team_totals_fg_tag = dict()
        self.team_totals_pat_tag = dict()
        self.team_totals_kr_tag = dict()
        self.team_totals_pr_tag = dict()
        self.team_totals_ir_tag = dict()
        self.team_totals_scoring_tag = dict()
        self.team_totals_defense_tag = dict()


    def fill_team_tag(self, team_name, team_id):
        self.team_tag['vh'] = self.vh
        self.team_tag['id'] = team_id
        self.team_tag['name'] = team_name
        self.team_tag['record'] = '0-0'
        # self.home_team_tag.team_tag['abb'] = 'F'
        # self.home_team_tag.team_tag['rank'] = '3'

    def fill_team_linescore_tag(self, team_q1_score, team_q2_score, team_q3_score, team_q4_score, team_ot_score, team_tot_score):
        self.team_linescore_tag['prds'] = self._get_number_of_prds(team_ot_score)
        self.team_linescore_tag['line'] = self._get_prds_score(team_q1_score, team_q2_score, team_q3_score,
                                                                   team_q4_score, team_ot_score)
        self.team_linescore_tag['score'] = team_tot_score

        self.team_linescore_lineprd_tag['1'] = team_q1_score
        self.team_linescore_lineprd_tag['2'] = team_q2_score
        self.team_linescore_lineprd_tag['3'] = team_q3_score
        self.team_linescore_lineprd_tag['4'] = team_q4_score
        if team_ot_score != NA_DEF_VALUE:
            self.team_linescore_lineprd_tag['ot'] = team_ot_score

    def _get_number_of_prds(self, home_team_ot_score):
        if home_team_ot_score == NA_DEF_VALUE:
            return '4'
        return '5'

    def _get_prds_score(self, home_team_q1_score, home_team_q2_score, home_team_q3_score, home_team_q4_score, home_team_ot_score):
        prds_score_str = home_team_q1_score + ',' + home_team_q2_score + ',' + home_team_q3_score + ',' + home_team_q4_score
        if home_team_ot_score == NA_DEF_VALUE:
            return prds_score_str
        return prds_score_str + ',' + home_team_ot_score

    def fill_team_totals_tag(self, team_stats_total_offensive_plays, team_stats_total_net_yards):
        self.team_totals_tag['totoff_plays'] = team_stats_total_offensive_plays
        self.team_totals_tag['totoff_yards'] = team_stats_total_net_yards
        self.team_totals_tag['totoff_avg'] = round(float(team_stats_total_net_yards)/float(team_stats_total_offensive_plays), 2)

    def fill_team_totals_firstdowns_tag(self, team_stats_first_downs, team_stats_rushing, team_stats_passing, team_stats_penalty):
        self.team_totals_firstdowns_tag['no'] = team_stats_first_downs
        self.team_totals_firstdowns_tag['rush'] = team_stats_rushing
        self.team_totals_firstdowns_tag['pass'] = team_stats_passing
        self.team_totals_firstdowns_tag['penalty'] = team_stats_penalty

    def fill_team_totals_penalties_tag(self, team_stats_penalties_number_yards):
        if team_stats_penalties_number_yards.strip() == NA_CHAR:
            team_stats_penalties_number_yards = str(NA_DEF_VALUE) + '-' + str(NA_DEF_VALUE)

        team_stats_penalties_number_yards_arr = team_stats_penalties_number_yards.split('-')
        self.team_totals_penalties_tag['no'] = team_stats_penalties_number_yards_arr[0]
        self.team_totals_penalties_tag['yds'] = team_stats_penalties_number_yards_arr[1]

    def fill_team_totals_conversions_tag(self, team_stats_thirddown_conversions, team_stats_fourthdown_conversions):
        if team_stats_thirddown_conversions.strip() == NA_CHAR:
            team_stats_thirddown_conversions = str(NA_DEF_VALUE) + ' of ' + str(NA_DEF_VALUE)

        team_stats_thirddown_conversions_arr = team_stats_thirddown_conversions.lower().split('of')
        self.team_totals_conversions_tag['thirdconv'] = team_stats_thirddown_conversions_arr[0].strip()
        self.team_totals_conversions_tag['thirdatt'] = team_stats_thirddown_conversions_arr[1].strip()

        if team_stats_fourthdown_conversions == NA_CHAR:
            team_stats_fourthdown_conversions = str(NA_DEF_VALUE) + ' of ' + str(NA_DEF_VALUE)

        team_stats_fourthdown_conversions_arr = team_stats_fourthdown_conversions.lower().split('of')
        self.team_totals_conversions_tag['fourthconv'] = team_stats_fourthdown_conversions_arr[0].strip()
        self.team_totals_conversions_tag['fourthatt'] = team_stats_fourthdown_conversions_arr[0].strip()

    def fill_team_totals_fumbles_tag(self, team_stats_fumbles__number_lost):
        if team_stats_fumbles__number_lost.strip() == NA_CHAR:
            team_stats_fumbles__number_lost = str(NA_DEF_VALUE) + '-' + str(NA_DEF_VALUE)

        team_stats_fumbles__number_lost_arr = team_stats_fumbles__number_lost.split('-')
        self.team_totals_fumbles_tag['no'] = team_stats_fumbles__number_lost_arr[0]
        self.team_totals_fumbles_tag['lost'] = team_stats_fumbles__number_lost_arr[1]

    def fill_team_totals_misc_tag(self, team_stats_possession_time):
        self.team_totals_misc_tag['yds'] = "0"
        self.team_totals_misc_tag['top'] = team_stats_possession_time if team_stats_possession_time != NA_CHAR else '-'
        self.team_totals_misc_tag['ona'] = "0"
        self.team_totals_misc_tag['onm'] = "0"
        self.team_totals_misc_tag['ptsto'] = "0"

    def fill_team_totals_redzone_tag(self, team_stats_redzone_scores_chances):
        if team_stats_redzone_scores_chances == NA_CHAR + '-' + NA_CHAR:
            team_stats_redzone_scores_chances = str(NA_DEF_VALUE) + '-' + str(NA_DEF_VALUE)
        team_stats_redzone_scores_chances_arr = team_stats_redzone_scores_chances.split('-')
        att = NA_DEF_VALUE if team_stats_redzone_scores_chances_arr[0] == NA_CHAR else team_stats_redzone_scores_chances_arr[0]
        scores = NA_DEF_VALUE if team_stats_redzone_scores_chances_arr[1] == NA_CHAR else team_stats_redzone_scores_chances_arr[1]
        self.team_totals_redzone_tag['att'] = att
        self.team_totals_redzone_tag['scores'] = scores
        self.team_totals_redzone_tag['points'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['tdrush'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['tdpass'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['fgmade'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['endfga'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['enddowns'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['endint'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['endfumb'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['endhalf'] = str(NA_DEF_VALUE)
        self.team_totals_redzone_tag['endgame'] = str(NA_DEF_VALUE)

    def fill_team_totals_rush_tag(self, team_stats_rushing_attempts, team_stats_yards_gained_rushes, team_stats_yards_lost_rushes,
                                  team_stats_net_yards_rushing, indi_stats_rushing_list):
        self.team_totals_rush_tag['att'] = self._get_rushing_attempts(indi_stats_rushing_list, team_stats_rushing_attempts)
        yds = self._get_rushing_yds(indi_stats_rushing_list, team_stats_net_yards_rushing, team_stats_yards_gained_rushes,
                                    team_stats_yards_lost_rushes)
        self.team_totals_rush_tag['yds'] = yds
        self.team_totals_rush_tag['gain'] = self._get_rushing_gain(indi_stats_rushing_list, team_stats_yards_gained_rushes,
                                                                   yds, team_stats_yards_lost_rushes)
        self.team_totals_rush_tag['loss'] = self._get_rushing_losses(indi_stats_rushing_list, team_stats_yards_lost_rushes,
                                                                     yds, team_stats_yards_gained_rushes)
        self.team_totals_rush_tag['td'] = self._get_tds(indi_stats_rushing_list)
        self.team_totals_rush_tag['long'] = self._get_long(indi_stats_rushing_list)

    def _get_rushing_attempts(self, indi_stats_rushing_list, team_stats_rushing_attempts):
        if team_stats_rushing_attempts not in [NA_CHAR, '0']:
            return team_stats_rushing_attempts
        atts = 0
        for indi_stats_rushing in indi_stats_rushing_list:
            if indi_stats_rushing.player_name.lower() == 'total':
                continue
            att = indi_stats_rushing.att
            if att != NA_DEF_VALUE:
                atts = atts + int(att)

        return str(atts)

    def _get_rushing_yds(self, indi_stats_rushing_list, team_stats_net_yards_rushing, gains, losses):
        if team_stats_net_yards_rushing not in [NA_CHAR, '0']:
            return team_stats_net_yards_rushing
        # To handle the total yards itself is '0' scenario. Eg: Purdue vs Washington 1990 both gain & lost are 64
        if int(gains) > 0 and int(losses) > 0:
            return str(int(gains) - int(losses))
        yds = 0
        for indi_stats_rushing in indi_stats_rushing_list:
            if indi_stats_rushing.player_name.lower() == 'total':
                continue
            net = indi_stats_rushing.net
            if net != NA_DEF_VALUE:
                yds = yds + int(net)

        return str(yds)

    def _get_rushing_gain(self, indi_stats_rushing_list, team_stats_yards_gained_rushes, yds, losses):
        if team_stats_yards_gained_rushes not in [NA_CHAR, '0']:
            return team_stats_yards_gained_rushes
        gains = 0
        for indi_stats_rushing in indi_stats_rushing_list:
            if indi_stats_rushing.player_name.lower() == 'total':
                continue
            gain = indi_stats_rushing.gain
            if gain != NA_DEF_VALUE:
                gains = gains + int(gain)

        if gains > 0:
            return str(gains)

        if int(yds) > 0 and int(losses) > 0:
            return str(int(yds) + int(losses))

        return str('0')

    def _get_rushing_losses(self, indi_stats_rushing_list, team_stats_yards_lost_rushes, yds, gains):
        if team_stats_yards_lost_rushes not in [NA_CHAR, '0']:
            return team_stats_yards_lost_rushes
        losses = 0
        for indi_stats_rushing in indi_stats_rushing_list:
            if indi_stats_rushing.player_name.lower() == 'total':
                continue
            lost = indi_stats_rushing.lost
            if lost != NA_DEF_VALUE:
                losses = losses + int(lost)

        if losses > 0:
            return str(losses)

        if int(yds) > 0 and int(gains) > 0:
            return str(int(yds) - int(gains))

        return str('0')

    def _get_tds(self, indi_stats_list):
        tds = 0
        for indi_stats in indi_stats_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            td = indi_stats.td
            if td == NA_DEF_VALUE:
                tds = tds + 0
            else:
                tds = tds + int(td)

        return str(tds)

    def _get_long(self, indi_stats_list):
        rlong = 0
        for indi_stats in indi_stats_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            lg = indi_stats.long
            if lg == NA_DEF_VALUE:
                continue

            if rlong < int(lg):
                rlong = int(lg)

        return NA_DEF_VALUE if rlong == 0 else str(rlong)

    def _get_nos(self, indi_stats_list):
        nos = 0
        for indi_stats in indi_stats_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            no = indi_stats.no
            if no == NA_DEF_VALUE:
                nos = nos + 0
            else:
                nos = nos + int(no)

        return str(nos)

    def _get_yds(self, indi_stats_list):
        yds = 0
        for indi_stats in indi_stats_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            yd = indi_stats.yards
            if yd == NA_DEF_VALUE:
                yds = yds + 0
            else:
                yds = yds + int(yd)

        return str(yds)

    def fill_team_totals_pass_tag(self, team_stats_net_yards_passing, team_stats_passes_attempted, team_stats_passes_completed,
                                  team_stats_had_intercepted, team_stats_sacks_by, indi_stats_passing_list):

        self.team_totals_pass_tag['comp'] = self._get_team_stats_passes_completed(team_stats_passes_completed, indi_stats_passing_list)
        self.team_totals_pass_tag['att'] = self._get_team_stats_passes_attempted(team_stats_passes_attempted, indi_stats_passing_list)
        self.team_totals_pass_tag['int'] = self._get_team_stats_had_intercepted(team_stats_had_intercepted, indi_stats_passing_list)
        self.team_totals_pass_tag['yds'] = self._get_team_stats_net_yards_passing(team_stats_net_yards_passing, indi_stats_passing_list)
        self.team_totals_pass_tag['td'] = self._get_tds(indi_stats_passing_list)
        self.team_totals_pass_tag['long'] = self._get_long(indi_stats_passing_list)
        if team_stats_sacks_by.strip() == NA_CHAR:
            team_stats_sacks_by = str(NA_DEF_VALUE) + '-' + str(NA_DEF_VALUE)
        team_stats_sacks_by_arr = team_stats_sacks_by.split('-')
        self.team_totals_pass_tag['sacks'] = team_stats_sacks_by_arr[0]
        self.team_totals_pass_tag['sackyds'] = team_stats_sacks_by_arr[1]

    def _get_team_stats_passes_completed(self, team_stats_passes_completed, indi_stats_passing_list):
        if team_stats_passes_completed != NA_CHAR:
            return team_stats_passes_completed

        completed = 0
        for indi_stats in indi_stats_passing_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            indi_stats_arr = indi_stats.att_comp_int.split('-')
            complete = indi_stats_arr[1]
            if complete != NA_CHAR:
                completed = completed + int(complete)

        return NA_DEF_VALUE if completed == 0 else completed

    def _get_team_stats_passes_attempted(self, team_stats_passes_attempted, indi_stats_passing_list):
        if team_stats_passes_attempted != NA_CHAR:
            return team_stats_passes_attempted

        attempted = 0
        for indi_stats in indi_stats_passing_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            indi_stats_arr = indi_stats.att_comp_int.split('-')
            attempt = indi_stats_arr[0]
            if attempt != NA_CHAR:
                attempted = attempted + int(attempt)

        return NA_DEF_VALUE if attempted == 0 else attempted

    def _get_team_stats_had_intercepted(self, team_stats_had_intercepted, indi_stats_passing_list):
        if team_stats_had_intercepted != NA_CHAR:
            return team_stats_had_intercepted

        intercepted = 0
        for indi_stats in indi_stats_passing_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            indi_stats_arr = indi_stats.att_comp_int.split('-')
            intercept = indi_stats_arr[2]
            if intercept != NA_CHAR:
                intercepted = intercepted + int(intercept)

        return NA_DEF_VALUE if intercepted == 0 else intercepted

    def _get_team_stats_net_yards_passing(self, team_stats_net_yards_passing, indi_stats_passing_list):
        if team_stats_net_yards_passing != NA_CHAR:
            return team_stats_net_yards_passing

        passing_yds = 0
        for indi_stats in indi_stats_passing_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            passing_yd = indi_stats.yards
            if passing_yd != NA_CHAR:
                passing_yds = passing_yds + int(passing_yd)

        return NA_DEF_VALUE if passing_yds == 0 else passing_yds


    def fill_team_totals_rcv_tag(self, indi_stats_passing_rec_list):
        self.team_totals_rcv_tag['no'] = self._get_nos(indi_stats_passing_rec_list)
        self.team_totals_rcv_tag['yds'] = self._get_yds(indi_stats_passing_rec_list)
        self.team_totals_rcv_tag['td'] = self._get_tds(indi_stats_passing_rec_list)
        self.team_totals_rcv_tag['long'] = self._get_long(indi_stats_passing_rec_list)

    def fill_team_totals_punt_tag(self, team_stats_number_of_punts_yards, team_stats_punting_inside_20,
                                                team_stats_punting_50plus, team_stats_punting_touchback,
                                                team_stats_punting_fair_catch, indi_stats_punting_list):
        if team_stats_number_of_punts_yards == NA_CHAR + '-' + NA_CHAR:
            team_stats_number_of_punts_yards = str(NA_DEF_VALUE) + '-' + str(NA_DEF_VALUE)
        team_stats_number_of_punts_yards_arr = team_stats_number_of_punts_yards.split('-')
        if len(team_stats_number_of_punts_yards_arr) != 2:
            print 'ERROR: <Number of Punts - Yards> value is not correct in excel.\n'
            raise ValueError('<Number of Punts - Yards> value is not correct in excel.')
        self.team_totals_punt_tag['no'] = team_stats_number_of_punts_yards_arr[0]
        self.team_totals_punt_tag['yds'] = team_stats_number_of_punts_yards_arr[1]
        self.team_totals_punt_tag['long'] = self._get_long(indi_stats_punting_list)
        self.team_totals_punt_tag['blkd'] = self._get_team_stats_punting_blkd(indi_stats_punting_list)
        self.team_totals_punt_tag['tb'] = self._get_team_stats_punting_touchback(team_stats_punting_touchback, indi_stats_punting_list)
        self.team_totals_punt_tag['fc'] = self._get_team_stats_punting_fair_catch(team_stats_punting_fair_catch, indi_stats_punting_list)
        self.team_totals_punt_tag['plus50'] = self._get_team_stats_punting_50plus(team_stats_punting_50plus, indi_stats_punting_list)
        self.team_totals_punt_tag['inside20'] = self._get_team_stats_punting_inside_20(team_stats_punting_inside_20, indi_stats_punting_list)
        self.team_totals_punt_tag['avg'] = self._calc_avg(team_stats_number_of_punts_yards_arr[1], team_stats_number_of_punts_yards_arr[0])

    def _get_team_stats_punting_blkd(self, indi_stats_punting_list):
        blkds = 0
        for indi_stats_punting in indi_stats_punting_list:
            if indi_stats_punting.player_name.lower() == 'total':
                continue
            blkd = indi_stats_punting.blkd
            if blkd != NA_CHAR:
                blkds = blkds + int(blkd)

        return NA_DEF_VALUE if blkds == 0 else blkds

    def _get_team_stats_punting_touchback(self, team_stats_punting_touchback, indi_stats_punting_list):
        if team_stats_punting_touchback != NA_CHAR:
            team_stats_punting_touchback

        tbs = 0
        for indi_stats_punting in indi_stats_punting_list:
            if indi_stats_punting.player_name.lower() == 'total':
                continue
            tb = indi_stats_punting.tb
            if tb != NA_CHAR:
                tbs = tbs + int(tb)

        return NA_DEF_VALUE if tbs == 0 else tbs

    def _get_team_stats_punting_fair_catch(self, team_stats_punting_fair_catch, indi_stats_punting_list):
        if team_stats_punting_fair_catch != NA_CHAR:
            team_stats_punting_fair_catch

        fcs = 0
        for indi_stats_punting in indi_stats_punting_list:
            if indi_stats_punting.player_name.lower() == 'total':
                continue
            fc = indi_stats_punting.fc
            if fc != NA_CHAR:
                fcs = fcs + int(fc)

        return NA_DEF_VALUE if fcs == 0 else fcs

    def _get_team_stats_punting_50plus(self, team_stats_punting_50plus, indi_stats_punting_list):
        if team_stats_punting_50plus != NA_CHAR:
            team_stats_punting_50plus

        punting_50plus = 0
        for indi_stats_punting in indi_stats_punting_list:
            if indi_stats_punting.player_name.lower() == 'total':
                continue
            punting_50p = indi_stats_punting.fifty_plus
            if punting_50p != NA_CHAR:
                punting_50plus = punting_50plus + int(punting_50p)

        return NA_DEF_VALUE if punting_50plus == 0 else punting_50plus

    def _get_team_stats_punting_inside_20(self, team_stats_punting_inside_20, indi_stats_punting_list):
        if team_stats_punting_inside_20 != NA_CHAR:
            team_stats_punting_inside_20

        inside_20s = 0
        for indi_stats_punting in indi_stats_punting_list:
            if indi_stats_punting.player_name.lower() == 'total':
                continue
            inside_20 = indi_stats_punting.inside20
            if inside_20 != NA_CHAR:
                inside_20s = inside_20s + int(inside_20)

        return NA_DEF_VALUE if inside_20s == 0 else inside_20s

    def _calc_avg(self, field1, field2):
        if int(field2) == 0:
            return 0
        return round(float(field1) / float(field2), 2)

    def fill_team_totals_ko_tag(self, team_stats_kickoff_number_yards, team_stats_kickoff_touchback, indi_stats_kick_offs_list):
        self.team_totals_ko_tag['no'] = self._get_team_stats_kickoff_number(team_stats_kickoff_number_yards, indi_stats_kick_offs_list)
        self.team_totals_ko_tag['yds'] = self._get_team_stats_kickoff_yards(team_stats_kickoff_number_yards, indi_stats_kick_offs_list)
        self.team_totals_ko_tag['ob'] = self._get_team_stats_kickoff_obs(indi_stats_kick_offs_list)
        self.team_totals_ko_tag['tb'] = self._get_team_stats_kickoff_tbs(team_stats_kickoff_touchback, indi_stats_kick_offs_list)
        self.team_totals_ko_tag['fcyds'] = self._get_team_stats_kickoff_fcyds(indi_stats_kick_offs_list)

    def _get_team_stats_kickoff_number(self, team_stats_kickoff_number_yards, indi_stats_kick_offs_list):
        if team_stats_kickoff_number_yards != NA_CHAR:
            numbers = team_stats_kickoff_number_yards.split('-')[0]
            return NA_DEF_VALUE if numbers == NA_CHAR else numbers

        numbers = 0
        for indi_stats_kick_offs in indi_stats_kick_offs_list:
            if indi_stats_kick_offs.player_name.lower() == 'total':
                continue
            number = indi_stats_kick_offs.no
            if number != NA_CHAR:
                numbers = numbers + int(number)
        return NA_DEF_VALUE if numbers == 0 else numbers

    def _get_team_stats_kickoff_yards(self, team_stats_kickoff_number_yards, indi_stats_kick_offs_list):
        if team_stats_kickoff_number_yards != NA_CHAR:
            yards = team_stats_kickoff_number_yards.split('-')[1]
            return NA_DEF_VALUE if yards == NA_CHAR else yards

        yards = 0
        for indi_stats_kick_offs in indi_stats_kick_offs_list:
            if indi_stats_kick_offs.player_name.lower() == 'total':
                continue
            yard = indi_stats_kick_offs.yds
            if yard != NA_CHAR:
                yards = yards + int(yard)
        return NA_DEF_VALUE if yards == 0 else yards

    def _get_team_stats_kickoff_obs(self, indi_stats_kick_offs_list):
        obs = 0
        for indi_stats_kick_offs in indi_stats_kick_offs_list:
            if indi_stats_kick_offs.player_name.lower() == 'total':
                continue
            ob = indi_stats_kick_offs.ob
            if ob != NA_CHAR:
                obs = obs + int(ob)
        return NA_DEF_VALUE if obs == 0 else obs

    def _get_team_stats_kickoff_tbs(self, team_stats_kickoff_touchback, indi_stats_kick_offs_list):
        if team_stats_kickoff_touchback != NA_CHAR:
            return team_stats_kickoff_touchback

        tbs = 0
        for indi_stats_kick_offs in indi_stats_kick_offs_list:
            if indi_stats_kick_offs.player_name.lower() == 'total':
                continue
            tb = indi_stats_kick_offs.tb
            if tb != NA_CHAR:
                tbs = tbs + int(tb)
        return NA_DEF_VALUE if tbs == 0 else tbs

    def _get_team_stats_kickoff_fcyds(self, indi_stats_kick_offs_list):
        fcyards = 0
        for indi_stats_kick_offs in indi_stats_kick_offs_list:
            if indi_stats_kick_offs.player_name.lower() == 'total':
                continue
            fcyard = indi_stats_kick_offs.fcyds
            if fcyard != NA_CHAR:
                fcyards = fcyards + int(fcyard)
        return NA_DEF_VALUE if fcyards == 0 else fcyards


    def fill_team_totals_fg_tag(self, team_stats_fields_goals_total_made, indi_stats_field_goal_list):

        self.team_totals_fg_tag['made'] = self._get_mades(team_stats_fields_goals_total_made, indi_stats_field_goal_list)
        self.team_totals_fg_tag['att'] = self._get_atts(team_stats_fields_goals_total_made, indi_stats_field_goal_list)
        self.team_totals_fg_tag['long'] = self._get_long(indi_stats_field_goal_list)
        self.team_totals_fg_tag['blkd'] = self._get_blkds(indi_stats_field_goal_list)


    def _get_mades(self, team_stats_fields_goals_total_made, indi_stats_list):
        if team_stats_fields_goals_total_made != NA_CHAR:
            made = team_stats_fields_goals_total_made.split('-')[1]
            return NA_DEF_VALUE if made == NA_CHAR else made

        mades = 0
        for indi_stats in indi_stats_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            made = indi_stats.made
            if made == NA_DEF_VALUE:
                mades = mades + 0
            else:
                mades = mades + int(made)

        return str(mades)

    def _get_atts(self, team_stats_fields_goals_total_made, indi_stats_list):
        if team_stats_fields_goals_total_made != NA_CHAR:
            atts = team_stats_fields_goals_total_made.split('-')[0]
            return NA_DEF_VALUE if atts == NA_CHAR else atts

        atts = 0
        for indi_stats in indi_stats_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            att = indi_stats.att
            if att == NA_CHAR:
                atts = atts + 0
            else:
                atts = atts + int(att)

        return str(atts)

    def _get_blkds(self, indi_stats_list):
        blkds = 0
        for indi_stats in indi_stats_list:
            if indi_stats.player_name.lower() == 'total':
                continue
            blkd = indi_stats.blkd
            if blkd == NA_DEF_VALUE:
                blkds = blkds + 0
            else:
                blkds = blkds + int(blkd)

        return str(blkds)

    def fill_team_totals_pat_tag(self, team_stats_pat_total_made):
        if team_stats_pat_total_made == NA_CHAR + '-' + NA_CHAR:
            team_stats_pat_total_made = str(NA_DEF_VALUE) + '-' + str(NA_DEF_VALUE)
        team_stats_pat_total_made_arr = team_stats_pat_total_made.split('-')
        self.team_totals_pat_tag['kickatt'] = team_stats_pat_total_made_arr[0]
        self.team_totals_pat_tag['kickmade'] = team_stats_pat_total_made_arr[1]


    def fill_team_totals_kr_tag(self, team_stats_kickoff_returns_number_yards, indi_stats_all_returns):
        if team_stats_kickoff_returns_number_yards.strip() == NA_CHAR + '-' + NA_CHAR + '-' + NA_CHAR:
            team_stats_kickoff_returns_number_yards = self._get_kr_stats(indi_stats_all_returns)

        team_stats_kickoff_returns_number_yards_arr = team_stats_kickoff_returns_number_yards.split('-')
        nos = NA_DEF_VALUE if team_stats_kickoff_returns_number_yards_arr[0] == NA_CHAR else team_stats_kickoff_returns_number_yards_arr[0]
        yds = NA_DEF_VALUE if team_stats_kickoff_returns_number_yards_arr[1] == NA_CHAR else team_stats_kickoff_returns_number_yards_arr[1]
        self.team_totals_kr_tag['no'] = nos
        self.team_totals_kr_tag['yds'] = yds
        tds = NA_DEF_VALUE if team_stats_kickoff_returns_number_yards_arr[2] == NA_CHAR else team_stats_kickoff_returns_number_yards_arr[2]
        self.team_totals_kr_tag['td'] = tds
        self.team_totals_kr_tag['long'] = self._get_long_kr(indi_stats_all_returns)

    def _get_long_kr(self, indi_stats_all_returns):
        kr_long = 0
        for indi_stats_all_return in indi_stats_all_returns:
            if indi_stats_all_return.player_name.lower() == 'total':
                continue

            kr = indi_stats_all_return.kickoff_no_yds_lp
            if len(kr.strip()) == 0:
                continue
            kr_arr = kr.split('-')
            if len(kr_arr) != 3:
                continue
            kr_long = int(kr_arr[2]) if int(kr_arr[2]) > int(kr_long) else kr_long
        return str(kr_long) if kr_long != 0 else str(NA_DEF_VALUE)

    def _get_kr_stats(self, indi_stats_all_returns):
        kr_nos = kr_yds = 0
        for indi_stats_all_return in indi_stats_all_returns:
            if indi_stats_all_return.player_name.lower() == 'total':
                continue

            kr = indi_stats_all_return.kickoff_no_yds_lp
            if len(kr.strip()) == 0:
                continue
            kr_arr = kr.split('-')
            if len(kr_arr) != 3:
                continue
            kr_nos = kr_nos + int(kr_arr[0])
            kr_yds = kr_yds + int(kr_arr[1])
        return str(kr_nos) + '-' + str(kr_yds) + '-' + NA_CHAR

    def fill_team_totals_pr_tag(self, team_stats_punt_returns_number_yards, indi_stats_all_returns):
        if team_stats_punt_returns_number_yards.strip() == NA_CHAR + '-' + NA_CHAR + '-' + NA_CHAR:
            team_stats_punt_returns_number_yards = self._get_pr_stats(indi_stats_all_returns)

        team_stats_punt_returns_number_yards_arr = team_stats_punt_returns_number_yards.split('-')
        nos = NA_DEF_VALUE if team_stats_punt_returns_number_yards_arr[0] == NA_CHAR else team_stats_punt_returns_number_yards_arr[0]
        yds = NA_DEF_VALUE if team_stats_punt_returns_number_yards_arr[1] == NA_CHAR else team_stats_punt_returns_number_yards_arr[1]
        self.team_totals_pr_tag['no'] = nos
        self.team_totals_pr_tag['yds'] = yds
        tds = NA_DEF_VALUE if team_stats_punt_returns_number_yards_arr[2] == NA_CHAR else team_stats_punt_returns_number_yards_arr[2]
        self.team_totals_pr_tag['td'] = tds
        self.team_totals_pr_tag['long'] = self._get_long_pr(indi_stats_all_returns)

    def _get_long_pr(self, indi_stats_all_returns):
        pr_long = 0
        for indi_stats_all_return in indi_stats_all_returns:
            if indi_stats_all_return.player_name.lower() == 'total':
                continue

            pr = indi_stats_all_return.punts_no_yds_lp
            if len(pr.strip()) == 0:
                continue
            pr_arr = pr.split('-')
            if len(pr_arr) != 3:
                continue
            pr_long = int(pr_arr[2]) if int(pr_arr[2]) > int(pr_long) else pr_long
        return str(pr_long) if pr_long != 0 else str(NA_DEF_VALUE)

    def _get_pr_stats(self, indi_stats_all_returns):
        pr_nos = pr_yds = 0
        for indi_stats_all_return in indi_stats_all_returns:
            if indi_stats_all_return.player_name.lower() == 'total':
                continue

            pr = indi_stats_all_return.punts_no_yds_lp
            if len(pr.strip()) == 0:
                continue
            pr_arr = pr.split('-')
            if len(pr_arr) != 3:
                continue
            pr_nos = pr_nos + int(pr_arr[0])
            pr_yds = pr_yds + int(pr_arr[1])
        return str(pr_nos) + '-' + str(pr_yds) + '-' + NA_CHAR

    def fill_team_totals_ir_tag(self, team_stats_interceptions_number_yards, indi_stats_all_returns):
        if team_stats_interceptions_number_yards.strip() == NA_CHAR + '-' + NA_CHAR + '-' + NA_CHAR:
            team_stats_interceptions_number_yards = self._get_ir_stats(indi_stats_all_returns)

        team_stats_interceptions_number_yards_arr = team_stats_interceptions_number_yards.split('-')
        nos = NA_DEF_VALUE if team_stats_interceptions_number_yards_arr[0] == NA_CHAR else team_stats_interceptions_number_yards_arr[0]
        yds = NA_DEF_VALUE if team_stats_interceptions_number_yards_arr[1] == NA_CHAR else team_stats_interceptions_number_yards_arr[1]
        self.team_totals_ir_tag['no'] = nos
        self.team_totals_ir_tag['yds'] = yds
        tds = NA_DEF_VALUE if team_stats_interceptions_number_yards_arr[2] == NA_CHAR else team_stats_interceptions_number_yards_arr[2]
        self.team_totals_ir_tag['td'] = tds
        self.team_totals_ir_tag['long'] = self._get_long_ir(indi_stats_all_returns)

    def _get_long_ir(self, indi_stats_all_returns):
        ir_long = 0
        for indi_stats_all_return in indi_stats_all_returns:
            if indi_stats_all_return.player_name.lower() == 'total':
                continue

            ir = indi_stats_all_return.intercepted_no_yds_lp
            if len(ir.strip()) == 0:
                continue
            ir_arr = ir.split('-')
            if len(ir_arr) != 3:
                continue
            ir_long = int(ir_arr[2]) if int(ir_arr[2]) > int(ir_long) else ir_long

        return str(ir_long) if ir_long != 0 else str(NA_DEF_VALUE)

    def _get_ir_stats(self, indi_stats_all_returns):
        ir_nos = ir_yds = 0
        for indi_stats_all_return in indi_stats_all_returns:
            if indi_stats_all_return.player_name.lower() == 'total':
                continue

            ir = indi_stats_all_return.intercepted_no_yds_lp
            if ir.strip() == NA_CHAR:
                continue
            ir_arr = ir.split('-')
            if len(ir_arr) != 3:
                continue
            ir_nos = ir_nos + int(ir_arr[0])
            ir_yds = ir_yds + int(ir_arr[1])
        ir_nos = NA_DEF_VALUE if ir_nos == 0 else ir_nos
        ir_yds = NA_DEF_VALUE if ir_yds == 0 else ir_yds
        return str(ir_nos) + '-' + str(ir_yds) + '-' + NA_CHAR

    def fill_team_totals_scoring_tag(self, indi_stats_rushing_list, indi_stats_passing_list, indi_stats_field_goal_list,
                                     team_stats_pat_total_made, team_stats_fields_goals_total_made):
        self.team_totals_scoring_tag['td'] = str(int(self._get_tds(indi_stats_rushing_list)) + int(self._get_tds(indi_stats_passing_list)))
        self.team_totals_scoring_tag['fg'] = self._get_mades(team_stats_fields_goals_total_made, indi_stats_field_goal_list)
        if team_stats_pat_total_made == NA_CHAR + '-' + NA_CHAR:
            team_stats_pat_total_made = str(NA_DEF_VALUE) + '-' + str(NA_DEF_VALUE)
        self.team_totals_scoring_tag['patkick'] = team_stats_pat_total_made.split('-')[1]

    def fill_team_totals_defense_tag(self, indi_stats_def_list):
        tack_ut_tot, tack_a_tot, tack_tot_tot, tackles_for_loss_no_tot, tackles_for_loss_yds_tot, fumb_rcvd_tot, pass_intc_tot, \
                pass_brup_tot, pass_sacks_tot, pass_sacks_yds_tot = self._sum_def_single_stats(indi_stats_def_list)

        #tfla_tot, tflyds_tot = self._sum_def_tack_for_losses(indi_stats_def_list)
        #sacks_tot, sacks_yds_tot = self._sum_def_sacks(indi_stats_def_list)

        self.team_totals_defense_tag['tackua'] = tack_ut_tot
        self.team_totals_defense_tag['tacka'] = tack_a_tot
        self.team_totals_defense_tag['tot_tack'] = tack_tot_tot
        self.team_totals_defense_tag['tfla'] = tackles_for_loss_no_tot
        self.team_totals_defense_tag['tflyds'] = tackles_for_loss_yds_tot
        self.team_totals_defense_tag['fr'] = fumb_rcvd_tot
        self.team_totals_defense_tag['int'] = pass_intc_tot
        self.team_totals_defense_tag['brup'] = pass_brup_tot
        self.team_totals_defense_tag['sacks'] = pass_sacks_tot
        self.team_totals_defense_tag['sackyds'] = pass_sacks_yds_tot

    def _sum_def_single_stats(self, indi_stats_def_list):
        tack_ut_tot = 0
        tack_a_tot = 0
        tack_tot_tot = 0
        tackles_for_loss_no_tot = 0
        tackles_for_loss_yds_tot = 0
        fumb_rcvd_tot = 0
        pass_intc_tot = 0
        pass_brup_tot = 0
        pass_sacks_tot = 0
        pass_sacks_yds_tot = 0

        for indi_stats_def in indi_stats_def_list:
            tack_ut = indi_stats_def.tack_ut
            tack_a = indi_stats_def.tack_a
            tack_tot = indi_stats_def.tack_tot
            tackles_for_loss_no = indi_stats_def.tackles_for_loss_no
            tackles_for_loss_yds = indi_stats_def.tackles_for_loss_yds
            fumb_rcvd = indi_stats_def.fumb_rcvd
            pass_intc = indi_stats_def.pass_intc
            pass_brup = indi_stats_def.pass_brup
            pass_sacks = indi_stats_def.pass_sacks
            pass_sacks_yds = indi_stats_def.pass_sacks_yds

            if tack_ut != NA_DEF_VALUE:
                tack_ut_tot = tack_ut_tot + int(tack_ut)
            if tack_a != NA_DEF_VALUE:
                tack_a_tot = tack_a_tot + int(tack_a)
            if tack_tot != NA_DEF_VALUE:
                tack_tot_tot = tack_tot_tot + int(tack_tot)
            if tackles_for_loss_no != NA_DEF_VALUE:
                tackles_for_loss_no_tot = tackles_for_loss_no_tot + float(tackles_for_loss_no)
            if tackles_for_loss_yds != NA_DEF_VALUE:
                tackles_for_loss_yds_tot = tackles_for_loss_yds_tot + int(tackles_for_loss_yds)
            if fumb_rcvd != NA_DEF_VALUE:
                fumb_rcvd_tot = fumb_rcvd_tot + int(fumb_rcvd)
            if pass_intc != NA_DEF_VALUE:
                pass_intc_tot = pass_intc_tot + int(pass_intc)
            if pass_brup != NA_DEF_VALUE:
                pass_brup_tot = pass_brup_tot + int(pass_brup)
            if pass_sacks != NA_DEF_VALUE:
                pass_sacks_tot = pass_sacks_tot + float(pass_sacks)
            if pass_sacks_yds != NA_DEF_VALUE:
                pass_sacks_yds_tot = pass_sacks_yds_tot + int(pass_sacks_yds)

        tack_ut_tot = tack_ut_tot if tack_ut_tot > 0 else '0'
        tack_a_tot = tack_a_tot if tack_a_tot > 0 else '0'
        tack_tot_tot = tack_tot_tot if tack_tot_tot > 0 else '0'
        tackles_for_loss_no_tot = tackles_for_loss_no_tot if tackles_for_loss_no_tot > 0 else '0'
        tackles_for_loss_yds_tot = tackles_for_loss_yds_tot if tackles_for_loss_yds_tot > 0 else '0'
        fumb_rcvd_tot = fumb_rcvd_tot if fumb_rcvd_tot > 0 else '0'
        pass_intc_tot = pass_intc_tot if pass_intc_tot > 0 else '0'
        pass_brup_tot = pass_brup_tot if pass_brup_tot > 0 else '0'
        pass_sacks_tot = pass_sacks_tot if pass_sacks_tot > 0 else '0'
        pass_sacks_yds_tot = pass_sacks_yds_tot if pass_sacks_yds_tot > 0 else '0'

        return tack_ut_tot, tack_a_tot, tack_tot_tot, tackles_for_loss_no_tot, tackles_for_loss_yds_tot, \
               fumb_rcvd_tot, pass_intc_tot, pass_brup_tot, pass_sacks_tot, pass_sacks_yds_tot

    def _sum_def_tack_for_losses(self, indi_stats_def_list):
        tfla_tot = 0
        tflyds_tot = 0

        for indi_stats_def in indi_stats_def_list:
            tfl = indi_stats_def.tackles_for_loss
            if len(tfl.strip()) != 0 and tfl.strip() != '0':
                tfl_arr = tfl.split('-')
                tfla_tot = tfla_tot + int(tfl_arr[0])
                if len(tfl_arr) == 2:
                    tflyds_tot = tflyds_tot + int(tfl_arr[1])
                else:
                    tflyds_tot = tflyds_tot + 0

        return tfla_tot, tflyds_tot

    def _sum_def_sacks(self, indi_stats_def_list):
        sacks_tot = 0
        sacks_yds_tot = 0
        for indi_stats_def in indi_stats_def_list:
            sacks = indi_stats_def.pass_sacks
            if len(sacks.strip()) != 0 and sacks.strip() != '0':
                try:
                    sacks_arr = sacks.split('-')
                    sacks_tot = sacks_tot + int(sacks_arr[0])
                    if len(sacks_arr) == 2:
                        sacks_yds_tot = sacks_yds_tot + int(sacks_arr[1])
                    else:
                        sacks_yds_tot = sacks_yds_tot + 0
                except Exception as e:
                    print 'Sack has decimal points or it does not have \'-\''
                    raise e

        return sacks_tot, sacks_yds_tot




class PlayerTagsFieldsStore(object):

    def __init__(self):
        self.player_tag = dict()
        self.pos = None
        self.name_pattern = re.compile('[\W_]+')

    def fill_player_tag(self, player_name, jersey_number, player_cls, player_pos, is_visitor):
        self.player_tag['name'] = player_name
        check_name, short_name = self._build_check_name(player_name, is_visitor)
        self.player_tag['shortname'] = player_name
        self.player_tag['checkname'] = check_name
        self.player_tag['uni'] = jersey_number
        self.player_tag['code'] = jersey_number
        self.player_tag['class'] = player_cls
        self.pos = player_pos

    def _build_check_name(self, player_name, is_visitor):

        if ',' in player_name:
            return self._split_names(player_name, ",", is_visitor)
        if ' ' in player_name:
            return self._split_names(player_name, " ", is_visitor)

        # Returning same player_name for short_name to handle TEAM or TM
        return player_name.upper(), player_name.upper()


    def _split_names(self, player_name, split_char, is_visitor):
        player_name_details = player_name.split(split_char)

        if len(player_name_details) == 2:
            if is_visitor:
                # print 'Player Name: ' + player_name
                last_name = player_name_details[1].strip()
                first_name = player_name_details[0].strip()
            else:
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
        # print 'check name: ' + check_name.upper()
        return check_name.upper(), short_name.upper()

    def fill_indi_stats_rushing(self, indi_stats_rushing):
        self.player_tag['gp'] = '1'
        self.player_tag['opos'] = self.pos
        rushing_dict = dict()
        rushing_dict['att'] = self._blank_to_zero(indi_stats_rushing.att)
        rushing_dict['yds'] = self._blank_to_zero(indi_stats_rushing.net)
        rushing_dict['gain'] = self._blank_to_zero(indi_stats_rushing.gain)
        rushing_dict['loss'] = self._blank_to_zero(indi_stats_rushing.lost)
        rushing_dict['td'] = self._blank_to_zero(indi_stats_rushing.td)
        rushing_dict['long'] = self._blank_to_zero(indi_stats_rushing.long)
        self.player_tag['rush'] = rushing_dict

    def fill_indi_stats_passing(self, indi_stats_passing):
        self.player_tag['gp'] = '1'
        self.player_tag['opos'] = self.pos
        passing_dict = dict()
        att, comp, inte = self._parse_att_comp_int(indi_stats_passing.att_comp_int)
        passing_dict['comp'] = comp
        passing_dict['att'] = att
        passing_dict['int'] = inte
        passing_dict['yds'] = self._blank_to_zero(indi_stats_passing.yards)
        passing_dict['td'] = self._blank_to_zero(indi_stats_passing.td)
        passing_dict['long'] = self._blank_to_zero(indi_stats_passing.long)
        passing_dict['sacks'] = self._blank_to_zero(indi_stats_passing.sacks)
        passing_dict['sackyds'] = "0"
        self.player_tag['pass'] = passing_dict


    def fill_indi_stats_passing_rec(self, indi_stats_home_passing_rec):
        self.player_tag['gp'] = '1'
        self.player_tag['opos'] = self.pos
        passing_rec_dict = dict()
        passing_rec_dict['no'] = self._blank_to_zero(indi_stats_home_passing_rec.no)
        passing_rec_dict['yds'] = self._blank_to_zero(indi_stats_home_passing_rec.yards)
        passing_rec_dict['td'] = self._blank_to_zero(indi_stats_home_passing_rec.td)
        passing_rec_dict['long'] = self._blank_to_zero(indi_stats_home_passing_rec.long)
        self.player_tag['rcv'] = passing_rec_dict


    def fill_indi_stats_punting(self, indi_stats_home_punting):
        self.player_tag['gp'] = '1'
        punt_dict = dict()
        punt_dict['no'] = self._blank_to_zero(indi_stats_home_punting.no)
        punt_dict['yds'] = self._blank_to_zero(indi_stats_home_punting.yds)
        punt_dict['long'] = self._blank_to_zero(indi_stats_home_punting.long)
        punt_dict['blkd'] = self._blank_to_zero(indi_stats_home_punting.blkd)
        punt_dict['tb'] = self._blank_to_zero(indi_stats_home_punting.tb)
        punt_dict['fc'] = self._blank_to_zero(indi_stats_home_punting.fc)
        punt_dict['plus50'] = self._blank_to_zero(indi_stats_home_punting.fifty_plus)
        punt_dict['inside20'] = self._blank_to_zero(indi_stats_home_punting.inside20)
        punt_dict['avg'] = self._calc_avg(indi_stats_home_punting.yds, indi_stats_home_punting.no)
        self.player_tag['punt'] = punt_dict


    def fill_indi_stats_field_goal(self, indi_stats_home_field_goal):
        self.player_tag['gp'] = '1'
        fg_dict = dict()
        fg_dict['made'] = self._blank_to_zero(indi_stats_home_field_goal.made)
        fg_dict['att'] = self._blank_to_zero(indi_stats_home_field_goal.att)
        fg_dict['long'] = self._blank_to_zero(indi_stats_home_field_goal.long)
        fg_dict['blkd'] = self._blank_to_zero(indi_stats_home_field_goal.blkd)
        self.player_tag['fg'] = fg_dict

    def _blank_to_zero(self, any_value):
        if any_value == NA_DEF_VALUE:
            return str(NA_DEF_VALUE)
        return str(any_value.strip())

    def _parse_att_comp_int(self, att_comp_int):
        if att_comp_int.strip() == NA_CHAR:
            return NA_DEF_VALUE, NA_DEF_VALUE, NA_DEF_VALUE
        att_comp_int_arr = att_comp_int.split('-')
        return str(att_comp_int_arr[0]), str(att_comp_int_arr[1]), str(att_comp_int_arr[2])

    def _calc_avg(self, field1, field2):
        if int(field2) == 0:
            return 0
        return round(float(field1) / float(field2), 2)

    def fill_indi_stats_kick_offs(self, indi_stats_kick_offs):
        self.player_tag['gp'] = '1'
        ko_dict = dict()
        ko_dict['no'] = self._blank_to_zero(indi_stats_kick_offs.no)
        ko_dict['yds'] = self._blank_to_zero(indi_stats_kick_offs.yds)
        ko_dict['ob'] = self._blank_to_zero(indi_stats_kick_offs.tb)
        ko_dict['tb'] = self._blank_to_zero(indi_stats_kick_offs.ob)
        self.player_tag['ko'] = ko_dict

    def fill_indi_stats_all_returns(self, indi_stats_all_returns):
        self.player_tag['gp'] = '1'

        punt_returns = indi_stats_all_returns.punts_no_yds_lp
        ko_returns = indi_stats_all_returns.kickoff_no_yds_lp
        int_returns = indi_stats_all_returns.intercepted_no_yds_lp

        if len(punt_returns.strip()) != 0 and punt_returns.strip() != '0':
            punt_returns_arr = punt_returns.split('-')
            pr_dict = dict()
            pr_dict['no'] = punt_returns_arr[0]
            pr_dict['yds'] = punt_returns_arr[1]
            pr_dict['td'] = "0"
            if len(punt_returns_arr) == 3:
                pr_dict['long'] = punt_returns_arr[2]
            else:
                pr_dict['long'] = '0'
            self.player_tag['pr'] = pr_dict

        if len(ko_returns.strip()) != 0 and ko_returns.strip() != '0':
            ko_returns_arr = ko_returns.split('-')
            kr_dict = dict()
            kr_dict['no'] = ko_returns_arr[0]
            kr_dict['yds'] = ko_returns_arr[1]
            kr_dict['td'] = "0"
            if len(ko_returns_arr) == 3:
                kr_dict['long'] = ko_returns_arr[2]
            else:
                kr_dict['long'] = '0'
            self.player_tag['kr'] = kr_dict

        if len(int_returns.strip()) != 0 and int_returns.strip() != '0':
            int_returns_arr = int_returns.split('-')
            ir_dict = dict()
            ir_dict['no'] = int_returns_arr[0]
            ir_dict['yds'] = int_returns_arr[1]
            ir_dict['td'] = "0"
            if len(int_returns_arr) > 2:
                ir_dict['long'] = int_returns_arr[2]
            else:
                ir_dict['long'] = '0'
            self.player_tag['ir'] = ir_dict


    def fill_indi_stats_def(self, indi_stats_def):
        self.player_tag['gp'] = '1'
        self.player_tag['dpos'] = self.pos
        def_dict = dict()

        def_dict['tackua'] = indi_stats_def.tack_ut
        def_dict['tacka'] = indi_stats_def.tack_a
        def_dict['tot_tack'] = indi_stats_def.tack_tot
        def_dict['dTfla'] = indi_stats_def.tackles_for_loss_no
        def_dict['dTflyds'] = indi_stats_def.tackles_for_loss_yds
        def_dict['fr'] = indi_stats_def.fumb_rcvd
        def_dict['tflyds'] = indi_stats_def.fumb_rcvd_yds
        def_dict['int'] = indi_stats_def.pass_intc
        def_dict['brup'] = indi_stats_def.pass_brup
        def_dict['sacks'] = indi_stats_def.pass_sacks
        def_dict['sackyds'] = indi_stats_def.pass_sacks_yds

        self.player_tag['defense'] = def_dict


class PlaysFieldsStore(object):

    def __init__(self):
        self.plays = dict()


    def fill_plays(self, score_play_list, home_team_name, home_team_id, visitor_team_name, visitor_team_id):

        self.plays['format'] = 'summary'
        qtr1_plays = list()
        qtr2_plays = list()
        qtr3_plays = list()
        qtr4_plays = list()
        qtr5_plays = list()

        for score_play in score_play_list:
            if score_play.team_name == home_team_name and score_play.qtr == '1':
                qtr1_plays.append(self._fill_play(score_play, home_team_id))
            elif score_play.team_name == home_team_name and score_play.qtr == '2':
                qtr2_plays.append(self._fill_play(score_play, home_team_id))
            elif score_play.team_name == home_team_name and score_play.qtr == '3':
                qtr3_plays.append(self._fill_play(score_play, home_team_id))
            elif score_play.team_name == home_team_name and score_play.qtr == '4':
                qtr4_plays.append(self._fill_play(score_play, home_team_id))
            elif score_play.team_name == home_team_name and score_play.qtr == '5':
                qtr5_plays.append(self._fill_play(score_play, home_team_id))
            elif score_play.team_name == visitor_team_name and score_play.qtr == '1':
                qtr1_plays.append(self._fill_play(score_play, visitor_team_id))
            elif score_play.team_name == visitor_team_name and score_play.qtr == '2':
                qtr2_plays.append(self._fill_play(score_play, visitor_team_id))
            elif score_play.team_name == visitor_team_name and score_play.qtr == '3':
                qtr3_plays.append(self._fill_play(score_play, visitor_team_id))
            elif score_play.team_name == visitor_team_name and score_play.qtr == '4':
                qtr4_plays.append(self._fill_play(score_play, visitor_team_id))
            elif score_play.team_name == visitor_team_name and score_play.qtr == '5':
                qtr5_plays.append(self._fill_play(score_play, visitor_team_id))

        qtr1 = dict()
        qtr2 = dict()
        qtr3 = dict()
        qtr4 = dict()
        qtr5 = dict()

        qtr1['number'] = '1'
        qtr1['text'] = '1st'
        qtr1['play'] = qtr1_plays
        qtr2['number'] = '2'
        qtr2['text'] = '2nd'
        qtr2['play'] = qtr2_plays
        qtr3['number'] = '3'
        qtr3['text'] = '3rd'
        qtr3['play'] = qtr3_plays
        qtr4['number'] = '4'
        qtr4['text'] = '4th'
        qtr4['play'] = qtr4_plays
        if len(qtr5_plays) > 0:
            qtr5['number'] = '5'
            qtr5['text'] = 'OT'
            qtr5['play'] = qtr1_plays

        qtrs_list = [qtr1, qtr2, qtr3, qtr4]
        if len(qtr5_plays) > 0:
            qtrs_list.append(qtr5)

        self.plays['qtr'] = qtrs_list

    def _fill_play(self, score_play, team_id):
        play_dict = dict()
        play_dict['hasball'] = team_id
        play_dict['down'] = '1'
        play_dict['spot'] = team_id + '0'
        # play_dict['togo'] = '0'
        play_dict['context'] = 'H,0,0,H00'
        play_dict['playid'] = '1,1,1'
        play_dict['type'] = 'P'
        play_dict['first'] = 'P'
        play_dict['score'] = 'Y'
        play_dict['vscore'] = score_play.visitor_score
        play_dict['hscore'] = score_play.home_score
        play_dict['clock'] = score_play.time
        play_dict['tokens'] = 'PASS:0,C,0,V00 T:' + score_play.time
        play_dict['text'] = score_play.scoring_play_text + ', clock ' + score_play.time
        play_dict['newcontext'] = 'H,0,0,V00'
        return play_dict



