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
import { Match } from '../interfaces/Match';

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
  playInMatchesEast : Match[] = [];
  playInMatchesWest : Match[] = [];
  FirstRoundMatches : Match[] = [];
  SecondRoundMatches : Match[] = [];
  FinalConferencesEast : Match[] = [];
  FinalConferencesWest : Match[] = [];
  FinalsNBA : Match[] = [];
  season!: Season;
  seasonId!: number ;
  isOnPlayOffs = false;
  isOnPlayIn = false;
  isOnFinals = false;

  constructor(
    private route: ActivatedRoute,
    private seasonService: SeasonService,
    private seasonTeamService: SeasonteamService,
    private teamService: TeamService,
    private matchService: MatchService,
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
    })
  }

  loadMatches(){
    if(this.season.matches){
      const sortedMatches = this.season.matches.sort((a, b) => a.matchId - b.matchId);
      this.playInMatchesEast = sortedMatches.slice(0, 3);
      this.playInMatchesWest = sortedMatches.slice(3, 6);
      this.FirstRoundMatches = sortedMatches.filter(match => match.phase === 1);
      this.SecondRoundMatches = sortedMatches.filter(match => match.phase === 2);
      this.FinalConferencesEast = sortedMatches.filter(match => match.phase === 3);
      this.FinalConferencesWest = sortedMatches.filter(match => match.phase === 4);
      this.FinalsNBA = sortedMatches.filter(match => match.phase === 5);
    }
  }

  verifyPlayIn(){
    if(this.listTeams[0].percentage > 0 && this.season.matches?.length === 0){
      this.isOnPlayIn = true;
    }
  }

  verifyPlayOffs(){
    if(this.season.matches){
      if(this.season.matches.length > 0 && this.season.matches.length < 7){
        this.isOnPlayOffs = true;
      }
    }
  }

  verifyFinals(){
    if(this.season.matches){
      if(this.season.matches.length > 6 ){
        this.isOnFinals = true;
      }
    }
  }

  async start(){
    this.listTeams = await nbaTournament(this.eastTeams, this.westTeams);

    this.listTeams.forEach(team => {
      this.seasonTeamService.updateTeam(team.seasonTeamId, team).subscribe()
    });

    this.verifyPlayIn();
  }

  async PlayOffTeams(topEastTeams: SeasonTeam[]){
    
    let matches = this.season.matches?.sort((a, b) => a.matchId - b.matchId);
    let smatches = matches ? [matches[0], matches[2]] : [];

    let winningPlayIn = smatches?.map(match => {
      return match.homeScore > match.visitorScore ? match.homeTeam?.name : match.visitorTeam?.name;
    })

    let eastWinningTeams;
    if(topEastTeams[0].conference == 'Eastern'){
      eastWinningTeams = this.eastTeams.filter(team => winningPlayIn?.includes(team.name));
      topEastTeams.push(...eastWinningTeams);
    }else {
      eastWinningTeams = this.westTeams.filter(team => winningPlayIn?.includes(team.name));
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


      while ( winsTeam1 < 4 && winsTeam2 < 4){
        let scores = matchnba();
        let score1 = scores[0];
        let score2 = scores[1];

        let match = {
          matchId: 0,
          seasonId: this.seasonId,
          homeTeamId: team1?.teamId ?? -1,
          visitorTeamId: team2?.teamId ?? -1,
          homeScore: score1,
          visitorScore: score2,
          phase: 1
        };
      
        await this.createMatchAsync(this.matchService, match);
        

        if(score1 > score2){
          winsTeam1++;
        } else {
          winsTeam2++;
        }

        if(winsTeam1 === 4){
          nextPhase.push(teamhome);
        } else if(winsTeam2 === 4){
          nextPhase.push(teamvisitor);
        }

      }
    }

    let finalConference = [];

    for(let i = 0; i < 4 ; i++){
      let j = 3 - i;
      let winsTeam1 = 0;
      let winsTeam2 = 0;

      let up = nextPhase[i];
      let down = nextPhase[j];

      let teamhome,teamvisitor;

      if(down && up.percentage > down.percentage){
        teamhome = up;
        teamvisitor = down;
      }else {
        teamhome = down;
        teamvisitor = up;
      }
      
      let team1 = await this.getTeamByNameAsync(this.teamService, teamhome.name);
      let team2 = await this.getTeamByNameAsync(this.teamService, teamvisitor.name);

      while ( winsTeam1 < 4 && winsTeam2 < 4){
        let scores = matchnba();
        let score1 = scores[0];
        let score2 = scores[1];

        let match = {
          matchId: 0,
          seasonId: this.seasonId,
          homeTeamId: team1.teamId,
          visitorTeamId: team2.teamId,
          homeScore: score1,
          visitorScore: score2,
          phase: 2
        };
      
        await this.createMatchAsync(this.matchService, match);

        if(score1 > score2){
          winsTeam1++;
        } else {
          winsTeam2++;
        }

        if(winsTeam1 === 4){
          finalConference.push(teamhome);
        } else if(winsTeam2 === 4){
          finalConference.push(teamvisitor);
        }

      }
    }

    
      let phaseconference ;
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

      while ( winsTeam1 < 4 && winsTeam2 < 4){
        let scores = matchnba();
        let score1 = scores[0];
        let score2 = scores[1];

        let match = {
          matchId: 0,
          seasonId: this.seasonId,
          homeTeamId: team1.teamId,
          visitorTeamId: team2.teamId,
          homeScore: score1,
          visitorScore: score2,
          phase: phaseconference
        };
      
        await this.createMatchAsync(this.matchService, match);

        if(score1 > score2){
          winsTeam1++;
        } else {
          winsTeam2++;
        }

        let conference = teamhome.conference;
        if(conference === 'Eastern'){
          if(winsTeam1 == 4) {
            this.seasonService.addChampionEast(
              this.seasonId,
              team1.teamId,
              team2.teamId
            ).subscribe();
          }else if(winsTeam2 == 4){
            this.seasonService.addChampionEast(
              this.seasonId,
              team2.teamId,
              team1.teamId
            ).subscribe();
          }
        } else if (conference === 'Western'){
          if(winsTeam1 == 4) {
            this.seasonService.addChampionWest(
              this.seasonId,
              team1.teamId,
              team2.teamId 
            ).subscribe();
          }else if(winsTeam2 == 4){
            this.seasonService.addChampionWest(
              this.seasonId,
              team2.teamId,
              team1.teamId
            ).subscribe();
          }
        }
      }

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

    let match = {
      matchId: 0,
      seasonId: this.seasonId,
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

    match = {
      matchId: 0,
      seasonId: this.seasonId,
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

    match = {
      matchId: 0,
      seasonId: this.seasonId,
      homeTeamId: team9.teamId,
      visitorTeamId: team10.teamId,
      homeScore: score1,
      visitorScore: score2
    };
  
    await this.createMatchAsync(this.matchService, match);
  
  }
  
  async generateMatches(eastTeams: SeasonTeam[], westTeams: SeasonTeam[]){
    await this.playIn(eastTeams);
    await this.playIn(westTeams);
  }

  async generatePlayOffs(topEastTeams: SeasonTeam[], topWestTeams: SeasonTeam[]){
    await this.PlayOffTeams(topEastTeams);
    await this.PlayOffTeams(topWestTeams);
  }

  startPlayIn(){

    const playInEast = this.eastTeams.slice(6, 10);
    const playInWest = this.westTeams.slice(6, 10);

    this.generateMatches(playInEast, playInWest);

    this.isOnPlayIn = false;
    this.isOnPlayOffs = true;

    this.cdr.detectChanges();

    this.loadMatches();

  }

  startPlayOffs(){
    
    const topEastTeams = this.eastTeams.slice(0, 6);
    const topWestTeams = this.westTeams.slice(0, 6);

    this.generatePlayOffs(topEastTeams, topWestTeams);

    this.isOnFinals = true;

    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.seasonId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadTeams();
  }

}
