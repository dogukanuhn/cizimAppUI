import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage  {

  constructor(public http:HttpClient,public router:Router,private userService:UserService) { }
  
  Login(user,pass){
    this.userService.Login(user,pass).then(x=>{
      if(x){
        this.router.navigate(['/lobby']);
      }
    });
  }

}
