import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
declare var $: any;


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  public restaurantName;
  public restaurantLogo;
  public firebaseUID;
  public firebaseName;
  public loggedIn;
  public name;
  public email;
  public phone;
  public optIn;

  constructor(
    public afAuth: AngularFireAuth,
    public afd: AngularFireDatabase,
    public storage: Storage,
    public toastCtrl: ToastController,
    public router: Router) { }

  ngOnInit() {
  }

  logout() {
    // Firebase Log Out
    this.afAuth.auth.signOut();
  }

  async ionViewWillEnter(){
    // Check for FirebaseUID
    if (this.storage.get('firebaseUID')){
      this.firebaseUID = await this.storage.get('firebaseUID');
      this.firebaseUID.replace(/['"]+/g, '');
     await this.storage.set('loggedIn','true');
    }
    // Check for Phone Number
    if (this.storage.get('phoneNumber')){
      this.phone = await this.storage.get('phoneNumber');
      console.log(this.phone);
      $('#phoneInput').val(this.phone);
    }
    // Check for Email
    if (this.storage.get('email')){
      this.email = await this.storage.get('email');
      console.log(this.email);
      $('#emailInput').val(this.email);
    }
    // Check for Name
    if (this.storage.get('name')){
      this.name = await this.storage.get('name');
      console.log(this.name);
      $('#nameInput').val(this.name);
    }
    // Check for Opt In
    if (await this.storage.get('optInMessages') == 'true'){
      this.optIn = true;
    }else{
      this.optIn = false;
     await this.storage.set('optInMessages','false');
    }
    // Check for Restaurant Info
    if (!this.storage.get('firebaseName')){
      this.router.navigate(['/choose-restaurant']);
    }else {
      this.firebaseName = await this.storage.get('firebaseName');
      this.restaurantLogo = await this.storage.get('restaurantLogo');
    }
    // Check for Loged In Status
    if (await this.storage.get('loggedIn') == 'true'){
      this.loggedIn = true;
    }else{
      this.loggedIn = false;
     await this.storage.set('loggedIn','false');
    }
  }

  login(){
    // Launch Log In Page
    this.router.navigate(['/login']);
  }

  signup(){
    // Launch Sign Up Page
    this.router.navigate(['/signup']);
  }

  async save(){ 
   // Create payload to be updated 
    let payload = {
      "name" : $('#nameInput').val(),
      "email" : $('#emailInput').val(),
      "phone" : $('#phoneNumber').val()
    }
    // Update firebase
    this.afd.object('/users/customers/' + this.firebaseUID)
    .update(payload)
    .then(resolve => {
      // If resolved, show Success Message
      this.savedMessage('success');
    }, reject => {
      // If rejected, show Error Message
      this.savedMessage('error');
    })
    .catch(reject => {
      // If rejected, show Error Message
      this.savedMessage('error');
    });

    // Update localStorage
   await this.storage.set('name', $('#nameInput').val());
    this.name = $('#nameInput').val();
   await this.storage.set('email', $('#emailInput').val());
    this.email = $('#emailInput').val();
   await this.storage.set('phoneNumber',$('#phoneInput').val());
    this.phone = $('#phoneInput').val();
  }

  async savedMessage(status) {
    // Create message variable
    let message;
    // Check for status and display message accordingly
    if (status == 'success'){
      message = 'Saved successfully!'
    }else{
      message = 'Oops! An error occurred';
    }
    // Create toast variable
    const alert = await this.toastCtrl.create({
      message: message,
      cssClass: 'toastController',
      duration: 3000      
    });
    // Show toast
    alert.present(); //update
  }

}