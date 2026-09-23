// 🧪 DEMONSTRAÇÃO EDUCACIONAL - COOKIES
// Execute este script no Console (F12) para demonstrar funcionalidades

console.log(`
🍪 DEMONSTRAÇÃO: Sistema de Cookies Educacional
============================================

Este script irá demonstrar todas as funcionalidades do sistema de cookies
usado para controlar o modal educacional do JWT.

Instruções:
1. Abra DevTools (F12)
2. Vá para Console
3. Cole e execute este script
4. Siga as instruções que aparecerão
`);

// Função para criar delay visual
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Demonstração interativa
async function demonstracaoCookies() {
    console.log('\n🔍 ETAPA 1: Verificando estado atual...');
    
    // Verificar se tokenManager existe
    if (typeof tokenManager === 'undefined') {
        console.error('❌ tokenManager não encontrado! Certifique-se de estar na página admin-dashboard.html');
        return;
    }
    
    console.log('✅ tokenManager disponível');
    
    // Estado atual do cookie
    const estadoAtual = tokenManager.getCookie('jwt_education_shown');
    console.log(`📊 Cookie atual: jwt_education_shown = "${estadoAtual}"`);
    
    await delay(2000);
    
    console.log('\n🧪 ETAPA 2: Testando API de cookies...');
    
    // Listar todos os métodos disponíveis
    const metodos = Object.getOwnPropertyNames(tokenManager).filter(prop => 
        typeof tokenManager[prop] === 'function'
    );
    console.log('🔧 Métodos disponíveis:', metodos);
    
    await delay(2000);
    
    console.log('\n🍪 ETAPA 3: Manipulando cookies...');
    
    // Criar cookie de teste
    console.log('📝 Criando cookie de teste...');
    tokenManager.setCookie('demo_cookie', 'valor_teste', 1);
    console.log('✅ Cookie demo_cookie criado');
    
    // Ler cookie de teste
    const valorTeste = tokenManager.getCookie('demo_cookie');
    console.log(`📖 Lendo cookie: demo_cookie = "${valorTeste}"`);
    
    await delay(2000);
    
    // Remover cookie de teste
    console.log('🗑️ Removendo cookie de teste...');
    tokenManager.deleteCookie('demo_cookie');
    const valorAposRemover = tokenManager.getCookie('demo_cookie');
    console.log(`📖 Após remoção: demo_cookie = "${valorAposRemover}"`);
    
    await delay(2000);
    
    console.log('\n🎯 ETAPA 4: Testando modal educacional...');
    
    if (estadoAtual === 'true') {
        console.log('💡 Modal já foi mostrado. Vamos resetar...');
        tokenManager.resetEducationalModal();
        console.log('✅ Modal resetado! Recarregue a página para ver o modal aparecer');
    } else {
        console.log('💡 Modal ainda não foi mostrado. Vamos forçar...');
        tokenManager.showEducationalModal();
        console.log('✅ Modal forçado a aparecer!');
    }
    
    await delay(2000);
    
    console.log('\n📊 ETAPA 5: Relatório final...');
    
    // Listar todos os cookies do domínio
    const todosCookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});
    
    console.log('🍪 Todos os cookies atuais:', todosCookies);
    
    console.log(`
    
📋 COMANDOS PARA TESTAR MANUALMENTE:
=====================================

// Ver estado do modal
tokenManager.getCookie("jwt_education_shown")

// Resetar modal (remove cookie + aviso)
tokenManager.resetEducationalModal()

// Forçar modal aparecer
tokenManager.showEducationalModal()

// Criar cookie personalizado
tokenManager.setCookie("meu_cookie", "meu_valor", 7)

// Remover cookie específico
tokenManager.deleteCookie("meu_cookie")

// Ver todos os cookies
document.cookie

🎓 DEMONSTRAÇÃO COMPLETA!
========================

Agora você pode:
1. Testar os comandos acima manualmente
2. Abrir Application > Cookies no DevTools
3. Manipular cookies visualmente
4. Recarregar página para ver comportamentos
5. Testar em modo incógnito
6. Implementar testes automatizados

💡 Dica: Execute 'demonstracaoCookies()' novamente a qualquer momento!
    `);
}

// Auto-executar demonstração
demonstracaoCookies();

// Disponibilizar função globalmente para re-execução
window.demonstracaoCookies = demonstracaoCookies;

// Funções de conveniência para testes rápidos
window.testeRapido = {
    resetarModal: () => {
        tokenManager.resetEducationalModal();
        console.log('🔄 Modal resetado! Recarregue para ver aparecer');
    },
    
    forcarModal: () => {
        tokenManager.showEducationalModal();
        console.log('🎯 Modal forçado a aparecer!');
    },
    
    verCookies: () => {
        const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [name, value] = cookie.split('=');
            acc[name] = value;
            return acc;
        }, {});
        console.table(cookies);
        return cookies;
    },
    
    criarCookieTeste: (nome = 'teste', valor = 'demo', dias = 1) => {
        tokenManager.setCookie(nome, valor, dias);
        console.log(`✅ Cookie "${nome}" criado com valor "${valor}" por ${dias} dias`);
    }
};

console.log(`
🚀 FUNÇÕES RÁPIDAS DISPONÍVEIS:
==============================

testeRapido.resetarModal()     - Reseta modal educacional
testeRapido.forcarModal()      - Força modal aparecer  
testeRapido.verCookies()       - Lista todos os cookies
testeRapido.criarCookieTeste() - Cria cookie de teste

demonstracaoCookies()          - Executa demonstração completa
`);