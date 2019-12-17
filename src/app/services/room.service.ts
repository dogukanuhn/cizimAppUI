import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';
import { resolve } from 'url';
import { UserService } from './user.service';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private http: HttpClient,private alertController: AlertController,public toastController: ToastController, private socket: SocketService,private userS:UserService) { }

  roomId;
  roomName;
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

  async presentKickMessage(username, id) {
    const alert = await this.alertController.create({
      message: `${username} kullanıcısı için atma isteği`,
      buttons: [
        {
          text: 'Hayır',
          handler: () => {
            var req = {
              id: id,
              username: username
            }
            this.http.post("https://192.168.2.36:45456/api/room/kickvoteno", req).subscribe(x => {

            });
          }
        }, {
          text: 'Evet',
          handler: (data) => {
            var req = {
              id: id,
              username: username
            }

            this.http.post("https://192.168.2.36:45456/api/room/kickvoteyes", req).subscribe(x => {

            });
          }
        }
      ]
    });

    await alert.present();
  }

  kickStart(uname, userId) {
    return new Promise((resolve, reject) => {
      this.kickUserId = userId;
      this.kickUsername = uname
      let data = {
        connectionId: userId
      }
      this.http.post(this.socket.apiUrl + 'api/room/kickstart', data).subscribe(x => {
        console.log(x)
        this.kickUserConnectionId = x['connectionId'];
        resolve(true);
      }, e => {
        reject(false);
      })
    })

  }

  checkKickStatus() {
    return new Promise((resolve,reject) => {
      var req = {
        username: this.kickUsername,
        connectionId: this.kickUserConnectionId
      }
      this.http.post(this.socket.apiUrl + 'api/room/kickstatus', req).subscribe(x => {
        resolve(x);
      })
    })
   
  }

  userList() {
    this.http.get(this.socket.apiUrl + 'api/room/roomuser/' + this.roomName).subscribe((x: any) => {
      if (x) {
        this.kickList = x;
      }
    })
  }

  closeRoom() {
    return new Promise((resolve,reject) => {

      if (this.userS.isAdmin){
        
        this.http.post(this.socket.apiUrl + 'api/room/remove', {
          roomName: this.roomName,
          id: this.roomId
        }).subscribe(x => {
          if(x){
            
            resolve(true);

          }
      })
      }
    })
  }
  
  SendMessage(message){
    this.socket.connection.send("SendMessageToGroup", this.roomName, message, this.userS.userInformation['username']);
  }
  
  closeConnections() {
    this.socket.connection.off("GroupJoined")
    this.socket.connection.off("GroupLeaved")
    this.socket.connection.off("GroupMessage")
    this.socket.connection.off("AdminCall")
    this.socket.connection.off("IsClosed")
    this.socket.connection.off("KickStart")
    this.socket.connection.off("KickedFromRoom")
    this.socket.connection.off("GetCanvas");
    let req = {
      connectedRoomName: this.roomName,
      connectionId: this.userS.userConnectionId
    }

    this.http.post(this.socket.apiUrl + 'api/room/quitroom', req).subscribe();

    this.userS.isAdmin = false;

  }


}
