import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Match } from '../interfaces/Match';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private endPoint: string = environment.BACKEND_URL;
  private apiUrl: string = this.endPoint + "Match";

  constructor(private http: HttpClient) { }

  newMatch(match: Match): Observable<Match> {
    return this.http.post<Match>(this.apiUrl, match);
  }
}
