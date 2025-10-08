import { Component } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    MaterialModule,
    RouterLink,
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
