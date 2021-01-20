import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

export class User {
  email: string;
  password: string;
  phone: string;
  name: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  public user:User = new User();

  constructor(
    public router: Router,
    public toastCtrl: ToastController,
    public afAuth: AngularFireAuth) { }

  ngOnInit() {
  }

  async register() {
    try {
      if (!this.user.email){
        this.toastMessage('Email address is required.');
        return;
      }else if (!this.user.password){
        this.toastMessage('Password is required.');
        return;
      }else if (!this.user.phone){
        this.toastMessage('Phone number is required.');
        return;
      }
      var r = await this.afAuth.auth.createUserWithEmailAndPassword(
        this.user.email,
        this.user.password
      );
      if (r) {
        this.toastMessage('Please check your email and verify your account.')
        console.log("Successfully registered!");
        console.log(r);
        console.log('UID: '+r.user.uid);
        console.log('Email: '+r.user.email);
        let user = this.afAuth.auth.currentUser;
        user.sendEmailVerification();
        this.router.navigate(['/login']);
      }
    } catch (err) {
      this.toastMessage('Oops! '+err.message);
      // console.error(err.message);
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
