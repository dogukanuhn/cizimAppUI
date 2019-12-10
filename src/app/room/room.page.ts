import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';
import * as signalR from '@microsoft/signalr';
import { ThrowStmt } from '@angular/compiler';
import { ToastController } from '@ionic/angular';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  constructor(private nav:ActivatedRoute,private socket:SocketService,public toastController: ToastController,private userS:UserService) { }

  roomId = this.nav.snapshot.params.id;

  chatMessage = []

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  ionViewWillEnter(){
    
    this.socket.connection.send("AddToGroup",this.roomId);

    this.socket.connection.send("GetAllChatMessage",this.roomId);

    this.socket.connection.on("GroupJoined",x=>{
        this.presentToast(x)
    })
    this.socket.connection.on("GroupLeaved",x=>{
      this.presentToast(x)
    })
    this.socket.connection.on("RoomMessage",x=>{
      console.log(x);
      this.chatMessage = x;
    })
    this.socket.connection.on("GroupMessage",x=>{
      this.chatMessage.push(x);
    })
    
    


  } 
  
  GoBack(){

    this.socket.connection.send("RemoveFromGroup",this.roomId);

    // this.socket.connection.stop();  
  }


  SendMessage(message){

    this.socket.connection.send("SendMessageToGroup",this.roomId,message,this.userS.userInformation['username']);

  }
  ngOnInit() {

  }

}
