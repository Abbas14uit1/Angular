import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { AdminService } from "../admin.service";
import { AddDialogComponent } from "./dialogs/add/add.dialog.component";
import { DeleteDialogComponent } from "./dialogs/delete/delete.dialog.component";
import { EditDialogComponent } from "./dialogs/edit/edit.dialog.component";
import { User } from "./models/user";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"],
  providers: [AdminService],
})
export class UsersComponent implements OnInit, OnChanges {

  public dataSource: any | null;
  public displayedColumns = ["isActive", "username", "email", "createdOn", "lastUpdatedOn", "id"];
  public users: any[];
  public userName: any;

  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;

  constructor(public dialog: MatDialog, public adminService: AdminService, private router: Router) { }

  public ngOnInit() {
    this.userName = localStorage.getItem("userName");
    this.getUsers();
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  public ngOnChanges() {
    this.getUsers();
  }
  public getUsers() {
    this.adminService.getUsers()
      .subscribe(
        (users) => this.users = users,
        (err) => console.log(err),
        () => {
          this.dataSource = new UserDataSource(this.users, this.sort);
        },
      );
  }

  public refreshTable() {
    this.getUsers();
  }

  public addNew(user: User) {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: { user },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.getUsers();
      }
    });
  }
  // tslint:disable-next-line:max-line-length
  public startEdit(id: string, username: string, email: string, isActive: boolean, admin: boolean, password: string, superAdmin: boolean, confName: string) {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: { id, username, password, email, isActive, admin, superAdmin, confName },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.getUsers();
      }
    });
  }
  // tslint:disable-next-line:max-line-length
  public deleteItem(id: string, username: string, email: string, isActive: boolean, admin: boolean, superAdmin: boolean) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { id, username, email, isActive, admin, superAdmin },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.getUsers();
      }
    });
  }

}
export class UserDataSource extends DataSource<any> {
  private filterChange = new BehaviorSubject("");
  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }
  private filteredData: any[] = [];
  private renderedData: any[] = [];
  constructor(
    private data: any[],
    private sort: MatSort,
  ) {
    super();
  }
  public connect(): Observable<any[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.filterChange,
    ];
    const user: any[] = this.data;

    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = user.slice().filter((item: any) => {
        const searchStr = (item.username).toLowerCase();
        const emailStr = (item.email).toLowerCase();
        // tslint:disable-next-line:max-line-length
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1 || emailStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      // Sort filtered data
      const sortedData = this.sortData(this.filteredData.slice());
      this.renderedData = sortedData;
      return this.renderedData;
    });
  }

  public disconnect() { return; }

  public sortData(data: any[]): any[] {
    if (!this.sort.active || this.sort.direction === "") { return data; }

    return data.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";
      switch (this.sort.active) {
        case "username": [propertyA, propertyB] = [a.username, b.username]; break;
        case "email": [propertyA, propertyB] = [a.username, b.username]; break;
        case "createdOn": [propertyA, propertyB] = [a.createdOn, b.createdOn]; break;
        case "lastUpdatedOn": [propertyA, propertyB] = [a.lastUpdatedOn, b.lastUpdatedOn]; break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
    });
  }
}
