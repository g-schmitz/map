import {Directive, Input, OnDestroy} from '@angular/core';

import { BaseMapDirective } from './base-map-directive';
import { NguiMapComponent } from '../components/ngui-map.component';

const INPUTS = ['controlPosition', 'controls', 'drawingMode', 'featureFactory', 'geoJson', 'geoJsonUrl'];
const OUTPUTS = [
  'addfeature', 'click', 'dblclick', 'mousedown', 'mouseout', 'mouseover',
  'mouseup', 'removefeature', 'removeproperty', 'rightclick', 'setgeometry', 'setproperty'
];

@Directive({
  selector: 'ngui-map > data-layer',
  inputs: INPUTS,
  outputs: OUTPUTS,
})
export class DataLayer extends BaseMapDirective {

  @Input() set visible(visibility: boolean) {
      const styles = this._layer.getStyle();
      this._layer.setStyle(Object.assign({visible: visibility}, styles));
  }

  @Input() set style(options: google.maps.Data.StyleOptions) {
      this._layer.setStyle(options);
  }

  private _layer: google.maps.Data = new google.maps.Data();
  get layer() { return this._layer; }


  constructor(nguiMapComponent: NguiMapComponent) {
    super(nguiMapComponent, 'Data', INPUTS, OUTPUTS);
  }

  // only called when map is ready
  initialize(): void {
      this._layer.setMap(this.nguiMapComponent.map);
      this._layer.setStyle(this.style);
    if (this['geoJson']) {
      // addGeoJson from an object
      console.log('this.geoJson', this['geoJson']);
      this._layer.addGeoJson(this['geoJson']);
    } else if (this['geoJsonUrl']) {
      // loadGeoJson from a URL
      console.log('this.geoJsonUrl', this['geoJsonUrl']);
      this._layer.loadGeoJson(this['geoJsonUrl']);
    }
    else {
      this.objectOptions = this.optionBuilder.googlizeAllInputs(this.inputs, this);
      console.log(this.mapObjectName, 'initialization objectOptions', this.objectOptions);
      this._layer.add(this.objectOptions);
    }

    // unlike others, data belongs to map. e.g., map.data.loadGeoJson(), map.data.add()
    this.mapObject = this._layer

    // set google events listeners and emits to this outputs listeners
    this.nguiMap.setObjectEvents(this.outputs, this, 'mapObject');

    this.nguiMapComponent.addToMapObjectGroup(this.mapObjectName, this.mapObject);
    this.initialized$.emit(this.mapObject);
  }
}