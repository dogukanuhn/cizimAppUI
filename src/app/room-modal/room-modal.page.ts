import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-room-modal',
  templateUrl: './room-modal.page.html',
  styleUrls: ['./room-modal.page.scss'],
})
export class RoomModalPage implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }
  dismissModal(){
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
