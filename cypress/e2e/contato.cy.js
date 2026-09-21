describe("Funcionalidade: Contato", () => {

beforeEach(() => {
    cy.visit("index.html");
  });

  it("Deve preencher o formulário de contato com sucesso", () => {
    cy.get('[name="name"]').type("Henrique");
    cy.get('[name="email"]').type("henrique@example.com");
    cy.get('[name="subject"]').select("Dúvidas Gerais");
    cy.get('[name="message"]').type("Olá, gostaria de saber mais sobre os serviços oferecidos.",
    );
    cy.get("#btn-submit").click();
    cy.contains("#alert-container", "Contato enviado com sucesso!").should(
      "be.visible",
    );
  });

  it("Deve validar mensagem de erro ao enviar sem preencher o nome", () => {
    cy.get('[name="name"]').clear();
    cy.get('[name="email"]').type("henrique@example.com");
    cy.get('[name="subject"]').select("Dúvidas Gerais");
    cy.get('[name="message"]').type(
      "Olá, gostaria de saber mais sobre os serviços oferecidos.",
    );
    cy.get("#btn-submit").click();
    cy.contains("#alert-container", "Por favor, preencha o campo Nome.").should(
      "be.visible",
    );
  });

  it("Deve validar mensagem de erro ao enviar sem preencher o email", () => {
    cy.get('[name="name"]').type("Henrique");
    cy.get('[name="email"]').clear();
    cy.get('[name="subject"]').select("Dúvidas Gerais");
    cy.get('[name="message"]').type(
      "Olá, gostaria de saber mais sobre os serviços oferecidos.",
    );
    cy.get("#btn-submit").click();
    cy.contains("#alert-container", "Por favor, preencha o campo E-mail.").should(
      "be.visible",
    );

  });
  it("Deve validar mensagem de erro ao enviar sem preencher o campo de mensagem", () => {
    cy.get('[name="name"]').type("Henrique");
    cy.get('[name="email"]').type("henrique@example.com");
    cy.get('[name="subject"]').select("Dúvidas Gerais");
    cy.get('[name="message"]').clear();
    cy.get("#btn-submit").click();
    cy.contains("#alert-container", "Por favor, escreva sua Mensagem.").should(
      "be.visible",
    );
  });
});
