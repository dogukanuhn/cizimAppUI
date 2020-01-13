import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';

import { ToastController, AlertController, Platform, ModalController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { HttpClient } from '@angular/common/http';
import { RoomService } from '../services/room.service';
import { RoomModalPage } from '../room-modal/room-modal.page';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements AfterViewInit {

  constructor(public modalController: ModalController, private plt: Platform, private room: RoomService, private nav: ActivatedRoute, private router: Router, private http: HttpClient, private socket: SocketService, public toastController: ToastController, private userS: UserService) { }


  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  @ViewChild('turnTimer', { static: false }) private turnTime: CountdownComponent;
  timerConfig: CountdownConfig = {
    format: 'mm:ss',
    demand: true,
    leftTime: 3
  }

  turnTimerConfig: CountdownConfig = {
    format: 'mm:ss',
    demand: true,
    leftTime: 10
  }


  @ViewChild('drawingCanvas', { static: false }) canvas: any;
  canvasElement: any;

  saveX: number;
  saveY: number;

  drawing = false
  selectedColor = '#9e2956';

  colors = ['#9e2956', '#c2281d', '#de722f'];
  lineWidth = 5;
  chatMessage = []
  kickList = [];
  gameTimerStatus = false;
  isGameStart = false;
  yourTurn = false;
  word


  handleTurnTimer(a) {
    console.log(a);
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    if (a.status === 3 && this.userS.isAdmin) {
      this.nextTurn();

    }
  }
  handleStartCountDown(a) {
    this.gameTimerStatus = false;
    if (a.status === 3 && this.userS.isAdmin) {

      this.room.startGame().then(x => {
        this.word = x['word'].WordName;
      })

    }
  }

  nextTurn() {
    this.room.nextTurn()
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: RoomModalPage,
      componentProps: {
        'firstName': 'Douglas',
        'lastName': 'Adams',
        'middleInitial': 'N'
      }
    });
    return await modal.present();
  }

  ngAfterViewInit() {
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;

  }
  startDrawing(ev) {
    if (this.yourTurn) {
      const canvasPosition = this.canvasElement.getBoundingClientRect();
      this.drawing = true;
      this.saveX = ev.pageX - canvasPosition.x;
      this.saveY = ev.pageY - canvasPosition.y;
    }


  }
  endDrawing(ev) {
    if (this.yourTurn) {
      this.drawing = false;
      this.socket.connection.send("SendCanvas", this.exportCanvasImage(), this.room.roomName);
    }

  }
  moved(ev) {

    if (this.yourTurn) {
      if (!this.drawing) return
      console.log(ev)
      const canvasPosition = this.canvasElement.getBoundingClientRect();
      let ctx = this.canvasElement.getContext('2d');

      let currentX = ev.touches[0].pageX - canvasPosition.x;
      let currentY = ev.touches[0].pageY - canvasPosition.y;

      ctx.lineJoin = 'round';
      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = this.lineWidth;

      ctx.beginPath();
      ctx.moveTo(this.saveX, this.saveY);
      ctx.lineTo(currentX, currentY);
      ctx.closePath();

      ctx.stroke();

      this.saveX = currentX;
      this.saveY = currentY;
    }


  }

  setBackgroundImage(canvasUrl) {
    console.log(canvasUrl);
    let background = new Image()
    background.src = canvasUrl;
    let ctx = this.canvasElement.getContext('2d');
    background.onload = x => {
      ctx.drawImage(background, 0, 0, this.canvasElement.width, this.canvasElement.height);

    }
  }

  exportCanvasImage() {
    const dataUrl = this.canvasElement.toDataURL();

    return dataUrl;

  }



  ionViewWillEnter() {
    this.room.roomId = this.nav.snapshot.params.id;
    this.room.roomName = this.nav.snapshot.params.roomName;

    this.http.get(this.socket.apiUrl + "api/room/" + this.room.roomName).subscribe(x => {
      if (x) {
        let req = {
          connectedRoomName: this.room.roomName,
          connectionId: this.userS.userConnectionId
        }

        this.http.post(this.socket.apiUrl + 'api/room/joinroom', req).subscribe(x => {

        })


        this.socket.connection.on("GetCanvas", x => {
          console.log(x);
          this.setBackgroundImage(x);
        })


        this.socket.connection.send("GetAllChatMessage", this.room.roomName);

        this.socket.connection.on("StartGameTimer", x => {
          console.log(x);
          this.countdown.begin();
          this.gameTimerStatus = true;
        })

        this.socket.connection.on("StartTurnTimer", x => {
          this.turnTime.begin();
          if (this.turnTime.left < 10) {
            this.turnTime.restart();
            this.turnTime.begin();
          }
        })


        this.socket.connection.on("YourTurn", x => {

          if (x == true) {
            this.yourTurn = true;
            console.log('your turn')
          } else {
            this.yourTurn = false;
          }

        })


        this.socket.connection.on("GroupJoined", x => {
          this.room.presentToast(x)
        })

        this.socket.connection.on("GroupLeaved", x => {
          this.room.presentToast(x)
        })
        this.socket.connection.on("GroupMessage", x => {
          this.chatMessage.push(x);
        })


        if (!this.userS.isAdmin) {
          this.socket.connection.on("KickStart", x => {

            console.log(x)
            console.log(this.userS.userConnectionId);
            if (!this.userS.isAdmin && this.userS.userConnectionId !== x.connectionId) {
              this.room.presentKickMessage(x.username, x.ConnectionId);
            }
          })
          this.socket.connection.on("AdminCall", x => {
            this.userS.isAdmin = x;
          })
          this.socket.connection.on("KickedFromRoom", x => {
            if (x) {
              this.room.presentToast(this.room.roomName + " Odasından atıldınız.");
              this.room.closeConnections();
              this.router.navigate(['/home']);
            }
          })
          this.socket.connection.on("IsClosed", x => {
            this.room.presentToast(this.room.roomName + " Odası Yöneticisi Tarafından Kapatıldı.");
            this.room.closeConnections();
            this.router.navigate(['/home']);

          })
        }
      } else {
        this.room.presentToast("Oda Kapatılmış")
        this.router.navigate(['/home']);
      }
    })

  }

  checkKickStatus() {

    this.room.checkKickStatus().then(x => {
      console.log(x);
    })
  }


  kickStart(uname, userId) {

    this.room.kickStart(uname, userId);
  }

  // userList() {

  //   this.room.userList();


  // }

  leaveRoom() {
    this.room.closeConnections();
    this.router.navigate(['/home']);
  }

  // closeRoom() {
  //   this.room.closeRoom().then(x=>{
  //     this.room.closeConnections();
  //     this.router.navigate(['/home']);
  //   })
  // }








}
