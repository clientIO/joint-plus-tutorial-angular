import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AvoidRouterService } from './avoid-router.service';

export function avoidRouterInit(avoidRouterService: AvoidRouterService) {
  return () => {
    return avoidRouterService.load();
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: avoidRouterInit,
      multi: true,
      deps: [AvoidRouterService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
