import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';
import { Browser } from '@capacitor/browser';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { EmailComposer, EmailComposerOptions } from '@awesome-cordova-plugins/email-composer/ngx';

import { Registro } from '../models/registro.model';
import { BehaviorSubject } from 'rxjs';
import { NavController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  private _storage: Storage | null = null;

  private _guardados: Registro[] = [];

  private seGuardados(registro: Registro[]){
    this._guardados.unshift(...registro);
    this.guardados$.next(this._guardados);
  }

  private isLoad : boolean  = false;

  guardados$: BehaviorSubject<Registro[]> = new BehaviorSubject<Registro[]>([])

  constructor(
    private storage: Storage,
    private navCtr: NavController,
    private file: File,
    private emailComposer: EmailComposer
  ) {

    this.init();

  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    await this.cargarRegistros();
  }

  async guardarRegistro(format: string, texto: string){
    if(!this.isLoad){
      await this.cargarRegistros();
    }
    const nuevoRegistro = new Registro(format,texto);
    this.seGuardados([nuevoRegistro]);
    this._storage?.set('registros',this._guardados);
    this.abrirRegistro(nuevoRegistro);
  }

  async cargarRegistros(){
    const resultados = await this._storage?.get('registros') || [];
    this.seGuardados(resultados);
    this.isLoad = true;
  }

  async abrirRegistro(registro: Registro){
    this.navCtr.navigateForward('/tabs/tab2');
    switch(registro.type){
      case 'http':
        await Browser.open({
          url: registro.texto,
        });
      break;
      case 'geo':
       this.navCtr.navigateForward(`/tabs/tab2/mapa/${registro.texto}`);
      break;
    }
  }

  enviarCorreo(){
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Text\n';

    arrTemp.push(titulos);

    this._guardados.forEach(registro=>{
      const linea = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.texto.replace(',',' ')}\n`;
      arrTemp.push(linea);
    });

    // this.crearArchivoFisico(arrTemp.join(''));
    this.compartirDescargarArchivo(arrTemp.join(''));

  }

  compartirDescargarArchivo(text: string, descargar: boolean = false ){
    Filesystem.writeFile({
      data: text,
      path: 'registros.csv',
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    }).then(d=>{
      console.log(d);
      this.emailComposer.isAvailable().then((avalible: boolean)=>{
        if(avalible){
          const email: EmailComposerOptions = {
            to: ['antoniomanu533@gmail.com'],
            cc: [],
            bcc: [],
            attachments: [d.uri],
            subject: 'Mis Scans',
            body: 'Esto es una copia de seguridad',
            isHtml: false
          }
          this.emailComposer.open(email).then(respuesta=>{
            if(!descargar){
              Filesystem.deleteFile({
                path: 'registros.csv',
                directory: Directory.Documents,
              }).then(r=>{
                console.log(r);
              })
            }
          });
        }
      })
    }).catch(e=>{
      console.log(e);
    })
  }

  crearArchivoFisicoOld(texto: string){
    this.file.checkFile(this.file.dataDirectory,'registros.csv').then(existe=>{
      console.log('Existe Archivo?', existe);
      return this.escribirEnArchivo(texto);
    }).catch(error=>{
      console.log('No existe', error);
      return this.file.createFile(this.file.dataDirectory, 'registros.csv', false).then(fileEntry=>{
        this.escribirEnArchivo(texto);
      }).catch(err=>{
        console.log('No se pudo Cargar el Archivo', err);
      })
    })
    this.escribirEnArchivo(texto);
  }

  async escribirEnArchivo(texto: string){
    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv',texto);
    console.log('File Creado', this.file.dataDirectory + 'registro.csv');
    const archivo = this.file.dataDirectory + 'registro.csv';
    this.emailComposer.isAvailable().then((avalible: boolean)=>{
      if(avalible){
        const email: EmailComposerOptions = {
          to: ['antoniomanu533@gmail.com'],
          cc: [],
          bcc: [],
          attachments: [archivo],
          subject: 'Mis Scans',
          body: 'Esto es una copia de seguridad',
          isHtml: false
        }
        this.emailComposer.open(email).then(respuesta=>{
          console.log(respuesta);
        });
      }
    })
  }

}
