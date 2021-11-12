import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { RecordService } from "app/sport/record/record.service";
import { Observable } from "rxjs/Observable";
import { IAvailableStatDetails } from "../../../../../../typings/server/availablePlayerStats.d";

@Component({
  selector: "app-record-filter-menu",
  templateUrl: "./record-filter-menu.component.html",
  styleUrls: ["./record-filter-menu.component.css"],
  providers: [RecordService],
})
export class RecordFilterMenuComponent implements OnInit {

  @ViewChild("filter") public filter: ElementRef;
  @Input() public teamId: any;
  @Input() public sportId: any;
  @Input() public teamColor: any;
  @Output() public results = new EventEmitter<any>();
  @Output() public spinner = new EventEmitter<boolean>();
  public recordTitle: string = "";
  public recordTitles: any = [];
  public filteredRecordTitles: any = [];
  constructor(private recordService: RecordService) { }
  public ngOnInit() {
    this.recordService.getRecordTitles(this.sportId,
      this.teamId)
      .subscribe((titles: any) => {
        this.recordTitles = titles.sort();
        this.filteredRecordTitles = titles.sort();
        if (titles.length > 0) {
        this.recordTitle = titles[0];
        this.getRecordDetails();
      }
      });

    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (this.filter.nativeElement.value.length > 0) {
          const filterVal = this.filter.nativeElement.value.toLowerCase();
          const filterednames = this.recordTitles.filter((item: any) => {
            return (item.toLowerCase().indexOf(filterVal) > -1);
          });
          this.filteredRecordTitles = filterednames;
        }
        else{
          this.filteredRecordTitles = this.recordTitles;
        }
      });
  }

  public onClick(title: string) {
    this.recordTitle = title;
    this.getRecordDetails();

  }
  public getRecordDetails() {
    this.spinner.emit(true);
    this.recordService.getRecords(
      this.sportId,
      this.teamId,
      this.recordTitle,
    )
      .subscribe(
        (results: any) => {
          this.results.emit(results);
          this.spinner.emit(false);
        },
        (err) => null,
      );
  }
}
