import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Component } from '@angular/core';
import * as firebase from 'firebase';
import { environment } from '../environments/environment';
import { FcmService } from './services/fcm.service';

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
    private fcmService: FcmService
  ) {
    this.initializeApp();
  }

  title = 'app';
  elementType = 'url';
  value = 'Techiediaries';


  initializeApp() {
    this.platform.ready().then(() => {
      setTimeout(() =>{
        console.log('platform ready');
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.fcmService.initPush();  
      }, 300)
    });
    firebase.initializeApp(environment.firebaseConfig);
  }
}
