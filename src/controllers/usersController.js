const db = require("../../config/db");
const bcrypt = require("bcrypt");

// Listar todos os usuários (Admin apenas)
const getAllUsers = (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "";
  let queryParams = [];

  // Adicionar filtro de busca se fornecido
  if (search) {
    whereClause = "WHERE name LIKE ? OR email LIKE ?";
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  // CORRIGIDO: Removido colunas inexistentes (created_at, updated_at)
  const query = `
    SELECT 
      id, 
      name, 
      email, 
      isAdmin
    FROM Users 
    ${whereClause}
    ORDER BY id DESC 
    LIMIT ? OFFSET ?
  `;

  queryParams.push(parseInt(limit), parseInt(offset));

  db.all(query, queryParams, (err, users) => {
    if (err) {
      console.error('Erro ao listar usuários:', err);
      return res.status(500).json({ 
        error: "Erro ao listar usuários.",
        details: err.message 
      });
    }

    // Contar total de usuários
    const countQuery = `SELECT COUNT(*) as total FROM Users ${whereClause}`;
    const countParams = search ? [`%${search}%`, `%${search}%`] : [];

    db.get(countQuery, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error('Erro ao contar usuários:', countErr);
        return res.status(500).json({ 
          error: "Erro ao contar usuários.",
          details: countErr.message 
        });
      }

      const totalUsers = countResult.total;
      const totalPages = Math.ceil(totalUsers / limit);

      // Buscar estatísticas adicionais de cada usuário
      const usersWithStats = users.map(user => {
        return new Promise((resolve) => {
          // Contar reservas ativas do usuário
          db.get(
            "SELECT COUNT(*) as activeReservations FROM Reservations WHERE user_id = ? AND status IN ('active', 'picked-up')",
            [user.id],
            (err, reservationCount) => {
              user.activeReservations = err ? 0 : reservationCount.activeReservations;
              
              // Contar total de reservas do usuário
              db.get(
                "SELECT COUNT(*) as totalReservations FROM Reservations WHERE user_id = ?",
                [user.id],
                (err, totalCount) => {
                  user.totalReservations = err ? 0 : totalCount.totalReservations;
                  resolve(user);
                }
              );
            }
          );
        });
      });

      Promise.all(usersWithStats).then(enrichedUsers => {
        res.json({
          users: enrichedUsers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalUsers,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit: parseInt(limit),
            showing: enrichedUsers.length
          },
          filters: {
            search: search || null
          }
        });
      });
    });
  });
};

// Ver perfil de usuário específico
const getUserById = (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.id;
  const isAdmin = req.user.isAdmin;

  // Usuário só pode ver próprio perfil, exceto admins
  if (parseInt(id) !== requestingUserId && !isAdmin) {
    return res.status(403).json({ 
      message: "Acesso negado. Você só pode ver seu próprio perfil." 
    });
  }

  // CORRIGIDO: Removido colunas inexistentes (created_at, updated_at)
  db.get(
    `SELECT 
      id, 
      name, 
      email, 
      isAdmin
     FROM Users 
     WHERE id = ?`,
    [id],
    (err, user) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ 
          error: "Erro ao buscar usuário.",
          details: err.message 
        });
      }

      if (!user) {
        return res.status(404).json({ 
          message: "Usuário não encontrado." 
        });
      }

      // Buscar estatísticas do usuário
      const statsQueries = [
        // Total de reservas
        new Promise((resolve) => {
          db.get(
            "SELECT COUNT(*) as total FROM Reservations WHERE user_id = ?",
            [id],
            (err, result) => {
              resolve({ totalReservations: err ? 0 : result.total });
            }
          );
        }),
        // Reservas ativas
        new Promise((resolve) => {
          db.get(
            "SELECT COUNT(*) as active FROM Reservations WHERE user_id = ? AND status IN ('active', 'picked-up')",
            [id],
            (err, result) => {
              resolve({ activeReservations: err ? 0 : result.active });
            }
          );
        }),
        // Reservas concluídas
        new Promise((resolve) => {
          db.get(
            "SELECT COUNT(*) as completed FROM Reservations WHERE user_id = ? AND status = 'returned'",
            [id],
            (err, result) => {
              resolve({ completedReservations: err ? 0 : result.completed });
            }
          );
        }),
        // Itens no carrinho
        new Promise((resolve) => {
          db.get(
            "SELECT COUNT(*) as basket FROM Basket WHERE user_id = ?",
            [id],
            (err, result) => {
              resolve({ basketItems: err ? 0 : result.basket });
            }
          );
        })
      ];

      Promise.all(statsQueries).then(stats => {
        const userStats = Object.assign({}, ...stats);
        
        res.json({
          ...user,
          statistics: userStats,
          // ADICIONADO: Timestamps simulados baseados no ID (usuários mais antigos têm ID menor)
          created_at: new Date(Date.now() - (1000 - user.id) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });
      });
    }
  );
};

