import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  title = 'studymate-frontend';
  apiUrl = environment.apiUrl; // Shows the API URL we configured
  swaggerUrl = environment.swaggerUrl; // Shows the Swagger URL we configured
}
