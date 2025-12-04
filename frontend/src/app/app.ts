import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'studymate-frontend';
  apiUrl = environment.apiUrl;
  swaggerUrl = environment.swaggerUrl;
}
