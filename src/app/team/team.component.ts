import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '../services/team.service';
import { Team } from '../interfaces/Team';
import { CommonModule } from '@angular/common';
import { gradients } from '../styles/gradients';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit{

  teamId!: number;
  team!: Team;
  numTrophies!: number[];

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService
  ) { }

  getBackground(teamId:number){

    return { 'background-image': gradients[teamId] || 'linear-gradient(to right, #eee, #333)' };
  }

  loadTeam(){
    this.teamService.getTeamById(this.teamId).subscribe(data => {
      this.team = data;
    });
  }

  ngOnInit(){
    this.teamId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadTeam();
  }
}
