import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
/*import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';*/
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { HeaderConfig } from "../../shared/header/header.component";
import { TeamColors } from "../../shared/team-colors";
import { DataSource } from '@angular/cdk/collections';

export interface Element {
  topics: string;
  story: string;
  icon:string;
}

export class eDataSource extends DataSource<any> {
  constructor(private element: Element[]) {
    super();
  }
  connect(): Observable<Element[]> {
    return Observable.of(this.element);
  }
  disconnect() {}
}

@Component({
  selector: "automated-story",
  templateUrl: "./automated-story.component.html",
  styleUrls: ["./automated-story.component.css"],
  providers: [],
  encapsulation: ViewEncapsulation.None
})
export class AutomatedStoryComponent implements OnInit{

  displayedColumns = ['topics', 'story', 'icon'];
  dataSource: eDataSource;
  ELEMENT_DATA: Element[] = [
  {topics: 'Season Opener', story: 'When playing at any stadium, Purdue is 76-49-6 in the season opener. \n This is the first meeting between Purdue and Nebraska in a season opener.', icon:'fa fa-twitter'},
  {topics: 'Opponent series', story: 'Purdue has played Nebraska four times with 4-4-0 record in these meetings.', icon:'fa fa-twitter'},
  {topics: 'All Time', story: 'In all games played at any stadium, Purdue is 618-575-48.', icon:'fa fa-twitter'}
  ];

/*,
  {topics: 'Players to Watch', story: 'Henry Ruggs had 2 receiving TDs in the game against Auburn, which puts him in a tie for 4th all time in receiving touchdowns in a single season.\n Jerry Jeudy added another receiving TD in the game against Auburn, which puts him in a tie for 2nd all time in receiving touchdowns in a single season.', icon:'fa fa-twitter'},
  {topics: 'Current Streaks', story: '', icon:'fa fa-twitter'}*/
  public shared: TeamColors = new TeamColors();
  public headerConfig = HeaderConfig;
  public teamColors: any;
  constructor(
    private route: ActivatedRoute,
  ) { 
    this.teamColors = this.shared.teamColors;
    //localStorage.setItem("headerTitle", "Automated Story" + " - " + localStorage.getItem("sportText"));
  }

  public ngOnInit() {
    this.dataSource = new eDataSource(this.ELEMENT_DATA);
  }
}

