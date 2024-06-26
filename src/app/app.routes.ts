import { Routes } from '@angular/router';
import { SeasonsComponent } from './seasons/seasons.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TournamentComponent } from './tournament/tournament.component';
import { TeamComponent } from './team/team.component';
import { ChampionComponent } from './champion/champion.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'seasons', component: SeasonsComponent},
    {path: 'season/:id', component: TournamentComponent},
    {path: 'team/:id', component: TeamComponent},
    {path: 'champions', component: ChampionComponent},
    {path: '**' , redirectTo: '/home', pathMatch: 'full'},
];
