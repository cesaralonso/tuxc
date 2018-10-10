import { Injectable } from '@angular/core';

import { Item } from '../../models/item';

@Injectable()
export class Items {
  items: Item[] = [];

  defaultItem: any = {
      "name": "Pedro García Pérez",
      "profilePic": "assets/img/conductor1.png",
      "about": "Excelente conductor."
  };


  constructor() {
    let items = [
      {
        "name": "Pedro García Pérez",
        "profilePic": "assets/img/conductor1.png",
        "about": "Excelente conductor."
      },
      {
        "name": "Mario Alberto Benavides",
        "profilePic": "assets/img/conductor2.png",
        "about": "Un poco lento, pero bueno."
      },
      {
        "name": "Ronaldo Bernardino Sanches",
        "profilePic": "assets/img/conductor1.png",
        "about": "Maneja con cuidado."
      },
      {
        "name": "Juan Amezcua",
        "profilePic": "assets/img/conductor2.png",
        "about": "Excelente conductor."
      },
      {
        "name": "Eliseo Godinez Pérez",
        "profilePic": "assets/img/conductor1.png",
        "about": "Excelenete conductor."
      },
      {
        "name": "Antonio Avarado Del Toro",
        "profilePic": "assets/img/conductor2.png",
        "about": "Maneja y estpa con el teléfono."
      },
      {
        "name": "José Sanchez Ruiz",
        "profilePic": "assets/img/conductor1.png",
        "about": "Muy malo, no lo recomiendo."
      }
    ];

    for (let item of items) {
      this.items.push(new Item(item));
    }
  }

  query(params?: any) {
    if (!params) {
      return this.items;
    }

    return this.items.filter((item) => {
      for (let key in params) {
        let field = item[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    });
  }

  add(item: Item) {
    this.items.push(item);
  }

  delete(item: Item) {
    this.items.splice(this.items.indexOf(item), 1);
  }
}