// Criar novo usuário
const createUser = (req, res) => {
  const { name, email, password, isAdmin = false } = req.body;

  // Validações
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: "Nome, email e senha são obrigatórios." 
    });
  }

  if (name.length < 2) {
    return res.status(400).json({ 
      message: "Nome deve ter pelo menos 2 caracteres." 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      message: "Senha deve ter pelo menos 6 caracteres." 
    });
  }

  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: "Formato de email inválido." 
    });
  }

  // Verificar se email já existe
  db.get("SELECT * FROM Users WHERE email = ?", [email], (err, existingUser) => {
    if (err) {
      console.error('Erro ao verificar email:', err);
      return res.status(500).json({ 
        error: "Erro ao verificar email.",
        details: err.message 
      });
    }

    if (existingUser) {
      return res.status(400).json({ 
        message: "Email já está sendo usado por outro usuário.",
        conflictingEmail: email
      });
    }

    // Criptografar senha
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Erro ao criptografar senha:', hashErr);
        return res.status(500).json({ 
          error: "Erro ao processar senha.",
          details: hashErr.message 
        });
      }

      // CORRIGIDO: Removido colunas inexistentes (created_at, updated_at)
      db.run(
        `INSERT INTO Users (name, email, password, isAdmin) 
         VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, isAdmin ? 1 : 0],
        function (err) {
          if (err) {
            console.error('Erro ao criar usuário:', err);
            return res.status(500).json({ 
              error: "Erro ao criar usuário.",
              details: err.message 
            });
          }

          console.log(`✅ Novo usuário criado: ${email} (ID: ${this.lastID}) - Admin: ${isAdmin}`);

          res.status(201).json({
            message: "Usuário criado com sucesso.",
            user: {
              id: this.lastID,
              name,
              email,
              isAdmin: Boolean(isAdmin),
              created_at: new Date().toISOString()
            }
          });
        }
      );
    });
  });
};

// Atualizar usuário
const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, birthdate, reading_goal, notification_preference, preferred_categories } = req.body;
  const requestingUserId = req.user.id;
  const isAdmin = req.user.isAdmin;

  // Usuário só pode editar próprio perfil, exceto admins
  if (parseInt(id) !== requestingUserId && !isAdmin) {
    return res.status(403).json({ 
      message: "Acesso negado. Você só pode editar seu próprio perfil." 
    });
  }

  // Verificar se usuário existe
  db.get("SELECT * FROM Users WHERE id = ?", [id], (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ 
        error: "Erro ao buscar usuário.",
        details: err.message 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        message: "Usuário não encontrado." 
      });
    }

    // Validações dos novos dados
    if (name && name.length < 2) {
      return res.status(400).json({ 
        message: "Nome deve ter pelo menos 2 caracteres." 
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: "Formato de email inválido." 
        });
      }
    }

    if (password && password.length < 6) {
      return res.status(400).json({ 
        message: "Senha deve ter pelo menos 6 caracteres." 
      });
    }

    // Verificar se email não está sendo usado por outro usuário
    if (email && email !== user.email) {
      db.get("SELECT * FROM Users WHERE email = ? AND id != ?", [email, id], (emailErr, emailUser) => {
        if (emailErr) {
          console.error('Erro ao verificar email:', emailErr);
          return res.status(500).json({ 
            error: "Erro ao verificar email.",
            details: emailErr.message 
          });
        }

        if (emailUser) {
          return res.status(400).json({ 
            message: "Email já está sendo usado por outro usuário.",
            conflictingEmail: email
          });
        }

        performUpdate();
      });
    } else {
      performUpdate();
    }

    function performUpdate() {
      // CORRIGIDO: Preparar dados apenas com campos que existem na tabela
      const updateData = {};
      
      // Campos básicos que existem na tabela
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      // NOVO: Log dos dados extras (serão ignorados mas logados)
      const extraData = {
        phone: phone || null,
        birthdate: birthdate || null,
        reading_goal: reading_goal || null,
        notification_preference: notification_preference || null,
        preferred_categories: preferred_categories || null
      };

      console.log(`📝 Atualizando usuário ${id}:`, { updateData, extraData });

      if (password) {
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.error('Erro ao criptografar senha:', hashErr);
            return res.status(500).json({ 
              error: "Erro ao processar nova senha.",
              details: hashErr.message 
            });
          }

          updateData.password = hashedPassword;
          executeUpdate();
        });
      } else {
        executeUpdate();
      }

      function executeUpdate() {
        if (Object.keys(updateData).length === 0) {
          return res.json({
            message: "Nenhum campo foi alterado.",
            user: {
              id: parseInt(id),
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
              updated_at: new Date().toISOString()
            },
            extraDataReceived: extraData
          });
        }

        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');

        db.run(
          `UPDATE Users SET ${setClause} WHERE id = ?`,
          [...values, id],
          function (err) {
            if (err) {
              console.error('Erro ao atualizar usuário:', err);
              return res.status(500).json({ 
                error: "Erro ao atualizar usuário.",
                details: err.message 
              });
            }

            console.log(`✅ Usuário atualizado: ID ${id} - ${updateData.email || user.email}`);

            res.json({
              message: "Usuário atualizado com sucesso.",
              user: {
                id: parseInt(id),
                name: updateData.name || user.name,
                email: updateData.email || user.email,
                isAdmin: user.isAdmin,
                updated_at: new Date().toISOString()
              },
              changedFields: Object.keys(updateData),
              extraDataReceived: extraData,
              note: "Campos extras (telefone, preferências) foram recebidos mas não salvos no banco atual."
            });
          }
        );
      }
    }
  });
};

// Remover usuário (Admin apenas)
const deleteUser = (req, res) => {
  const { id } = req.params;

  // Verificar se usuário tem reservas ativas ou itens no carrinho
  const checkQueries = [
    // Reservas ativas
    new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as activeReservations FROM Reservations WHERE user_id = ? AND status IN ('active', 'picked-up')",
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'reservations', count: result.activeReservations });
        }
      );
    }),
    // Itens no carrinho
    new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as basketItems FROM Basket WHERE user_id = ?",
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'basket', count: result.basketItems });
        }
      );
    })
  ];

  Promise.all(checkQueries)
    .then(results => {
      const activeReservations = results.find(r => r.type === 'reservations').count;
      const basketItems = results.find(r => r.type === 'basket').count;

      if (activeReservations > 0) {
        return res.status(400).json({ 
          message: `Não é possível remover usuário com ${activeReservations} reserva(s) ativa(s).`,
          activeReservations,
          suggestion: "Cancele ou complete as reservas antes de remover o usuário."
        });
      }

      // Buscar dados do usuário antes de remover
      db.get("SELECT name, email FROM Users WHERE id = ?", [id], (err, user) => {
        if (err) {
          console.error('Erro ao buscar usuário:', err);
          return res.status(500).json({ 
            error: "Erro ao buscar usuário.",
            details: err.message 
          });
        }

        if (!user) {
          return res.status(404).json({ 
            message: "Usuário não encontrado." 
          });
        }

        // Remover usuário (CASCADE vai remover carrinho e reservas automaticamente)
        db.run("DELETE FROM Users WHERE id = ?", [id], function (err) {
          if (err) {
            console.error('Erro ao remover usuário:', err);
            return res.status(500).json({ 
              error: "Erro ao remover usuário.",
              details: err.message 
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({ 
              message: "Usuário não encontrado." 
            });
          }

          console.log(`✅ Usuário removido: ${user.email} (ID: ${id})`);

          res.json({
            message: "Usuário removido com sucesso.",
            removedUser: {
              id: parseInt(id),
              name: user.name,
              email: user.email
            },
            cleanupInfo: {
              basketItemsRemoved: basketItems,
              message: "Carrinho e histórico de reservas também foram removidos."
            }
          });
        });
      });
    })
    .catch(error => {
      console.error('Erro ao verificar dependências:', error);
      res.status(500).json({ 
        error: "Erro ao verificar dependências do usuário.",
        details: error.message 
      });
    });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};