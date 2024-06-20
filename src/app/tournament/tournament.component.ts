import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeasonService } from '../services/season.service';
import { SeasonTeam } from '../interfaces/SeasonTeam';
import { Season } from '../interfaces/Season';
import { nbaTournament } from '../logic/nbatournament';

import { CommonModule } from '@angular/common';
import { SeasonteamService } from '../services/seasonteam.service';

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
  season!: Season;
  seasonId!: number ;
  isOnPlayOffs = false;

  constructor(
    private route: ActivatedRoute,
    private seasonService: SeasonService,
    private seasonTeamService: SeasonteamService
  ) {}

  loadTeams(){
    this.seasonService.getSeasonById(this.seasonId).subscribe(data => {
      this.listTeams = data.teams ? data.teams.sort((a, b) => b.percentage - a.percentage) : [];
      this.season = data;
      this.eastTeams = this.listTeams.filter(team => team.conference === 'Eastern');
      this.westTeams = this.listTeams.filter(team => team.conference === 'Western');
      this.verifyPlayOffs();
    })
  }

  verifyPlayOffs(){
    if(this.listTeams[0].percentage > 0 ){
      this.isOnPlayOffs = true;
    }
  }

  async start(){
    this.listTeams = await nbaTournament(this.eastTeams, this.westTeams);

    this.listTeams.forEach(team => {
      this.seasonTeamService.updateTeam(team.seasonTeamId, team).subscribe()
    });

    this.verifyPlayOffs();
  }

  ngOnInit() {
    this.seasonId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadTeams();
  }
}
