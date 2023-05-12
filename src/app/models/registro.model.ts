
export class Registro{

  public format: string;
  public texto: string;
  public type!: string;
  public icon!: string;
  public created: Date;

  constructor( format : string, texto: string){
    this.format = format;
    this.texto = texto;
    this.created = new Date();

    this.determinarTipo();
  }


  private determinarTipo(){
    const iniciotexto = this.texto.substring(0,4);

    switch(iniciotexto){
      case 'http':
        this.type = 'http';
        this.icon = 'globe';
        break;
      case 'geo:':
        this.type = 'geo';
        this.icon = 'location-outline';
        break;
      default:
        this.type = 'No reconocido';
        this.icon = 'create';
    }
  }

}
