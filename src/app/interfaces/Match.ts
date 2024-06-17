import { Season } from "./Season";
import { Team } from "./Team";

export interface Match {
    matchId: number,
    season: Season,
    homeTeam: Team,
    visitorTeam: Team,
    homeScore: number,
    visitorScore: number,
}