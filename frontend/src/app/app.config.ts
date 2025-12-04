<<<<<<< HEAD
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
=======
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
>>>>>>> 00464d4ead25df3f8333cbe7d82ccf2e3ede44cc
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
<<<<<<< HEAD
    provideRouter(routes), provideClientHydration(withEventReplay())
=======
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
>>>>>>> 00464d4ead25df3f8333cbe7d82ccf2e3ede44cc
  ]
};
