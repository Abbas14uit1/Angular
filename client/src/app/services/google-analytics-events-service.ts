import {Injectable} from "@angular/core";
declare let ga: any;

@Injectable()
export class GoogleAnalyticsEventsService {

  	public emitEvent(eventCategory: string, eventAction: string, eventLabel: string, eventValue: number) {
        ga('send', 'event', {
	      eventCategory: eventCategory,
	      eventLabel: eventLabel,
	      eventAction: eventAction,
	      eventValue: eventValue
	    });
	}
}