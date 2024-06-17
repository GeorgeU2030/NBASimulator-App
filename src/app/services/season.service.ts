import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Season } from '../interfaces/Season';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {

  private endPoint: string = environment.BACKEND_URL;
  private apiUrl: string = this.endPoint + "Season";

  constructor(private http:HttpClient) { }

  getSeasons():Observable<Season[]>{
    return this.http.get<Season[]>(this.apiUrl);
  }

  addSeason(season:Season):Observable<Season>{
    return this.http.post<Season>(this.apiUrl, season);
  }

  getSeasonById(seasonId:number):Observable<Season>{
    return this.http.get<Season>(this.apiUrl + "/" + seasonId);
  }
  
}
