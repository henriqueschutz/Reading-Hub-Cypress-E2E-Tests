# Reading Hub — Cypress E2E Tests

![Cypress](https://img.shields.io/badge/Tests-Cypress-17202C?logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=nodedotjs&logoColor=white)

Automated end-to-end tests for a reading hub. This repository brings the educational Hub de Leitura application together with a Cypress test suite covering registration, the book catalog, the basket, and the contact form.

> **Authorship:** Henrique Schütz wrote the automated UI tests. The Hub de Leitura application used as the system under test belongs to [EBAC-QE](https://github.com/EBAC-QE/hub-de-leitura-integrado).

## English

### About the project

This is a QA portfolio project that uses Cypress to test real user journeys in an educational library application. **Henrique Schütz is the author of the tests; EBAC-QE created the Hub.**

### Test scenarios

#### User registration — `cypress/e2e/cadastro.cy.js`

- Register a user with a unique email generated at runtime.
- Register a user using names, emails, phone numbers, and passwords generated with **Faker**.
- Check the dashboard redirect and displayed user name.

#### Book catalog — `cypress/e2e/catalogo.cy.js`

- Add books to the basket and check the item counter.
- Check the confirmation message after adding a book.
- Open a book's details and add it to the basket there.

#### Contact form — `cypress/e2e/contato.cy.js`

- Submit a valid message and check the success alert.
- Check validation when name, email, or message is missing.

### Project structure

```text
.
├── config/                 # Application and database configuration
├── cypress/
│   ├── e2e/               # UI test specs
│   ├── fixtures/          # Test data
│   └── support/           # Cypress setup and commands
├── data/books.json        # Initial book data
├── public/                # HTML pages, CSS, JavaScript and images
├── scripts/init_db.js     # SQLite database initialization
├── src/                   # Express server, routes and controllers
├── cypress.config.js      # Cypress baseUrl: http://localhost:3000
└── package.json           # Dependencies; see setup note below
```

### Requirements

- Node.js **20.19+** and npm 10+ (required by the Faker version in this repository).
- Git, if you want to clone the repository.

### Run the Reading Hub

1. Clone the repository and enter its root directory:

   ```bash
   git clone https://github.com/henriqueschutz/hub-de-leitura-teste-UI.git
   cd hub-de-leitura-teste-UI
   ```

   If you downloaded a ZIP instead, extract it and open a terminal in the directory containing `package.json`, `cypress/` and `src/`.

2. Install the existing test dependencies:

   ```bash
   npm install
   ```

3. **One-time integration step:** the original test project's `package.json` does not yet list the Hub's server dependencies. Install them from the repository root; npm will update `package.json` and `package-lock.json`:

   ```bash
   npm install bcrypt@^5.1.1 body-parser@^1.20.3 cors@^2.8.5 dotenv@^17.2.0 express@^4.21.2 express-rate-limit@^8.0.1 helmet@^8.1.0 joi@^17.13.3 jsonwebtoken@^9.0.2 sqlite3@^5.1.7 swagger-jsdoc@^3.7.0 swagger-ui-express@^5.0.1
   ```

   Commit the updated package files afterward. Once they are committed, future clones need only `npm install` in this step.

4. Make sure the `database/` directory exists, then initialize SQLite **once**:

   ```bash
   mkdir database
   node scripts/init_db.js
   ```

   Skip `mkdir database` if the directory already exists. Do not rerun the initializer over a populated database: it inserts sample records again. If you intentionally want fresh sample data, stop the server, delete `database/biblioteca.db`, and rerun the initializer.

5. Start the server:

   ```bash
   node src/server.js
   ```

   Open **http://localhost:3000** for the application or **http://localhost:3000/api-docs** for the API documentation. Keep this terminal running while testing. Press `Ctrl+C` to stop it.

The initializer creates sample accounts for local testing: `admin@biblioteca.com` / `admin123` and `usuario@teste.com` / `user123`. These are demo credentials, not production accounts.

### Run the UI tests

With the Hub running on port 3000, open **another terminal** in the same repository root:

```bash
npx cypress open
```

Choose **E2E Testing**, select a browser, and click a spec to run it interactively. To run the suite in the terminal instead:

```bash
npx cypress run
```

To run a single spec:

```bash
npx cypress run --spec "cypress/e2e/catalogo.cy.js"
```

**Before running the complete catalog spec**, remove `.only` from the book details test in `cypress/e2e/catalogo.cy.js`. To include the explicitly skipped scenario as well, change its `it.skip` to `it`. Changes to the database or basket may affect later runs; reset the test data when you need a clean starting state.

### Troubleshooting

| Symptom | What to check |
| --- | --- |
| Cypress cannot reach `localhost:3000` | Start the Hub first with `node src/server.js` and leave that terminal open. |
| `Cannot find module 'express'` (or another server package) | Complete the one-time server dependency installation above. |
| `Banco de dados não encontrado` | Create `database/` if needed and run `node scripts/init_db.js` before starting the server. |
| Only the book details test runs in the catalog spec | Remove the `it.only` in `catalogo.cy.js`. |
| Port 3000 is already in use | Stop the process already using that port; Cypress is configured to target port 3000. |

### Credits

- **UI test suite:** Henrique Schütz.
- **Application under test:** [EBAC-QE — Hub de Leitura](https://github.com/EBAC-QE/hub-de-leitura-integrado). The application's original README credits Fábio Araújo.

**Author of the tests: Henrique Schütz**

---

## Português

### Hub de Leitura — Testes de UI com Cypress

Testes automatizados de ponta a ponta para um hub de leitura. Este repositório reúne a aplicação didática Hub de Leitura e uma suíte Cypress que cobre cadastro, catálogo de livros, cesta e formulário de contato.

> **Autoria:** Henrique Schütz escreveu os testes automatizados de UI. A aplicação Hub de Leitura usada nos testes é da [EBAC-QE](https://github.com/EBAC-QE/hub-de-leitura-integrado).

### Cenários de teste

#### Cadastro — `cypress/e2e/cadastro.cy.js`

- Cadastrar um usuário com e-mail único gerado durante a execução.
- Cadastrar um usuário com nome, e-mail, telefone e senha gerados pelo **Faker**.
- Conferir o redirecionamento ao painel e o nome exibido na página.

#### Catálogo — `cypress/e2e/catalogo.cy.js`

- Adicionar livros à cesta e conferir o contador.
- Conferir a mensagem de confirmação após a adição.
- Abrir os detalhes de um livro e adicioná-lo à cesta nessa página.

#### Contato — `cypress/e2e/contato.cy.js`

- Enviar uma mensagem válida e conferir o alerta de sucesso.
- Conferir as validações quando nome, e-mail ou mensagem estão vazios.

### Estrutura do projeto

```text
.
├── config/                 # Configuração da aplicação e do banco
├── cypress/
│   ├── e2e/               # Arquivos de testes de UI
│   ├── fixtures/          # Dados de teste
│   └── support/           # Configuração e comandos Cypress
├── data/books.json        # Dados iniciais dos livros
├── public/                # Páginas HTML, CSS, JavaScript e imagens
├── scripts/init_db.js     # Inicialização do banco SQLite
├── src/                   # Servidor Express, rotas e controllers
├── cypress.config.js      # baseUrl: http://localhost:3000
└── package.json           # Dependências; veja a nota de instalação
```

### Pré-requisitos

- Node.js **20.19+** e npm 10+ (exigidos pela versão do Faker usada aqui).
- Git, caso queira clonar o repositório.

### Como rodar o Hub

1. Clone o repositório e entre na pasta principal:

   ```bash
   git clone https://github.com/henriqueschutz/hub-de-leitura-teste-UI.git
   cd hub-de-leitura-teste-UI
   ```

   Se baixou um ZIP, extraia e abra o terminal na pasta que contém `package.json`, `cypress/` e `src/`.

2. Instale as dependências de teste que já constam no projeto:

   ```bash
   npm install
   ```

3. **Integração necessária uma única vez:** o `package.json` original dos testes ainda não inclui as dependências do servidor do Hub. Instale-as na raiz do repositório; o npm atualizará `package.json` e `package-lock.json`:

   ```bash
   npm install bcrypt@^5.1.1 body-parser@^1.20.3 cors@^2.8.5 dotenv@^17.2.0 express@^4.21.2 express-rate-limit@^8.0.1 helmet@^8.1.0 joi@^17.13.3 jsonwebtoken@^9.0.2 sqlite3@^5.1.7 swagger-jsdoc@^3.7.0 swagger-ui-express@^5.0.1
   ```

   Depois, faça commit dos dois arquivos atualizados. Quando essas dependências estiverem no repositório, quem clonar o projeto só precisará rodar `npm install`.

4. Confira se a pasta `database/` existe e inicialize o SQLite **uma vez**:

   ```bash
   mkdir database
   node scripts/init_db.js
   ```

   Pule o `mkdir database` se a pasta já existir. Não rode o inicializador de novo sobre um banco já preenchido: ele tenta inserir os dados de exemplo novamente. Para começar do zero de propósito, pare o servidor, apague `database/biblioteca.db` e execute o inicializador outra vez.

5. Inicie o servidor:

   ```bash
   node src/server.js
   ```

   Acesse **http://localhost:3000** para usar o Hub ou **http://localhost:3000/api-docs** para ver a documentação da API. Deixe esse terminal aberto durante os testes. Para parar, pressione `Ctrl+C`.

O inicializador cria contas de demonstração para testes locais: `admin@biblioteca.com` / `admin123` e `usuario@teste.com` / `user123`. Essas credenciais são apenas para o ambiente didático.

### Como rodar os testes de UI

Com o Hub rodando na porta 3000, abra **outro terminal** na mesma pasta principal:

```bash
npx cypress open
```

Escolha **E2E Testing**, selecione um navegador e clique no arquivo de teste para executá-lo visualmente. Para rodar pelo terminal:

```bash
npx cypress run
```

Para rodar só o catálogo:

```bash
npx cypress run --spec "cypress/e2e/catalogo.cy.js"
```

**Antes de rodar todos os cenários do catálogo**, tire o `.only` do teste de detalhes em `cypress/e2e/catalogo.cy.js`. Se também quiser executar o cenário pulado, troque `it.skip` por `it`. Alterações no banco ou na cesta podem influenciar execuções futuras; reinicialize os dados de teste quando precisar começar do zero.

### Problemas comuns

| Sintoma | O que conferir |
| --- | --- |
| Cypress não acessa `localhost:3000` | Inicie o Hub com `node src/server.js` e mantenha o terminal aberto. |
| `Cannot find module 'express'` (ou outro pacote do servidor) | Faça a instalação das dependências do Hub descrita acima. |
| `Banco de dados não encontrado` | Crie `database/` se necessário e execute `node scripts/init_db.js` antes de iniciar o servidor. |
| Só o teste de detalhes do livro roda no catálogo | Remova o `it.only` de `catalogo.cy.js`. |
| Porta 3000 ocupada | Encerre o processo que está usando a porta; o Cypress está configurado para acessá-la. |

### Créditos

- **Suíte de testes de UI:** Henrique Schütz.
- **Aplicação testada:** [EBAC-QE — Hub de Leitura](https://github.com/EBAC-QE/hub-de-leitura-integrado). O README original da aplicação credita Fábio Araújo.

**Autor dos testes: Henrique Schütz**
