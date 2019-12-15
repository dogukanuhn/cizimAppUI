import { Component, OnInit, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import * as signalR from '@microsoft/signalr';
import { ThrowStmt } from '@angular/compiler';
import { ToastController, AlertController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  constructor(private nav: ActivatedRoute,private alertController:AlertController, private router: Router, private http: HttpClient, private socket: SocketService, public toastController: ToastController, private userS: UserService) { }

  roomId = this.nav.snapshot.params.id;
  roomName = this.nav.snapshot.params.roomName;
  chatMessage = []
  kickList = [];

  kickUserId;
  kickUserConnectionId;
  kickUsername;

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async presentKickMessage(username,id) {
    const alert = await this.alertController.create({
      message:`${username} kullanıcısı için atma isteği`,
      buttons: [
        {
          text: 'Hayır',
          handler: () => {
            var req = {
              id:id,
              username:username
            }
          this.http.post("https://192.168.2.36:45455/api/room/kickvoteno",req).subscribe(x=>{

          });
          }
        }, {
          text: 'Evet',
          handler: (data) => {
              var req = {
                id:id,
                username:username
              }

            this.http.post("https://192.168.2.36:45455/api/room/kickvoteyes",req).subscribe(x=>{
            
          });
          }
        }
      ]
    });

    await alert.present();
  }

  ionViewWillEnter() {

    this.http.get(this.socket.apiUrl + "api/room/" + this.roomName).subscribe(x => {
      if (x) {
        let req = {
          connectedRoomName:this.roomName,
          connectionId:this.userS.userConnectionId
        }

        this.http.post(this.socket.apiUrl + 'api/room/joinroom',req).subscribe(x=>{

        })

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
        this.socket.connection.on("KickStart", x=>{
          
          console.log(x)
          console.log(this.userS.userConnectionId);
          if(!this.userS.isAdmin && this.userS.userConnectionId  !== x.connectionId){
            this.presentKickMessage(x.username,x.ConnectionId);
          }
        })
        this.socket.connection.on("AdminCall", x => {
          this.userS.isAdmin = x;
        })
        this.socket.connection.on("KickedFromRoom",x=>{
          if(x){
            this.presentToast(this.roomName + " Odasından atıldınız.");
          this.closeConnections();
          this.router.navigate(['/home']);
          }
        })
        this.socket.connection.on("IsClosed", x => {
          this.presentToast(this.roomName + " Odası Yöneticisi Tarafından Kapatıldı.");
          this.closeConnections();
          this.router.navigate(['/home']);

        })
      } else {
        this.presentToast("Oda Kapatılmış")
        this.router.navigate(['/home']);
      }
    })

  }

  checkKickStatus(){
    
    var req = {
      username:this.kickUsername,
      connectionId:this.kickUserConnectionId
    }
    console.log(req);
    this.http.post(this.socket.apiUrl+'api/room/kickstatus',req).subscribe(x=>{
      console.log(x);
    })
  }
 

  kickStart(uname,userId){
    this.kickUserId = userId;
    this.kickUsername =uname 
    let data = {
      connectionId:userId
    }
    this.http.post(this.socket.apiUrl+'api/room/kickstart',data).subscribe(x=>{
      console.log(x)  
      this.kickUserConnectionId = x['connectionId'];
       
    })
  }

  userList() {
    this.http.get(this.socket.apiUrl + 'api/room/roomuser/'+this.roomName,this.userS.httpOptions).subscribe((x:any) => {
      if (x) {
        this.kickList = x;
      }
    })
  }


  closeRoom() {
    if (this.userS.isAdmin) {
      this.closeConnections();
      this.http.post(this.socket.apiUrl + 'api/room/remove', {
        roomName: this.roomName,
        id: this.roomId
      }).subscribe(x => {
        if (x) {
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
    this.socket.connection.off("KickStart")
    this.socket.connection.off("KickedFromRoom")
    let req = {
      connectedRoomName:this.roomName,
      connectionId:this.userS.userConnectionId
    }

    this.http.post(this.socket.apiUrl + 'api/room/quitroom',req).subscribe(x=>{

    })
    
    this.userS.isAdmin = false;

  }


  SendMessage(message) {

    this.socket.connection.send("SendMessageToGroup", this.roomName, message, this.userS.userInformation['username']);

  }
  ngOnInit() {

  }

}
