import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userS:UserService,
    private storage:Storage,
    private router:Router
    
  ) {

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.storage.get("userinfo").then(x=>{
      //   if(x){
      //     this.router.navigate(['/home']);
      //     this.userS.userInformation = x;
      //   }
      // })

      
    
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
