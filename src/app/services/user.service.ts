import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocketService } from './socket.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient,private socket:SocketService,private storage:Storage) { }

  public apiUrl = "https://192.168.2.36:45456/"
  isAdmin = false;
  
  ngOnInit() {
  }

  userInformation;
  userConnectionId;

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  }


  public Login(user,pass){
   return new Promise((resolve,reject) =>{
    this.http.post(this.apiUrl+"api/user",{
      Username:user,
      Password:pass
  },this.httpOptions).subscribe(x=>{
    if(x){
      this.userInformation = x;
      
      this.storage.set("userinfo",this.userInformation);
      console.log(x);
      resolve(true);
    }
    resolve(false);
  })
   })
  }
}
