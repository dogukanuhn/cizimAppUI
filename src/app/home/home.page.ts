import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";

import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {


  constructor(private alertController: AlertController, public http: HttpClient,private router:Router,private socket:SocketService,private userS:UserService) {

  }
  public apiUrl = "https://192.168.2.36:45455/"
  liste = []
  
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  }

  ionViewWillEnter() {


      this.socket.connection.start().then(x=>{
        this.socket.connection.on("SetConnectionId",x=>{
          console.log(x);
          this.http.post(this.apiUrl+"api/user/connect",{
            Username:this.userS.userInformation['username'],
            ConnectionId:x
          },this.httpOptions).subscribe(x=>{})
        })    
    
        this.socket.connection.on("Notify",x=>{;
          this.liste = x
        })
      });
      
    
  }

  ionViewDidEnter() {
   
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

            this.http.post("https://192.168.2.36:45455/api/room",JSON.stringify(data.roomName),this.httpOptions).subscribe(x=>{
            })
          }
        }
      ]
    });

    await alert.present();
  }

  JoinRoom(roomId){

    this.router.navigate(['/room/'+roomId])
    this.socket.connection.off("Notify")
   


  }

  ngOnInit() {



  }



}
