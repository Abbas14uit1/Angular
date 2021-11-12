import { DataSource } from "@angular/cdk/collections";
import { HttpClient } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from "@angular/core";
import { Injectable } from "@angular/core";
// import { Headers, Http, RequestOptions, Response } from "@angular/http";
import {
  FileDropDirective, FileItem,
  FileSelectDirective, FileUploader, FileUploaderOptions,
} from "ng2-file-upload/ng2-file-upload";

import { environment } from "environments/environment";
import * as moment from "moment";

import "rxjs/add/operator/catch";
import { Observable } from "rxjs/Observable";

const URL = environment.API_URL + "/api_v1/upload/games";

@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.css"],
})

@Injectable()
export class UploadComponent implements OnInit {
  public uploader: FileUploader;
  public hasBaseDropZoneOver = false;
  public hasAnotherDropZoneOver = false;
  public errorMessage: string[] = [];
  // possible error messages based on line numbers and files
  public errorMessages: IError[] = [
    {
      value: "playTokenParser.js",
      name: " contains a play (or plays) without tokens",
    },
    {
      value: "footballImporter.js:90:65",
      name: " contains no drive tags",
    },
    {
      value: "playerParser.js:91:27",
      name: " contains a player (or players) with an empty defense tag in their statistics",
    },
    {
      value: "footballImporter.js:58:51",
      name: " contains no play tags",
    },
    {
      value: "teamParser.js:40:26",
      name: " is missing one team",
    },
    {
      value: "footballImporter.js:59:44",
      name: " is missing venue information",
    },
  ];
  public displayedColumns = ["name", "size", "progress", "status"];
  public data: any[] = [];
  public dataSource = new UploadDataSource(this.data);

  public selectedSource: string;
  public upCount = 0;

  private token: { username: string, admin: boolean };

  constructor() {
    const parsed = JSON.parse(localStorage.getItem("user") || "");
    if (parsed.token) {
      this.token = parsed.token;
    }
    this.uploader = new FileUploader({
      url: URL,
      itemAlias: "file",
      authToken: `JWT ${this.token}`,
    });
    this.uploader.onAfterAddingFile = (item: FileItem): any => {
      this.dataSource = new UploadDataSource(this.uploader.queue);
    };
    this.uploader.onErrorItem = (
      (item: FileItem, response: string, status: number): any => {
        this.errorMessage.push(this.handleError(response, item._file.name)!);
      });

  }

  public ngOnInit() { return; }

  public handleError(message: string, name: string) {
    let errorMatched = false;
    for (const error of this.errorMessages) {
      if (message.includes(error.value)) {
        errorMatched = true;
        return name + error.name;
      }
    }
    if (!errorMatched) {
      return "ERROR: " + name + " " + message + " PLEASE CONTANCT ADMINISTRATOR FOR ERROR RESOLUTION";
    }
  }
  public clearErrors() {
    this.errorMessage = [];
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }
  public getErrorMessage(name: string) {
    for (const mes of this.errorMessage) {
      if (mes.includes(name)) {
        return mes;
      }
    }
  }
  public removeAllFiles() {
    this.dataSource = new UploadDataSource(this.data);
  }

}

interface IError {
  name: string;
  value: string;
}
export class UploadDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  constructor(private data: any) {
    super();
  }
  public connect(): Observable<any[]> {
    return Observable.of(this.data);
  }
  // tslint:disable-next-line:no-empty
  public disconnect() { }
}
