import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { Router } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  public canActivate() {
    if (localStorage.getItem("user")) {
      return true;
    }

    this.router.navigate(["/admin/login"]);
    return false;
  }
}
