import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { SeasonTeam } from '../interfaces/SeasonTeam';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeasonteamService {

  private endPoint: string = environment.BACKEND_URL;
  private apiUrl: string = this.endPoint + "SeasonTeam";

  constructor(private http: HttpClient) { }

  updateTeam(seasonTeamId:number, seasonTeam: SeasonTeam):Observable<SeasonTeam>{
    return this.http.put<SeasonTeam>(this.apiUrl+"/"+seasonTeamId, seasonTeam);
  }

}
