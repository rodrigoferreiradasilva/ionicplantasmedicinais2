import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

import { Usuario } from './usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth
  ) { }

  getAll() {
    return this.db.list('usuarios').snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
  }

  save(usuario: Usuario) {
    return this.db.list("usuarios").push(usuario)
    // .then(
    //   res => {
    //     cliente.id = res.key;
    //     res.set(cliente);
    //   }
    // );
  }

  remove(key) {
    return this.db.list("usuarios").remove(key);
  }

  update(key, usuario: Usuario) {
    return this.db.list("usuarios").update(key, usuario);
  }

  get(key) {
    return this.db.object<Usuario>("usuarios/" + key).valueChanges();
  }

  saveAuth(usuario: Usuario) {
    return this.afAuth.auth.createUserWithEmailAndPassword(usuario.email, usuario.pws);
  }

}