import { Component, NgModule } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { environment } from "./../environments/environment";
declare var ga: any;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public headerTitle = "Sports Analytics Portal";
  constructor(public router: Router) {
    this.appendGaTrackingCode();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        ga("set", "userId", localStorage.getItem("userName"));
        if (localStorage.getItem("userName")) {
          // tslint:disable-next-line:max-line-length
          const userType =
            localStorage.getItem("superAdmin") === "true"
              ? "SuperAdmin"
              : ga("set", "userId", localStorage.getItem("userName"));
          ga("set", "dimension1", localStorage.getItem("userName"));
          ga("set", "dimension4", userType);
          ga("set", "userId", localStorage.getItem("userName"));
        }
        if (localStorage.getItem("sportText")) {
          ga("set", "dimension2", localStorage.getItem("sportText"));
        }
        if (localStorage.getItem("teamText")) {
          ga("set", "dimension3", localStorage.getItem("teamText"));
        }
        ga("send", "pageview");
      }
    });
  }

  public getRouterOutlet() {
    // tslint:disable-next-line:max-line-length
    return (
      window.location.href.indexOf("query") > 0 ||
      window.location.href.indexOf("admin") > 0 ||
      window.location.href.indexOf("alerts") > 0 ||
      window.location.href.indexOf("analytics") > 0
    );
  }

  private appendGaTrackingCode() {
    try {
      const script = document.createElement("script");
      script.innerHTML =
        `
        (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,"script","https://www.google-analytics.com/analytics.js","ga");
        ga("create", "` +
        environment.googleAnalyticsKey +
        `", "auto");
      `;
      document.head.appendChild(script);
    } catch (ex) {
      console.error("Error appending google analytics");
      console.error(ex);
    }
  }
}
