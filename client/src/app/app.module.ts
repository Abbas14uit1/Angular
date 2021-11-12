import { CdkTableModule } from "@angular/cdk/table";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RequestOptions } from "@angular/http";
import { MATERIAL_COMPATIBILITY_MODE } from "@angular/material";
import { MatExpansionModule } from "@angular/material/expansion";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { QueryBuilderModule } from "angular2-query-builder";
import {
  AuthRequest,
  AuthService,
} from "app/shared/auth-request/auth-request.module";
import { AuthGuard } from "app/shared/guard/auth.guard";
import { FileSelectDirective, FileUploadModule } from "ng2-file-upload";
import { AdminLoginComponent } from "./admin/admin-login/admin-login.component";
import { AdminComponent } from "./admin/admin.component";
import { EditPlayerDialogComponent } from "./admin/players/dialogs/edit/edit-player.dialog.component";
import { PlayersComponent } from "./admin/players/players.component";
import { UploadComponent } from "./admin/upload/upload.component";
import { AddDialogComponent } from "./admin/users/dialogs/add/add.dialog.component";
import { DeleteDialogComponent } from "./admin/users/dialogs/delete/delete.dialog.component";
import { EditDialogComponent } from "./admin/users/dialogs/edit/edit.dialog.component";
import { UsersComponent } from "./admin/users/users.component";
import { AppComponent } from "./app.component";
import { MaterialModule } from "./material/material.module";
import { OrdinalPipe } from "./ordinal.pipe";
import { RoundToPipe } from "./roundto.pipe";
import { GoogleAnalyticsEventsService } from "./services/google-analytics-events-service";
import { FooterComponent } from "./shared/footer/footer.component";
import { HeaderComponent } from "./shared/header/header.component";
import { HomeComponent } from "./shared/home/home.component";
import { AdhocQueriesComponent } from "./sport/adhoc-queries/adhoc-queries.component";
import { AdhocResultsDialogComponent } from "./sport/adhoc-queries/adhoc-results.dialog.component";
import { AlertsComponent } from "./sport/alerts/alerts.component";
import { InnerComponent } from "./sport/alerts/records/inner.component";
import { PlayersDetailDialogComponent } from "./sport/alerts/records/players.detail.dialog.component";
import { PlayersDialogComponent } from "./sport/alerts/records/players.dialog.component";
import { RecordsPostgameComponent } from "./sport/alerts/records/records-postgame.component";
import { RecordsPregameComponent } from "./sport/alerts/records/records-pregame.component";
import { AnalyticsComponent } from "./sport/analytics/analytics.component";
import { ClusterComponent } from "./sport/analytics/datamining/cluster.component";
import { LastwhenComponent } from "./sport/analytics/lastwhen/lastwhen.component";
import { RecordsBasketballComponent } from "./sport/analytics/records/records-basketball.component";
import { RecordsComponent } from "./sport/analytics/records/records.component";
import { StreaksComponent } from "./sport/analytics/streaks/streaks.component";
import { AutomatedStoryComponent } from "./sport/automated-story/automated-story.component";
// import { StreaksTeamComponent } from "./sport/alerts/streaks/streaks-team.component";
// import { StreaksPlayerComponent } from "./sport/alerts/streaks/streaks-player.component";
import { DashboardComponent } from "./sport/dashboard/dashboard.component";
import { RosterComponent } from "./sport/dashboard/roster/roster.component";
import { SeasonComponent } from "./sport/dashboard/season/season.component";
import { GameComponent } from "./sport/game/game.component";
import { PlayByPlayComponent } from "./sport/game/play-by-play/play-by-play.component";
import { PlayListBaseballComponent } from "./sport/game/play-by-play/play-list/play-list-baseball.component";
import { PlayListBasketballComponent } from "./sport/game/play-by-play/play-list/play-list-basketball.component";
import { PlayListFootballComponent } from "./sport/game/play-by-play/play-list/play-list-football.component";
import { FullRosterComponent } from "./sport/game/rosters/full-roster/full-roster.component";
import { RostersComponent } from "./sport/game/rosters/rosters.component";
import { StarterRosterComponent } from "./sport/game/rosters/starter-roster/starter-roster.component";
import { BaserunningComponent } from "./sport/game/summary/baseball/baserunning/baserunning.component";
import { FieldingComponent } from "./sport/game/summary/baseball/fielding/fielding.component";
import { HittingsComponent } from "./sport/game/summary/baseball/hittings/hittings.component";
// tslint:disable-next-line:max-line-length
import { OverallStatsBaseballComponent } from "./sport/game/summary/baseball/overall-stats/overall-stats-baseball.component";
import { PitchingsComponent } from "./sport/game/summary/baseball/pitchings/pitchings.component";
// tslint:disable-next-line:max-line-length
import { ScoringPlaysBaseballComponent } from "./sport/game/summary/baseball/scoring-plays/scoring-plays-baseball.component";
import { SummaryBaseballComponent } from "./sport/game/summary/baseball/summary-baseball.component";
import { FoulsComponent } from "./sport/game/summary/basketball/fouls/fouls-basketball.component";
import { OtherComponent } from "./sport/game/summary/basketball/other/other-baseketball.component";
// tslint:disable-next-line:max-line-length
import { OverallStatsBasketballComponent } from "./sport/game/summary/basketball/overall-stats/overall-stats-basketball.component";
import { ReboundsComponent } from "./sport/game/summary/basketball/rebounds/rebounds-basketball.component";
// tslint:disable-next-line:max-line-length
import { ScoringPlaysBaketballComponent } from "./sport/game/summary/basketball/scoring-plays/scoring-plays-basketball.component";
import { ShootingsComponent } from "./sport/game/summary/basketball/shootings/shootings-baseketball.component";
import { SpecialComponent } from "./sport/game/summary/basketball/special/special-baseketball.component";
import { SummaryBasketballComponent } from "./sport/game/summary/basketball/summary-basketball.component";
import { AllreturnsComponent } from "./sport/game/summary/football/allreturns/allreturns.component";
import { DefenseComponent } from "./sport/game/summary/football/defense/defense.component";
import { FieldgoalsComponent } from "./sport/game/summary/football/fieldgoals/fieldgoals.component";
import { FumblesComponent } from "./sport/game/summary/football/fumbles/fumbles.component";
import { InterceptionsComponent } from "./sport/game/summary/football/interceptions/interceptions.component";
import { KickoffsComponent } from "./sport/game/summary/football/kickoffs/kickoffs.component";
// tslint:disable-next-line:max-line-length
import { OverallStatsFootballModalComponent } from "./sport/game/summary/football/overall-stats/overall-stats-football-modal.component";
// tslint:disable-next-line:max-line-length
import { OverallStatsFootballComponent } from "./sport/game/summary/football/overall-stats/overall-stats-football.component";
import { PassingComponent } from "./sport/game/summary/football/passing/passing.component";
import { PuntsComponent } from "./sport/game/summary/football/punts/punts.component";
import { ReceivingComponent } from "./sport/game/summary/football/receiving/receiving.component";
import { RushingComponent } from "./sport/game/summary/football/rushing/rushing.component";
// tslint:disable-next-line:max-line-length
import { ScoringPlaysFootballComponent } from "./sport/game/summary/football/scoring-plays/scoring-plays-football.component";
import { ScoringSummaryComponent } from "./sport/game/summary/football/scoring-summary/scoring-summary.component";
import { SummaryFootballComponent } from "./sport/game/summary/football/summary-football.component";
import { TeamStatsComponent } from "./sport/game/summary/football/team-stats/team-stats.component";
import { ColGroupsComponent } from "./sport/player/col-groups/col-groups.component";
import { PlayerAggBaseketballComponent } from "./sport/player/player-agg/player-agg-baseketball.component";
import { PlayerAggComponent } from "./sport/player/player-agg/player-agg.component";
import { PlayerGamesTableComponent } from "./sport/player/player-games/player-games-table.component";
import { PlayerGamesComponent } from "./sport/player/player-games/player-games.component";
import { PlayerComponent } from "./sport/player/player.component";
// tslint:disable-next-line:max-line-length
import { QueryBuilderResultsComponent } from "./sport/query-builderdb/query-builder-results/query-builder-results.component";
import { QueryBuilderdbBaseballComponent } from "./sport/query-builderdb/query-builderdb-baseball.component";
import { QueryBuilderdbBasketballComponent } from "./sport/query-builderdb/query-builderdb-basketball.component";
import { QueryBuilderdbFootballComponent } from "./sport/query-builderdb/query-builderdb-football.component";
import { FilterMenuBaseballComponent } from "./sport/query/filter-menu/filter-menu-baseball.component";
import { FilterMenuBasketballComponent } from "./sport/query/filter-menu/filter-menu-basketball.component";
import { FilterMenuFootballComponent } from "./sport/query/filter-menu/filter-menu-football.component";
import { QueryDisplayComponent } from "./sport/query/query-display/query-display.component";
import { QueryComponent } from "./sport/query/query.component";
import { RecordDisplayComponent } from "./sport/record/record-display/record-display.component";
import { RecordFilterMenuComponent } from "./sport/record/record-filter-menu/record-filter-menu.component";
import { RecordComponent } from "./sport/record/record.component";
import { UtcdatePipe } from "./utcdate.pipe";
// tslint:disable-next-line:max-line-length
import { PlayerAggSoccerComponent } from "./sport/player/player-agg/player-agg-soccer.component";
import { PlayListSoccerComponent } from "./sport/game/play-by-play/play-list/play-list-soccer.component";
import { SummarySoccerComponent } from "./sport/game/summary/soccer/summary-soccer.component";
import { GoalieComponent } from "./sport/game/summary/soccer/goalie/goalie.component";
import { MiscComponent } from "./sport/game/summary/soccer/misc/misc.component";
import { PenaltiesComponent } from "./sport/game/summary/soccer/penalties/penalties.component";
import { ScoringComponent } from "./sport/game/summary/soccer/scoring/scoring.component";
import { ShotsComponent } from "./sport/game/summary/soccer/shots/shots.component";

