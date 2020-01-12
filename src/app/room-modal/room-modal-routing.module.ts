import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomModalPage } from './room-modal.page';

const routes: Routes = [
  {
    path: '',
    component: RoomModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomModalPageRoutingModule {}
