import { Team } from "./Team";

export interface Season {
    seasonId: number,
    edition: number,
    champion: Team,
    subChampion: Team,
    championEast: Team,
    championWest: Team,
    semifinalEast: Team,
    semifinalWest: Team,
}