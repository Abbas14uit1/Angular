import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

@Pipe({ name: "utcdate" })
export class UtcdatePipe implements PipeTransform {
  public transform(gameDate: Date, format: string = "LL") {
    return (
      moment.utc(gameDate).format(format));
  }
}
