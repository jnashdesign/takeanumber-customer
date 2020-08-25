import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {
  public restaurantName;
  public restaurantLogo;
  public firebaseName;
  public menu;


  constructor(public afd: AngularFireDatabase) {
    this.firebaseName = localStorage.getItem('firebaseName');
    this.afd.object('restaurants/' + this.firebaseName + '/client_info')
    .valueChanges().subscribe((res:any) => {
      console.log(res);
      this.restaurantLogo = res.restaurantLogo.replace(/['"]+/g, '');
      
      if (res.menu){
        this.menu = res.menu.replace(/['"]+/g, '');
      }
    });

  }


}
