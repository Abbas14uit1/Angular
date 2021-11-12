import xlrd
from xml_fields_store import BasicFieldsStore, TeamTagsFieldsStore, PlayerTagsFieldsStore, PlaysFieldsStore


NA_DEF_VALUE = 0
NA_CHAR = '#'


class ExcelParser(object):

    def __init__(self):
        pass


    def start_parsing(self, xls_file_name):

        basic_fields = BasicFieldsStore()

        workbook = xlrd.open_workbook(xls_file_name)
        sheet = workbook.sheet_by_index(0)

        home_team_name = str(sheet.cell(0, 1).value).strip()
        home_team_id = str(sheet.cell(0, 2).value).strip()
        visitor_team_name = str(sheet.cell(1, 1).value).strip()
        visitor_team_id = str(sheet.cell(1, 2).value).strip()
        game_id = str(sheet.cell(2, 1).value).strip()
        game_date = str(sheet.cell(3, 1).value).strip()
        stadium = str(sheet.cell(4, 1).value).strip()
        location = str(sheet.cell(5, 1).value).strip()
        attendance = self._get_int_value(sheet, 6, 1)

        home_team_q1_score = self._get_int_value(sheet, 8, 1)
        home_team_q2_score = self._get_int_value(sheet, 8, 2)
        home_team_q3_score = self._get_int_value(sheet, 8, 3)
        home_team_q4_score = self._get_int_value(sheet, 8, 4)
        home_team_ot_score = self._get_int_value(sheet, 8, 5)
        home_team_tot_score = self._get_int_value(sheet, 8, 6)

        visitor_team_q1_score = self._get_int_value(sheet, 9, 1)
        visitor_team_q2_score = self._get_int_value(sheet, 9, 2)
        visitor_team_q3_score = self._get_int_value(sheet, 9, 3)
        visitor_team_q4_score = self._get_int_value(sheet, 9, 4)
        visitor_team_ot_score = self._get_int_value(sheet, 9, 5)
        visitor_team_tot_score = self._get_int_value(sheet, 9, 6)

        score_play_list = list()
        row_no = 11
        for score_play_row in range(row_no, sheet.nrows):
            score_team_name = str(sheet.cell(score_play_row, 0).value).strip()
            if score_team_name in [home_team_name, visitor_team_name, home_team_id, visitor_team_id]:
                qtr = self._get_int_value(sheet, score_play_row, 1)
                time = str(sheet.cell(score_play_row, 2).value).strip()
                scoring_play_text = str(sheet.cell(score_play_row, 3).value.encode("ascii", "ignore")).strip()
                home_score = visitor_score = 0
                if sheet.cell(score_play_row, 4).value.strip() != '-':
                    home_score = self._get_int_value(sheet, score_play_row, 4)
                if sheet.cell(score_play_row, 5).value.strip() != '-':
                    visitor_score = self._get_int_value(sheet, score_play_row, 5)
                score_play = ScorePlay(score_team_name, qtr, time, scoring_play_text, home_score, visitor_score)
                score_play_list.append(score_play)
                row_no = row_no + 1
            else:
                break

        plays_tag_obj = PlaysFieldsStore()
        plays_tag_obj.fill_plays(score_play_list, home_team_name, home_team_id, visitor_team_name, visitor_team_id)

        kick_off_time = str(sheet.cell(row_no, 1).value).strip()
        game_end_time = str(sheet.cell(row_no + 1, 1).value).strip()
        total_elapsed_time = str(sheet.cell(row_no + 2, 1).value).strip()
        official_rows = row_no + 4
        referee = str(sheet.cell(official_rows, 1).value).strip()
        umpire = str(sheet.cell(official_rows, 2).value).strip()
        head_linesman = str(sheet.cell(official_rows, 3).value).strip()
        line_judge = str(sheet.cell(official_rows, 4).value).strip()
        field_judge = str(sheet.cell(official_rows, 5).value).strip()
        side_judge = str(sheet.cell(official_rows, 6).value).strip()
        back_judge = str(sheet.cell(official_rows, 7).value).strip()
        temperature = '-' if str(sheet.cell(official_rows + 1, 1).value).strip() == '-' else self._get_int_value(sheet, official_rows + 1, 1)
        wind = str(sheet.cell(official_rows + 2, 1).value).strip()
        weather = str(sheet.cell(official_rows + 3, 1).value).strip()

        basic_fields.fill_fbgame_tag()
        basic_fields.fill_venue_tag(home_team_name, home_team_id, visitor_team_name, visitor_team_id, game_id, game_date,
                           stadium, location, attendance, kick_off_time, game_end_time, total_elapsed_time, temperature, wind, weather)
        basic_fields.fill_venue_official_tag(referee, umpire, head_linesman, line_judge, field_judge, side_judge, back_judge)
        basic_fields.fill_venue_rules_tag()

        home_team_tag = TeamTagsFieldsStore('H')
        visitor_team_tag = TeamTagsFieldsStore('V')
        home_team_tag.fill_team_tag(home_team_name, home_team_id)
        home_team_tag.fill_team_linescore_tag(home_team_q1_score, home_team_q2_score, home_team_q3_score, home_team_q4_score,
                                              home_team_ot_score, home_team_tot_score)

        visitor_team_tag.fill_team_tag(visitor_team_name, visitor_team_id)
        visitor_team_tag.fill_team_linescore_tag(visitor_team_q1_score, visitor_team_q2_score, visitor_team_q3_score, visitor_team_q4_score,
                                                 visitor_team_ot_score, visitor_team_tot_score)

        team_stats_row = official_rows + 5
        home_team_stats_first_downs = self._get_int_value(sheet, team_stats_row, 1)
        home_team_stats_rushing = self._get_int_value(sheet, team_stats_row + 1, 1)
        home_team_stats_passing = self._get_int_value(sheet, team_stats_row + 2, 1)
        home_team_stats_penalty = self._get_int_value(sheet, team_stats_row + 3, 1)
        home_team_stats_rushing_attempts = self._get_int_value(sheet, team_stats_row + 4, 1)
        home_team_stats_yards_gained_rushes = self._get_int_value(sheet, team_stats_row + 5, 1)
        home_team_stats_yards_lost_rushes = self._get_int_value(sheet, team_stats_row + 6, 1)
        home_team_stats_net_yards_rushing = self._get_int_value(sheet, team_stats_row + 7, 1)
        home_team_stats_net_yards_passing = self._get_int_value(sheet, team_stats_row + 8, 1)
        home_team_stats_passes_attempted = self._get_int_value(sheet, team_stats_row + 9, 1)
        home_team_stats_passes_completed = self._get_int_value(sheet, team_stats_row + 10, 1)
        home_team_stats_had_intercepted = self._get_int_value(sheet, team_stats_row + 11, 1)
        home_team_stats_total_offensive_plays = self._get_int_value(sheet, team_stats_row + 12, 1)
        home_team_stats_total_net_yards = self._get_int_value(sheet, team_stats_row + 13, 1)
        home_team_stats_average_gain_per_play = str(sheet.cell(team_stats_row + 14, 1).value).strip()
        home_team_stats_return_yards = str(sheet.cell(team_stats_row + 15, 1).value).strip()
        home_team_stats_fumbles_number_lost = str(sheet.cell(team_stats_row + 16, 1).value).strip()
        home_team_stats_penalties_number_yards = str(sheet.cell(team_stats_row + 17, 1).value).strip()
        home_team_stats_number_of_punts_yards = str(sheet.cell(team_stats_row + 18, 1).value).strip()
        self._validate_two_values(home_team_stats_fumbles_number_lost, 'Fumbles: Number - Lost(Home)')
        self._validate_two_values(home_team_stats_penalties_number_yards, 'Penalties: Number - Yards(Home)')
        self._validate_two_values(home_team_stats_number_of_punts_yards, 'Number of Punts - Yards(Home)')
        home_team_stats_average_per_punt = str(sheet.cell(team_stats_row + 19, 1).value).strip()
        home_team_stats_punt_returns_number_yards = str(sheet.cell(team_stats_row + 20, 1).value).strip()
        home_team_stats_kickoff_returns_number_yards = str(sheet.cell(team_stats_row + 21, 1).value).strip()
        home_team_stats_interceptions_number_yards = str(sheet.cell(team_stats_row + 22, 1).value).strip()
        home_team_stats_fumble_returns_number_yards = str(sheet.cell(team_stats_row + 23, 1).value).strip()
        self._validate_three_values(home_team_stats_punt_returns_number_yards, 'Punt Returns: Number - Yards - TD(Home)')
        self._validate_three_values(home_team_stats_kickoff_returns_number_yards, 'Kickoff Returns: Number - Yards - TD(Home)')
        self._validate_three_values(home_team_stats_interceptions_number_yards, 'Interceptions: Number - Yards - TD(Home)')
        self._validate_three_values(home_team_stats_fumble_returns_number_yards, 'Fumble Returns: Number -Yards -TD(Home)')
        home_team_stats_possession_time = str(sheet.cell(team_stats_row + 24, 1).value).strip()
        home_team_stats_thirddown_conversions = self._get_formatted_conv(str(sheet.cell(team_stats_row + 25, 1).value).strip())
        home_team_stats_fourthdown_conversions = self._get_formatted_conv(str(sheet.cell(team_stats_row + 26, 1).value).strip())
        home_team_stats_punting_inside_20 = str(sheet.cell(team_stats_row + 27, 1).value).strip()
        home_team_stats_punting_50plus = str(sheet.cell(team_stats_row + 28, 1).value).strip()
        home_team_stats_punting_touchback = str(sheet.cell(team_stats_row + 29, 1).value).strip()
        home_team_stats_punting_fair_catch = str(sheet.cell(team_stats_row + 30, 1).value).strip()
        home_team_stats_kickoff_number_yards = str(sheet.cell(team_stats_row + 31, 1).value).strip()
        self._validate_two_values(home_team_stats_kickoff_number_yards, 'Kickoffs: Number - Yards(Home)')
        home_team_stats_kickoff_touchback = str(sheet.cell(team_stats_row + 32, 1).value).strip()
        home_team_stats_redzone_scores_chances = str(sheet.cell(team_stats_row + 33, 1).value).strip()
        home_team_stats_sacks_total_yds = str(sheet.cell(team_stats_row + 34, 1).value).strip()
        home_team_stats_pat_total_made = str(sheet.cell(team_stats_row + 35, 1).value).strip()
        home_team_stats_fields_goals_total_made = str(sheet.cell(team_stats_row + 36, 1).value).strip()
        self._validate_two_values(home_team_stats_redzone_scores_chances, 'Red-Zone: Scores - Chances(Home)')
        self._validate_two_values(home_team_stats_sacks_total_yds, 'Sacks: Total - Yds.(Home)')
        self._validate_two_values(home_team_stats_pat_total_made, 'PAT: Total - Made(Home)')
        self._validate_two_values(home_team_stats_fields_goals_total_made, 'Field Goals: Total - Made(Home)')

        visitor_team_stats_first_downs = self._get_int_value(sheet, team_stats_row, 2)
        visitor_team_stats_rushing = self._get_int_value(sheet, team_stats_row + 1, 2)
        visitor_team_stats_passing = self._get_int_value(sheet, team_stats_row + 2, 2)
        visitor_team_stats_penalty = self._get_int_value(sheet, team_stats_row + 3, 2)
        visitor_team_stats_rushing_attempts = self._get_int_value(sheet, team_stats_row + 4, 2)
        visitor_team_stats_yards_gained_rushes = self._get_int_value(sheet, team_stats_row + 5, 2)
        visitor_team_stats_yards_lost_rushes = self._get_int_value(sheet, team_stats_row + 6, 2)
        visitor_team_stats_net_yards_rushing = self._get_int_value(sheet, team_stats_row + 7, 2)
        visitor_team_stats_net_yards_passing = self._get_int_value(sheet, team_stats_row + 8, 2)
        visitor_team_stats_passes_attempted = self._get_int_value(sheet, team_stats_row + 9, 2)
        visitor_team_stats_passes_completed = self._get_int_value(sheet, team_stats_row + 10, 2)
        visitor_team_stats_had_intercepted = self._get_int_value(sheet, team_stats_row + 11, 2)
        visitor_team_stats_total_offensive_plays = self._get_int_value(sheet, team_stats_row + 12, 2)
        visitor_team_stats_total_net_yards = self._get_int_value(sheet, team_stats_row + 13, 2)
        visitor_team_stats_average_gain_per_play = str(sheet.cell(team_stats_row + 14, 2).value).strip()
        visitor_team_stats_return_yards = str(sheet.cell(team_stats_row + 15, 2).value).strip()
        visitor_team_stats_fumbles_number_lost = str(sheet.cell(team_stats_row + 16, 2).value).strip()
        visitor_team_stats_penalties_number_yards = str(sheet.cell(team_stats_row + 17, 2).value).strip()
        visitor_team_stats_number_of_punts_yards = str(sheet.cell(team_stats_row + 18, 2).value).strip()
        visitor_team_stats_average_per_punt = str(sheet.cell(team_stats_row + 19, 2).value).strip()
        visitor_team_stats_punt_returns_number_yards = str(sheet.cell(team_stats_row + 20, 2).value).strip()
        visitor_team_stats_kickoff_returns_number_yards = str(sheet.cell(team_stats_row + 21, 2).value).strip()
        visitor_team_stats_interceptions_number_yards = str(sheet.cell(team_stats_row + 22, 2).value).strip()
        visitor_team_stats_fumble_returns_number_yards = str(sheet.cell(team_stats_row + 23, 2).value).strip()
        visitor_team_stats_possession_time = str(sheet.cell(team_stats_row + 24, 2).value).strip()
        visitor_team_stats_thirddown_conversions = self._get_formatted_conv(str(sheet.cell(team_stats_row + 25, 2).value).strip())
        visitor_team_stats_fourthdown_conversions = self._get_formatted_conv(str(sheet.cell(team_stats_row + 26, 2).value).strip())
        visitor_team_stats_punting_inside_20 = str(sheet.cell(team_stats_row + 27, 2).value).strip()
        visitor_team_stats_punting_50plus = str(sheet.cell(team_stats_row + 28, 2).value).strip()
        visitor_team_stats_punting_touchback = str(sheet.cell(team_stats_row + 29, 2).value).strip()
        visitor_team_stats_punting_fair_catch = str(sheet.cell(team_stats_row + 30, 2).value).strip()
        visitor_team_stats_kickoff_number_yards = str(sheet.cell(team_stats_row + 31, 2).value).strip()
        visitor_team_stats_kickoff_touchback = str(sheet.cell(team_stats_row + 32, 2).value).strip()
        visitor_team_stats_redzone_scores_chances = str(sheet.cell(team_stats_row + 33, 2).value).strip()
        visitor_team_stats_sacks_total_yds = str(sheet.cell(team_stats_row + 34, 2).value).strip()
        visitor_team_stats_pat_total_made = str(sheet.cell(team_stats_row + 35, 2).value).strip()
        visitor_team_stats_fields_goals_total_made = str(sheet.cell(team_stats_row + 36, 2).value).strip()
        self._validate_two_values(visitor_team_stats_fumbles_number_lost, 'Fumbles: Number - Lost(Visitor)')
        self._validate_two_values(visitor_team_stats_penalties_number_yards, 'Penalties: Number - Yards(Visitor)')
        self._validate_two_values(visitor_team_stats_number_of_punts_yards, 'Number of Punts - Yards(Visitor)')
        self._validate_three_values(visitor_team_stats_punt_returns_number_yards, 'Punt Returns: Number - Yards - TD(Visitor)')
        self._validate_three_values(visitor_team_stats_kickoff_returns_number_yards, 'Kickoff Returns: Number - Yards - TD(Visitor)')
        self._validate_three_values(visitor_team_stats_interceptions_number_yards, 'Interceptions: Number - Yards - TD(Visitor)')
        self._validate_three_values(visitor_team_stats_fumble_returns_number_yards, 'Fumble Returns: Number -Yards -TD(Visitor)')
        self._validate_two_values(visitor_team_stats_kickoff_number_yards, 'Kickoffs: Number - Yards(Visitor)')
        self._validate_two_values(visitor_team_stats_redzone_scores_chances, 'Red-Zone: Scores - Chances(Visitor)')
        self._validate_two_values(visitor_team_stats_sacks_total_yds, 'Sacks: Total - Yds.(Visitor)')
        self._validate_two_values(visitor_team_stats_pat_total_made, 'PAT: Total - Made(Visitor)')
        self._validate_two_values(visitor_team_stats_fields_goals_total_made, 'Field Goals: Total - Made(Visitor)')

        indi_stats_home_row = team_stats_row + 39
        indi_stats_home_rushing_list = list()
        for is_home_row in range(indi_stats_home_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_home_row = indi_stats_home_row + 1
                continue
            att = self._get_int_value(sheet, is_home_row, 1)
            gain = self._get_int_value(sheet, is_home_row, 2)
            lost = self._get_int_value(sheet, is_home_row, 3)
            net = self._get_int_value(sheet, is_home_row, 4)
            td = self._get_int_value(sheet, is_home_row, 5)
            long = self._get_int_value(sheet, is_home_row, 6)

            indi_stats_home_rushing = IndividualStatsRushing(player_name, att, gain, lost, net, td, long)
            indi_stats_home_rushing_list.append(indi_stats_home_rushing)
            indi_stats_home_row = indi_stats_home_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_home_row = indi_stats_home_row + 1
                break

        indi_stats_home_passing_list = list()
        for is_home_row in range(indi_stats_home_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_home_row = indi_stats_home_row + 1
                continue
            att_comp_int = str(sheet.cell(is_home_row, 1).value).strip()
            self._validate_pass_comp_att(att_comp_int, 'Home')
            yards = self._get_int_value(sheet, is_home_row, 2)
            td = self._get_int_value(sheet, is_home_row, 3)
            long = self._get_int_value(sheet, is_home_row, 4)
            sacks = self._get_int_value(sheet, is_home_row, 5)

            indi_stats_home_passing = IndividualStatsPassing(player_name, att_comp_int, yards, td, long, sacks)
            indi_stats_home_passing_list.append(indi_stats_home_passing)
            indi_stats_home_row = indi_stats_home_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_home_row = indi_stats_home_row + 1
                break

        indi_stats_home_passing_rec_list = list()
        for is_home_row in range(indi_stats_home_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_home_row = indi_stats_home_row + 1
                continue
            no = self._get_int_value(sheet, is_home_row, 1)
            yards = self._get_int_value(sheet, is_home_row, 2)
            td = self._get_int_value(sheet, is_home_row, 3)
            long = self._get_int_value(sheet, is_home_row, 4)
            indi_stats_home_passing_rec = IndividualStatsPassReceiving(player_name, no, yards, td, long)
            indi_stats_home_passing_rec_list.append(indi_stats_home_passing_rec)
            indi_stats_home_row = indi_stats_home_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_home_row = indi_stats_home_row + 1
                break

        indi_stats_home_punting_list = list()
        indi_stats_home_field_goal_list = list()
        indi_stats_home_kick_offs_list = list()
        indi_stats_home_all_returns_list = list()
        for is_home_row in range(indi_stats_home_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_home_row = indi_stats_home_row + 1
                continue
            no = self._get_int_value(sheet, is_home_row, 1)
            yds = self._get_int_value(sheet, is_home_row, 2)
            avg = str(sheet.cell(is_home_row, 3).value).strip()
            long = self._get_int_value(sheet, is_home_row, 4)
            blkd = self._get_int_value(sheet, is_home_row, 5)
            tb = self._get_int_value(sheet, is_home_row, 6)
            fc = self._get_int_value(sheet, is_home_row, 7)
            fifty_plus = self._get_int_value(sheet, is_home_row, 8)
            inside20 = self._get_int_value(sheet, is_home_row, 9)

            indi_stats_home_punting = IndividualStatsPunting(player_name, no, yds, avg, long, blkd, tb, fc, fifty_plus, inside20)
            indi_stats_home_punting_list.append(indi_stats_home_punting)
            indi_stats_home_row = indi_stats_home_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_home_row = indi_stats_home_row + 1
                break

        for is_home_row in range(indi_stats_home_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_home_row = indi_stats_home_row + 1
                continue
            att = self._get_int_value(sheet, is_home_row, 1)
            made = self._get_int_value(sheet, is_home_row, 2)
            long = self._get_int_value(sheet, is_home_row, 3)
            blkd = self._get_int_value(sheet, is_home_row, 4)
            indi_stats_home_field_goal = IndividualStatsFieldGoals(player_name, att, made, long, blkd)
            indi_stats_home_field_goal_list.append(indi_stats_home_field_goal)
            indi_stats_home_row = indi_stats_home_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_home_row = indi_stats_home_row + 1
                break

        for is_home_row in range(indi_stats_home_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_home_row = indi_stats_home_row + 1
                continue
            no = self._get_int_value(sheet, is_home_row, 1)
            yds = self._get_int_value(sheet, is_home_row, 2)
            tb = self._get_int_value(sheet, is_home_row, 3)
            ob = self._get_int_value(sheet, is_home_row, 4)
            fcyds = self._get_int_value(sheet, is_home_row, 5)

            indi_stats_home_kick_offs = IndividualStatsKickoffs(player_name, no, yds, tb, ob, fcyds)
            indi_stats_home_kick_offs_list.append(indi_stats_home_kick_offs)
            indi_stats_home_row = indi_stats_home_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_home_row = indi_stats_home_row + 1
                break

        for is_home_row in range(indi_stats_home_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_home_row = indi_stats_home_row + 1
                continue
            punts_no_yds_lp = str(sheet.cell(is_home_row, 1).value).strip()
            kickoff_no_yds_lp = str(sheet.cell(is_home_row, 2).value).strip()
            intercepted_no_yds_lp = str(sheet.cell(is_home_row, 3).value).strip()
            indi_stats_home_all_returns = IndividualStatsAllReturns(player_name, punts_no_yds_lp, kickoff_no_yds_lp, intercepted_no_yds_lp)
            indi_stats_home_all_returns_list.append(indi_stats_home_all_returns)
            indi_stats_home_row = indi_stats_home_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_home_row = indi_stats_home_row + 1
                break

        indi_stats_visitor_row = indi_stats_home_row + 1
        indi_stats_visitor_rushing_list = list()
        for is_visitor_row in range(indi_stats_visitor_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                continue
            att = self._get_int_value(sheet, is_visitor_row, 1)
            gain = self._get_int_value(sheet, is_visitor_row, 2)
            lost = self._get_int_value(sheet, is_visitor_row, 3)
            net = self._get_int_value(sheet, is_visitor_row, 4)
            td = self._get_int_value(sheet, is_visitor_row, 5)
            long = self._get_int_value(sheet, is_visitor_row, 6)

            indi_stats_visitor_rushing = IndividualStatsRushing(player_name, att, gain, lost, net, td, long)
            indi_stats_visitor_rushing_list.append(indi_stats_visitor_rushing)
            indi_stats_visitor_row = indi_stats_visitor_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                break

        indi_stats_visitor_passing_list = list()
        for is_visitor_row in range(indi_stats_visitor_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                continue
            att_comp_int = str(sheet.cell(is_visitor_row, 1).value).strip()
            self._validate_pass_comp_att(att_comp_int, 'Visitor')
            yards = self._get_int_value(sheet, is_visitor_row, 2)
            td = self._get_int_value(sheet, is_visitor_row, 3)
            long = self._get_int_value(sheet, is_visitor_row, 4)
            sacks = self._get_int_value(sheet, is_visitor_row, 5)

            indi_stats_visitor_passing = IndividualStatsPassing(player_name, att_comp_int, yards, td, long, sacks)
            indi_stats_visitor_passing_list.append(indi_stats_visitor_passing)
            indi_stats_visitor_row = indi_stats_visitor_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                break

        indi_stats_visitor_passing_rec_list = list()
        for is_visitor_row in range(indi_stats_visitor_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                continue
            no = self._get_int_value(sheet, is_visitor_row, 1)
            yards = self._get_int_value(sheet, is_visitor_row, 2)
            td = self._get_int_value(sheet, is_visitor_row, 3)
            long = self._get_int_value(sheet, is_visitor_row, 4)
            indi_stats_visitor_passing_rec = IndividualStatsPassReceiving(player_name, no, yards, td, long)
            indi_stats_visitor_passing_rec_list.append(indi_stats_visitor_passing_rec)
            indi_stats_visitor_row = indi_stats_visitor_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                break

        indi_stats_visitor_punting_list = list()
        indi_stats_visitor_field_goal_list = list()
        indi_stats_visitor_kick_offs_list = list()
        indi_stats_visitor_all_returns_list = list()
        for is_visitor_row in range(indi_stats_visitor_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                continue
            no = self._get_int_value(sheet, is_visitor_row, 1)
            yds = self._get_int_value(sheet, is_visitor_row, 2)
            avg = str(sheet.cell(is_visitor_row, 3).value).strip()
            long = self._get_int_value(sheet, is_visitor_row, 4)
            blkd = self._get_int_value(sheet, is_visitor_row, 5)
            tb = self._get_int_value(sheet, is_visitor_row, 6)
            fc = self._get_int_value(sheet, is_visitor_row, 7)
            fifty_plus = self._get_int_value(sheet, is_visitor_row, 8)
            inside20 = self._get_int_value(sheet, is_visitor_row, 9)

            indi_stats_visitor_punting = IndividualStatsPunting(player_name, no, yds, avg, long, blkd, tb, fc, fifty_plus, inside20)
            indi_stats_visitor_punting_list.append(indi_stats_visitor_punting)
            indi_stats_visitor_row = indi_stats_visitor_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                break

        for is_visitor_row in range(indi_stats_visitor_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                continue
            att = self._get_int_value(sheet, is_visitor_row, 1)
            made = self._get_int_value(sheet, is_visitor_row, 2)
            long = self._get_int_value(sheet, is_visitor_row, 3)
            blkd = self._get_int_value(sheet, is_visitor_row, 4)
            indi_stats_visitor_field_goal = IndividualStatsFieldGoals(player_name, att, made, long, blkd)
            indi_stats_visitor_field_goal_list.append(indi_stats_visitor_field_goal)
            indi_stats_visitor_row = indi_stats_visitor_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                break

        for is_visitor_row in range(indi_stats_visitor_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                continue
            no = self._get_int_value(sheet, is_visitor_row, 1)
            yds = self._get_int_value(sheet, is_visitor_row, 2)
            tb = self._get_int_value(sheet, is_visitor_row, 3)
            ob = self._get_int_value(sheet, is_visitor_row, 4)
            fcyds = self._get_int_value(sheet, is_visitor_row, 5)

            indi_stats_visitor_kick_offs = IndividualStatsKickoffs(player_name, no, yds, tb, ob, fcyds)
            indi_stats_visitor_kick_offs_list.append(indi_stats_visitor_kick_offs)
            indi_stats_visitor_row = indi_stats_visitor_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                break

        for is_visitor_row in range(indi_stats_visitor_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_row, 0).value).strip()
            if player_name in ['-', '#']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                continue
            punts_no_yds_lp = str(sheet.cell(is_visitor_row, 1).value).strip()
            kickoff_no_yds_lp = str(sheet.cell(is_visitor_row, 2).value).strip()
            intercepted_no_yds_lp = str(sheet.cell(is_visitor_row, 3).value).strip()
            indi_stats_visitor_all_returns = IndividualStatsAllReturns(player_name, punts_no_yds_lp, kickoff_no_yds_lp,
                                                                       intercepted_no_yds_lp)
            indi_stats_visitor_all_returns_list.append(indi_stats_visitor_all_returns)
            indi_stats_visitor_row = indi_stats_visitor_row + 1
            if player_name.lower() in ['total', 'totals']:
                indi_stats_visitor_row = indi_stats_visitor_row + 1
                break

        indi_stats_home_def_row = indi_stats_visitor_row + 1
        indi_stats_home_def_list = list()
        indi_stats_visitor_def_list = list()

        for is_home_def_row in range(indi_stats_home_def_row, sheet.nrows):
            player_name = str(sheet.cell(is_home_def_row, 0).value.encode("ascii", "ignore")).strip()
            if player_name.startswith('Defense'):
                break
            if player_name.startswith('Defensive Statistics'):
                indi_stats_home_def_row = indi_stats_home_def_row + 1
                break
            if player_name in ['-', '#']:
                indi_stats_home_def_row = indi_stats_home_def_row + 1
                continue

            tack_ut = self._get_int_value(sheet, is_home_def_row, 1)
            tack_a = self._get_int_value(sheet, is_home_def_row, 2)
            tack_tot = self._get_int_value(sheet, is_home_def_row, 3)
            tackles_for_loss_no = self._get_float_value(sheet, is_home_def_row, 4)
            tackles_for_loss_yds = self._get_int_value(sheet, is_home_def_row, 5)
            fumb_rcvd = self._get_int_value(sheet, is_home_def_row, 6)
            fumb_rcvd_yds = self._get_int_value(sheet, is_home_def_row, 7)
            pass_intc = self._get_int_value(sheet, is_home_def_row, 8)
            pass_intc_yds = self._get_int_value(sheet, is_home_def_row, 9)
            pass_brup = self._get_int_value(sheet, is_home_def_row, 10)
            pass_sacks = self._get_float_value(sheet, is_home_def_row, 11)
            pass_sacks_yds = self._get_int_value(sheet, is_home_def_row, 12)

            indi_stats_home_def = IndividualStatsDefensive(player_name, tack_ut, tack_a, tack_tot, tackles_for_loss_no,
                                                           tackles_for_loss_yds, fumb_rcvd,
                                                           fumb_rcvd_yds, pass_intc, pass_intc_yds, pass_brup, pass_sacks, pass_sacks_yds)

            indi_stats_home_def_list.append(indi_stats_home_def)
            indi_stats_home_def_row = indi_stats_home_def_row + 1

        indi_stats_visitor_def_row = indi_stats_home_def_row + 1
        for is_visitor_def_row in range(indi_stats_visitor_def_row, sheet.nrows):
            player_name = str(sheet.cell(is_visitor_def_row, 0).value.encode("ascii", "ignore")).strip()
            if player_name.startswith('Time of Possession'):
                indi_stats_visitor_def_row = indi_stats_visitor_def_row + 1
                break
            if player_name in ['-', '#']:
                indi_stats_visitor_def_row = indi_stats_visitor_def_row + 1
                continue
            tack_ut = self._get_int_value(sheet, is_visitor_def_row, 1)
            tack_a = self._get_int_value(sheet, is_visitor_def_row, 2)
            tack_tot = self._get_int_value(sheet, is_visitor_def_row, 3)
            tackles_for_loss_no = self._get_float_value(sheet, is_visitor_def_row, 4)
            tackles_for_loss_yds = self._get_int_value(sheet, is_visitor_def_row, 5)
            fumb_rcvd = self._get_int_value(sheet, is_visitor_def_row, 6)
            fumb_rcvd_yds = self._get_int_value(sheet, is_visitor_def_row, 7)
            pass_intc = self._get_int_value(sheet, is_visitor_def_row, 8)
            pass_intc_yds = self._get_int_value(sheet, is_visitor_def_row, 9)
            pass_brup = self._get_int_value(sheet, is_visitor_def_row, 10)
            pass_sacks = self._get_float_value(sheet, is_visitor_def_row, 11)
            pass_sacks_yds = self._get_int_value(sheet, is_visitor_def_row, 12)

            indi_stats_visitor_def = IndividualStatsDefensive(player_name, tack_ut, tack_a, tack_tot, tackles_for_loss_no,
                                                           tackles_for_loss_yds, fumb_rcvd,
                                                           fumb_rcvd_yds, pass_intc, pass_intc_yds, pass_brup, pass_sacks, pass_sacks_yds)
            indi_stats_visitor_def_list.append(indi_stats_visitor_def)
            indi_stats_visitor_def_row = indi_stats_visitor_def_row + 1

        time_pos_home_row = indi_stats_visitor_def_row
        time_pos_home_qtr_1 = str(sheet.cell(time_pos_home_row, 1).value).strip()
        time_pos_home_qtr_2 = str(sheet.cell(time_pos_home_row, 2).value).strip()
        time_pos_home_qtr_3 = str(sheet.cell(time_pos_home_row, 3).value).strip()
        time_pos_home_qtr_4 = str(sheet.cell(time_pos_home_row, 4).value).strip()
        time_pos_home_qtr_total = str(sheet.cell(time_pos_home_row, 5).value).strip()

        time_pos_visitor_row = time_pos_home_row + 2
        time_pos_visitor_qtr_1 = str(sheet.cell(time_pos_visitor_row, 1).value).strip()
        time_pos_visitor_qtr_2 = str(sheet.cell(time_pos_visitor_row, 2).value).strip()
        time_pos_visitor_qtr_3 = str(sheet.cell(time_pos_visitor_row, 3).value).strip()
        time_pos_visitor_qtr_4 = str(sheet.cell(time_pos_visitor_row, 4).value).strip()
        time_pos_visitor_qtr_total = str(sheet.cell(time_pos_visitor_row, 5).value).strip()

        home_team_tag.fill_team_totals_tag(home_team_stats_total_offensive_plays, home_team_stats_total_net_yards)
        home_team_tag.fill_team_totals_firstdowns_tag(home_team_stats_first_downs, home_team_stats_rushing,
                                                      home_team_stats_passing, home_team_stats_penalty)
        home_team_tag.fill_team_totals_penalties_tag(home_team_stats_penalties_number_yards)
        home_team_tag.fill_team_totals_conversions_tag(home_team_stats_thirddown_conversions, home_team_stats_fourthdown_conversions)
        home_team_tag.fill_team_totals_fumbles_tag(home_team_stats_fumbles_number_lost)
        home_team_tag.fill_team_totals_misc_tag(home_team_stats_possession_time)
        home_team_tag.fill_team_totals_redzone_tag(home_team_stats_redzone_scores_chances)
        home_team_tag.fill_team_totals_rush_tag(home_team_stats_rushing_attempts, home_team_stats_yards_gained_rushes,
                                                home_team_stats_yards_lost_rushes,
                                                home_team_stats_net_yards_rushing, indi_stats_home_rushing_list)
        home_team_tag.fill_team_totals_pass_tag(home_team_stats_net_yards_passing, home_team_stats_passes_attempted,
                                                home_team_stats_passes_completed, home_team_stats_had_intercepted,
                                                home_team_stats_sacks_total_yds, indi_stats_home_passing_list)
        home_team_tag.fill_team_totals_rcv_tag(indi_stats_home_passing_rec_list)
        home_team_tag.fill_team_totals_punt_tag(home_team_stats_number_of_punts_yards, home_team_stats_punting_inside_20,
                                                home_team_stats_punting_50plus, home_team_stats_punting_touchback,
                                                home_team_stats_punting_fair_catch, indi_stats_home_punting_list)
        home_team_tag.fill_team_totals_ko_tag(home_team_stats_kickoff_number_yards, home_team_stats_kickoff_touchback,
                                              indi_stats_home_kick_offs_list)
        home_team_tag.fill_team_totals_fg_tag(home_team_stats_fields_goals_total_made, indi_stats_home_field_goal_list)
        home_team_tag.fill_team_totals_pat_tag(home_team_stats_pat_total_made)
        home_team_tag.fill_team_totals_kr_tag(home_team_stats_kickoff_returns_number_yards, indi_stats_home_all_returns_list)
        home_team_tag.fill_team_totals_pr_tag(home_team_stats_punt_returns_number_yards, indi_stats_home_all_returns_list)
        home_team_tag.fill_team_totals_ir_tag(home_team_stats_interceptions_number_yards, indi_stats_home_all_returns_list)
        home_team_tag.fill_team_totals_scoring_tag(indi_stats_home_rushing_list, indi_stats_home_passing_list,
                                                   indi_stats_home_field_goal_list, home_team_stats_pat_total_made,
                                                   home_team_stats_fields_goals_total_made)
        home_team_tag.fill_team_totals_defense_tag(indi_stats_home_def_list)

        visitor_team_tag.fill_team_totals_tag(visitor_team_stats_total_offensive_plays, visitor_team_stats_total_net_yards)
        visitor_team_tag.fill_team_totals_firstdowns_tag(visitor_team_stats_first_downs, visitor_team_stats_rushing,
                                                         visitor_team_stats_passing, visitor_team_stats_penalty)
        visitor_team_tag.fill_team_totals_penalties_tag(visitor_team_stats_penalties_number_yards)
        visitor_team_tag.fill_team_totals_conversions_tag(visitor_team_stats_thirddown_conversions, visitor_team_stats_fourthdown_conversions)
        visitor_team_tag.fill_team_totals_fumbles_tag(visitor_team_stats_fumbles_number_lost)
        visitor_team_tag.fill_team_totals_misc_tag(visitor_team_stats_possession_time)
        visitor_team_tag.fill_team_totals_redzone_tag(visitor_team_stats_redzone_scores_chances)
        visitor_team_tag.fill_team_totals_rush_tag(visitor_team_stats_rushing_attempts, visitor_team_stats_yards_gained_rushes,
                                                   visitor_team_stats_yards_lost_rushes,
                                                   visitor_team_stats_net_yards_rushing, indi_stats_visitor_rushing_list)
        visitor_team_tag.fill_team_totals_pass_tag(visitor_team_stats_net_yards_passing, visitor_team_stats_passes_attempted,
                                                   visitor_team_stats_passes_completed, visitor_team_stats_had_intercepted,
                                                   visitor_team_stats_sacks_total_yds, indi_stats_visitor_passing_list)
        visitor_team_tag.fill_team_totals_rcv_tag(indi_stats_visitor_passing_rec_list)
        visitor_team_tag.fill_team_totals_punt_tag(visitor_team_stats_number_of_punts_yards, visitor_team_stats_punting_inside_20,
                                                   visitor_team_stats_punting_50plus, visitor_team_stats_punting_touchback,
                                                   visitor_team_stats_punting_fair_catch, indi_stats_visitor_punting_list)
        visitor_team_tag.fill_team_totals_ko_tag(visitor_team_stats_kickoff_number_yards, visitor_team_stats_kickoff_touchback,
                                                 indi_stats_visitor_kick_offs_list)
        visitor_team_tag.fill_team_totals_fg_tag(visitor_team_stats_fields_goals_total_made, indi_stats_visitor_field_goal_list)
        visitor_team_tag.fill_team_totals_pat_tag(visitor_team_stats_pat_total_made)
        visitor_team_tag.fill_team_totals_kr_tag(visitor_team_stats_kickoff_returns_number_yards, indi_stats_visitor_all_returns_list)
        visitor_team_tag.fill_team_totals_pr_tag(visitor_team_stats_punt_returns_number_yards, indi_stats_visitor_all_returns_list)
        visitor_team_tag.fill_team_totals_ir_tag(visitor_team_stats_interceptions_number_yards, indi_stats_visitor_all_returns_list)
        visitor_team_tag.fill_team_totals_scoring_tag(indi_stats_visitor_rushing_list, indi_stats_visitor_passing_list,
                                                      indi_stats_visitor_field_goal_list, visitor_team_stats_pat_total_made,
                                                      visitor_team_stats_fields_goals_total_made)
        visitor_team_tag.fill_team_totals_defense_tag(indi_stats_visitor_def_list)

        sheet_roster = workbook.sheet_by_index(1)

        home_team_rosters_list = list()
        roster_row = 2
        for row in range(roster_row, sheet_roster.nrows):
            player_name = str(sheet_roster.cell(row, 0).value.encode("ascii", "ignore")).strip()
            if len(player_name) == 0:
                roster_row = roster_row + 1
                continue
            # need to handle scenario when the actual player name itself starts with roster.
            if player_name.startswith('Roster'):
                roster_row = roster_row + 1
                break
            pos = str(sheet_roster.cell(row, 1).value).strip()
            jersey_no = self._get_jersey_value(sheet_roster, row, 2)
            player_class = self._get_jersey_value(sheet_roster, row, 3)
            home_team_rosters = Roster(player_name, pos, jersey_no, player_class)
            home_team_rosters_list.append(home_team_rosters)
            roster_row = roster_row + 1

        visitor_team_rosters_list = list()
        roster_row = roster_row + 1
        for row in range(roster_row, sheet_roster.nrows):
            player_name = str(sheet_roster.cell(row, 0).value.encode("ascii", "ignore")).strip()
            if len(player_name) == 0:
                roster_row = roster_row + 1
                continue
            # need to handle scenario when the actual player name itself starts with roster.
            if player_name.startswith('Roster'):
                roster_row = roster_row + 1
                break
            pos = str(sheet_roster.cell(row, 1).value).strip()
            jersey_no = self._get_jersey_value(sheet_roster, row, 2)
            player_class = self._get_jersey_value(sheet_roster, row, 3)
            visitor_team_rosters = Roster(player_name, pos, jersey_no, player_class)
            visitor_team_rosters_list.append(visitor_team_rosters)
            roster_row = roster_row + 1

        home_team_player_tag_objs = dict()

        for home_team_roster in home_team_rosters_list:
            player_tag = PlayerTagsFieldsStore()
            player_tag.fill_player_tag(home_team_roster.player_name, home_team_roster.jersey_number, home_team_roster.player_class,
                                       home_team_roster.pos, True)
            # Not appending jersey_number because in actual stats we dont have jersey number available.
            player_key = home_team_roster.player_name
            home_team_player_tag_objs[player_key] = player_tag

        visitor_team_player_tag_objs = dict()

        for visitor_team_roster in visitor_team_rosters_list:
            player_tag = PlayerTagsFieldsStore()
            player_tag.fill_player_tag(visitor_team_roster.player_name, visitor_team_roster.jersey_number, visitor_team_roster.player_class,
                                       visitor_team_roster.pos, True)
            player_key = visitor_team_roster.player_name
            visitor_team_player_tag_objs[player_key] = player_tag

        for indi_stats_home_rushing in indi_stats_home_rushing_list:
            if indi_stats_home_rushing.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_rushing.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-Rush). Player Name:' + indi_stats_home_rushing.player_name
                continue
            player_tag_obj.fill_indi_stats_rushing(indi_stats_home_rushing)

        for indi_stats_home_passing in indi_stats_home_passing_list:
            if indi_stats_home_passing.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_passing.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-Passing). Player Name:' + indi_stats_home_passing.player_name
                continue
            player_tag_obj.fill_indi_stats_passing(indi_stats_home_passing)

        for indi_stats_home_passing_rec in indi_stats_home_passing_rec_list:
            if indi_stats_home_passing_rec.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_passing_rec.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-Passing Rcv). Player Name:' + indi_stats_home_passing_rec.player_name
                continue
            player_tag_obj.fill_indi_stats_passing_rec(indi_stats_home_passing_rec)

        for indi_stats_home_punting in indi_stats_home_punting_list:
            if indi_stats_home_punting.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_punting.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-Punt). Player Name:' + indi_stats_home_punting.player_name
                continue
            player_tag_obj.fill_indi_stats_punting(indi_stats_home_punting)

        for indi_stats_home_field_goal in indi_stats_home_field_goal_list:
            if indi_stats_home_field_goal.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_field_goal.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-FG). Player Name:' + indi_stats_home_field_goal.player_name
                continue
            player_tag_obj.fill_indi_stats_field_goal(indi_stats_home_field_goal)

        for indi_stats_home_kick_offs in indi_stats_home_kick_offs_list:
            if indi_stats_home_kick_offs.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_kick_offs.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-FG). Player Name:' + indi_stats_home_kick_offs.player_name
                continue
            player_tag_obj.fill_indi_stats_kick_offs(indi_stats_home_kick_offs)

        for indi_stats_home_all_returns in indi_stats_home_all_returns_list:
            if indi_stats_home_all_returns.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_all_returns.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-All Returns). Player Name:' + indi_stats_home_all_returns.player_name
                continue
            player_tag_obj.fill_indi_stats_all_returns(indi_stats_home_all_returns)

        for indi_stats_home_def in indi_stats_home_def_list:
            if indi_stats_home_def.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = home_team_player_tag_objs.get(indi_stats_home_def.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-Defense). Player Name:' + indi_stats_home_def.player_name
                continue
            player_tag_obj.fill_indi_stats_def(indi_stats_home_def)
        # =======================================================================
        for indi_stats_visitor_rushing in indi_stats_visitor_rushing_list:
            if indi_stats_visitor_rushing.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_rushing.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Visitor-Rush). Player Name:' + indi_stats_visitor_rushing.player_name
                continue
            player_tag_obj.fill_indi_stats_rushing(indi_stats_visitor_rushing)

        for indi_stats_visitor_passing in indi_stats_visitor_passing_list:
            if indi_stats_visitor_passing.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_passing.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Visitor-Passing). Player Name:' + indi_stats_visitor_passing.player_name
                continue
            player_tag_obj.fill_indi_stats_passing(indi_stats_visitor_passing)

        for indi_stats_visitor_passing_rec in indi_stats_visitor_passing_rec_list:
            if indi_stats_visitor_passing_rec.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_passing_rec.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Visitor-Passing Rcv). Player Name:' + indi_stats_visitor_passing_rec.player_name
                continue
            player_tag_obj.fill_indi_stats_passing_rec(indi_stats_visitor_passing_rec)

        for indi_stats_visitor_punting in indi_stats_visitor_punting_list:
            if indi_stats_visitor_punting.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_punting.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Visitor-Punt). Player Name:' + indi_stats_visitor_punting.player_name
                continue
            player_tag_obj.fill_indi_stats_punting(indi_stats_visitor_punting)

        for indi_stats_visitor_field_goal in indi_stats_visitor_field_goal_list:
            if indi_stats_visitor_field_goal.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_field_goal.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Visitor-FG). Player Name:' + indi_stats_visitor_field_goal.player_name
                continue
            player_tag_obj.fill_indi_stats_field_goal(indi_stats_visitor_field_goal)

        for indi_stats_visitor_kick_offs in indi_stats_visitor_kick_offs_list:
            if indi_stats_visitor_kick_offs.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_kick_offs.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Home-FG). Player Name:' + indi_stats_visitor_kick_offs.player_name
                continue
            player_tag_obj.fill_indi_stats_kick_offs(indi_stats_visitor_kick_offs)

        for indi_stats_visitor_all_returns in indi_stats_visitor_all_returns_list:
            if indi_stats_visitor_all_returns.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_all_returns.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Visitor-All Returns). Player Name:' + indi_stats_visitor_all_returns.player_name
                continue
            player_tag_obj.fill_indi_stats_all_returns(indi_stats_visitor_all_returns)

        for indi_stats_visitor_def in indi_stats_visitor_def_list:
            if indi_stats_visitor_def.player_name.lower() in ['total', 'totals']:
                continue
            player_tag_obj = visitor_team_player_tag_objs.get(indi_stats_visitor_def.player_name, None)
            if player_tag_obj is None:
                print '====>>> Player not found in the Object Dictionary(Visitor-Defense). Player Name:' + indi_stats_visitor_def.player_name
                continue
            player_tag_obj.fill_indi_stats_def(indi_stats_visitor_def)

        return basic_fields, home_team_tag, visitor_team_tag, home_team_player_tag_objs, visitor_team_player_tag_objs, plays_tag_obj

    def _get_int_value(self, sheet, row, col):

        data = str(sheet.cell(row, col).value).strip()
        if len(data) != 0:
            try:
                if data == '#':
                    return NA_DEF_VALUE

                return str(int(sheet.cell(row, col).value))
            except Exception as e:
                print 'Error converting excel value to int value. Excel Value: <' + data + '>, Row Number: <' \
                      + str(row + 1) + '>, Columns: <' + str(col + 1) + '>\n'
                raise e
        return '0'

    def _get_float_value(self, sheet, row, col):

        data = str(sheet.cell(row, col).value).strip()
        if len(data) != 0:
            try:
                if data == '#':
                    return NA_DEF_VALUE

                return str(float(sheet.cell(row, col).value))
            except Exception as e:
                print 'Error converting excel value to float value. Excel Value: <' + data + '>, Row Number: <' \
                      + str(row + 1) + '>, Columns: <' + str(col + 1) + '>'
                raise e
        return ''

    def _get_jersey_value(self, sheet, row, col):

        data = str(sheet.cell(row, col).value).strip()
        if len(data) != 0:
            try:
                return str(int(sheet.cell(row, col).value))
            except:
                return str(sheet.cell(row, col).value).strip()

        return ''

    def _get_formatted_conv(self, convs):
        if 'of' in convs:
            return convs
        elif '/' in convs:
            return convs.replace('/', ' of ')
        elif '-' in convs:
            return convs.replace('-', ' of ')

        return convs

    def _validate_two_values(self, values, field_name):

        if len(values.split('-')) != 2:
            print 'ERROR: Values are not correct format (#-#) for field: <' + field_name + '>, Value in Excel: <' + values + '>'
            raise ValueError('Values are not correct format')

    def _validate_three_values(self, values, field_name):

        if len(values.split('-')) != 3:
            print 'ERROR: Values are not correct format (#-#-#) for field: <' + field_name + '>, Value in Excel: <' + values + '>'
            raise ValueError('Values are not correct format')

    def _validate_pass_comp_att(self, att_comp_int, team):

        if len(att_comp_int.split('-')) != 3:
            print 'ERROR: Values are not correct format (#-#-#) for field: <Passing - Att.-Comp-Int.>. Team: <' + team + \
                  '>, Value in Excel: <' + att_comp_int + '>'
            raise ValueError('Values are not correct format')

        att_comp_int_arr = att_comp_int.split('-')
        atts = att_comp_int_arr[0]
        comp = att_comp_int_arr[1]
        if atts == NA_CHAR or comp == NA_CHAR:
            return

        if int(comp) > int(atts):
            print 'ERROR: Pass Completions are greater than pass attempts. Team: <' + team + '>'
            raise ValueError('Values are not correct format')

