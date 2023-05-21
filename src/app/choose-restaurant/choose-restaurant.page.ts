import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

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
  public hours;
  public address;

  constructor(
    public afd: AngularFireDatabase,
    public router: Router,
    public storage: Storage,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController) {
      this.getRestaurants();
    }

  ionViewDidEnter(){
    // setTimeout(function(){
    //   if (this.storage.get('firebaseName')){
    //     let firebaseName = await this.storage.get('firebaseName');
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

  async selectRestaurant(firebaseName, restaurantLogo) {
    if (this.storage.get('firebaseName') && firebaseName !== await this.storage.get('firebaseName')){
      this.areYouSure(firebaseName, restaurantLogo);
    }else{
      this.changeRestaurantInfo(firebaseName, restaurantLogo);
    }
  }

  async changeRestaurantInfo(firebaseName, restaurantLogo){
   await this.storage.set('firebaseName',firebaseName);
   await this.storage.set('restaurantLogo', restaurantLogo);
    this.itemList = this.afd.list('/restaurants/' + await this.storage.get('firebaseName') + '/' +await this.storage.get('date') + '/').valueChanges();
    this.getRestaurantData(this.storage.get('firebaseName')).then(() =>{
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
            if (this.storage.get('myID')){
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
    if (!this.storage.get('firebaseName')){
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
    .valueChanges().subscribe(async (res:any) => {
      console.log(res);
      // Set the main stuff
      this.restaurantName = res.restaurantName;
     await this.storage.set('restaurantName', res.restaurantName);

      this.restaurantLogo = res.restaurantLogo;
     await this.storage.set('restaurantLogo', res.restaurantLogo);

      if (res.address){
        this.address = res.address;
       await this.storage.set('address',res.address);
      }

      if (res.hours){
        this.hours = res.hours;
       await this.storage.set('hours',res.hours);
      }

      // Check for website
      if (res.site){
        this.restaurantSite = res.site;
       await this.storage.set('restaurantSite', res.site);
      }

      // Check for phone
      if (res.phone){
        this.restaurantPhone = res.phone;
       await this.storage.set('restaurantPhone', res.phone);
      }

      // Check for email
      if (res.email){
        this.restaurantEmail = res.email;
       await this.storage.set('restaurantEmail', res.email);
      }

      // Check for 1st paragraph of description     
      if (res.description1){
        this.description1 = res.description1;
       await this.storage.set('description1', res.description1); 
      }

      // Check for 2nd paragraph of description     
      if (res.description2){
        this.description2 = res.description2;
       await this.storage.set('description2', res.description2);
      }

      // Check for 3rd paragraph of description
      if(res.description3){
        this.description3 = res.description3;
       await this.storage.set('description3', res.description3);
      }

      // Check for social links
      if (res.facebook){
        this.facebook = res.facebook;
       await this.storage.set('facebook', res.facebook);
      }

      if (res.instagram){
        this.instagram = res.instagram;
       await this.storage.set('instagram', res.instagram);
      }

      if (res.twitter){
        this.twitter = res.twitter;
       await this.storage.set('twitter', res.twitter);
      }
    });
    return Promise.resolve();
  }

  async markCancelled() {
    this.afd.object('/restaurants/' + await this.storage.get('firebaseName') + '/' + await this.storage.get('date') + '/' + await this.storage.get('timeStamp') + '_' + await this.storage.get('name'))
      .update({
        status: 'cancelled'
      });
     await this.storage.remove('myID');
     await this.storage.remove('name');
     await this.storage.remove('timeStamp');
     await this.storage.remove('date');
     await this.storage.remove('time');
     await this.storage.set('status','start');
  }

}
