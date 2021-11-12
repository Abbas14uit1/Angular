import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnInit } from "@angular/core";
import { Jsonp } from "@angular/http";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-scoring-plays-soccer",
  templateUrl: "./scoring-plays-soccer.component.html",
  styleUrls: ["./scoring-plays-soccer.component.css", "../summary-soccer.component.css"],
})
export class ScoringPlaysSoccerComponent implements OnInit {

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
       day = Number(value),
       prefix = "PERIOD";
     if (day === 5)
       return "OT";
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

