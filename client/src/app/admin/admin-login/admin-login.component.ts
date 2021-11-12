import { Component, OnInit } from "@angular/core";
import { FormControl, Validators} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthRequest } from "../../shared/auth-request/auth-request.module";
import { HeaderConfig } from "../../shared/header/header.component";
import { AdminService } from "../admin.service";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.css"],
  providers: [AdminService],
})
export class AdminLoginComponent implements OnInit {
  public user: { username: string | undefined, password: string | undefined } = {
    username: undefined,
    password: undefined,
  };
  public errorMsg: string;
  public headerConfig = HeaderConfig;

  constructor(
    private router: Router,
    private loginService: AdminService,
  ) { }

  public ngOnInit() {
    // reset login status
    localStorage.setItem("headerTitle", "Sports Analytics Portal");
    this.loginService.logoutUser();
  }

  public login() {
    if (!this.user.username && !this.user.password) {
      this.errorMsg = "Username & Password is required";
    }
    else if (!this.user.username) {
      this.errorMsg = "Username is required";
    }
    else if (!this.user.password) {
      this.errorMsg = "Password is required";
    }
    else if (this.user.username && this.user.password) {
      this.loginService.loginUser(this.user.username, this.user.password)
        .subscribe((data) => {
          /*if (data.admin || data.superAdmin ) {
            this.router.navigate(["admin"]);
          } else {*/
            // if(data.confName === ())
            this.router.navigate(["home"]);
          /*}*/
        }, (err) => {
          this.errorMsg = "Failed to login";
        });
    }
  }
}
