import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

export class User {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public user:User = new User();

  constructor(
    public router: Router,
    public toastCtrl: ToastController,
    public afAuth: AngularFireAuth) { }

  ngOnInit() {
  }

  async login() {
    try {
      var r = await this.afAuth.auth.signInWithEmailAndPassword(
        this.user.email,
        this.user.password
      );
      if (r) {
        if (r.user.emailVerified){
          this.toastMessage('Successfully logged in!');
          this.router.navigate(['/login']);
        }else{
          this.toastMessage('Please verify your email.');
        }
        console.log(r);
      }
    } catch (err) {
      console.error(err);
    }
  }

dismiss(){
  this.router.navigate(['/tabs/account']);
}

async toastMessage(message) {
  const alert = await this.toastCtrl.create({
    message: message,
    cssClass: 'toastController',
    duration: 3000      
  });
  alert.present(); //update
}

}