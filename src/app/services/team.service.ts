import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../interfaces/Team';

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

  getTeamByName(name:string):Observable<Team>{
    return this.http.get<Team>(this.apiUrl + '/getByName/' + name);
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
