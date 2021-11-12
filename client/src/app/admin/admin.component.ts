import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HeaderConfig } from "../shared/header/header.component";
import { AdminService } from "./admin.service";
import { MatTabChangeEvent } from "@angular/material";
import { GoogleAnalyticsEventsService } from "../services/google-analytics-events-service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
  providers: [AdminService],
})
export class AdminComponent implements OnInit {
  public headerConfig = HeaderConfig;
  public superAdmin: boolean = false;
  constructor(private router: Router, public googleAnalyticsEventsService: GoogleAnalyticsEventsService) { }
  public ngOnInit() {
    this.superAdmin = JSON.parse(localStorage.getItem("superAdmin") || "false") as boolean;
    localStorage.setItem("headerTitle", "Sports Analytics Portal");
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.googleAnalyticsEventsService.emitEvent("Admin Panel", "tabClick", tabChangeEvent.tab.textLabel, tabChangeEvent.index);
  }
}
