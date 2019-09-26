export class Usuario{
    id: number;
    nome: string;
    telefone: string;
    ddd: string;


   // constructor(){}

    constructor(nome , telefone){
        this.telefone = telefone
        this.nome = nome
    }
}