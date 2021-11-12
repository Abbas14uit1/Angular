import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
@Component({
  selector: "app-col-groups",
  templateUrl: "./col-groups.component.html",
  styleUrls: ["./col-groups.component.css"],
})
export class ColGroupsComponent implements OnInit {

  @Input() public data: any[];
  @Input() public games = false;
sportId: any;

  public totalCols = 0;
  public colsArr: any = [];

  constructor(private route: ActivatedRoute) {
  //
  }

  public ngOnInit() {
    this.sportId = this.route.params;
    this.getTotalCols();
    this.colsArr = Array(this.totalCols).fill(0);
  }

  public getTotalCols() {
    this.data.forEach((element) => {
      this.totalCols += element.colSpan;
    });
  }

}
