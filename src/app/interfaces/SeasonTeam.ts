import { Season } from "./Season"

export interface SeasonTeam {
    seasonId: number,
    season: Season,
    seasonTeamId: number,
    name: string,
    logo: string,
    wins: number,
    losses: number,
    percentage: number,
    conference: string,
    division: string
}