import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomModalPageRoutingModule } from './room-modal-routing.module';

import { RoomModalPage } from './room-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoomModalPageRoutingModule
  ],
  declarations: [RoomModalPage]
})
export class RoomModalPageModule {}
