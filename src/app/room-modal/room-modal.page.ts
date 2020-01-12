import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { RoomService } from '../services/room.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-modal',
  templateUrl: './room-modal.page.html',
  styleUrls: ['./room-modal.page.scss'],
})
export class RoomModalPage implements OnInit {

  constructor(public modalController: ModalController, private router: Router, private navParams: NavParams, private room: RoomService) { }

  kickUserName;
  kickUserConId;
  isKickButtonOn=true;

  ngOnInit() {
    this.room.userList();
  }


  dismissModal() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }



  selectUser(uname, userId) {
    this.kickUserConId = userId;
    this.kickUserName = uname;
    this.isKickButtonOn = false;
  }

  kickStart() {

    this.room.kickStart(this.kickUserName, this.kickUserConId).then(x=>{
      this.isKickButtonOn = false;
    });
  }

  closeRoom() {
    this.room.closeRoom().then(x => {
      this.room.closeConnections();
      this.router.navigate(['/home']);
    })
  }

}
