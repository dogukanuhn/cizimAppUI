import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomPageRoutingModule } from './room-routing.module';

import { RoomPage } from './room.page';
import { RoomModalPage } from '../room-modal/room-modal.page';
import { RoomModalPageModule } from '../room-modal/room-modal.module';
import { CountdownModule } from 'ngx-countdown';
@NgModule({
  entryComponents:[RoomModalPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CountdownModule,
    RoomPageRoutingModule,
    RoomModalPageModule
  ],
  declarations: [RoomPage]
})
export class RoomPageModule {}
