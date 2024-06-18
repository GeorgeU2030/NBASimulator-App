import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent implements OnInit {

  seasonId!: string ;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.seasonId = this.route.snapshot.paramMap.get('id')!;
  }
}
