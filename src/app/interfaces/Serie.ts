import { Match } from "./Match";

export interface Serie {
    serieId: number,
    seasonId: number,
    winsHome: number,
    winsVisitor: number,
    phase: number,
    matches?: Match[],
}