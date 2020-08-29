import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-choose-restaurant',
  templateUrl: './choose-restaurant.page.html',
  styleUrls: ['./choose-restaurant.page.scss'],
})
export class ChooseRestaurantPage {

  public restaurants: any;
  public testInfo: any;
  public itemList: any;
  public restaurantName;
  public restaurantLogo;
  public restaurantSite;
  public restaurantPhone;
  public restaurantEmail;
  public description1;
  public description2;
  public description3;
  public facebook;
  public instagram;
  public twitter;

  constructor(
    public afd: AngularFireDatabase,
    public router: Router,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController) {
      this.getRestaurants();
    }

  ionViewDidEnter(){
    // setTimeout(function(){
    //   if (localStorage.getItem('firebaseName')){
    //     let firebaseName = localStorage.getItem('firebaseName');
    //     $('#'+firebaseName).addClass('selected');
    //   }
    // }, 10)
  }

  getRestaurants(){
   this.afd.list('/restaurants/').valueChanges()
    .subscribe(data => {
      this.restaurants = data;
    });
  }

  selectRestaurant(firebaseName, restaurantLogo) {

    if (localStorage.getItem('firebaseName') && firebaseName !== localStorage.getItem('firebaseName')){
      this.areYouSure(firebaseName, restaurantLogo);
    }else{
      this.changeRestaurantInfo(firebaseName, restaurantLogo);
    }
  }

  changeRestaurantInfo(firebaseName, restaurantLogo){
    localStorage.setItem('firebaseName',firebaseName);
    localStorage.setItem('restaurantLogo', restaurantLogo);
    this.itemList = this.afd.list('/restaurants/' + localStorage.getItem('firebaseName') + '/' + localStorage.getItem('date') + '/').valueChanges();
    this.getRestaurantData(localStorage.getItem('firebaseName')).then(() =>{
        this.router.navigate(['/tabs/tab3']);
    });
  }

  async areYouSure(firebaseName, restaurantLogo) {
    // Create the popup
    const toast = await this.toastCtrl.create({
      header: 'Are you sure you want to change restaurants?',
      message: 'If you have an open order, you will lose your spot in line and your order will be cancelled.',
      position: 'top',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (localStorage.getItem('myID')){
              this.markCancelled();
            }
            this.changeRestaurantInfo(firebaseName, restaurantLogo);
          }
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            return;
          }
        }
      ]
    });

    // Present the popup
    toast.present();
  }

  dismiss(){
    if (!localStorage.getItem('firebaseName')){
      this.youMustPickARestaurant();
    }else{
      this.router.navigate(['/tabs/tab1']);
    }
  }

  async youMustPickARestaurant() {
    // Create the popup
    const toast = await this.toastCtrl.create({
      header: 'Choose A Restaurant',
      message: 'You Have to Choose A Restaurant.',
      position: 'top',
      buttons: [
        {
          text: 'Got it',
          role: 'cancel',
          handler: () => {
            console.log('User told to pick a restaurant.');
            return;
          }
        }
      ]
    });

    // Present the popup
    toast.present();
  }

  getRestaurantData(firebaseName) {
    this.afd.object('restaurants/' + firebaseName + '/client_info')
    .valueChanges().subscribe((res:any) => {
      console.log(res);
      // Set the main stuff
      this.restaurantName = res.restaurantName;
      localStorage.setItem('restaurantName', res.restaurantName);

      this.restaurantLogo = res.restaurantLogo;
      localStorage.setItem('restaurantLogo', res.restaurantLogo);

      // Check for website
      if (res.site){
        this.restaurantSite = res.site;
        localStorage.setItem('restaurantSite', res.site);
      }

      // Check for phone
      if (res.phone){
        this.restaurantPhone = res.phone;
        localStorage.setItem('restaurantPhone', res.phone);
      }

      // Check for email
      if (res.email){
        this.restaurantEmail = res.email;
        localStorage.setItem('restaurantEmail', res.email);
      }

      // Check for 1st paragraph of description     
      if (res.description1){
        this.description1 = res.description1;
        localStorage.setItem('description1', res.description1); 
      }

      // Check for 2nd paragraph of description     
      if (res.description2){
        this.description2 = res.description2;
        localStorage.setItem('description2', res.description2);
      }

      // Check for 3rd paragraph of description
      if(res.description3){
        this.description3 = res.description3;
        localStorage.setItem('description3', res.description3);
      }

      // Check for social links
      if (res.facebook){
        this.facebook = res.facebook;
        localStorage.setItem('facebook', res.facebook);
      }

      if (res.instagram){
        this.instagram = res.instagram;
        localStorage.setItem('instagram', res.instagram);
      }

      if (res.twitter){
        this.twitter = res.twitter;
        localStorage.setItem('twitter', res.twitter);
      }
    });
    return Promise.resolve();
  }

  markCancelled() {
    this.afd.object('/restaurants/' + localStorage.getItem('firebaseName') + '/' + localStorage.getItem('date') + '/' + localStorage.getItem('timeStamp') + '_' + localStorage.getItem('name'))
      .update({
        status: 'cancelled'
      });
      localStorage.removeItem('myID');
      localStorage.removeItem('name');
      localStorage.removeItem('timeStamp');
      localStorage.removeItem('date');
      localStorage.removeItem('time');
      localStorage.setItem('status','start');
  }

}
