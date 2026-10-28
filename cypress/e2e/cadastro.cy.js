///<reference types="cypress"/>
import { faker } from '@faker-js/faker';
import CadastroPage from '../support/pages/cadastro-object';

describe('Funcionalidade: Cadastro no Hub de Leitura', () => {
    beforeEach(() => {
        CadastroPage.visitarPaginaCadastro();
    });

    afterEach(() => {
        cy.screenshot();
    })

    it('Deve fazer cadastro com sucesso, usando função JS', () => {
        let email = `teste${Date.now()}@teste.com`
        cy.get('#name').type('Henrique');
        cy.get('#email').type(email);
        cy.get('#phone').type('1234567890');
        cy.get('#password').type('123456');
        cy.get('#confirm-password').type('123456');
        cy.get('#terms-agreement').click();
        cy.get('#register-btn').click();
        cy.url().should('include', 'dashboard.html');
    });

    it('Deve fazer cadastro com sucesso, usando Faker', () => {
        let nome = faker.person.fullName();
        let email = faker.internet.email();
        let telefone = faker.phone.number('##########');
        let senha = faker.internet.password(22);
        cy.get('#name').type(nome);
        cy.get('#email').type(email);
        cy.get('#phone').type(telefone);
        cy.get('#password').type(senha);
        cy.get('#confirm-password').type(senha);
        cy.get('#terms-agreement').click();
        cy.get('#register-btn').click();
        cy.url().should('include', 'dashboard.html');
        cy.get('#user-name').should('contain', nome);
    });

    it('Deve fazer cadastro com sucesso, usando comando customizado', () => {
        cy.preencherCadastro(
            faker.person.fullName(),
            faker.internet.email(),
            faker.phone.number('##########'),
            faker.internet.password(22)
        )
        cy.url().should("include", "dashboard.html");
    });

    it('Deve fazer cadastro com sucesso, usando page objects', () => {
        CadastroPage.preencherCadastro(
            faker.person.fullName(),
            faker.internet.email(),
            faker.phone.number('##########'),
            faker.internet.password(22)
        )
        cy.url().should("include", "dashboard.html")
});

    it('Deve validar mensagem ao cadaastrar sem preencher nome', () => {
        CadastroPage.preencherCadastro(
            '',
            faker.internet.email(),
            faker.phone.number('##########'),
            faker.internet.password(22)
        )
        cy.get(':nth-child(1) > .invalid-feedback').should('contain', "Nome deve ter pelo menos 2 caracteres");
    })
})