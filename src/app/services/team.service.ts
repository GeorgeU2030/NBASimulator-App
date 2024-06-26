import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../interfaces/Team';
import { TeamEdition } from '../interfaces/TeamEdition';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private endPoint: string = environment.BACKEND_URL;
  private apiUrl: string = this.endPoint + "Team";

  constructor(private http:HttpClient) { }

  getTeams():Observable<Team[]>{
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeamsEditions():Observable<TeamEdition[]>{
    return this.http.get<TeamEdition[]>(this.apiUrl + '/editions');
  }

  getTeamByName(name:string):Observable<Team>{
    return this.http.get<Team>(this.apiUrl + '/getByName/' + name);
  }

  getTeamById(teamId:number):Observable<Team>{
    return this.http.get<Team>(this.apiUrl + '/' + teamId);
  }

  updateDivision(teamId:number):Observable<Team>{
    return this.http.put<Team>(this.apiUrl + '/' + teamId + '/division', {});
  }

  updateConference(teamId:number):Observable<Team>{
    return this.http.put<Team>(this.apiUrl + '/' + teamId + '/conference', {});
  }

  updateChampion(teamId:number):Observable<Team>{
    return this.http.put<Team>(this.apiUrl + '/' + teamId + '/champion', {});
  }

}
