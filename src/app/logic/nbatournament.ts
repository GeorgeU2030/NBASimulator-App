import { SeasonTeam } from "../interfaces/SeasonTeam";

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export async function nbaTournament(eastTeams: SeasonTeam[], westTeams: SeasonTeam[]){
    let atlantic = eastTeams.filter(team => team.division === 'Atlantic');
    let central = eastTeams.filter(team => team.division === 'Central');
    let southeast = eastTeams.filter(team => team.division === 'Southeast');
    let northwest = westTeams.filter(team => team.division === 'Northwest');
    let southwest = westTeams.filter(team => team.division === 'Southwest');
    let pacific = westTeams.filter(team => team.division === 'Pacific');

    // same Division

    samedivision(atlantic);
    samedivision(central);
    samedivision(southeast);
    samedivision(northwest);
    samedivision(southwest);
    samedivision(pacific);

    // same conference

    let joinTeams: SeasonTeam[] = [];
    joinTeams = joinTeams.concat(central, southeast);
    sameconference(atlantic, joinTeams);
    sameconference(central, southeast);

    joinTeams = [];
    joinTeams = joinTeams.concat(southwest, pacific);
    sameconference(northwest, joinTeams);
    sameconference(southwest, pacific);

    // different conference
    joinTeams = [];
    joinTeams = joinTeams.concat(atlantic, central, southeast);
    let joinTeamsWest : SeasonTeam[] = [];
    joinTeamsWest = joinTeamsWest.concat(northwest, southwest, pacific);
    differentconference(joinTeams, joinTeamsWest);

    // any team

    joinTeams = [];
    joinTeams = joinTeams.concat(atlantic, central, southeast, northwest, southwest, pacific);
    shuffleArray(joinTeams);
    anyteam(joinTeams);

    return joinTeams;
}

function samedivision(teams: SeasonTeam[]){
    for(let i=0 ; i < 5; i++){
        for(let i = 0; i < teams.length; i++){
            for(let j = i+1; j < teams.length; j++){
                let score1, score2;

                do{
                    score1 = Math.floor(Math.random() * (120-80 + 1))+80;
                    score2 = Math.floor(Math.random() * (120-80 + 1))+80;
                } while (score1 === score2)

                if (score1 > score2) {
                    teams[i].wins += 1;
                    teams[j].losses += 1;
                } else {
                    teams[j].wins += 1;
                    teams[i].losses += 1;
                }
                teams[i].percentage = teams[i].wins / (teams[i].wins + teams[i].losses);
                teams[j].percentage = teams[j].wins / (teams[j].wins + teams[j].losses);
            }
        }
    }
}

function sameconference(teams: SeasonTeam[], restTeams: SeasonTeam[]){
    for(let i=0 ; i < 3; i++){
        for(let i = 0; i < teams.length; i++){
            for(let j = 0; j < restTeams.length; j++){
                let score1, score2;

                do{
                    score1 = Math.floor(Math.random() * (120-80 + 1))+80;
                    score2 = Math.floor(Math.random() * (120-80 + 1))+80;
                } while (score1 === score2)

                if (score1 > score2) {
                    teams[i].wins += 1;
                    restTeams[j].losses += 1;
                } else {
                    restTeams[j].wins += 1;
                    teams[i].losses += 1;
                }
                teams[i].percentage = teams[i].wins / (teams[i].wins + teams[i].losses);
                restTeams[j].percentage = restTeams[j].wins / (restTeams[j].wins + restTeams[j].losses);
            }
        }
    }
}

function differentconference(teams: SeasonTeam[], restTeams: SeasonTeam[]){
    for(let i=0 ; i < 2; i++){
        for(let i = 0; i < teams.length; i++){
            for(let j = 0; j < restTeams.length; j++){
                let score1, score2;

                do{
                    score1 = Math.floor(Math.random() * (120-80 + 1))+80;
                    score2 = Math.floor(Math.random() * (120-80 + 1))+80;
                } while (score1 === score2)

                if (score1 > score2) {
                    teams[i].wins += 1;
                    restTeams[j].losses += 1;
                } else {
                    restTeams[j].wins += 1;
                    teams[i].losses += 1;
                }
                teams[i].percentage = teams[i].wins / (teams[i].wins + teams[i].losses);
                restTeams[j].percentage = restTeams[j].wins / (restTeams[j].wins + restTeams[j].losses);
            }
        }
    }
}

function anyteam(teams: SeasonTeam[]){
    for(let i=0 ; i < 2; i++){
        for(let i = 0; i < teams.length; i+=2){
                let score1, score2;

                do{
                    score1 = Math.floor(Math.random() * (120-80 + 1))+80;
                    score2 = Math.floor(Math.random() * (120-80 + 1))+80;
                } while (score1 === score2)

                if (score1 > score2) {
                    teams[i].wins += 1;
                    teams[i+1].losses += 1;
                } else {
                    teams[i+1].wins += 1;
                    teams[i].losses += 1;
                }
                teams[i].percentage = teams[i].wins / (teams[i].wins + teams[i].losses);
                teams[i+1].percentage = teams[i+1].wins / (teams[i+1].wins + teams[i+1].losses);
        }
    }
}