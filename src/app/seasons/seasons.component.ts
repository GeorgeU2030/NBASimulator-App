import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-seasons',
  standalone: true,
  imports: [ButtonModule, ToastModule],
  templateUrl: './seasons.component.html',
  styleUrl: './seasons.component.css'
})
export class SeasonsComponent {

  constructor(
    private message: MessageService
  ) { }

  newSeason(){
    this.message.add({severity:'success', summary:'New Season', detail:'Season created successfully'});
  }

}
