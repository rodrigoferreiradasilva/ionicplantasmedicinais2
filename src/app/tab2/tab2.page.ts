import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AgmCoreModule } from '@agm/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   posLat:number = 50.234435;
   posLon:number = 8.3426785;

  constructor(private geolocation: Geolocation) { }

  local() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.posLat = resp.coords.latitude;
      this.posLon = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
}