class ScorePlay(object):

    def __init__(self, team_name, qtr, time, scoring_play_text, home_score, visitor_score):
        self.team_name = team_name
        self.qtr = qtr
        self.time = time
        self.scoring_play_text = scoring_play_text
        self.home_score = home_score
        self.visitor_score = visitor_score


class IndividualStatsRushing(object):

    def __init__(self, player_name, att, gain, lost, net, td, long):
        self.player_name = player_name
        self.att = att
        self.gain = gain
        self.lost = lost
        self.net = net
        self.td = td
        self.long = long


class IndividualStatsPassing(object):

    def __init__(self, player_name, att_comp_int, yards, td, long, sacks):
        self.player_name = player_name
        self.att_comp_int = att_comp_int
        self.yards = yards
        self.td = td
        self.long = long
        self.sacks = sacks


class IndividualStatsPassReceiving(object):

    def __init__(self, player_name, no, yards, td, long):
        self.player_name = player_name
        self.no = no
        self.yards = yards
        self.td = td
        self.long = long


class IndividualStatsPunting(object):

    def __init__(self, player_name, no, yds, avg, long, blkd, tb, fc, fifty_plus, inside20):
        self.player_name = player_name
        self.no = no
        self.yds = yds
        self.avg = avg
        self.long = long
        self.blkd = blkd
        self.tb = tb
        self.fc = fc
        self.fifty_plus = fifty_plus
        self.inside20 = inside20


