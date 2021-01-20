import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
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
    public toastCtrl: ToastController,
    public router: Router) { }

  ngOnInit() {
  }

  logout() {
    // Firebase Log Out
    this.afAuth.auth.signOut();
  }

  ionViewWillEnter(){
    // Check for FirebaseUID
    if (localStorage.getItem('firebaseUID')){
      this.firebaseUID = localStorage.getItem('firebaseUID').replace(/['"]+/g, '');
      localStorage.setItem('loggedIn','true');
    }
    // Check for Phone Number
    if (localStorage.getItem('phoneNumber')){
      this.phone = localStorage.getItem('phoneNumber');
      console.log(this.phone);
      $('#phoneInput').val(this.phone);
    }
    // Check for Email
    if (localStorage.getItem('email')){
      this.email = localStorage.getItem('email');
      console.log(this.email);
      $('#emailInput').val(this.email);
    }
    // Check for Name
    if (localStorage.getItem('name')){
      this.name = localStorage.getItem('name');
      console.log(this.name);
      $('#nameInput').val(this.name);
    }
    // Check for Opt In
    if (localStorage.getItem('optInMessages') == 'true'){
      this.optIn = true;
    }else{
      this.optIn = false;
      localStorage.setItem('optInMessages','false');
    }
    // Check for Restaurant Info
    if (!localStorage.getItem('firebaseName')){
      this.router.navigate(['/choose-restaurant']);
    }else {
      this.firebaseName = localStorage.getItem('firebaseName');
      this.restaurantLogo = localStorage.getItem('restaurantLogo');
    }
    // Check for Loged In Status
    if (localStorage.getItem('loggedIn') == 'true'){
      this.loggedIn = true;
    }else{
      this.loggedIn = false;
      localStorage.setItem('loggedIn','false');
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
    localStorage.setItem('name', $('#nameInput').val());
    this.name = $('#nameInput').val();
    localStorage.setItem('email', $('#emailInput').val());
    this.email = $('#emailInput').val();
    localStorage.setItem('phoneNumber',$('#phoneInput').val());
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