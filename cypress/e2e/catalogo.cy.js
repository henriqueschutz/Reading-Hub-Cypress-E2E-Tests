///<reference types="cypress"/>
import { faker } from "@faker-js/faker";

describe("Funcionalidade: Catálogo de livros", () => {
  beforeEach(() => {
    cy.visit("catalog.html");
  });

  it.skip("Deve clicar no botão de adicionar à cesta", () => {
    cy.get(
      ":nth-child(1) > .card > .card-body > .mt-auto > .d-grid > .btn-primary",
    ).click();
    cy.get("#cart-count").should("contain", 1);
    cy.get("#global-alert-container").should(
      "contain",
      "foi adicionado à cesta!",
    );
  });

  it('Deve clicar em todos os botões "adicionar à cesta"', () => {
    cy.get(".btn-primary").click({ multiple: true });
    cy.get("#cart-count").should("contain", 12);
    cy.get("#global-alert-container").should(
      "contain",
      "foi adicionado à cesta!",
    );
  });

  it('Deve clicar no primeiro botão "adicionar à cesta"', () => {
    cy.get(".btn-primary").first().click();
    cy.get("#cart-count").should("contain", 1);
    cy.get("#global-alert-container").should(
      "contain",
      "foi adicionado à cesta!",
    );
  });

  it('Deve clicar no último botão "adicionar à cesta"', () => {
    cy.get(".btn-primary").last().click();
    cy.get("#cart-count").should("contain", 1);
    cy.get("#global-alert-container").should(
      "contain",
      "foi adicionado à cesta!",
    );
  });

  it('Deve clicar no terceiro botão "adicionar à cesta"', () => {
    cy.get(".btn-primary").eq(2).click();
    cy.get("#cart-count").should("contain", 1);
    cy.get("#global-alert-container").should(
      "contain",
      "foi adicionado à cesta!",
    );
  });

  it.only("Deve clicar no livro e acessar a página de detalhes do livro", () => {
    cy.get(".text-dark").eq(12).click();
    cy.url().should("include", "book-details.html?id=7");
    cy.get('#add-to-cart-btn').click();
    cy.get('#alert-container').should('contain', 'Livro adicionado à cesta com sucesso!');
  

  });
});
