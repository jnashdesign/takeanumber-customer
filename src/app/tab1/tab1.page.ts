import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Tab2Page } from '../tab2/tab2.page';
import { Component } from "@angular/core";
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  // Static variables
  public restaurantName: string;
  public description: string;
  public restaurantLogo: string;

  // Array variables
  public itemList: any;
  public numItems: any;
  public restaurants: any;
  public items = [];
  public presentModalVar;

  // String variables
  public timeStamp: any;
  public tab: string;
  public myID: string;
  public date: string;
  public time: string;
  public name: string;
  public status: string;
  public firebaseName: string;

  // Status total arrays
  public waitingCustomers: Number = 0;
  public inProgressOrders: Number = 0;
  public completedOrders: Number = 0;
  public cancelledOrders: Number = 0;
  public errorOrders: Number = 0;
  public onHoldOrders: Number = 0;
  public readyOrders: Number = 0;
  public startingCustomers: Number = 0;

  constructor(
    public afd: AngularFireDatabase,
    private toastCtrl: ToastController,
    public router: Router,
    public modalController: ModalController,
    public storage: Storage) {
      this.getRestaurants();
      this.checkDate();
  }

  ionViewWillEnter(){
    this.checkDate();
    this.restaurantLogo = localStorage.getItem('restaurantLogo');
    if (!localStorage.getItem('firebaseName')){
      this.router.navigate(['/choose-restaurant']);
    }else {
      this.firebaseName = localStorage.getItem('firebaseName');
      this.setData(this.firebaseName);
    }

  // Set default tab
  this.tab = 'myNumber';

  // Get the current date
  this.getItems(this.getCurrentDate());

  // Get localStorage Info
  this.getLocalStorageInfo();

  }

  checkDate(){
    if (localStorage.getItem('date') && localStorage.getItem('date') !== this.getCurrentDate()){
      console.log('dates mismatch')
      localStorage.removeItem('myID');
      this.myID = null;
      localStorage.removeItem('name');
      this.name = null;
      localStorage.removeItem('timeStamp');
      this.timeStamp = null;
      localStorage.removeItem('status');
      this.status = null;
      localStorage.removeItem('date');
      this.date = null;
      localStorage.removeItem('time');
      this.time = null;
    }
  }

  setData(firebaseName){
    this.afd.object('restaurants/' + firebaseName + '/client_info')
    .valueChanges().subscribe((res:any) => {
      this.restaurantLogo = res.restaurantLogo.replace(/['"]+/g, '');
    });
  }

  getCurrentDate() {
    // Get date info
    let d = new Date;
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let year = d.getFullYear();
    let date = month + '-' + day + '-' + year;

    return date;
  }

  getRestaurants(){
    //  this.restaurants = this.afd.list('/restaurants/').valueChanges();
     this.afd.list('/restaurants/').valueChanges()
      .subscribe(data => {
        this.restaurants = data;
        console.log(this.restaurants);
      });
    }

  selectRestaurant() {
    localStorage.setItem('pageRoute','/tabs/tab1');
      this.router.navigate(['/choose-restaurant']);
  }

  getItems(date) {
    this.firebaseName = localStorage.getItem('firebaseName');
    // Pull items from Firebase to be displayed
    this.itemList = this.afd.list('/restaurants/' + this.firebaseName + '/' + date + '/').valueChanges();
    this.afd.list('/restaurants/' + this.firebaseName + '/' + date + '/').valueChanges()
      .subscribe(data => {
        this.numItems = data.length + 1;
      });
    this.getMyData();

    this.getOrderData('start');
    this.getOrderData('waiting');
    this.getOrderData('ready');
    this.getOrderData('on-hold');
    this.getOrderData('in-progress');
    this.getOrderData('complete');
  }

  getMyData(){
    // Get completed orders
    this.afd.list('/restaurants/' + this.firebaseName + '/' + this.getCurrentDate() + '/')
      .snapshotChanges().subscribe((res) => {
        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e.payload.val());

          if (!localStorage.getItem('timeStamp')){
            return;
          }else{
            $(tempArray).each(function(i,res){
              if (res.timeStamp == localStorage.getItem('timeStamp')){
  
              localStorage.setItem('myID',res.id);
              localStorage.setItem('date',res.date);
              localStorage.setItem('name',res.name);
              localStorage.setItem('status',res.status);
              localStorage.setItem('time',res.time_gotNumber);
              localStorage.setItem('timeStamp',res.timeStamp);

              this.status = localStorage.getItem('status');

              if (this.status == 'start'){
                localStorage.removeItem('acknowledged');
                $('#currentStatus').removeClass().addClass('step1');
              }else if (this.status == 'waiting'){
                localStorage.removeItem('acknowledged');
                $('#currentStatus').removeClass().addClass('step2');
                this.tab = 'waiting';
              }else if (this.status == 'ready'){
                if (!localStorage.getItem('acknowledged')){
                  $('.readyToOrderNotice').removeClass('hide');
                }
                $('#currentStatus').removeClass().addClass('step3');
              }else if (this.status == 'in-progress'){
                localStorage.removeItem('acknowledged');
                $('#currentStatus').removeClass().addClass('step4');
              }else if (this.status == 'complete'){
                $('#currentStatus').removeClass().addClass('step5');
                if (!localStorage.getItem('acknowledged')){
                  $('.completeNotice').removeClass('hide');
                }
              }else if (this.status == 'on-hold'){
                localStorage.removeItem('acknowledged');
                $('#currentStatus').removeClass().addClass('step2').addClass('on-hold');
              }
            }
            return;
          });
        }
      });
    });
  }

  getOrderData(status) {
    // Get completed orders
    this.afd.list('/restaurants/' + this.firebaseName + '/' + this.getCurrentDate() + '/',
      ref => ref.orderByChild('status').equalTo(status))
      .snapshotChanges().subscribe((res) => {
        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e.payload.val());
      });
      this.updateTotals(status, tempArray);
    });
  }

  updateTotals(status, tempArray){
    if (status == 'start') {
      this.startingCustomers = tempArray.length;
    }
    if (status == 'waiting') {
      this.waitingCustomers = tempArray.length;
    }
    if (status == 'ready') {
      this.readyOrders = tempArray.length;
    }
    if (status == 'on-hold') {
      this.onHoldOrders = tempArray.length;
    } 
    if (status == 'in-progress') {
      this.inProgressOrders = tempArray.length;
    } 
    if (status == 'completed') {
      this.completedOrders = tempArray.length;
    } 
    if (status == 'cancelled') {
      this.cancelledOrders = tempArray.length;
    }
  }

  addItem() {
    // Get customer name field input
    let name: string = $('#nameInput').val();
    name = name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

    // Throw error if name is not provided.
    if (!name) {
      this.presentToast('Oops!', 'Name is required.');
      return;
    }

    localStorage.removeItem('name');
    localStorage.removeItem('date');
    localStorage.removeItem('time');
    localStorage.removeItem('myID');
    localStorage.removeItem('status');

    let date = this.getCurrentDate();
    let time = this.getTime();

    // Create a timestamp to append to the Firebase entry 
    // to ensure they stay chronological
    let newDate = new Date();
    this.timeStamp = newDate.getTime();
    localStorage.setItem('timeStamp', this.timeStamp);
    this.firebaseName = localStorage.getItem('firebaseName');

    this.afd.list('/restaurants/' + this.firebaseName + '/' + date + '/').valueChanges()
      .subscribe(data => {
        this.numItems = data.length + 1;
      });

    // Push data to Firebase
    this.afd.object('/restaurants/' + this.firebaseName + '/' + date + '/' + this.timeStamp + '_' + name)
      .update({
        date: date,
        name: name,
        id: this.numItems,
        time_gotNumber: time,
        timeStamp: this.timeStamp,
        status: 'waiting'
      });

    this.name = name;
    localStorage.setItem('name', this.name);

    this.date = date;
    localStorage.setItem('date', this.date);

    this.time = time;
    localStorage.setItem('time', this.time);

    this.myID = this.numItems;
    localStorage.setItem('myID', this.myID);

    this.status = 'waiting';
    localStorage.setItem('status',this.status);

    // Disable creation button to prevent duplicates
    $('.reseveASpotBtn').attr('disabled', true);
    // Change Cancel button to Done
    $('.doneBtn').html('Done');
  }

  // Define popup function collecting 
  // header and message params.
  async presentToast(messageHeader, message) {
    // Create the popup
    const toast = await this.toastCtrl.create({
      header: messageHeader,
      message: message,
      position: 'top',
      buttons: [{
          text: 'Got it!',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
    });

    // Present the popup
    toast.present();
  }

  getTime(){
    // Get time info.
    let d = new Date;
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let minutesString;
    let time;

    // Check whether AM or PM 
    var newformat = hours >= 12 ? 'PM' : 'AM';

    // Find current hour in AM-PM Format 
    hours = hours % 12;

    // To display "0" as "12" 
    hours = hours ? hours : 12;
    minutesString = minutes < 10 ? '0' + minutes : minutes;

    // Format the date and time
    time = hours + ':' + minutesString + ' ' + newformat;
    
    return time;  
  }

  markCancelled() {
    this.date = localStorage.getItem('date');
    this.name = localStorage.getItem('name');
    this.timeStamp = localStorage.getItem('timeStamp');
    this.afd.object('/restaurants/' + this.firebaseName + '/' + this.date + '/' + this.timeStamp + '_' + this.name)
      .update({
        status: 'cancelled'
      });
    this.status = 'cancelled';
    $('#currentStatus').removeClass().addClass('step1');
    this.name = null;
    this.date = null;
    this.timeStamp = null;
    this.time = null;
    localStorage.clear();
  }

  async areYouSure() {
    // Create the popup
    const toast = await this.toastCtrl.create({
      header: 'Are you sure you want to cancel?',
      message: 'You will lose your spot in line and your order will be cancelled.',
      position: 'top',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.markCancelled();
          }
        },
        {
        text: 'No',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
      ]
    });

    // Present the popup
    toast.present();
  }

  getNewNumber(){
    $('#currentStatus').removeClass().addClass('step1');
    this.name = null;
    this.date = null;
    this.timeStamp = null;
    this.time = null;
    localStorage.clear();
  }

  async presentModal() {
    if (localStorage.getItem('acknowledged') == 'true'){
      // No modal necessary
    }else{
      const modal = await this.modalController.create({
        component: Tab2Page
      });
      return await modal.present();  
    }
  }

  segmentChanged(e) {
    console.log(e.detail.value);
    if (e.detail.value == 'myNumber'){
      this.getLocalStorageInfo();
    }
  }

  getLocalStorageInfo(){
    // Collect the information from localStorage
    this.myID = localStorage.getItem('myID');
    this.time = localStorage.getItem('time');
    this.name = localStorage.getItem('name');
    this.timeStamp = localStorage.getItem('timeStamp')
    this.status = localStorage.getItem('status');
    this.date = localStorage.getItem('date');
  }

  dismiss(){
    localStorage.setItem('acknowledged','true');
    $('.readyToOrderNotice').addClass('hide');
    $('.completeNotice').addClass('hide');
  }

}