import { MyNodeBookingFreePage } from './../my-node-booking-free/my-node-booking-free';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NodeEventsPage } from './../node-events/node-events';
import { Http } from '@angular/http';
import { ModalController, AlertController } from 'ionic-angular';
import * as moment from 'moment';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { MonthViewComponent } from 'ionic2-calendar/monthview';
import { WeekViewComponent } from 'ionic2-calendar/weekview';
import { DayViewComponent } from 'ionic2-calendar/dayview';
import { Subscription } from 'rxjs/Subscription';
import { LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';


/**
 * Generated class for the MyNodeCalendarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-my-node-calendar',
  templateUrl: 'my-node-calendar.html',
})
export class MyNodeCalendarPage {
  eventSource = [];
  viewTitle: string;
  selectedDay = new Date();
  isToday: boolean;
  startHour: any;
  endHour: any;
  nodeAddress: any;
  nodeId: any;
  chargerType: any;
  nodeOwnerId;
  calendar = {
    mode: 'month',
    currentDate: new Date(),
    startHour: 1,
    endHour: 24,
    step: 30,

  };
  userId: any;
  eventsStart = [];
  eventsFinish = [];
  costPer15Mins: any;
  bookingId: number;
  previousMode: any;

  constructor(private afAuth: AngularFireAuth, public loadingCtrl: LoadingController, public http: Http, public navParams: NavParams, navCtrl: NavController, private modalCtrl: ModalController, private alertCtrl: AlertController) {

    this.userId = navParams.get("param7");
    this.startHour = navParams.get("startHour");
    this.endHour = navParams.get("endHour");
    this.nodeAddress = navParams.get("nodeAddress");
    this.nodeId = navParams.get("nodeId")
    this.chargerType = navParams.get("chargerType")
   
    console.log("ID " + this.nodeId);
    this.loadCalendar();

    let loading = this.loadingCtrl.create({
      content: 'Loading Node Data...'
    });

    loading.present();

    setTimeout(() => {
      this.calendar.mode = 'week';
      this.previousMode = this.calendar.mode;



      loading.dismiss();

    }, 100);



    console.log("HOUR" + this.startHour)





  }
  ionViewDidLoad() {


  }



  loadCalendar() {


    let events = this.eventSource;
    this.http.get('http://colinfyp.bitnamiapp.com/data_marker/myNodeBookings.php?userId=' + this.userId)
      .map(res => res.json())
      .subscribe(nodeBookings => {


        if (nodeBookings) {


          for (let eventData of nodeBookings) {






            var mysqlDateTimeStart = eventData.startTime.split(/[- :]/);

            // Apply each element to the Date function
            var javascriptDateTimeStart = new Date(mysqlDateTimeStart[0], mysqlDateTimeStart[1] - 1, mysqlDateTimeStart[2], mysqlDateTimeStart[3], mysqlDateTimeStart[4], mysqlDateTimeStart[5]);


            var mysqlDateTimefinish = eventData.finishTime.split(/[- :]/);

            // Apply each element to the Date function
            var javascriptDateTimefinish = new Date(mysqlDateTimefinish[0], mysqlDateTimefinish[1] - 1, mysqlDateTimefinish[2], mysqlDateTimefinish[3], mysqlDateTimefinish[4], mysqlDateTimefinish[5]);




            eventData.startTime = new Date(javascriptDateTimeStart);
            eventData.endTime = new Date(javascriptDateTimefinish);

            eventData.title = "Booking ID:" + eventData.bookingId + ". Charge Point ID:" + eventData.nodeId + ".  \n ChargePoint Address:" + eventData.nodeAddress + "\n Charger Type:" + eventData.chargerType;



            this.eventSource.push(eventData);
            this.eventsStart.push(eventData.startTime);
            this.eventsFinish.push(eventData.endTime);




          }
        }
        else
          return 0;
        if (nodeBookings == null) {
          console.log("problem");
        }


      });




  }


  click() {
    var elem: HTMLElement = document.elementFromPoint(300, 200) as HTMLElement;
    elem.click();
  }





  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  onEventSelected(event) {

    let start = moment(event.startTime).format('LLLL');
    let end = moment(event.endTime).format('LLLL');
    var booking = event.title.split(":");
    var id = booking[1].split(".");
    this.bookingId = id[0];
    console.log("HHHHEEEEEYYY" + this.bookingId[0]);

    let alert = this.alertCtrl.create({
      title: '' + event.title,
      subTitle: 'From: ' + start + '<br>To: ' + end,
      buttons: [
        {
          text: 'ok',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {


            this.deleteBookingCheck(event);

          }
        }
      ]
    })
    alert.present();
  }


  changeMode(mode) {
    this.calendar.mode = mode;
    console.log(this.calendar.mode)
    this.previousMode = mode;
  }



  onTimeSelected(ev) {
    this.selectedDay = ev.selectedTime;
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }


  addEvent() {

    let modal = this.modalCtrl.create(MyNodeBookingFreePage, { selectedDay: this.selectedDay, nodeAddress: this.nodeAddress, chargerType: this.chargerType, nodeOwnerId: this.nodeOwnerId, nodeId: this.nodeId, userId: this.userId, eventsStart: this.eventsStart, eventsFinish: this.eventsFinish, costPer15Mins: this.costPer15Mins, startHour: this.startHour, endHour: this.endHour });

    modal.present();
    modal.onDidDismiss(data => {




      if (data) {
        let alert = this.alertCtrl.create({
          title: 'Great!',
          subTitle: 'Your Booking Was Successful',
          buttons: ['OK']
        });


        this.loadCalendar();
        this.changeMode("month");
        alert.present();

      }


      if (data) {
        let eventData = data;

        eventData.startTime = new Date(data.startTime);
        eventData.endTime = new Date(data.endTime);

        let events = this.eventSource;
        events.push(eventData);
        this.eventSource = [];

        setTimeout(() => {
          this.changeMode("week");
          console.log(this.eventSource);
        });
      }

    });
  }


  deleteBookingCheck(event) {
    var now = Date.now();

    if (event.endTime < now) {


      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'Past bookings cannot be deleted',
        buttons: ['Ok']
      });

      alert.present();

    }

    else {

      console.log("works")
      this.deleteBooking();

    }



  }

  deleteBooking() {

    console.log(this.bookingId);

    this.eventSource = [];
    this.calendar.mode = "month";

    let options: any = { "bookingId": this.bookingId },
      url: any = 'http://colinfyp.bitnamiapp.com/data_marker/deleteBooking.php';
    console.log(options);

    this.http.post(url, JSON.stringify(options))
      .subscribe((data: any) => {


      
      
        this.loadCalendar();
        




        let alert = this.alertCtrl.create({
          title: 'Complete!',
          subTitle: 'Your Booking Has Been Deleted',
          buttons: ['OK']
        });

        console.log("HEEYEYEYEYE" + this.eventSource.length);

        alert.onWillDismiss(res => {

          
          console.log("DELETED");
          console.log(this.eventSource.length);
          this.changeMode("week");
          
          


        });

        alert.present();

      },
      (error: any) => {
        console.log("HEYY" + error);

        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: 'Please ensure your device is connected to the internet.',
          buttons: ['OK']
        });


        alert.present();

      });

     

  }
}