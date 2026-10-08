///<reference types="cypress"/>
import { faker } from "@faker-js/faker";
import catalogos from "../fixtures/livros.json";

describe("Funcionalidade: Busca no catálogo", () => {
  beforeEach(() => {
    cy.visit("catalog.html");
  });
  it("Deve buscar o livro 1984 com sucesso", () => {
    cy.get("#search-input").type("1984");
    cy.get('.card-title > .text-dark').should("contain", "1984");
  });

  it("Deve fazer a busca de um livro do arquivo de massa de dados", () => {
    cy.get('#search-input').type(catalogos[1].livro);
    cy.get(':nth-child(1) > .card > .card-body > .card-title').should("contain", catalogos[1].livro);
  });
});
