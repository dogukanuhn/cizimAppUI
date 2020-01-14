import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(public userService:UserService,private router:Router,private storage:Storage) { }

  ngOnInit() {
  }

  username;

  Login(user : string){
      if(user.length > 3){
        this.userService.userInformation['username'] = user;
        this.storage.set('username',user);
        this.router.navigate(['/lobby']);
     
      }

  }

}
