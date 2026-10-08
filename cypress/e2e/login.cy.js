///<reference types="cypress"/>
import { faker } from '@faker-js/faker';
import usuario from '../fixtures/usuario.json'

describe('Funcionalidade: Login no Hub de Leitura', () => {
    beforeEach(() => {
        cy.visit('login.html');
    });
        it('Deve fazer login com sucesso', () => {
            cy.get('#email').type('usuario@teste.com');
            cy.get('#password').type('user123');
            cy.get('#login-btn').click();
            cy.url().should('include', 'dashboard.html');
        });

        it('Deve fazer login com sucesso usando comando customizado', () => {
            cy.login('usuario@teste.com', 'user123');
        });

        it('Deve fazer login com sucesso usando dados do admin', () => {
            cy.login('admin@biblioteca.com', 'admin123');
        });

        it('Deve fazer login com sucesso usando importação da massa de dados', () => {
            cy.login(usuario.email, usuario.password);
        });

});