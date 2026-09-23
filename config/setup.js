#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 ===============================================');
console.log('📚 HUB DE LEITURA - Setup Automático');
console.log('🚀 ===============================================\n');

function runCommand(command, description) {
  try {
    console.log(`📦 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Concluído!\n`);
  } catch (error) {
    console.error(`❌ Erro em: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

function createDirectories() {
  const dirs = [
    'data',
    'config',
    'src/controllers',
    'src/middleware', 
    'src/routes',
    'public/css',
    'public/js',
    'public/images'
  ];

  console.log('📁 Criando estrutura de diretórios...');
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✅ ${dir}`);
    }
  });
  console.log('✅ Estrutura de diretórios criada!\n');
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  console.log(`🔍 Verificando Node.js: ${nodeVersion}`);
  
  if (majorVersion < 18) {
    console.log('⚠️  AVISO: Node.js 18+ é recomendado');
    console.log('   Versão atual pode funcionar, mas pode ter problemas');
  } else {
    console.log('✅ Versão do Node.js compatível!');
  }
  console.log();
}

function main() {
  try {
    console.log('🎯 Iniciando setup do Hub de Leitura...\n');
    
    // Verificar Node.js
    checkNodeVersion();
    
    // Criar diretórios
    createDirectories();
    
    // Instalar dependências
    console.log('📦 Instalando dependências principais...');
    const dependencies = [
      'express@^4.18.2',
      'cors@^2.8.5', 
      'body-parser@^1.20.2',
      'bcrypt@^5.1.1',
      'jsonwebtoken@^9.0.2',
      'joi@^17.11.0',
      'sqlite3@^5.1.6',
      'swagger-ui-express@^5.0.0',
      'helmet@^7.1.0',
      'dotenv@^16.3.1'
    ];
    
    runCommand(`npm install ${dependencies.join(' ')}`, 'Instalação de dependências');
    
    // Instalar dependências de desenvolvimento (opcional)
    console.log('🛠️  Instalando ferramentas de desenvolvimento (opcional)...');
    const devDependencies = [
      'nodemon@^3.0.2',
      'open@^10.0.3'
    ];
    
    try {
      runCommand(`npm install --save-dev ${devDependencies.join(' ')}`, 'Dependências de desenvolvimento');
    } catch (error) {
      console.log('⚠️  Dependências de desenvolvimento falharam, mas não são obrigatórias');
    }
    
    // Criar arquivo .env se não existir
    if (!fs.existsSync('.env')) {
      console.log('⚙️  Criando arquivo de configuração...');
      const envContent = `# Hub de Leitura - Configurações
NODE_ENV=development
PORT=3000
JWT_SECRET=hub_leitura_secret_key_qa_2024
DB_PATH=./data/library.db

# Configurações de Segurança (para produção)
# BCRYPT_ROUNDS=12
# SESSION_SECRET=your_session_secret_here

# Configurações de Upload
MAX_FILE_SIZE=5mb
UPLOAD_PATH=./public/images/covers

# Configurações de Rate Limiting  
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
`;
      fs.writeFileSync('.env', envContent);
      console.log('✅ Arquivo .env criado!\n');
    }
    
    // Verificar se server.js existe
    if (!fs.existsSync('src/server.js')) {
      console.log('⚠️  Arquivo src/server.js não encontrado!');
      console.log('   Certifique-se de ter os arquivos do projeto.');
    } else {
      console.log('✅ Arquivo principal encontrado!');
    }
    
    // Sucesso!
    console.log('\n🎉 ===============================================');
    console.log('✅ SETUP CONCLUÍDO COM SUCESSO!');
    console.log('🎉 ===============================================\n');
    
    console.log('🚀 Para iniciar o servidor:');
    console.log('   npm start\n');
    
    console.log('🌐 URLs importantes:');
    console.log('   📱 App: http://localhost:3000');
    console.log('   📖 Docs: http://localhost:3000/api-docs');
    console.log('   ❤️  Health: http://localhost:3000/api/health\n');
    
    console.log('🔑 Credenciais de teste:');
    console.log('   👑 Admin: admin@biblioteca.com / admin123');
    console.log('   👤 User: usuario@teste.com / user123\n');
    
    console.log('📚 Próximos passos:');
    console.log('   1. Execute: npm start');
    console.log('   2. Abra: http://localhost:3000');
    console.log('   3. Teste os endpoints na documentação');
    console.log('   4. Pratique cenários de QA!\n');
    
  } catch (error) {
    console.error('\n❌ Erro durante o setup:', error.message);
    console.error('\n🔧 Tente executar manualmente:');
    console.error('   npm install');
    console.error('   npm start');
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };