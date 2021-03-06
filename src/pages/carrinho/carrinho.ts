import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CarrinhoService } from '../../services/domain/carrinho.service';
import { ItemPedidos } from '../../models/item.pedido.dto';
import { ClienteService } from '../../services/domain/cliente.service';
import { ClienteDTO } from '../../models/cliente.dto';
import { StorageService } from '../../services/storage.service';
import { API_CONFIG } from '../../config/api.config';
import { ProdutoService } from '../../services/domain/produto.service';
import { Carrinho } from '../../models/carrinho';
import { AuthService } from '../../services/auth.service';

@IonicPage()
@Component({
  selector: 'page-carrinho',
  templateUrl: 'carrinho.html',
})
export class CarrinhoPage {

  items: ItemPedidos[]

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public carrinhoService: CarrinhoService,
    public clienteService: ClienteService,
    public store: StorageService,
    public produtoService: ProdutoService,
    public authService: AuthService) {
  }

  ionViewDidLoad() {
    this.loadData()
  }

  ionViewCanEnter() {
    let auth = this.authService.isAuthenticated()
    if(!auth){
      this.authService.logout()
      this.navCtrl.setRoot("HomePage")
    }
    
  }

  loadData() {
    this.items = this.carrinhoService.getCart().itemPedidos
  }

  goOn(){
    this.navCtrl.setRoot('CategoriasPage')
  }
  
  async checkout() {
    let cart = this.carrinhoService.getCart()
    await this.saveClienteStorage(cart)
    this.navCtrl.push("EscolhaEnderecoPage")
  }
  
  async saveClienteStorage(cart: Carrinho){
    return new Promise(resolve => {
        if(cart.cliente == null){
          this.clienteService.findByEmail(this.store.getLocalUser().email).subscribe(
            res => {
              cart.cliente = res as ClienteDTO
              this.store.setLocalCart(cart)
              resolve()
            },
            error => {
              console.log("Erro capturar o perfil do cliente "+error)
            }
          );
        }
        else
          resolve()
    })
   
  }

  loadImagesUrls() {
    for(let item of this.items){ 
      this.produtoService.getSmallImageFromBucket(item.produtoId)
        .subscribe(res => {
          item.imgUrl = `${API_CONFIG.bucketBaseUrl}/produtos/pr${item.produtoId}-small.jpg`
        },
        error => {
          item.imgUrl = 'assets/imgs/prod.jpg'
        })
    }
  }
        
  increaseQuantity(produtoId: string) {
    this.items = this.carrinhoService.increaseQuantity(produtoId).itemPedidos
  }
  
  decreaseQuantity(produtoId: string) {
    this.items = this.carrinhoService.decreaseQuantity(produtoId).itemPedidos
  }

  removeItem(produtoId: string) {
    this.items = this.carrinhoService.removeItem(produtoId).itemPedidos
  }
  
  total(): number {
    return this.carrinhoService.total()
  }
}
