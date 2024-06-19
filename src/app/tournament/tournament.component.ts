import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeasonService } from '../services/season.service';
import { SeasonTeam } from '../interfaces/SeasonTeam';
import { Season } from '../interfaces/Season';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent implements OnInit {

  listTeams : SeasonTeam[] = [];
  eastTeams : SeasonTeam[] = [];
  westTeams : SeasonTeam[] = [];
  season!: Season;
  seasonId!: number ;

  constructor(
    private route: ActivatedRoute,
    private seasonService: SeasonService
  ) {}

  loadTeams(){
    this.seasonService.getSeasonById(this.seasonId).subscribe(data => {
      this.listTeams = data.teams ? data.teams : [];
      this.season = data;
      this.eastTeams = this.listTeams.filter(team => team.conference === 'Eastern');
      this.westTeams = this.listTeams.filter(team => team.conference === 'Western');
    })
  }

  ngOnInit() {
    this.seasonId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadTeams();
  }
}
