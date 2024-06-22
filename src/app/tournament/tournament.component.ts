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
  playoffTeamsEast : Team[] = [];
  playoffTeamsWest : Team[] = [];
  playInMatchesEast : Match[] = [];
  playInMatchesWest : Match[] = [];
  season!: Season;
  seasonId!: number ;
  isOnPlayOffs = false;
  isOnPlayIn = false;

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
      this.loadMatches();
    })
  }

  loadMatches(){
    if(this.season.matches){
      const sortedMatches = this.season.matches.sort((a, b) => a.matchId - b.matchId);
      this.playInMatchesEast = sortedMatches.slice(0, 3);
      this.playInMatchesWest = sortedMatches.slice(3, 6);
    }
  }

  verifyPlayIn(){
    if(this.listTeams[0].percentage > 0 ){
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

  async start(){
    this.listTeams = await nbaTournament(this.eastTeams, this.westTeams);

    this.listTeams.forEach(team => {
      this.seasonTeamService.updateTeam(team.seasonTeamId, team).subscribe()
    });

    this.verifyPlayIn();
  }

  async PlayOffTeams(){
    const topEastTeams = this.eastTeams.slice(0, 6);
    const topWestTeams = this.westTeams.slice(0, 6);
    
  }

  async getTeamByNameAsync(teamService: TeamService, name: string): Promise<Team> {
    return new Promise((resolve, reject) => {
      teamService.getTeamByName(name).subscribe({
        next: resolve,
        error: reject
      });
    });
  }
  
  async createMatchAsync(matchService: MatchService, match: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      matchService.newMatch(match).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
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

  startPlayIn(){

    const playInEast = this.eastTeams.slice(6, 10);
    const playInWest = this.westTeams.slice(6, 10);

    this.generateMatches(playInEast, playInWest);

    this.isOnPlayIn = false;
    this.isOnPlayOffs = true;

    this.cdr.detectChanges();

    this.loadMatches();

  }

  ngOnInit() {
    this.seasonId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadTeams();
  }

}