import { OverallStatsSoccerComponent } from "./sport/game/summary/soccer/overall-stats/overall-stats-soccer.component";
import { ScoringPlaysSoccerComponent } from "./sport/game/summary/soccer/scoring-plays/scoring-plays-soccer.component";
import { FilterMenuSoccerComponent } from "./sport/query/filter-menu/filter-menu-soccer.component";
import { QueryBuilderdbSoccerComponent } from "./sport/query-builderdb/query-builderdb-soccer.component";
import { NewQueryBuilderdbSoccerComponent } from "./sport/query-builderdb/newquery-builderdb-soccer.component";

const appRoutes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    canActivate: [AuthGuard],
    pathMatch: "full",
  },
  { path: "home", canActivate: [AuthGuard], component: HomeComponent }, // Football
  {
    path: ":sport/adhoc-queries/:team",
    canActivate: [AuthGuard],
    component: AdhocQueriesComponent,
  },
  {
    path: ":sport/alerts/:team",
    canActivate: [AuthGuard],
    component: AlertsComponent,
  },
  {
    path: ":sport/analytics/:team",
    canActivate: [AuthGuard],
    component: AnalyticsComponent,
  },
  {
    path: ":sport/dashboard/:teamCode",
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  {
    path: ":sport/playerdashboard/:teamCode",
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  {
    path: ":sport/gamedashboard/:teamCode",
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  {
    path: ":sport/dashboard",
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  { path: ":sport/query", canActivate: [AuthGuard], component: QueryComponent },
  {
    path: ":sport/record/:team",
    canActivate: [AuthGuard],
    component: RecordComponent,
  }, // All
  {
    path: "game/:sport/:gameId",
    canActivate: [AuthGuard],
    component: GameComponent,
  },
  {
    path: "games/:sport/latest",
    canActivate: [AuthGuard],
    component: GameComponent,
  },
  {
    path: "player/:sport/:playerId",
    canActivate: [AuthGuard],
    component: PlayerComponent,
  },
  {
    path: "automatedstory",
    canActivate: [AuthGuard],
    component: AutomatedStoryComponent,
  },
  { path: "admin", canActivate: [AuthGuard], component: AdminComponent },
  { path: "admin/login", component: AdminLoginComponent },
  { path: "login", component: AdminLoginComponent },
  // { path: ":sport/querybuilder/:team", canActivate: [AuthGuard], component: QueryBuilderdbComponent },
  // { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    OrdinalPipe,
    RoundToPipe,
    UtcdatePipe,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    SeasonComponent,
    ClusterComponent,
    GameComponent,
    PitchingsComponent,
    BaserunningComponent,
    FieldingComponent,
    HittingsComponent,
    ScoringSummaryComponent,
    SpecialComponent,
    SummaryFootballComponent,
    SummaryBaseballComponent,
    SummaryBasketballComponent,
    PlayByPlayComponent,
    QueryComponent,
    RostersComponent,
    RushingComponent,
    TeamStatsComponent,
    RosterComponent,
    PassingComponent,
    ReceivingComponent,
    PlayerComponent,
    DefenseComponent,
    FullRosterComponent,
    StarterRosterComponent,
    AdminComponent,
    AdminLoginComponent,
    InterceptionsComponent,
    HomeComponent,
    UploadComponent,
    UsersComponent,
    PlayersComponent,
    OverallStatsFootballComponent,
    OverallStatsFootballModalComponent,
    OverallStatsBasketballComponent,
    ScoringPlaysFootballComponent,
    ScoringPlaysBaseballComponent,
    ScoringPlaysBaketballComponent,
    PlayListFootballComponent,
    FumblesComponent,
    FilterMenuBaseballComponent,
    FilterMenuBasketballComponent,
    FilterMenuFootballComponent,
    QueryBuilderResultsComponent,
    QueryBuilderdbBaseballComponent,
    QueryBuilderdbBasketballComponent,
    QueryBuilderdbFootballComponent,
    // FilterTemplate,
    QueryDisplayComponent,
    PlayerAggBaseketballComponent,
    PlayerAggComponent,
    ColGroupsComponent,
    PlayerGamesComponent,
    PlayerGamesTableComponent,
    OverallStatsBaseballComponent,
    PlayListBaseballComponent,
    ShootingsComponent,
    ReboundsComponent,
    OtherComponent,
    FoulsComponent,
    PlayListBasketballComponent,
    RecordFilterMenuComponent,
    RecordDisplayComponent,
    RecordComponent,
    AddDialogComponent,
    EditDialogComponent,
    DeleteDialogComponent,
    EditPlayerDialogComponent,
    PlayersDialogComponent,
    PlayersDetailDialogComponent,
    InnerComponent,
    AdhocResultsDialogComponent,
    PuntsComponent,
    FieldgoalsComponent,
    KickoffsComponent,
    AdhocQueriesComponent,
    AllreturnsComponent,
    AlertsComponent,
    AnalyticsComponent,
    RecordsPostgameComponent,
    RecordsPregameComponent,
    RecordsComponent,
    RecordsBasketballComponent,
    LastwhenComponent,
    StreaksComponent,
    AutomatedStoryComponent,
    PlayerAggSoccerComponent,
    PlayListSoccerComponent,
    SummarySoccerComponent,
    GoalieComponent,
    MiscComponent,
    PenaltiesComponent,
    ScoringComponent,
    ShotsComponent,
    OverallStatsSoccerComponent,
    ScoringPlaysSoccerComponent,
    FilterMenuSoccerComponent,
    QueryBuilderdbSoccerComponent,
    NewQueryBuilderdbSoccerComponent,
  ],
  imports: [
    BrowserModule,
    QueryBuilderModule,
    RouterModule.forRoot(
      appRoutes,
      // { enableTracing: true }, // <-- debugging purposes only
    ),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    FileUploadModule,
  ],
  entryComponents: [
    AddDialogComponent,
    EditDialogComponent,
    DeleteDialogComponent,
    OverallStatsFootballModalComponent,
    EditPlayerDialogComponent,
    PlayersDialogComponent,
    PlayersDetailDialogComponent,
    AdhocResultsDialogComponent,
  ],
  exports: [RouterModule, CdkTableModule],
  providers: [
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true },
    /* { provide: RequestOptions , useClass: AuthRequest},*/
    { provide: HTTP_INTERCEPTORS, useClass: AuthRequest, multi: true },
    AuthGuard,
    AuthService,
    GoogleAnalyticsEventsService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