class IndividualStatsFieldGoals(object):

    def __init__(self, player_name, att, made, long, blkd):
        self.player_name = player_name
        self.att = att
        self.made = made
        self.long = long
        self.blkd = blkd


class IndividualStatsKickoffs(object):

    def __init__(self, player_name, no, yds, tb, ob, fcyds):
        self.player_name = player_name
        self.no = no
        self.yds = yds
        self.tb = tb
        self.ob = ob
        self.fcyds = fcyds


class IndividualStatsAllReturns(object):

    def __init__(self, player_name, punts_no_yds_lp, kickoff_no_yds_lp, intercepted_no_yds_lp):
        self.player_name = player_name
        self.punts_no_yds_lp = punts_no_yds_lp
        self.kickoff_no_yds_lp = kickoff_no_yds_lp
        self.intercepted_no_yds_lp = intercepted_no_yds_lp


class IndividualStatsDefensive(object):

    def __init__(self, player_name, tack_ut, tack_a, tack_tot, tackles_for_loss_no, tackles_for_loss_yds, fumb_rcvd,
                       fumb_rcvd_yds, pass_intc, pass_intc_yds, pass_brup, pass_sacks, pass_sacks_yds):
        self.player_name = player_name
        self.tack_ut = tack_ut
        self.tack_a = tack_a
        self.tack_tot = tack_tot
        self.tackles_for_loss_no = tackles_for_loss_no
        self.tackles_for_loss_yds = tackles_for_loss_yds
        self.fumb_rcvd = fumb_rcvd
        self.fumb_rcvd_yds = fumb_rcvd_yds
        self.pass_intc = pass_intc
        self.pass_intc_yds = pass_intc_yds
        self.pass_brup = pass_brup
        self.pass_sacks = pass_sacks
        self.pass_sacks_yds = pass_sacks_yds


class Roster(object):

    def __init__(self, player_name, pos, jersey_number, player_class):
        self.player_name = player_name
        self.pos = pos
        self.jersey_number = jersey_number
        self.player_class = player_class
