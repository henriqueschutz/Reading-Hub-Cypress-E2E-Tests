///<reference types="cypress"/>
import { faker } from '@faker-js/faker';

describe('Funcionalidade: Cadastro no Hub de Leitura', () => {
    beforeEach(() => {
        cy.visit('register.html');
    });
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


})