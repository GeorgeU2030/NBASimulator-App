import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { Team } from '../interfaces/Team';
import { TeamService } from '../services/team.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  listTeams : Team[] = [];

  constructor (
    private teamService: TeamService,
    private router: Router 
  ){
  }

  getTeams(){
    this.teamService.getTeams().subscribe(
      data => {
        this.listTeams = data;
      }
    );
  }

  navigate(){
    this.router.navigate(['/seasons']);
  }

  ngOnInit(): void {
    this.getTeams();
  }

}
