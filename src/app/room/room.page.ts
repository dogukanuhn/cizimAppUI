import { Component, OnInit, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import * as signalR from '@microsoft/signalr';
import { ThrowStmt } from '@angular/compiler';
import { ToastController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  constructor(private nav: ActivatedRoute, private router: Router, private http: HttpClient, private socket: SocketService, public toastController: ToastController, private userS: UserService) { }

  roomId = this.nav.snapshot.params.id;
  roomName = this.nav.snapshot.params.roomName;
  chatMessage = []
  

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  ionViewWillEnter() {

    this.http.get(this.socket.apiUrl+"api/room/" + this.roomName).subscribe(x => {
      if (x) {
        this.socket.connection.send("AddToGroup", this.roomName);

        this.socket.connection.send("GetAllChatMessage", this.roomName);

        this.socket.connection.on("GroupJoined", x => {
          this.presentToast(x)
        })
        this.socket.connection.on("GroupLeaved", x => {
          this.presentToast(x)
        })
        this.socket.connection.on("RoomMessage", x => {
          console.log(x);
          this.chatMessage = x;
        })
        this.socket.connection.on("GroupMessage", x => {
          this.chatMessage.push(x);
        })
        this.socket.connection.on("AdminCall", x => {
          this.userS.isAdmin = x;
        })
        this.socket.connection.on("IsClosed", x => {
          this.presentToast(this.roomName + " Odası Yöneticisi Tarafından Kapatıldı.");
          this.closeConnections();
          this.router.navigate(['/home']);

        })
      }else{
        this.presentToast("Oda Kapatılmış")
        this.router.navigate(['/home']);
      }
    })






  }

  closeRoom() {
    if(this.userS.isAdmin){
      this.closeConnections();
    this.http.post(this.socket.apiUrl + 'api/room/remove',{
      roomName:this.roomName,
      id:this.roomId
    }).subscribe(x=>{
      if(x){
        this.presentToast("Odanız Kapatıldı")
        this.router.navigate(['/home']);
      }

    })
    }
  }

  closeConnections() {
    this.socket.connection.off("GroupJoined")
    this.socket.connection.off("GroupLeaved")
    this.socket.connection.off("RoomMessage")
    this.socket.connection.off("GroupMessage")
    this.socket.connection.off("AdminCall")
    this.socket.connection.off("IsClosed")
    this.socket.connection.send("RemoveFromGroup", this.roomName);
    this.userS.isAdmin = false;

  }


  SendMessage(message) {

    this.socket.connection.send("SendMessageToGroup", this.roomName, message, this.userS.userInformation['username']);

  }
  ngOnInit() {

  }

}
