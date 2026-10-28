///<reference types="cypress"/>
import { faker } from "@faker-js/faker";
import catalogos from "../fixtures/livros.json";

describe("Funcionalidade: Busca no catálogo", () => {
  beforeEach(() => {
    cy.visit("catalog.html");
  });
  it("Deve buscar o livro 1984 com sucesso", () => {
    cy.get("#search-input").type("1984");
    cy.get(".card-title > .text-dark").should("contain", "1984");
  });

  it("Deve fazer a busca de um livro do arquivo de massa de dados", () => {
    cy.get("#search-input").type(catalogos[1].livro);
    cy.get(".card-title").should("contain", catalogos[1].livro);
  });

  it("Deve fazer a busca de um livro usando fixture", () => {
    cy.fixture("livros").then((cat) => {
      cy.get("#search-input").type(cat[1].livro);
      cy.get(".card-title").should("contain", cat[1].livro);
    });
  });

  it("Deve validar todos os livros da lista", () => {
    cy.fixture("livros").then((cat) => {
      cat.forEach((item) => {
        cy.get("#search-input").clear().type(item.livro);
        cy.get(".card-title").should("contain", item.livro);
      });
    });
  });
});
