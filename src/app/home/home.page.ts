import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Usuario } from '../model/Usuario';
import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastController ,LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ObjectDTO } from '../model/ObjectDTO';
import { Configuracao } from '../model/Configuracao';
import { Network } from '@ionic-native/network/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  model: Usuario = new Usuario();
  config: Configuracao = new Configuracao();
  exibirConfig = true
  
  LISTA_USUARIO = "LISTA_USUARIO"
  PATH = 'PATH'
  CODIGO = 'CODIGO'

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }
  constructor(private http: HttpClient, 
              public loadingController: LoadingController,
              public storage: Storage,private network: Network,
               public toast: ToastController ) {
    //this.storage.set(this.LISTA_USUARIO, new Array<Usuario>());
    this.storage.get(this.PATH).then(data => { 
      if(data){
        this.exibirConfig = false
        this.config.path = data
        this.storage.get(this.CODIGO).then(cod => { 
          this.config.codigo = cod
        })
      }
    })
   
  }

  salvar(){
    if(this.model.telefone.length >= 14){
      if(this.model.nome && this.model.telefone){
        this.storageSave(this.model);
      }else{
        this.presentToast('Campos obrigatorios')
      }
    }else{
      this.model.telefone = ''
      this.presentToast('Campos obrigatorios')
    }
  }
  salvarConfig(){
    if(this.config.codigo && this.config.path){
      this.storage.set(this.PATH, this.config.path);
      this.storage.set(this.CODIGO, this.config.codigo);
      this.exibirConfig = false
    }
  }
  listar(){
    this.getList().subscribe()
    this.storage.get(this.LISTA_USUARIO).then(data=> { 
      console.log(data)
    })
  }

  enviar(){
    this.storage.get(this.LISTA_USUARIO).then(data=> { 
      if(data && data.length > 0 ){
        let objecto : ObjectDTO = new ObjectDTO
        objecto.codigo = this.config.codigo
        objecto.usuarios = data 
       this.createItens(objecto).subscribe(result => {
          console.log('Atualizado o servidor')
          this.storage.set(this.LISTA_USUARIO, new Array<Usuario>());        
       }, err =>{
        console.log('Erro ao enviar ao servidor')
       })
      }else{
        console.log('SEM REGISTRO')
      }
    })
  }

  // Handle API errors
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };


  // Create a new itens
  createItens(itens): Observable<ObjectDTO> {
    return this.http
      .post<ObjectDTO>(this.config.path +'save' , JSON.stringify(itens), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }


   // Get students data
   getList(): Observable<Usuario> {
    return this.http
      .get<Usuario>(this.config.path +'findAll')
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }


  private storageSave(usuario: Usuario) {
    this.storage.get(this.LISTA_USUARIO).then(data=> { 
      if(data && data.length > 0 ){
       let listaUsuario = data
       listaUsuario.push(usuario)
       this.storage.set(this.LISTA_USUARIO, listaUsuario)
       setTimeout( () => {
        this.limparCampo()
        }, 500)
       this.presentToast('Salvo com sucesso.')
      }else{
        let listaUsuario = new Array<Usuario>()
        listaUsuario.push(usuario)
        this.storage.set(this.LISTA_USUARIO, listaUsuario)

      }
    })
  }

  public limparCampo(){
    this.model.nome = ''
    this.model.telefone = ''
  }

  async presentToast(item) {
    const toast = await this.toast.create({
      message: item,
      position: 'top',
      duration: 3000
    });
    toast.present();
  }

  isConnected(){
    this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
       // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });
  }

}
