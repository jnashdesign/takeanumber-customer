import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Platform, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
declare var $: any;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

export class Tab3Page {
  public restaurantName;
  public description1;
  public description2;
  public description3;
  public restaurantLogo;
  public restaurantEmail;
  public restaurantSite;
  public restaurantPhone;
  public facebook;
  public instagram;
  public twitter;
  public firebaseName;
  public openStatus;
  public openStatusTxt;
  public address;
  public hours;

  constructor(
    public afd: AngularFireDatabase,
    public router: Router,
    private menu: MenuController,
    private storage: Storage,
    public plt: Platform) {
      this.plt.ready().then(() => {
              this.setData();
      });
    }

    async ionViewWillEnter(){
      // if (!this.storage.get('firebaseName')){
      //   this.router.navigate(['/choose-restaurant']);
      // }else {
        this.firebaseName = await this.storage.get('firebaseName');
      // }
      setTimeout(() => {
        this.setData();
       }, 500);

       if (this.storage.get('status')){
        $('ion-button.checkStatus').text('Check Order Status')
       }else{
        $('ion-button.checkStatus').text('Get A Number')
       }
       this.getRestaurantData();
    }

    openFirst() {
      this.menu.enable(true, 'first');
        this.menu.toggle('first');
    }

    getRestaurantData(){
      this.afd.object('restaurants/' + this.firebaseName + '/client_info')
      .valueChanges().subscribe(async (res:any) => {
        if (res.openStatus){
          this.openStatus = res.openStatus;
          if (this.openStatus == 'open'){
            this.openStatusTxt = 'Open';
          }else if (this.openStatus == 'closed'){
            this.openStatusTxt = 'Closed';
          }else if (this.openStatus == 'notTakingOrders'){
            this.openStatusTxt = 'Not Taking Orders';
          }else if (this.openStatus == 'soldOut'){
            this.openStatusTxt = 'Sold Out';
          }else{
            this.openStatusTxt = 'Open';
          }
        }
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
    }


    async setData(){
      console.log('setDataRan');
      // Set the main stuff
      this.restaurantName = await this.storage.get('restaurantName');
      this.restaurantLogo = await this.storage.get('restaurantLogo');

      // Check for address
      if (this.storage.get('address')){
        this.address = await this.storage.get('address');
      }

      // Check for hours
      if (this.storage.get('hours')){
        this.hours = await this.storage.get('hours');
      }

      // Check for website
      if (this.storage.get('restaurantSite')){
        this.restaurantSite = await this.storage.get('restaurantSite');
      }

      // Check for phone
      if (this.storage.get('restaurantPhone')){
        this.restaurantPhone = await this.storage.get('restaurantPhone');
      }

      // Check for email
      if (this.storage.get('restaurantEmail')){
        this.restaurantEmail  = await this.storage.get('restaurantEmail');
      }

      // Check for 1st paragraph of description     
      if (this.storage.get('description1')){
        this.description1 = await this.storage.get('description1'); 
      }
      // Check for 2nd paragraph of description     
      if (this.storage.get('description2')){
        this.description2 = await this.storage.get('description2');  
      }
      // Check for 3rd paragraph of description
      if(this.storage.get('description3')){
        this.description3 = await this.storage.get('description3');  
      }

      // Check for social links
      if (this.storage.get('facebook')){
        this.facebook = await this.storage.get('facebook');
      }
      if (this.storage.get('instagram')){
        this.instagram = await this.storage.get('instagram');
      }
      if (this.storage.get('twitter')){
        this.twitter = await this.storage.get('twitter');
      }
    }
}
