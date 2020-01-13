import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";

import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {


  constructor(private alertController: AlertController, private storage: Storage, public http: HttpClient, private router: Router, private socket: SocketService, private userS: UserService) {

  }
  public apiUrl = "https://192.168.2.36:45455/"
  liste = []

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  ionViewWillEnter() {


    if (this.socket.connection.state == signalR.HubConnectionState.Disconnected) {
      this.socket.connection.start().then(x => {

        this.socket.connection.invoke("GetConnecionId").then(x => {
          if (x) {
            this.userS.userConnectionId = x;
            console.log(x);
            let user;
            if (this.userS.userInformation['username']) {
              user = this.userS.userInformation['username'];
            } else {
              this.storage.get('username').then(x => user = x);
            }
            this.http.post(this.apiUrl + "api/user/connect", {
              Username: user,
              ConnectionId: x
            }, this.httpOptions).subscribe(x => { })
          }


        })

        this.socket.connection.on("Notify", x => {
          ;
          console.log(x);
          this.liste = x
        })


      });
    } else if (this.socket.connection.state == signalR.HubConnectionState.Connected) {

      this.socket.connection.on("Notify", x => {
        ;
        console.log(x);
        this.liste = x
      })
    }


  }

  openRoom() {

    this.presentCreateRoom();

  }

  async presentCreateRoom() {
    const alert = await this.alertController.create({
      header: 'Oda Adı',
      inputs: [
        {
          name: 'roomName',
          type: 'text',
          placeholder: "Muzlu kek"
        },
        {
          name: 'roomMaxUserCount',
          type: 'text',
          placeholder: "Kaç Kişi (maks 10)"
        },
        {
          name: 'roomPassword',
          type: 'text',
          placeholder: "Oda şifresi(yoksa boş)"
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            var req = {
              roomName: data.roomName,
              roomMaxUserCount: parseInt(data.roomMaxUserCount),
              roomAdmin: this.userS.userInformation['username'],
              roomPassword: data.roomPassword
            }

            this.http.post("https://192.168.2.36:45455/api/room", req, this.httpOptions).subscribe(x => {
              if (x) {
                this.userS.isAdmin = true;
                this.router.navigate([`/room/${x['id']}/${data.roomName}`])
                this.socket.connection.off("Notify")
              }
            })
          }
        }
      ]
    });

    await alert.present();
  }


  JoinRoom(roomId, roomName, userCount, roomMaxUserCount, roomLocked) {

    if (userCount < roomMaxUserCount) {
      this.router.navigate([`/room/${roomId}/${roomName}`])
      this.socket.connection.off("Notify")
    }



  }



}
