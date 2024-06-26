import { Component, OnInit } from '@angular/core';
import { TeamService } from '../services/team.service';
import { TeamEdition } from '../interfaces/TeamEdition';

@Component({
  selector: 'app-champion',
  standalone: true,
  imports: [],
  templateUrl: './champion.component.html',
  styleUrl: './champion.component.css'
})
export class ChampionComponent implements OnInit {

  teams!: TeamEdition[]; 

  constructor(
    private teamService: TeamService,
  ){}

  loadTeams():void{
    this.teamService.getTeamsEditions().subscribe(data=>{
      this.teams = data;
      console.log(this.teams)
    })
  }

  ngOnInit(){
      this.loadTeams();
  }
}
