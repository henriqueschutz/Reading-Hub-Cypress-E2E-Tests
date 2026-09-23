const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || "admin@admin";

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: "Token de acesso necessário",
      error: "MISSING_TOKEN",
      hint: "Faça login para obter um token e inclua no cabeçalho: Authorization: Bearer {token}"
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "Token expirado",
          error: "EXPIRED_TOKEN",
          expiredAt: err.expiredAt,
          hint: "Faça login novamente para obter um novo token"
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: "Token inválido",
          error: "INVALID_TOKEN",
          hint: "Verifique se o token está correto e no formato: Bearer {token}"
        });
      } else {
        return res.status(401).json({ 
          message: "Erro na verificação do token",
          error: "TOKEN_ERROR"
        });
      }
    }

    // Adicionar informações do usuário na requisição
    req.user = user;
    next();
  });
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: "Usuário não autenticado",
      error: "USER_NOT_AUTHENTICATED"
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      message: "Acesso negado. Apenas administradores podem realizar esta ação.",
      error: "ADMIN_REQUIRED",
      userRole: "user",
      requiredRole: "admin"
    });
  }

  next();
};

// Middleware combinado: autenticação + verificação de admin
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, (err) => {
    if (err) return;
    isAdmin(req, res, next);
  });
};

// Middleware para verificar se o usuário pode acessar o recurso
// (próprio recurso ou é admin)
const canAccessResource = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: "Usuário não autenticado",
      error: "USER_NOT_AUTHENTICATED"
    });
  }

  const requestedUserId = parseInt(req.params.userId || req.params.id);
  const currentUserId = req.user.id;
  const isAdmin = req.user.isAdmin;

  // Admin pode acessar qualquer recurso
  if (isAdmin) {
    return next();
  }

  // Usuário comum só pode acessar próprios recursos
  if (requestedUserId === currentUserId) {
    return next();
  }

  return res.status(403).json({ 
    message: "Acesso negado. Você só pode acessar seus próprios recursos.",
    error: "RESOURCE_ACCESS_DENIED",
    requestedUserId,
    currentUserId
  });
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// Função para gerar token JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: !!user.isAdmin
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: '8h' });
};

// Função para verificar se um token é válido (sem middleware)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

// Middleware para log de tentativas de autenticação
const logAuthAttempts = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const authHeader = req.headers['authorization'];
    const hasToken = !!authHeader;
    const endpoint = `${req.method} ${req.path}`;
    
    console.log(`🔐 Auth attempt: ${endpoint} - Token: ${hasToken ? 'present' : 'missing'}`);
    
    if (hasToken) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        console.log(`   ✅ Valid user: ${decoded.email} (admin: ${decoded.isAdmin})`);
      } else {
        console.log(`   ❌ Invalid token`);
      }
    }
  }
  next();
};

// === MIDDLEWARE DE DEBUG PARA SWAGGER ===

// Middleware para debug detalhado de autenticação
const debugAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const authHeader = req.headers['authorization'];
    const userAgent = req.headers['user-agent'] || '';
    const isSwagger = userAgent.includes('swagger') || req.headers['referer']?.includes('/api-docs');
    
    console.log('\n🔍 ===== DEBUG AUTH =====');
    console.log(`📍 Endpoint: ${req.method} ${req.path}`);
    console.log(`🌐 User-Agent: ${userAgent}`);
    console.log(`📚 É Swagger: ${isSwagger ? 'SIM' : 'NÃO'}`);
    console.log(`🔑 Auth Header: ${authHeader ? 'PRESENTE' : 'AUSENTE'}`);
    
    if (authHeader) {
      console.log(`📝 Header completo: ${authHeader}`);
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, SECRET_KEY);
          console.log(`✅ Token válido para: ${decoded.email} (Admin: ${decoded.isAdmin})`);
        } catch (error) {
          console.log(`❌ Token inválido: ${error.message}`);
        }
      }
    }
    
    console.log('🔍 ========================\n');
  }
  next();
};

// Middleware para adicionar headers CORS específicos para Swagger
const swaggerCors = (req, res, next) => {
  // Headers específicos para requisições do Swagger UI
  if (req.headers['referer']?.includes('/api-docs') || 
      req.headers['user-agent']?.includes('swagger')) {
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Responder imediatamente a requisições OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  }
  next();
};

// Middleware para interceptar e melhorar respostas de erro de autenticação
const enhanceAuthErrors = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Se é um erro de autenticação e vem do Swagger
    if (res.statusCode === 401 && 
        (req.headers['referer']?.includes('/api-docs') || 
         req.headers['user-agent']?.includes('swagger'))) {
      
      // Adicionar instruções específicas para o Swagger
      if (data && typeof data === 'object') {
        data.swagger_help = {
          message: "🔧 Problema de autenticação no Swagger?",
          steps: [
            "1. Faça login em /api/login primeiro",
            "2. Copie o token retornado (ex: 'Bearer eyJ...')",
            "3. Clique no botão 🔒 Authorize no topo do Swagger",
            "4. Cole o token completo no campo 'Value'",
            "5. Clique 'Authorize' e depois 'Close'",
            "6. Tente a requisição novamente"
          ],
          helper_page: "/swagger-helper.html",
          test_credentials: {
            admin: "admin@biblioteca.com / admin123",
            user: "usuario@teste.com / user123"
          }
        };
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  authenticateAdmin,
  canAccessResource,
  optionalAuth,
  generateToken,
  verifyToken,
  logAuthAttempts,
  debugAuth,
  swaggerCors,
  enhanceAuthErrors
};

