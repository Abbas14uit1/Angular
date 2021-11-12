import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { IGameBaseBallScoring } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-scoring-plays-baseball",
  templateUrl: "./scoring-plays-baseball.component.html",
  styleUrls: ["./scoring-plays-baseball.component.css", "../summary-baseball.component.css"],
})
export class ScoringPlaysBaseballComponent implements OnInit {
  @Input() public homeTeam: any;
  @Input() public awayTeam: any;
  @Input() public scoringPlays: any[];
  @Input() public sportId: any;  
    // tslint:disable:no-empty
  constructor() { }
  public ngOnInit() {   
  }

   public getNumberSuffix(value: any) {
     let suffix = 'th',
       day = value,
       prefix = "INNING";    
    if (day === 1 || day === 21 || day === 31) {
        suffix = 'st'
    } else if (day === 2 || day === 22) {
        suffix = 'nd';
    } else if (day === 3 || day === 23) {
        suffix = 'rd';
    }
     return value + "" + suffix + " " + prefix;
    }

  public splitDesc(desc: string) {
    const split = desc.split(", clock");
    return split[0];
  }


  }
