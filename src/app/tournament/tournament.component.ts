import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeasonService } from '../services/season.service';
import { SeasonTeam } from '../interfaces/SeasonTeam';
import { Season } from '../interfaces/Season';
import { nbaTournament } from '../logic/nbatournament';

import { CommonModule } from '@angular/common';
import { SeasonteamService } from '../services/seasonteam.service';
import { Team } from '../interfaces/Team';
import { TeamService } from '../services/team.service';
import { matchnba } from '../logic/matchnba';
import { MatchService } from '../services/match.service';
import { Serie } from '../interfaces/Serie';
import { Match } from '../interfaces/Match';
import { SerieService } from '../services/serie.service';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent implements OnInit {

  listTeams : SeasonTeam[] = [];
  eastTeams : SeasonTeam[] = [];
  westTeams : SeasonTeam[] = [];
  playInMatchesEast : Serie[] = [];
  playInMatchesWest : Serie[] = [];
  FirstRoundMatches : Serie[] = [];
  SecondRoundMatches : Serie[] = [];
  FinalConferencesEast : Serie[] = [];
  FinalConferencesWest : Serie[] = [];
  FinalsNBA : Serie[] = [];
  season!: Season;
  seasonId!: number ;
  isOnPlayOffs = false;
  isOnPlayIn = false;
  isOnFinals = false;
  isFinished = false;

  constructor(
    private route: ActivatedRoute,
    private seasonService: SeasonService,
    private seasonTeamService: SeasonteamService,
    private teamService: TeamService,
    private matchService: MatchService,
    private serieService: SerieService,
    private cdr: ChangeDetectorRef
  ) {}


  loadTeams(){
    this.seasonService.getSeasonById(this.seasonId).subscribe(data => {
      this.listTeams = data.teams ? data.teams.sort((a, b) => {
        const percentageDiff = b.percentage - a.percentage;
        if(percentageDiff !== 0){
          return percentageDiff;
        }
        return a.seasonTeamId - b.seasonTeamId;
      }) : [];
      this.season = data;
      this.eastTeams = this.listTeams.filter(team => team.conference === 'Eastern');
      this.westTeams = this.listTeams.filter(team => team.conference === 'Western');
      this.verifyPlayIn();
      this.verifyPlayOffs();
      this.verifyFinals();
      this.loadMatches();
      if(this.season.champion){
        this.isFinished = true;
      }
    })
  }

  loadMatches(){
    if(this.season.series){
      const sortedMatches = this.season.series.sort((a, b) => a.serieId - b.serieId);
      this.playInMatchesEast = sortedMatches.slice(0, 3);
      this.playInMatchesWest = sortedMatches.slice(3, 6);
      this.FirstRoundMatches = sortedMatches.filter(serie => serie.phase === 1);
      this.SecondRoundMatches = sortedMatches.filter(serie => serie.phase === 2);
      this.FinalConferencesEast = sortedMatches.filter(serie => serie.phase === 3);
      this.FinalConferencesWest = sortedMatches.filter(serie => serie.phase === 4);
      this.FinalsNBA = sortedMatches.filter(serie => serie.phase === 5);
    }
  }

  verifyPlayIn(){
    if(this.listTeams[0].percentage > 0 && this.season.series?.length === 0){
      this.isOnPlayIn = true;
    }
  }

  verifyPlayOffs(){
    if(this.season.series){
      if(this.season.series.length > 0 && this.season.series.length < 7){
        this.isOnPlayOffs = true;
      }
    }
  }

  verifyFinals(){
    if(this.season.series){
      if(this.season.series.length > 6 ){
        this.isOnFinals = true;
      }
    }
  }

  chargeChampionDivision(){
    const processedDivisions = new Set(); 
    this.listTeams.forEach(team => {
      if (!processedDivisions.has(team.division)) {
        this.teamService.getTeamByName(team.name).subscribe(data => {
          this.teamService.updateDivision(data.teamId).subscribe();
          processedDivisions.add(team.division);
        })
      }
    })
  }

  async start(){
    this.listTeams = await nbaTournament(this.eastTeams, this.westTeams);

    this.listTeams.forEach(team => {
      this.seasonTeamService.updateTeam(team.seasonTeamId, team).subscribe()
    });

    this.chargeChampionDivision();

    this.verifyPlayIn();
  }

  async PlayOffTeams(topEastTeams: SeasonTeam[]){
     
    let matches = this.season.series?.flatMap(serie => serie.matches ?? []) 
      .filter((match): match is Match => match !== undefined) 
      .sort((a, b) => a.matchId - b.matchId);

    let smatches;

    if(topEastTeams[0].conference == 'Eastern'){
      smatches = matches ? [matches[0], matches[2]] : [];
    } else {
      smatches = matches ? [matches[3], matches[5]] : [];
    }

    let winningPlayIn = smatches?.map(match => {
      return match.homeScore > match.visitorScore ? match.homeTeam?.name : match.visitorTeam?.name;
    })

    let eastWinningTeams;

    if(topEastTeams[0].conference == 'Eastern'){
      eastWinningTeams = this.eastTeams.filter(team => winningPlayIn?.includes(team.name))
                                       .sort((a, b) => winningPlayIn.indexOf(a.name) - winningPlayIn.indexOf(b.name));
      topEastTeams.push(...eastWinningTeams);
    }else {
      eastWinningTeams = this.westTeams.filter(team => winningPlayIn?.includes(team.name))
                                       .sort((a, b) => winningPlayIn.indexOf(a.name) - winningPlayIn.indexOf(b.name));
      topEastTeams.push(...eastWinningTeams);
    }
   
    let nextPhase : SeasonTeam[] = [];
    const matchups = [[0,7], [3,4], [1,6], [2,5]];

    for(let matchup of matchups){
      let i = matchup[0];
      let j = matchup[1];
      let winsTeam1 = 0;
      let winsTeam2 = 0;

      let teamhome = topEastTeams[i];
      let teamvisitor = topEastTeams[j];

      let team1,team2; 
      if(teamhome && teamvisitor){
        team1 = await this.getTeamByNameAsync(this.teamService, teamhome.name);
        team2 = await this.getTeamByNameAsync(this.teamService, teamvisitor.name);
      }

      const newserie = {
        serieId: 0,
        seasonId: this.seasonId,
        winsHome: 0,
        winsVisitor: 0,
        phase: 1
      }
  
      let serie = await this.createSerieAsync(this.serieService, newserie)

      let numgame = 1; 
      while ( winsTeam1 < 4 && winsTeam2 < 4){
        let scores = matchnba();
        let score1 = scores[0];
        let score2 = scores[1];

        let homegame, awaygame;
        if(numgame == 1 || numgame == 2 || numgame == 5 || numgame == 7){
          homegame = team1;
          awaygame = team2;
          if(score1 > score2){
            winsTeam1++;
          }else{
            winsTeam2++;
          }
        }else {
          homegame = team2;
          awaygame = team1;
          if(score2 > score1){
            winsTeam1++;
          }else{
            winsTeam2++;
          }
        }

        let match = {
          matchId: 0,
          serieId: serie.serieId,
          homeTeamId: homegame?.teamId ?? -1,
          visitorTeamId: awaygame?.teamId ?? -1,
          homeScore: score1,
          visitorScore: score2,
        };
      
        await this.createMatchAsync(this.matchService, match);

        if(winsTeam1 === 4){
          nextPhase.push(teamhome);
        } else if(winsTeam2 === 4){
          nextPhase.push(teamvisitor);
        }

        numgame++;

      }

      this.serieService.updateWins(serie.serieId, winsTeam1, winsTeam2).subscribe();
    }

    let finalConference = [];

    for(let i = 0; i < 4 ; i+=2){
      let j = i+1;
      let winsTeam1 = 0;
      let winsTeam2 = 0;

      let up = nextPhase[i];
      let down = nextPhase[j];

      let teamhome,teamvisitor;

      if(up && down && up.percentage > down.percentage){
        teamhome = up;
        teamvisitor = down;
      }else {
        teamhome = down;
        teamvisitor = up;
      }
      
      let team1 = await this.getTeamByNameAsync(this.teamService, teamhome.name);
      let team2 = await this.getTeamByNameAsync(this.teamService, teamvisitor.name);

      const newserie = {
        serieId: 0,
        seasonId: this.seasonId,
        winsHome: 0,
        winsVisitor: 0,
        phase: 2
      }

      let serie = await this.createSerieAsync(this.serieService, newserie)

      let numgame = 1;
      while ( winsTeam1 < 4 && winsTeam2 < 4){
        let scores = matchnba();
        let score1 = scores[0];
        let score2 = scores[1];

        let homegame, awaygame;
        if(numgame == 1 || numgame == 2 || numgame == 5 || numgame == 7){
          homegame = team1;
          awaygame = team2;
          if(score1 > score2){
            winsTeam1++;
          }else{
            winsTeam2++;
          }
        }else {
          homegame = team2;
          awaygame = team1;
          if(score2 > score1){
            winsTeam1++;
          }else {
            winsTeam2++;
          }
        }

        let match = {
          matchId: 0,
          serieId: serie.serieId,
          homeTeamId: homegame.teamId,
          visitorTeamId: awaygame.teamId,
          homeScore: score1,
          visitorScore: score2,
        };
      
        await this.createMatchAsync(this.matchService, match);

        if(winsTeam1 === 4){
          finalConference.push(teamhome);
        } else if(winsTeam2 === 4){
          finalConference.push(teamvisitor);
        }

        numgame++;
      }

      this.serieService.updateWins(serie.serieId, winsTeam1, winsTeam2).subscribe();
    }

    
      let phaseconference = 0 ;
      if(finalConference[0].conference === 'Eastern'){
        phaseconference = 3;
      }else if(finalConference[0].conference === 'Western'){
        phaseconference = 4;
      }
      let winsTeam1 = 0;
      let winsTeam2 = 0;

      let up = finalConference[0];
      let down = finalConference[1];

      let teamhome,teamvisitor;

      if(up.percentage > down.percentage){
        teamhome = up;
        teamvisitor = down;
      }else {
        teamhome = down;
        teamvisitor = up;
      }
      
      let team1 = await this.getTeamByNameAsync(this.teamService, teamhome.name);
      let team2 = await this.getTeamByNameAsync(this.teamService, teamvisitor.name);

      const newserie = {
        serieId: 0,
        seasonId: this.seasonId,
        winsHome: 0,
        winsVisitor: 0,
        phase: phaseconference
      }
      let serie = await this.createSerieAsync(this.serieService, newserie)

      let numgame = 1;
      while ( winsTeam1 < 4 && winsTeam2 < 4){
        let scores = matchnba();
        let score1 = scores[0];
        let score2 = scores[1];

        let homegame, awaygame;
        if(numgame == 1 || numgame == 2 || numgame == 5 || numgame == 7){
          homegame = team1;
          awaygame = team2;
          if(score1 > score2){
            winsTeam1++;
          }else{
            winsTeam2++;
          }
        }else {
          homegame = team2;
          awaygame = team1;
          if(score2 > score1){
            winsTeam1++;
          }else {
            winsTeam2++;
          }
        }

        let match = {
          matchId: 0,
          serieId: serie.serieId,
          homeTeamId: homegame.teamId,
          visitorTeamId: awaygame.teamId,
          homeScore: score1,
          visitorScore: score2,
        };
      
        await this.createMatchAsync(this.matchService, match);

        let conference = teamhome.conference;
        if(conference === 'Eastern'){
          if(winsTeam1 == 4) {
            this.seasonService.addChampionEast(
              this.seasonId,
              team1.teamId,
              team2.teamId
            ).subscribe();

            this.teamService.updateConference(team1.teamId).subscribe();
          }else if(winsTeam2 == 4){
            this.seasonService.addChampionEast(
              this.seasonId,
              team2.teamId,
              team1.teamId
            ).subscribe();

            this.teamService.updateConference(team2.teamId).subscribe();
          }
        } else if (conference === 'Western'){
          if(winsTeam1 == 4) {
            this.seasonService.addChampionWest(
              this.seasonId,
              team1.teamId,
              team2.teamId 
            ).subscribe();

            this.teamService.updateConference(team1.teamId).subscribe();
          }else if(winsTeam2 == 4){
            this.seasonService.addChampionWest(
              this.seasonId,
              team2.teamId,
              team1.teamId
            ).subscribe();

            this.teamService.updateConference(team2.teamId).subscribe();
          }
        }

        numgame++;
      }

      this.serieService.updateWins(serie.serieId, winsTeam1, winsTeam2).subscribe();

      // Finish Conferences
  }

  async getTeamByNameAsync(teamService: TeamService, name: string): Promise<Team> {
    return new Promise((resolve, reject) => {
      teamService.getTeamByName(name).subscribe({
        next: resolve,
        error: reject
      });
    });
  }
  
  async createMatchAsync(matchService: MatchService, match: Match): Promise<Match> {
    return new Promise((resolve, reject) => {
      matchService.newMatch(match).subscribe({
        next: resolve,
        error: reject
      });
    });
  }

  async createSerieAsync(serieService: SerieService, serie: Serie): Promise<Serie> {
    return new Promise((resolve, reject) => {
      serieService.addSerie(serie).subscribe({
        next: resolve,
        error: reject
      });
    });
  }
  
  async playIn(teams: SeasonTeam[]): Promise<void> {
    let loser: SeasonTeam, winner: SeasonTeam;
  
    let scores = matchnba();
    let score1 = scores[0];
    let score2 = scores[1];
  
    if (score1 > score2) {
      loser = teams[1];
    } else {
      loser = teams[0];
    }
  
    let team7 = await this.getTeamByNameAsync(this.teamService, teams[0].name);
    let team8 = await this.getTeamByNameAsync(this.teamService, teams[1].name);

    const newserie = {
      serieId: 0,
      seasonId: this.seasonId,
      winsHome: 0,
      winsVisitor: 0,
      phase: 0
    }

    let serie = await this.createSerieAsync(this.serieService, newserie)

    let match = {
      matchId: 0,
      serieId: serie.serieId,
      homeTeamId: team7.teamId,
      visitorTeamId: team8.teamId,
      homeScore: score1,
      visitorScore: score2
    };
  
    await this.createMatchAsync(this.matchService, match);
  
    scores = matchnba();
    score1 = scores[0];
    score2 = scores[1];
  
    if (score1 > score2) {
      winner = teams[2];
    } else {
      winner = teams[3];
    }
  
    let team9 = await this.getTeamByNameAsync(this.teamService, teams[2].name);
    let team10 = await this.getTeamByNameAsync(this.teamService, teams[3].name);

    serie = await this.createSerieAsync(this.serieService, newserie)

    match = {
      matchId: 0,
      serieId: serie.serieId,
      homeTeamId: team9.teamId,
      visitorTeamId: team10.teamId,
      homeScore: score1,
      visitorScore: score2
    };
  
    await this.createMatchAsync(this.matchService, match);
  
    scores = matchnba();
    score1 = scores[0];
    score2 = scores[1];
  
    team9 = await this.getTeamByNameAsync(this.teamService, loser.name);
    team10 = await this.getTeamByNameAsync(this.teamService, winner.name);

    serie = await this.createSerieAsync(this.serieService, newserie)

    match = {
      matchId: 0,
      homeTeamId: team9.teamId,
      serieId: serie.serieId,
      visitorTeamId: team10.teamId,
      homeScore: score1,
      visitorScore: score2
    };
  
    await this.createMatchAsync(this.matchService, match);
  
  }
  
  async generateMatches(eastTeams: SeasonTeam[], westTeams: SeasonTeam[]){
    await this.playIn(eastTeams);
    await this.playIn(westTeams);
    this.loadTeams();
  }

  async generatePlayOffs(topEastTeams: SeasonTeam[], topWestTeams: SeasonTeam[]){
    try {
      await this.PlayOffTeams(topEastTeams);
      console.log('PlayOffs for East Teams finished');
    } catch (error) {
      console.error('Error generating playoffs for East Teams:', error);
    }
  
    try {
      await this.PlayOffTeams(topWestTeams);
      console.log('PlayOffs for West Teams finished');
    } catch (error) {
      console.error('Error generating playoffs for West Teams:', error);
    }
    this.loadTeams();

  }

  startPlayIn(){

    const playInEast = this.eastTeams.slice(6, 10);
    const playInWest = this.westTeams.slice(6, 10);

    this.generateMatches(playInEast, playInWest);

    this.isOnPlayIn = false;
    this.isOnPlayOffs = true;

    this.cdr.detectChanges();

  }

  startPlayOffs(){
    
    const topEastTeams = this.eastTeams.slice(0, 6);
    const topWestTeams = this.westTeams.slice(0, 6);

    this.generatePlayOffs(topEastTeams, topWestTeams);

    this.isOnFinals = true;

    this.cdr.detectChanges();

  }

  async finals (){
    await this.startFinals();
    this.loadTeams();
  }

  startNBAfinals(){
    this.finals();
    this.isFinished = true;
    this.cdr.detectChanges();
  }

  async startFinals(){
    let championEast = this.season.championEast
    let championWest = this.season.championWest

      let up = this.eastTeams.find(team => team.name === championEast?.name);
      let down = this.westTeams.find(team => team.name === championWest?.name);

      let winsTeam1 = 0;
      let winsTeam2 = 0;

      let teamhome,teamvisitor;

      if(up && down && up.percentage > down.percentage){
        teamhome = up;
        teamvisitor = down;
      }else {
        teamhome = down;
        teamvisitor = up;
      }
      
      let team1, team2;
      if(teamhome && teamvisitor){
        team1 = await this.getTeamByNameAsync(this.teamService, teamhome.name);
        team2 = await this.getTeamByNameAsync(this.teamService, teamvisitor.name);
      }

      const newserie = {
        serieId: 0,
        seasonId: this.seasonId,
        winsHome: 0,
        winsVisitor: 0,
        phase: 5
      }
      let serie = await this.createSerieAsync(this.serieService, newserie)

      let numgame = 1;
      while ( winsTeam1 < 4 && winsTeam2 < 4){
        let scores = matchnba();
        let score1 = scores[0];
        let score2 = scores[1];

        let homegame, awaygame;
        if(numgame == 1 || numgame == 2 || numgame == 5 || numgame == 7){
          homegame = team1;
          awaygame = team2;
          if(score1 > score2){
            winsTeam1++;
          }else{
            winsTeam2++;
          }
        }else {
          homegame = team2;
          awaygame = team1;
          if(score2 > score1){
            winsTeam1++;
          }else {
            winsTeam2++;
          }
        }

        let match = {
          matchId: 0,
          serieId: serie.serieId,
          homeTeamId: homegame?.teamId ?? -1,
          visitorTeamId: awaygame?.teamId ?? -1,
          homeScore: score1,
          visitorScore: score2,
        };
      
        await this.createMatchAsync(this.matchService, match);

        if(winsTeam1 === 4){
          if(team1 && team2){
            this.teamService.updateChampion(team1.teamId).subscribe();
            this.seasonService.addChampion(this.seasonId, team1.teamId, team2.teamId).subscribe();
          }
        }else if(winsTeam2 === 4){
          if(team1 && team2){
            this.teamService.updateChampion(team2.teamId).subscribe();
            this.seasonService.addChampion(this.seasonId, team2.teamId, team1.teamId).subscribe();
          }
        }

        numgame++;
      }
      this.serieService.updateWins(serie.serieId, winsTeam1, winsTeam2).subscribe();
  }

  ngOnInit() {
    this.seasonId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadTeams();
  }

}
