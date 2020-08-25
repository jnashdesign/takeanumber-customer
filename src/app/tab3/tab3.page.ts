import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

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

  constructor(
    public afd: AngularFireDatabase) {
      localStorage.setItem('firebaseName','bellsSweetFactory');
      this.setData(localStorage.getItem('firebaseName'));
    }

  setData(firebaseName){
    this.afd.object('restaurants/' + firebaseName + '/client_info')
    .valueChanges().subscribe((res:any) => {

      // Set the main stuff
      this.restaurantName = res.restaurantName.replace(/['"]+/g, '');
      this.restaurantLogo = res.restaurantLogo.replace(/['"]+/g, '');

      // Check for website
      if (res.site){
        this.restaurantSite = res.site.replace(/['"]+/g, '');
      }

      // Check for phone
      if (res.phone){
        this.restaurantPhone = res.phone.replace(/['"]+/g, '');
      }

      // Check for email
      if (res.email){
        this.restaurantEmail  = res.email.replace(/['"]+/g, '');
      }

      // Check for 1st paragraph of description     
      if (res.description1){
        this.description1 = res.description1.replace(/['"]+/g, ''); 
      }
      // Check for 2nd paragraph of description     
      if (res.description2){
        this.description2 = res.description2.replace(/['"]+/g, '');  
      }
      // Check for 3rd paragraph of description
      if(res.description3){
        this.description3 = res.description3.replace(/['"]+/g, '');  
      }

      // Check for social links
      if (res.facebook){
        this.facebook = res.facebook;
      }
      if (res.instagram){
        this.instagram = res.instagram;
      }
      if (res.twitter){
        this.twitter = res.twitter;
      }
    });
  }

}
