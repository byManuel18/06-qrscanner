import { Component } from '@angular/core';

import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner';
import { DataLocalService } from '../../services/data-local.service';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(
    private dataLocal: DataLocalService
  ) {
  }

  ionViewWillEnter(){
    this.scan();
  }

  scan(){
    BarcodeScanner.scan().then(res=>{
      if(!res.cancelled){
        this.dataLocal.guardarRegistro(res.format, res.text);
      }
    }).catch(err=>{
      // console.log(err);
      // this.dataLocal.guardarRegistro('QRCode', 'https://fernando-herrera.com');
      this.dataLocal.guardarRegistro('QRCode', 'geo:40.73151796986687,-74.06087294062502');
    })
  }

}
