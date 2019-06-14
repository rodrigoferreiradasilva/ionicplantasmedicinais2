import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { Usuario } from './usuario';
import { UsuarioService } from './usuario.service';

import { DomSanitizer } from '@angular/platform-browser';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({

  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})




export class UsuarioPage implements OnInit {





  private usuario: Usuario;
  private id = null;
  private preview: any = null;


  constructor(

    private usuarioService: UsuarioService,
    public alertController: AlertController,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private sn: DomSanitizer,
    private androidPermissions: AndroidPermissions,
    private camera: Camera
  ) {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      result => this.presentAlert('Has permission?', result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    );
  }


  ngOnInit() {
    this.usuario = new Usuario;
    this.id = this.activeRouter.snapshot.paramMap.get("id");
    if (this.id != null) {
      this.edit(this.id);
    } else {
      this.id = null;
    }
  }


  onSubmit(form) {
    if (this.preview) {
      if (this.id == null) {
        //Grava usuario na autenticação ------------------------
        this.usuarioService.saveAuth(this.usuario)
          .then(
            res => {
              //Grava dados do usuario no Banco de dados ----------------
              this.usuario.foto = this.preview;
              this.usuarioService.save(this.usuario)
                .then(
                  res => {
                    this.presentAlert("Aviso", this.usuario.nome + ". Já tá salvo!");
                    form.reset();
                    this.usuario = new Usuario;
                    this.router.navigate(['/tabs/tab2']);
                  },
                  err => {
                    this.presentAlert("Erro!!!", "Ops!! Deu erro ao salvar!" + err);
                  }
                )
            },
            err => {
              this.presentAlert("Erro!!!", "Usuario já cadastrado!" + err);
            }
          ).catch(
            erros => {
              this.presentAlert("Erro!!!", "Não consegui conectar ao sistma" + erros);
            }
          )
      } else {
        //Atualiza usuario -------------------------
        this.usuario.foto = this.preview;
        this.usuarioService.update(this.id, this.usuario)
          .then(
            res => {
              this.id = null;
              this.presentAlert("Aviso", this.usuario.nome + ". Foi atualizado!");
              form.reset();
              this.usuario = new Usuario;
              this.router.navigate(['/tabs/tab2']);
            },
            err => {
              this.presentAlert("Erro!!!", "Ops!! Deu erro na atualização!" + err);
            }
          );
      }
    } else this.presentAlert("Erro!!!", "Voce tem que tirar uma foto!");
  }


  edit(key) {
    this.preview = null;
    this.usuarioService.get(key)
      .subscribe(
        res => {
          this.usuario = res;
          if (this.usuario.foto) {
            this.preview = this.usuario.foto;
          }
          //console.log(res);
        },
        err => {
          console.log(err);
        }
      );
  }

  

  async tirarFoto() {
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA,
    this.androidPermissions.PERMISSION.GET_ACCOUNTS]);

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.preview = this.sn.bypassSecurityTrustResourceUrl(base64Image);
    }, (err) => {
      // Handle error
      console.log("Erro camera:" + err);
    });
  }


  //Alertas ----------------------------------------------
  async presentAlert(titulo: string, texto: string) {
    const alert = await this.alertController.create({
      header: titulo,
      //subHeader: 'Subtitle',
      message: texto,
      buttons: ['OK']
    });
    await alert.present();
  }

}