class CadastroPage {

    //seletores
campoNome(){return cy.get('#name')}
campoEmail(){return cy.get('#email')}
campoTelefone(){return cy.get('#phone')}
campoSenha(){return cy.get('#password')}
campoConfirmarSenha(){return cy.get('#confirm-password')}
campoTermos(){return cy.get('#terms-agreement')}
campoBotaoCadastrar(){return cy.get('#register-btn')}
 

    //Métodos
visitarPaginaCadastro() {
    cy.visit("register.html");
}

preencherCadastro(nome, email, telefone, senha) {
   if (nome) this.campoNome().type(nome);
    this.campoEmail().type(email);
    this.campoTelefone().type(telefone);
    this.campoSenha().type(senha);
    this.campoConfirmarSenha().type(senha);
    this.campoTermos().click();
    this.campoBotaoCadastrar().click()
}

}

export default new CadastroPage()