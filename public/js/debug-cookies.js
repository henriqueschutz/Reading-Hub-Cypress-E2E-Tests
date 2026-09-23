console.log('🧪 TESTE DE DEBUGGING - COOKIES');
console.log('================================');

// 1. Verificar se tokenManager existe
if (typeof tokenManager !== 'undefined') {
    console.log('✅ tokenManager está disponível');
    
    // 2. Verificar se o cookie existe
    const cookieValue = tokenManager.getCookie('jwt_education_shown');
    console.log('🍪 Cookie jwt_education_shown:', cookieValue);
    
    // 3. Verificar todos os cookies
    console.log('🍪 Todos os cookies do documento:', document.cookie);
    
    // 4. Tentar criar um cookie de teste
    console.log('📝 Criando cookie de teste...');
    tokenManager.setCookie('cookie_debug', 'teste123', 1);
    
    // 5. Verificar se foi criado
    setTimeout(() => {
        console.log('🔍 Verificando cookie de teste:', document.cookie);
        console.log('🔍 Usando método getCookie:', tokenManager.getCookie('cookie_debug'));
        
        // 6. Resetar modal para aparecer novamente
        console.log('🔄 Resetando modal educacional...');
        tokenManager.resetEducationalModal();
        
        console.log('✅ Agora recarregue a página (F5) para ver o modal aparecer!');
    }, 1000);
    
} else {
    console.error('❌ tokenManager não está disponível!');
    console.log('💡 Certifique-se de estar na página admin-dashboard.html');
}