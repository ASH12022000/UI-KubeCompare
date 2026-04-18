import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule)
  ]
};
<!-- slide -->
import { Routes } from '@angular/router';
import { LoginComponent } from './auth';
import { WizardComponent } from './wizard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'wizard', component: WizardComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
