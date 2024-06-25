import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Serie } from '../interfaces/Serie';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SerieService {

  private endPoint:string = environment.BACKEND_URL;
  private apiUrl:string = this.endPoint + "Serie";

  constructor(private http:HttpClient) { }

  addSerie(serie:Serie):Observable<Serie>{
    return this.http.post<Serie>(this.apiUrl, serie);
  }

  getSerieById(serieId:number):Observable<Serie>{
    return this.http.get<Serie>(this.apiUrl + "/" + serieId);
  }

  updateWins(serieId:number, winshome:number, winsaway:number):Observable<Serie>{
    const url = `${this.apiUrl}/${serieId}?winshome=${winshome}&winsaway=${winsaway}`;
    return this.http.put<Serie>(url, {});
  }
}
