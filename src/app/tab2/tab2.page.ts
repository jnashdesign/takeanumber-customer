import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {
  public restaurantName;
  public restaurantLogo;
  public firebaseName;
  public restaurantMenu;
  constructor(
    private menu: MenuController,
    public afd: AngularFireDatabase,
    public storage: Storage,
    public router: Router) {
  }

  async ionViewWillEnter(){
    // if (!this.storage.get('firebaseName')){
    //   this.router.navigate(['/choose-restaurant']);
    // }else {
      this.firebaseName = await this.storage.get('firebaseName');
      this.restaurantLogo = await this.storage.get('restaurantLogo');
    // }

    this.afd.object('restaurants/' + this.firebaseName + '/client_info')
    .valueChanges().subscribe((res:any) => {     
      if (res.menu){
        this.restaurantMenu = res.menu.replace(/['"]+/g, '');
      }
    });
  }

  openFirst() {
    this.menu.enable(true, 'first');
      this.menu.toggle('first');
  }
}
