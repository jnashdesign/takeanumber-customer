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
    }

    setData(){
      console.log('setDataRan');

      // Set the main stuff
      this.restaurantName = localStorage.getItem('restaurantName');
      this.restaurantLogo = localStorage.getItem('restaurantLogo');

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
