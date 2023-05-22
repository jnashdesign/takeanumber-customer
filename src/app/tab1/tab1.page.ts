import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { ModalController, ToastController, MenuController } from '@ionic/angular';
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
  public openStatus: string;
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
  public acknowledged;

  // Array variables
  public itemList: any;
  public numItems: any;
  public restaurants: any;
  public items = [];
  public presentModalVar;
  public textUpdates: boolean;
  public textOption: boolean;
  public textToggle: boolean;
  public numberSaved: boolean;
  public agreeToTerms: boolean;

  // String variables
  public timeStamp: any;
  public tab: string;
  public myID: string;
  public date: string;
  public time: string;
  public name: string;
  public status: string;
  public firebaseName: string;
  public phoneNumber: string;

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
    private menu: MenuController,
    public storage: Storage) {
      // this.firebaseName = 'bellsSweetFactory';
      this.firebaseName = 'TheeKitchenBeast';
      this.getLocalStorageInfo();
      this.date = this.getCurrentDate();
      this.getRestaurantData(this.firebaseName);      
  }

  async ionViewWillEnter(){
    // Frst get today's date
    this.date = this.getCurrentDate();

    // Then check to see if you have an order 
    let orderDate = await this.storage.get('date');
    // See if it's leftover from a previous day
    if (orderDate){
      this.checkIfOrderDateIsToday(orderDate)
    }
      
    // Set default tab
    this.tab = 'myNumber';

    let myPhoneNumber = await this.storage.get('phoneNumber')
    // Set phone number if in localStorage
    if (myPhoneNumber){
      this.phoneNumber = myPhoneNumber
    }else{
      this.phoneNumber = null;
    }

    // Get the current date
    this.getItems(this.getCurrentDate());

    // Get localStorage Info
      if (this.storage.get('name')){
        let nameInput = await this.storage.get('name');
        $('#nameInput').val(nameInput);
      }

      this.setData(this.firebaseName);
  }

  async checkIfOrderDateIsToday(orderDate){
    this.timeStamp = await this.storage.get('timeStamp');
    this.myID = await this.storage.get('myID');
    this.time = await this.storage.get('time');
    let name = await this.storage.get('name');  

    if (orderDate && this.date !== orderDate){
      this.afd.object('/restaurants/' + this.firebaseName + '/' + orderDate + '/' + this.timeStamp + '_' + name)
      .update({
        status: 'completed'
      });
      this.myID = null;
      await this.storage.remove('myID');
      this.status = 'start';
      await this.storage.set('status','start');
      this.date = null;
      await this.storage.remove('date');
      this.timeStamp = null;
      await this.storage.remove('timeStamp');
      this.time = null;
      await this.storage.remove('time');
      this.phoneNumber = null;
      await this.storage.remove('phoneNumber')
      this.tab = 'myNumber';
    }
  }

  getRestaurantData(firebaseName) {
    this.afd.object('restaurants/' + firebaseName + '/client_info')
    .valueChanges().subscribe(async (res:any) => {
     await this.storage.set('firebaseName',this.firebaseName);
      // Set the main stuff
      this.restaurantName = res?.restaurantName;
     await this.storage.set('restaurantName', res?.restaurantName);

      this.restaurantLogo = res?.restaurantLogo;
     await this.storage.set('restaurantLogo', res?.restaurantLogo);

      if (res?.address){
        this.address = res?.address;
       await this.storage.set('address',res?.address);
      }

      if (res?.hours){
        this.hours = res?.hours;
       await this.storage.set('hours',res?.hours);
      }

      // Check for website
      if (res?.site){
        this.restaurantSite = res?.site;
       await this.storage.set('restaurantSite', res?.site);
      }

      // Check for phone
      if (res?.phone){
        this.restaurantPhone = res?.phone;
       await this.storage.set('restaurantPhone', res?.phone);
      }

      // Check for email
      if (res?.email){
        this.restaurantEmail = res?.email;
       await this.storage.set('restaurantEmail', res?.email);
      }

      // Check for 1st paragraph of description     
      if (res?.description1){
        this.description1 = res?.description1;
       await this.storage.set('description1', res?.description1); 
      }

      // Check for 2nd paragraph of description     
      if (res?.description2){
        this.description2 = res?.description2;
       await this.storage.set('description2', res?.description2);
      }

      // Check for 3rd paragraph of description
      if(res?.description3){
        this.description3 = res?.description3;
       await this.storage.set('description3', res?.description3);
      }

      // Check for social links
      if (res?.facebook){
        this.facebook = res?.facebook;
       await this.storage.set('facebook', res?.facebook);
      }

      if (res?.instagram){
        this.instagram = res?.instagram;
       await this.storage.set('instagram', res?.instagram);
      }

      if (res?.twitter){
        this.twitter = res?.twitter;
       await this.storage.set('twitter', res?.twitter);
      }
    });
    return Promise.resolve();
  }

  openFirst() {
    this.menu.enable(true, 'first');
      this.menu.toggle('first');
  }

  async toggleTextOptions(){
    if (this.textToggle == true){
      this.textToggle = false;
    }else{
      this.textToggle = true;
    }
  }

  // checkIfUpdated(){
  //   if (this.storage.get('lastUpdate') !== '12132020'){
  //     localStorage.clear();
  //    await this.storage.set('lastUpdate','12132020');
  //   }else{
  //     return;
  //   }
  // }


  setData(firebaseName){
    this.afd.object('restaurants/' + firebaseName + '/client_info')
    .valueChanges().subscribe((res:any) => {
      if (res?.openStatus){
        this.openStatus = res?.openStatus;
      }
      if (res?.restaurantLogo){
        this.restaurantLogo = res?.restaurantLogo.replace(/['"]+/g, '');
      }
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

  getItems(date) {
    // Pull items from Firebase to be displayed
    this.itemList = this.afd.list('/restaurants/' + this.firebaseName + '/' + date + '/').valueChanges();
    this.afd.list('/restaurants/' + this.firebaseName + '/' + date + '/').valueChanges()
      .subscribe(data => {
        this.numItems = data.length;
      });
    this.getMyData();

    let statuses = ['start','waiting','ready','on-hold','in-progress','complete'];
    statuses.forEach(status => {
      this.getOrderData(status);
    });
  }

  getMyData(){
    // Get completed orders
    this.afd.list('/restaurants/' + this.firebaseName + '/' + this.getCurrentDate() + '/')
      .snapshotChanges().subscribe((res) => {
        let tempArray: any = [];
        res?.forEach((e) => {
          tempArray.push(e.payload.val());
      });
      this.processArray(tempArray);
    });
  }

  processArray(tempArray){
    let myOrderStatus: any;
    if (this.myID){
      let index = parseInt(this.myID) - 1;
      myOrderStatus = tempArray[index].status;
      this.myID = tempArray[index].id.toString();
      this.date = tempArray[index].date;
      this.name = tempArray[index].name;
      this.status = tempArray[index].status;
      this.time = tempArray[index].time_gotNumber;
      this.timeStamp = tempArray[index].timeStamp;
      this.status = tempArray[index].status;

      this.updatetatus(myOrderStatus);
    }
  }

  async updatetatus(status){
    if (status == 'start'){
      // update status in storage
      await this.storage.set('status', status)
      await this.storage.remove('acknowledged');
      $('#currentStatus').removeClass().addClass('step1');

    }else if (status == 'waiting'){
      // update status in storage
      await this.storage.set('status', status)
      await this.storage.remove('acknowledged');
      $('#currentStatus').removeClass().addClass('step2');
      this.tab = 'waiting';

    }else if (status == 'ready'){
      // update status in storage
      await this.storage.set('status', status)
      if (!this.storage.get('acknowledged')){
        $('.readyToOrderNotice').removeClass('hide');
      }
      $('#currentStatus').removeClass().addClass('step3');

    }else if (status == 'in-progress'){
      // update status in storage
      await this.storage.set('status', status)
      await this.storage.remove('acknowledged');
      $('#currentStatus').removeClass().addClass('step4');

    }else if (status == 'complete'){
      // update status in storage
      await this.storage.set('status', 'complete')
      $('#currentStatus').removeClass().addClass('step5');

    }else if (status == 'cancelled'){
      // update status in storage
      await this.storage.set('status', 'start');
      $('#currentStatus').removeClass().addClass('step1');

    }else if (this.status == 'on-hold'){
      // update status in storage
      await this.storage.set('status', status)
      await this.storage.remove('acknowledged');
      $('#currentStatus').removeClass().addClass('step2').addClass('on-hold');
    }
  }

  getOrderData(status) {
    // Get completed orders
    this.afd.list('/restaurants/' + this.firebaseName + '/' + this.getCurrentDate() + '/',
      ref => ref.orderByChild('status').equalTo(status))
      .snapshotChanges().subscribe((res) => {
        let orders: any = [];
        res?.forEach((e) => {
          orders.push(e.payload.val());
      });
      this.updateTotals(status, orders);
    });
  }

  updateTotals(status, orders){
    if (status == 'start') {
      this.startingCustomers = orders.length;
    }
    if (status == 'waiting') {
      this.waitingCustomers = orders.length;
    }
    if (status == 'ready') {
      this.readyOrders = orders.length;
    }
    if (status == 'on-hold') {
      this.onHoldOrders = orders.length;
    } 
    if (status == 'in-progress') {
      this.inProgressOrders = orders.length;
    } 
    if (status == 'completed') {
      this.completedOrders = orders.length;
    } 
    if (status == 'cancelled') {
      this.cancelledOrders = orders.length;
    }
  }

  numbersOnly(e){
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
      return false;
    }
  }

  validateInfo(){
    // Get customer name field input
    let name: string = $('#nameInput').val();

    // Throw error if name is not provided.
    if (!name) {
      this.presentToast('Oops! Name is required.', 'We need a name to add to your number.');
    }else{
      this.validatePhoneNumber(name);
    }
  }

  async validatePhoneNumber(name){
    let mobileFormat = /^[1-9]{1}[0-9]{9}$/;
    let currentValue = $('#phoneNumberInput').val();
    if(mobileFormat.test(currentValue) == false && currentValue != 10){
        $('#phoneNumberInput').css('border-color','red').addClass('error');
        this.presentToast('Oops! Number is required.', 'There seems to be an issue with your phone number.');
        return;
    } else{
        $('#phoneNumberInput').css('border-color','#2ad85b').removeClass('error');
        // Save phone number to storage
       await this.storage.set('phoneNumber',$('#phoneNumberInput').val());
        // Update opt in variable and storage reference
        this.phoneNumber = await this.storage.get('phoneNumber');
        this.numberSaved = true;
       await this.storage.set('numberSaved','true');
        if (this.agreeToTerms !== true){
          this.presentToast('Agree to Terms.', 'You have to agree to receive messages.');
        }else{
         await this.storage.set('agreeToTerms','true');
         await this.storage.set('name', name);
         this.name = name;
          this.addItem(name);
        }
    }
  }

  async addItem(name) {    
    // Set date and time
    let date = this.getCurrentDate();
    let time = this.getTime();

    // Create a timestamp to append to the Firebase entry 
    // to ensure they stay chronological
    let newDate = new Date();
    this.timeStamp = newDate.getTime();
    await this.storage.set('timeStamp', this.timeStamp);
    this.afd.list('/restaurants/' + this.firebaseName + '/' + date + '/').valueChanges()
      .subscribe(data => {
        this.numItems = data.length;
      });

    let payload;
      if (this.numberSaved == true && this.agreeToTerms == true){
        payload = {
          date: date,
          id: this.numItems + 1,
          name: name,
          phone: this.phoneNumber,
          status: 'waiting',
          text: 'waiting|'+this.phoneNumber,
          time_gotNumber: time,
          timeStamp: this.timeStamp
        }
      }


    // Push data to Firebase
    this.afd.object('/restaurants/' + this.firebaseName + '/' + date + '/' + this.timeStamp + '_' + name)
    .update(payload);

    let userInfo = {
      lastActiveDate: date,
      lastActiveTime: time,
      name: this.name,
      phone: this.phoneNumber
    }
    
    this.afd.object('/users/customers/' + this.firebaseName + '/' + this.phoneNumber)
    .update(userInfo);

    // this.name = name;
    // await this.storage.set('name', this.name);

    this.date = date;
    await this.storage.set('date', this.date);

    this.time = time;
    await this.storage.set('time', this.time);

    this.myID = this.numItems;
    await this.storage.set('myID', this.myID);

    this.status = 'waiting';
    await this.storage.set('status',this.status);

    // Disable creation button to prevent duplicates
    $('.reseveASpotBtn').attr('disabled', true);
    // Change Cancel button to Done
    $('.doneBtn').html('Done');
    
    // Return toggle status to default
    this.textToggle = false;
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

  async markCancelled(name) {
    this.afd.object('/restaurants/' + this.firebaseName + '/' + this.date + '/' + this.timeStamp + '_' + name)
      .update({
        status: 'cancelled'
      });

    $('#currentStatus').removeClass().addClass('step1');
    await this.storage.remove('myID');

    this.status = 'start';
    await this.storage.set('status', 'start');

    this.date = null;
    await this.storage.remove('date');

    this.timeStamp = null;
    await this.storage.remove('timeStamp');

    this.time = null;
    await this.storage.remove('time');

    this.tab = 'myNumber';
}

  async areYouSure() {
    const name = await this.storage.get('name');
    // Create the popup
    const toast = await this.toastCtrl.create({
      header: 'Are you sure you want to cancel?',
      message: 'You will lose your spot in line and your order will be cancelled.',
      position: 'top',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.markCancelled(name);
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

  async getNewNumber(){
    $('#currentStatus').removeClass().addClass('step1');
    await this.storage.remove('myID');

    this.status = 'start';
    await this.storage.set('status', 'start');

    this.date = null;
    await this.storage.remove('date');

    this.timeStamp = null;
    await this.storage.remove('timeStamp');

    this.time = null;
    await this.storage.remove('time');
}

  async presentModal() {
    if (await this.storage.get('acknowledged') == 'true'){
      // No modal necessary
    }else{
      const modal = await this.modalController.create({
        component: Tab2Page
      });
      return await modal.present();  
    }
  }

  async segmentChanged(e) {
    // console.log(e.detail.value);
    let status = await this.storage.get('status');

    if (e.detail.value == 'myNumber'){
      if (status == 'complete'){
        this.storage.set('status', 'start');
        this.timeStamp = null;
        await this.storage.remove('timeStamp');
        this.time = null;
        await this.storage.remove('time');
        this.myID = null;
        await this.storage.remove('myID');
        $('#currentStatus').removeClass().addClass('step1');
      }
    }
  }

  async getLocalStorageInfo(){
    // Collect the information from localStorage
    this.myID = await this.storage.get('myID');
    this.time = await this.storage.get('time');
    this.name = await this.storage.get('name');
    this.timeStamp = await this.storage.get('timeStamp');
    this.status = await this.storage.get('status');
    this.date = await this.storage.get('date');
    if (this.storage.get('agreeToTerms')){
      this.agreeToTerms = JSON.parse(await this.storage.get('agreeToTerms'));
    }
  }

  dismiss(){
    this.acknowledged = true;
    $('.readyToOrderNotice').addClass('hide');
    $('.completeNotice').addClass('hide');
  }

}