import * as mongo from "mongodb";

import { AthlyteImporter } from "../AthlyteImporter";

// definitions
import { IGame } from "../../../../../../typings/athlyte/basketball/game.d";
import { IPlay } from "../../../../../../typings/athlyte/basketball/play.d";
import { IPlayer, IPlayerDynamicData, IPlayerStaticData } from "../../../../../../typings/athlyte/basketball/player.d";
import { ITeam, ITeamDynamicData, ITeamStaticData } from "../../../../../../typings/athlyte/basketball/team.d";

/**
 * BaseImportClass serves as template for the various other classes (game, play, player, team) to implement
 * to ensure that child classes have all the required methods for registering and updating dependents.
 * By having the various subclasses all implement the same base class,
 * we can use [dynamic dispatch](https://en.wikipedia.org/wiki/Dynamic_dispatch) when registering
 * and updating dependents.
 * The class is abstract to prevent direct instantiation, although some non-abstract member methods exist that
 * are available for children to call.
 */
export abstract class BasketballStatcrewImportBase extends AthlyteImporter {
  /**
   * Information parsed from Statcrew; is populated when `this.parse()` is called.
   */
  public abstract parsedData: IGame | IPlay | IPlayer | ITeam;

  /**
   * Dependents are instances of (subclasses of) BaseImportClass.
   * A dependent is an instance of Play/ Player/ Team/ Game which relies on knowing the ID
   * of another instance of Play/ Player/ Team/ Game before it is saved to the database.
   */
  public abstract dependents: BasketballStatcrewImportBase[];

  constructor() {
    super();
    //this.dependents = [];
  }

  /**
   * Generate (or get) a unique ID for the class; will be used as the unique Mongo ID
   * when saved. First checks the DB to see if the record exists and uses that ID if found;
   * otherwise, generates a new ID. Returns the ID.
   * @param db Mongo DB
   */
  public abstract async generateId(db: mongo.Db, sportCode: "MBB" | "WBB"): Promise<string>;

  /**
   * Populate `this.parsedData` by parsing 1+ objects from Statcrew.
   * @param args Information necessary for a subclass of BaseImportClass to fully populate its own parsedData field
   */
  public abstract parse(...args: any[]): void;

  /**
   * Set the ID; useful both for testing (manually setting an ID) and when running the app.
   * When running the app, the ID should come from `this.generateID()` to ensure that the ID
   * does not conflict with one in Mongo.
   * @param id ID to set for this class
   */
  public populateId(id: string): void {
    this.parsedData._id = id;
  }

  /**
   * Get the ID; will throw an error if the ID has not yet been set.
   * This prevents accidentally saving to Mongo without setting an ID.
   */
  public getId(): string {
    const id = this.parsedData._id;
    if (!id) {
      throw new Error("Trying to access ID before it has been set");
    } else {
      return id;
    }
  }

  /**
   * Prepare to save dynamic data to Mongo.
   * Dynamic data is data which is game specific, such as a player's or team's performance.
   * For games and plays, all data is considered game specific and therefore all data is dynamic.
   */
  public abstract prepareDynamicData(): IGame | IPlay | IPlayerDynamicData | ITeamDynamicData;

  /**
   * Prepare to save static data to Mongo.
   * Static data is data which is constant between games, such as a player's or a team's name.
   * For games and plays, no data is considered static and therefore this method will return void.
   */
  public abstract prepareStaticData(): void | IPlayerStaticData | ITeamStaticData;

  /**
   * Go through the list of dependents in `this.dependents`
   * and call the appropriate `update<Team|Play|Player|Game>Ref()` method.
   * This method is unique to each subclass; for example, a team should not be a dependent of a play
   * and a play should not call `team.updatePlayRef()` (and no such method exists).
   *
   * Each subclass of BaseImportClass which implements this method will call a method named after itself
   * when iterating through `this.dependents`. For example, when `this.updateDependents()` is called in `TeamClass`,
   * the function will call `updateTeamRef()` for every class found in its list of dependents.
   *
   * Some use of `instanceof` is necessary when implementing `this.updateDependents()`
   * since various dependents have different signatures for the same method. Going back to the `TeamClass` example,
   * the `updateTeamRef()` of `GameClass` has a different signature than the `updateTeamRef()` of `PlayerClass`.
   */
  public abstract updateDependents(): void;

  /**
   * Add a list of dependents to this classes dependents;
   * dependents are other classes which need to know the ID of this class
   * @param deps List of dependents of this class
   */
  public registerDependents(deps: BasketballStatcrewImportBase[]) {
    this.dependents = this.dependents.concat(deps);
  }

  /**
   * After parsing all information and populating IDs, `this.save()` is called to save relevant information
   * to Mongo. Not all information is saved;
   * sometimes only dynamic data is saved in cases when a player/ team already exists in Mongo.
   * @param db Mongo DB
   */
  public abstract save(db: mongo.Db): Promise<string>;
}
