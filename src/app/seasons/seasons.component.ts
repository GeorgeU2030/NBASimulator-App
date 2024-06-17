import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SeasonService } from '../services/season.service';
import { Season } from '../interfaces/Season';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-seasons',
  standalone: true,
  imports: [ButtonModule, ToastModule],
  templateUrl: './seasons.component.html',
  styleUrl: './seasons.component.css'
})
export class SeasonsComponent implements OnInit {

  listSeasons : Season[] = [];

  constructor(
    private message: MessageService,
    private seasonService: SeasonService,
    private teamService: TeamService
  ) { }

  newSeason(){
    this.message.add({severity:'success', summary:'New Season', detail:'Season created successfully'});
    this.addSeason().then (()=> {
      this.loadSeasons();
    })
  }

  async addSeason(){
    let edition;
    let lastEdition;

    if(this.listSeasons.length > 0){
      lastEdition = this.listSeasons[this.listSeasons.length - 1].edition;
      edition = lastEdition + 1;
    } else {
      edition = 1;
    }

    const season = {
      seasonId: 0,
      edition: edition,
    }

    this.seasonService.addSeason(season).subscribe(data => {
      this.listSeasons.push(data);

      this.teamService.getTeams().subscribe(teams => {
        teams.forEach(team => {
          const seasonTeam = {
            season: data,
            seasonId: data.seasonId,
            seasonTeamId: 0,
            name: team.name,
            logo: team.logo,
            wins: 0,
            losses: 0,
            percentage: 0,
            conference: team.conference,
            division: team.division
          }
          this.seasonService.addTeamtoSeason(data.seasonId, seasonTeam).subscribe({
            error : (err) =>{
              console.log(err);
            }
          });
        })
      });
    });

  }

  loadSeasons() : void {
    this.seasonService.getSeasons().subscribe(data => {
      this.listSeasons = data;
    });
  }

  ngOnInit(): void {
    this.loadSeasons();
  }

}
