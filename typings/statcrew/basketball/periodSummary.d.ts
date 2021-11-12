import { ISpecial, ISummary } from "./team.d";


export interface IPeriodSummaries {
	byprdsummary: IPeriodSummary[];
}

export interface IPeriodSummary {
  $: {
    prd: number;
  };
  summary: ISummary[];
  special: ISpecial[];
}