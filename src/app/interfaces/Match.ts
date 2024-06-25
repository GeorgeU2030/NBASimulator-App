import { Serie } from "./Serie";
import { Team } from "./Team";

export interface Match {
    matchId: number,
    serieId: number,
    serie?: Serie,
    homeTeamId: number,
    homeTeam?: Team,
    visitorTeamId: number,
    visitorTeam?: Team,
    homeScore: number,
    visitorScore: number,
}