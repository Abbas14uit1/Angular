import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: "roundto" })
export class RoundToPipe implements PipeTransform {
  public transform(val: any) {
    try {
      if (val && !isNaN(val)) {
        return +val.toFixed(2);
      }
      return val;
    } catch (ex) {
      return val;
    }
  }
}
