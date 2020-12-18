import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Tab2Page } from '../tab2/tab2.page';
import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { FcmService } from '../services/fcm.service';
import { Badge } from '@ionic-native/badge/ngx';
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

  // Array variables
  public itemList: any;
  public numItems: any;
  public restaurants: any;
  public items = [];
  public presentModalVar;
  public optInTexts: boolean;
  public textUpdates: boolean;
  public textOption: boolean;
  public textToggle: boolean;
  public numberSaved: boolean;

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
    public fcmService: FcmService,
    private badge: Badge,
    public storage: Storage) {
      this.getRestaurants();
      this.checkDate();
      this.fcmService.initPush();
  }

  ionViewWillEnter(){
    this.checkIfUpdated();

    if (localStorage.getItem('numberSaved')){
      this.numberSaved = JSON.parse(localStorage.getItem('numberSaved'));
    }
    this.checkDate();
    this.checkForRequiredInfo();
    this.restaurantLogo = localStorage.getItem('restaurantLogo');

  // Set default tab
  this.tab = 'myNumber';

  // Set phone number if in localStorage
  if (localStorage.getItem('phoneNumber')){
    this.phoneNumber = localStorage.getItem('phoneNumber')
  }else{
    this.phoneNumber = null;
  }

  // Get the current date
  this.getItems(this.getCurrentDate());

  // Get localStorage Info
  this.getLocalStorageInfo();
  this.badge.clear();
    if (localStorage.getItem('name')){
      let nameInput = localStorage.getItem('name');
      $('#nameInput').val(nameInput);
    }

    this.textUpdates = this.optInTexts;

    if (this.textUpdates == true){
      this.optInTexts = true;
      localStorage.setItem('optInTexts','true');
    }else{
      this.optInTexts = false;
      localStorage.setItem('optInTexts','false');
    }
    console.log('this.optInTexts: '+this.optInTexts);
    this.setData(this.firebaseName);

  }

  async toggleTextOptions(){
    console.log('toggleTextOptions')
    if (this.textToggle == true){
      this.textToggle = false;
    }else{
      this.textToggle = true;
    }
  }

  checkIfUpdated(){
    if (localStorage.getItem('lastUpdate') !== '12132020'){
      localStorage.clear();
      localStorage.setItem('lastUpdate','12132020');
    }else{
      return;
    }
  }

  checkOptInTexts(){
    console.log("this.checkOptInTexts")
    if (localStorage.getItem('optInTexts')){
      this.optInTexts = JSON.parse(localStorage.getItem('optInTexts'));
      if (this.optInTexts == true){
        this.textUpdates = true;
      }
    }else{
      this.optInTexts = false;
      localStorage.setItem('optInTexts','false');
    }
  }

  checkForRequiredInfo(){
    if (!localStorage.getItem('firebaseName')){
      this.presentToast('Choose A Restaurant', 'A restaurant has to be chosen, let\'s try again.');
      this.router.navigate(['/choose-restaurant']);
    }else {
      this.firebaseName = localStorage.getItem('firebaseName');
    }
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
      if (res.openStatus){
        this.openStatus = res.openStatus;
        if (this.openStatus == 'open'){
          localStorage.setItem('openStatus','Open');
        }else if (this.openStatus == 'closed'){
          localStorage.setItem('openStatus','Closed');
        }else if (this.openStatus == 'notTakingOrders'){
          localStorage.setItem('openStatus','Not Taking Orders');
        }else if (this.openStatus == 'soldOut'){
          localStorage.setItem('openStatus','Sold Out');
        }else{
          localStorage.setItem('openStatus','Open');
        }

      }
      if (res.restaurantLogo){
        this.restaurantLogo = res.restaurantLogo.replace(/['"]+/g, '');
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

  getRestaurants(){
    //  this.restaurants = this.afd.list('/restaurants/').valueChanges();
     this.afd.list('/restaurants/').valueChanges()
      .subscribe(data => {
        this.restaurants = data;
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
            this.processArray(tempArray);
        }
      });
    });
  }

  processArray(tempArray){
    console.log('processArray()');
    let myOrderStatus: any;
    $(tempArray).each(function(i,res){
      if (res.timeStamp == localStorage.getItem('timeStamp')){
        localStorage.setItem('myID',res.id);
        localStorage.setItem('date',res.date);
        localStorage.setItem('name',res.name);
        localStorage.setItem('status',res.status);
        localStorage.setItem('time',res.time_gotNumber);
        localStorage.setItem('timeStamp',res.timeStamp);
        this.status = localStorage.getItem('status');

        myOrderStatus = res.status;
      }
    });
    this.checkStatus(myOrderStatus);
  }

  checkStatus(status){
    console.log('checkStatus()');
    if (status == 'start'){
      localStorage.removeItem('acknowledged');
      $('#currentStatus').removeClass().addClass('step1');
    }else if (status == 'waiting'){
      localStorage.removeItem('acknowledged');
      $('#currentStatus').removeClass().addClass('step2');
      this.tab = 'waiting';
    }else if (status == 'ready'){
      console.log('status is ready');
      if (!localStorage.getItem('acknowledged')){
        $('.readyToOrderNotice').removeClass('hide');
      }
      $('#currentStatus').removeClass().addClass('step3');
    }else if (status == 'in-progress'){
      localStorage.removeItem('acknowledged');
      $('#currentStatus').removeClass().addClass('step4');
    }else if (status == 'complete'){
      $('#currentStatus').removeClass().addClass('step5');
      if (!localStorage.getItem('acknowledged')){
        $('.completeNotice').removeClass('hide');
      }
    }else if (this.status == 'on-hold'){
      localStorage.removeItem('acknowledged');
      $('#currentStatus').removeClass().addClass('step2').addClass('on-hold');
    }
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
    this.checkForRequiredInfo();

    // Get customer name field input
    let name: string = $('#nameInput').val();

    // Throw error if name is not provided.
    if (!name) {
      this.presentToast('Oops! Name is required.', 'We need a name to add to your number.');
      return;
    }

    //  Remove storage items 
    let keysToRemove = ["name", "date","time","myID","status"];
    keysToRemove.forEach(k =>
      localStorage.removeItem(k))

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
      
      let payload;

      console.log('this.optInTexts: '+this.optInTexts);

      if (this.numberSaved == true && this.optInTexts == true){
        payload = {
          date: date,
          id: this.numItems,
          name: name,
          phone: this.phoneNumber,
          status: 'waiting',
          optInTexts: this.optInTexts,
          text: 'waiting|'+this.phoneNumber,
          time_gotNumber: time,
          timeStamp: this.timeStamp
        }
      }else{
        payload = {
          date: date,
          id: this.numItems,
          name: name,
          phone: this.phoneNumber,
          status: 'waiting',
          optInTexts: this.optInTexts,
          time_gotNumber: time,
          timeStamp: this.timeStamp
        }
      }


    // Push data to Firebase
    this.afd.object('/restaurants/' + this.firebaseName + '/' + date + '/' + this.timeStamp + '_' + name)
    .update(payload);      

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

  addPhoneNumber(){
    // Validate number
    this.validatePhoneNumber();
    if($('#phoneNumberInput').val()){
      // If error results from validation, don't opt in
      if($('#phoneNumberInput').hasClass('error')){
        return;
      }else{
        // Save phone number to storage
        localStorage.setItem('phoneNumber',$('#phoneNumberInput').val());
      }
      // Update opt in variable and storage reference
      this.optInTexts = true;
      this.phoneNumber = localStorage.getItem('phoneNumber');
      localStorage.setItem('optInTexts','true');
      this.numberSaved = true;
      localStorage.setItem('numberSaved','true');
      if (!localStorage.getItem('timeStamp')){
        return;
      }else{
        this.afd.object('/restaurants/' + this.firebaseName + '/' + this.date + '/' + this.timeStamp + '_' + this.name)
        .update({
          phone: this.phoneNumber
        });
      }
    }
  }

  optInOutTexts(){
    if (this.textUpdates == true){
      this.optInTexts = false;
    }else{
      this.optInTexts = true;
    }
    console.log('textOptions: '+this.optInTexts)
    localStorage.setItem('optInTexts',JSON.stringify(this.optInTexts));

    if (!localStorage.getItem('timeStamp')){
      return;
    }else{
      this.afd.object('/restaurants/' + this.firebaseName + '/' + this.date + '/' + this.timeStamp + '_' + this.name)
      .update({
        optInTexts: this.optInTexts,
      });
    }
  }

  validatePhoneNumber(){
    let mobileFormat = /^[1-9]{1}[0-9]{9}$/;
    let currentValue = $('#phoneNumberInput').val();
    if(mobileFormat.test(currentValue) == false && currentValue != 10){
        $('#phoneNumberInput').css('border-color','red').addClass('error');
    } else{
        $('#phoneNumberInput').css('border-color','#2ad85b').removeClass('error');
    }
    event.preventDefault();
  }

  numbersOnly(e){
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
      return false;
    }
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

    this.myID = null;
    this.status = 'start';
    this.date = null;
    this.timeStamp = null;
    this.time = null;

    localStorage.removeItem('myID');
    localStorage.removeItem('status');
    localStorage.removeItem('date');
    localStorage.removeItem('timeStamp');
    localStorage.removeItem('time');
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
    this.myID = null;
    this.status = 'start';
    this.date = null;
    this.timeStamp = null;
    this.time = null;

    localStorage.removeItem('myID');
    localStorage.removeItem('status');
    localStorage.removeItem('date');
    localStorage.removeItem('timeStamp');
    localStorage.removeItem('time');
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