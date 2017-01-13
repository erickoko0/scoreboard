import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';

import { AppComponent }  from './app.component';
import { TimerPipe, YesNoPipe, QPipe, RPipe } from './scoreboard.pipe';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, TimerPipe, YesNoPipe, QPipe, RPipe ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
