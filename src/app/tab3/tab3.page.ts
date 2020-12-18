import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
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
    public plt: Platform) {
      this.plt.ready().then(() => {
              this.setData();
      });
    }

    ionViewWillEnter(){
      if (!localStorage.getItem('firebaseName')){
        this.router.navigate(['/choose-restaurant']);
      }else {
        this.firebaseName = localStorage.getItem('firebaseName');
      }
      setTimeout(() => {
        this.setData();
       }, 500);

       if (localStorage.getItem('status')){
        $('ion-button.checkStatus').text('Check Order Status')
       }else{
        $('ion-button.checkStatus').text('Get A Number')
       }
       this.getRestaurantData();
    }

    getRestaurantData(){
      this.afd.object('restaurants/' + this.firebaseName + '/client_info')
      .valueChanges().subscribe((res:any) => {
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
          localStorage.setItem('address',res.address);
        }
  
        if (res.hours){
          this.hours = res.hours;
          localStorage.setItem('hours',res.hours);
        }
  
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
    }


    setData(){
      console.log('setDataRan');
      // Set the main stuff
      this.restaurantName = localStorage.getItem('restaurantName');
      this.restaurantLogo = localStorage.getItem('restaurantLogo');

      // Check for address
      if (localStorage.getItem('address')){
        this.address = localStorage.getItem('address');
      }

      // Check for hours
      if (localStorage.getItem('hours')){
        this.hours = localStorage.getItem('hours');
      }

      // Check for website
      if (localStorage.getItem('restaurantSite')){
        this.restaurantSite = localStorage.getItem('restaurantSite');
      }

      // Check for phone
      if (localStorage.getItem('restaurantPhone')){
        this.restaurantPhone = localStorage.getItem('restaurantPhone');
      }

      // Check for email
      if (localStorage.getItem('restaurantEmail')){
        this.restaurantEmail  = localStorage.getItem('restaurantEmail');
      }

      // Check for 1st paragraph of description     
      if (localStorage.getItem('description1')){
        this.description1 = localStorage.getItem('description1'); 
      }
      // Check for 2nd paragraph of description     
      if (localStorage.getItem('description2')){
        this.description2 = localStorage.getItem('description2');  
      }
      // Check for 3rd paragraph of description
      if(localStorage.getItem('description3')){
        this.description3 = localStorage.getItem('description3');  
      }

      // Check for social links
      if (localStorage.getItem('facebook')){
        this.facebook = localStorage.getItem('facebook');
      }
      if (localStorage.getItem('instagram')){
        this.instagram = localStorage.getItem('instagram');
      }
      if (localStorage.getItem('twitter')){
        this.twitter = localStorage.getItem('twitter');
      }
    }
}
