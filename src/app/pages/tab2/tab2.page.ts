import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataLocalService } from '../../services/data-local.service';
import { Subscription } from 'rxjs';
import { Registro } from '../../models/registro.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {

  $guardados!: Subscription;

  guardados: Registro[] = [];

  constructor(
    private dataLocal:  DataLocalService
  ) {}

  ngOnInit(): void {
   this.$guardados = this.dataLocal.guardados$.subscribe(registros=>{
    this.guardados = registros;
   })
  }

  enviarCorreo(){
    this.dataLocal.enviarCorreo();
  }

  abrirRegistro(registro: Registro){
    this.dataLocal.abrirRegistro(registro);
  }

  ngOnDestroy(): void {
   if(this.$guardados) {
    this.$guardados.unsubscribe();
   }
  }

}
