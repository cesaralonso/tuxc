import { Settings } from './../../providers/settings/settings';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-driver-detail',
  templateUrl: 'driver-detail.html'
})
export class DriverDetailPage {
  item: any;

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    private settings: Settings,
    public loadingCtrl: LoadingController) {

    this.presentLoading();

    // Aqui se supone que ya obtiene el carro que ha aceptado
    this.item = {
        "name": "Pedro García Pérez",
        "profilePic": "assets/img/conductor1.png",
        "about": "Excelente conductor."
    };
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Espere a que un chofer acepte el viaje...",
      duration: 3000
    });
    loader.present();
  }

  setCarro(item: any) {
    this.settings.setValue('carro', item);
    this.navCtrl.push('TravelPage');
  }

}
