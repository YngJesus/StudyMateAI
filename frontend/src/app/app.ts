import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
<<<<<<< HEAD
  styleUrls: ['./app.css'],
})
export class AppComponent {
  title = 'studymate-frontend';
  apiUrl = environment.apiUrl; // Shows the API URL we configured
  swaggerUrl = environment.swaggerUrl; // Shows the Swagger URL we configured
=======
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('studyai');
>>>>>>> 00464d4ead25df3f8333cbe7d82ccf2e3ede44cc
}
