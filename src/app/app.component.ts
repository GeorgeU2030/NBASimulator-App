import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Team } from './interfaces/Team';
import { TeamService } from './services/team.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  
  listTeams : Team[] = [];

  constructor (private teamService: TeamService){
  }

  getTeams(){
    this.teamService.getTeams().subscribe(
      data => {
        this.listTeams = data;
      }
    );
  }

  ngOnInit(): void {
    this.getTeams();
  }
}
