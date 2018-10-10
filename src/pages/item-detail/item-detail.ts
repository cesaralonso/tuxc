import { Settings } from './../../providers/settings/settings';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Items } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;

  constructor(
    public navCtrl: NavController, 
    navParams: NavParams, 
    items: Items,
    private settings: Settings) {
    this.item = navParams.get('item') || items.defaultItem;
  }


  setCarro(item: any) {
    console.log('setCarro item', item);
    this.settings.setValue('carro', item);
    this.navCtrl.push('ViajePage');
  }

}
