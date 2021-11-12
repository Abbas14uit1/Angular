import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { IAdminUserDetails } from "../../../../../typings/user/user.d";
import {Router} from '@angular/router';

@Injectable()
export class AuthService {
  public getToken(): string {
    const emptyUserAuth: string = "{\"username\":\"\",\"admin\":false,\"token\":\"\"}";
    const userAuth: IAdminUserDetails = JSON.parse(localStorage.getItem("user") || emptyUserAuth);
    return userAuth.token;
  }
  public isAuthenticated(): boolean {
    // get the token
    const token = this.getToken();
    // TODO: Check for expiry. Also redirect to login upon expiry
    if (token) {
      return true;
    }
    return false;
  }
}

@Injectable()
export class AuthRequest implements HttpInterceptor {
  constructor(public auth: AuthService, private router: Router) { }
  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        Authorization: `JWT ${this.auth.getToken()}`,
      },
    });
    
    return next.handle(request).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        console.log("err>>>"+err);
        if (err.status === 401) {
          this.router.navigate(["/admin/login"]);
        }
      }
    });
  }
}