import { Team } from "./Team";

export interface TeamEdition {
    team: Team,
    championshipEditions?: number[]
}