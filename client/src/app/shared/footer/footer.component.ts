import { Component, Input, OnInit } from "@angular/core";
import { MatToolbar } from "@angular/material";
import { Router } from "@angular/router";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent implements OnInit {
  constructor(private router: Router) {
  //
   }
  public ngOnInit() {
  //
  }
}
