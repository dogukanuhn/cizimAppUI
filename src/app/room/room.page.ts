import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import * as signalR from '@microsoft/signalr';
import { ThrowStmt } from '@angular/compiler';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit,AfterViewInit {

  constructor(private plt:Platform,private nav: ActivatedRoute, private alertController: AlertController, private router: Router, private http: HttpClient, private socket: SocketService, public toastController: ToastController, private userS: UserService) { }

  @ViewChild('drawingCanvas',{static:false}) canvas :any;
  canvasElement :any;

  saveX : number;
  saveY : number;

  drawing = false
  selectedColor = '#9e2956';

  colors = ['#9e2956','#c2281d','#de722f'];
  lineWidth = 5;


  roomId = this.nav.snapshot.params.id;
  roomName = this.nav.snapshot.params.roomName;
  chatMessage = []
  kickList = [];

  kickUserId;
  kickUserConnectionId;
  kickUsername;


  ngAfterViewInit(){
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
  }
  startDrawing(ev) {
    console.log(ev)
    const canvasPosition = this.canvasElement.getBoundingClientRect();
    this.drawing = true;
    this.saveX = ev.pageX - canvasPosition.x;
    this.saveY = ev.pageY - canvasPosition.y;

  }
  endDrawing(ev) {
    this.drawing = false;
    this.socket.connection.send("SendCanvas",this.exportCanvasImage(),this.roomName);
    console.log(ev)
  }
  moved(ev) {
    if(!this.drawing) return
    console.log(ev)
    const canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');

    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.saveX,this.saveY);
    ctx.lineTo(currentX,currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;

  }

  setBackgroundImage(canvasUrl){
    console.log(canvasUrl);
    let background = new Image()
    background.src = canvasUrl;
    let ctx = this.canvasElement.getContext('2d');
    background.onload = x=>{
        ctx.drawImage(background,0,0,this.canvasElement.width,this.canvasElement.height);

    }
  }
  exportCanvasImage(){
    const dataUrl = this.canvasElement.toDataURL();
    return dataUrl;

  }
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
            this.http.post("https://192.168.2.36:45455/api/room/kickvoteno", req).subscribe(x => {

            });
          }
        }, {
          text: 'Evet',
          handler: (data) => {
            var req = {
              id: id,
              username: username
            }

            this.http.post("https://192.168.2.36:45455/api/room/kickvoteyes", req).subscribe(x => {

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
          connectedRoomName: this.roomName,
          connectionId: this.userS.userConnectionId
        }

        this.http.post(this.socket.apiUrl + 'api/room/joinroom', req).subscribe(x => {

        })

        if(!this.userS.isAdmin){
          this.socket.connection.on("GetCanvas",x=>{
            this.setBackgroundImage(x);
          })
        }
      
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
        this.socket.connection.on("KickStart", x => {

          console.log(x)
          console.log(this.userS.userConnectionId);
          if (!this.userS.isAdmin && this.userS.userConnectionId !== x.connectionId) {
            this.presentKickMessage(x.username, x.ConnectionId);
          }
        })
        this.socket.connection.on("AdminCall", x => {
          this.userS.isAdmin = x;
        })
        this.socket.connection.on("KickedFromRoom", x => {
          if (x) {
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

  checkKickStatus() {

    var req = {
      username: this.kickUsername,
      connectionId: this.kickUserConnectionId
    }
    console.log(req);
    this.http.post(this.socket.apiUrl + 'api/room/kickstatus', req).subscribe(x => {
      console.log(x);
    })
  }


  kickStart(uname, userId) {
    this.kickUserId = userId;
    this.kickUsername = uname
    let data = {
      connectionId: userId
    }
    this.http.post(this.socket.apiUrl + 'api/room/kickstart', data).subscribe(x => {
      console.log(x)
      this.kickUserConnectionId = x['connectionId'];

    })
  }

  userList() {
    this.http.get(this.socket.apiUrl + 'api/room/roomuser/' + this.roomName, this.userS.httpOptions).subscribe((x: any) => {
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
    this.socket.connection.off("GetCanvas");
    let req = {
      connectedRoomName: this.roomName,
      connectionId: this.userS.userConnectionId
    }

    this.http.post(this.socket.apiUrl + 'api/room/quitroom', req).subscribe(x => {

    })

    this.userS.isAdmin = false;

  }


  SendMessage(message) {

    this.socket.connection.send("SendMessageToGroup", this.roomName, message, this.userS.userInformation['username']);

  }
  ngOnInit() {

  }

}
