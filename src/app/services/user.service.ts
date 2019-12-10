import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { reject } from 'q';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  public apiUrl = "https://192.168.2.36:45455/"
  ngOnInit() {
  }

  userInformation;
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
      console.log(x);
      resolve(true);
    }
    resolve(false);
  })
   })
  }
}
