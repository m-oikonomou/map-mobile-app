import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { AgmCoreModule } from '@agm/core';
import { MapsService } from './maps.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD8q_NvFGTutZ9CVzeFyb3Vt5rIqN8ieBM', 
      libraries: ['places']
    }),
    HttpClientModule
  ],
  providers: [MapsService],
  declarations: [HomePage]
})
export class HomePageModule {}
