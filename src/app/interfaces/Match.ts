import { Season } from "./Season";
import { Team } from "./Team";

export interface Match {
    matchId: number,
    seasonId: number,
    season?: Season,
    homeTeamId: number,
    homeTeam?: Team,
    visitorTeamId: number,
    visitorTeam?: Team,
    homeScore: number,
    visitorScore: number,
}