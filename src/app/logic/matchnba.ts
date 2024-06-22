import { SeasonTeam } from "../interfaces/SeasonTeam";

export function matchnba(){
    let score1, score2;
        do{
            score1 = Math.floor(Math.random() * (120-80 + 1))+80;
            score2 = Math.floor(Math.random() * (120-80 + 1))+80;
        } while (score1 === score2)
    return [score1, score2];        
}