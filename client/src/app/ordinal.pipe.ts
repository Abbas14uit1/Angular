import { Pipe, PipeTransform } from "@angular/core";
const ordinals: string[] = ["th", "st", "nd", "rd"];
@Pipe({ name: "ordinal" })
export class OrdinalPipe implements PipeTransform {
  public transform(n: number, keepNumber: boolean = true) {
    const v = n % 100;
    return (
      (keepNumber ? n : "") +
      (ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0])
    );
  }
}
