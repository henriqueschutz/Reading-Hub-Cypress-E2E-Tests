const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const ReservationsController = require("../controllers/reservationsController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       description: Reserva de livro por um usuário
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da reserva
 *           example: 1
 *         status:
 *           type: string
 *           enum: [active, picked-up, returned, cancelled, expired]
 *           description: |
 *             Status da reserva:
 *             * `active` - Aguardando retirada (48h)
 *             * `picked-up` - Livro retirado pelo usuário (14 dias para devolver)
 *             * `returned` - Livro devolvido com sucesso
 *             * `cancelled` - Reserva cancelada pelo usuário
 *             * `expired` - Prazo de retirada expirou
 *           example: "active"
 *         calculated_status:
 *           type: string
 *           enum: [active, picked-up, returned, cancelled, expired, overdue]
 *           description: Status calculado considerando prazos (inclui 'overdue' para atraso na devolução)
 *           example: "active"
 *         reservation_date:
 *           type: string
 *           format: date-time
 *           description: Data e hora quando a reserva foi feita
 *           example: "2024-01-15T10:30:00Z"
 *         pickup_deadline:
 *           type: string
 *           format: date-time
 *           description: Prazo limite para retirar o livro (48h após reserva)
 *           example: "2024-01-17T10:30:00Z"
 *         pickup_date:
 *           type: string
 *           format: date-time
 *           description: Data quando o livro foi retirado (null se não retirado)
 *           example: "2024-01-16T14:20:00Z"
 *         return_deadline:
 *           type: string
 *           format: date-time
 *           description: Prazo para devolver o livro (14 dias após retirada)
 *           example: "2024-01-30T14:20:00Z"
 *         return_date:
 *           type: string
 *           format: date-time
 *           description: Data quando o livro foi devolvido (null se não devolvido)
 *           example: "2024-01-28T09:15:00Z"
 *         notes:
 *           type: string
 *           description: Observações sobre a reserva
 *           example: "Livro para estudo acadêmico"
 *           maxLength: 500
 *         hours_remaining:
 *           type: integer
 *           description: Horas restantes para vencimento (negativo se atrasado)
 *           example: 36
 *         title:
 *           type: string
 *           description: Título do livro reservado
 *           example: "Dom Casmurro"
 *         author:
 *           type: string
 *           description: Autor do livro
 *           example: "Machado de Assis"
 *         category:
 *           type: string
 *           description: Categoria do livro
 *           example: "Literatura Brasileira"
 *         cover_image:
 *           type: string
 *           description: Nome do arquivo da capa
 *           example: "dom-casmurro.jpg"
 *         isbn:
 *           type: string
 *           description: Código ISBN do livro
 *           example: "978-85-260-1318-3"
 *       required: [status, reservation_date, title, author]
 *     ReservationCreateRequest:
 *       type: object
 *       description: Dados para criar nova reserva
 *       properties:
 *         bookId:
 *           type: integer
 *           description: ID do livro a ser reservado
 *           example: 1
 *           minimum: 1
 *         notes:
 *           type: string
 *           description: Observações sobre a reserva (opcional)
 *           example: "Livro para trabalho de conclusão"
 *           maxLength: 500
 *       required: [bookId]
 *     ReservationUpdateRequest:
 *       type: object
 *       description: Dados para atualizar reserva
 *       properties:
 *         action:
 *           type: string
 *           enum: [cancel, update_notes]
 *           description: Ação a ser realizada na reserva
 *           example: "cancel"
 *         notes:
 *           type: string
 *           description: Novas observações (usado com action='update_notes')
 *           example: "Observações atualizadas"
 *           maxLength: 500
 *       required: [action]
 *     BasketToReservationsRequest:
 *       type: object
 *       description: Dados para criar reservas a partir do carrinho
 *       properties:
 *         notes:
 *           type: string
 *           description: Observações para todas as reservas
 *           example: "Livros para estudo do semestre"
 *           maxLength: 500
 *         clearBasket:
 *           type: boolean
 *           description: Se deve limpar o carrinho após criar reservas
 *           example: true
 *           default: true
 *     ReservationsListResponse:
 *       type: object
 *       description: Lista paginada de reservas com estatísticas
 *       properties:
 *         reservations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reservation'
 *         statistics:
 *           type: object
 *           description: Estatísticas das reservas do usuário
 *           properties:
 *             active:
 *               type: integer
 *               description: Reservas aguardando retirada
 *               example: 2
 *             pickedUp:
 *               type: integer
 *               description: Livros retirados (em posse do usuário)
 *               example: 1
 *             returned:
 *               type: integer
 *               description: Livros já devolvidos
 *               example: 5
 *             cancelled:
 *               type: integer
 *               description: Reservas canceladas
 *               example: 1
 *             overdue:
 *               type: integer
 *               description: Livros em atraso para devolução
 *               example: 0
 *             expired:
 *               type: integer
 *               description: Reservas que expiraram (não retiradas a tempo)
 *               example: 1
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 15
 *             limit:
 *               type: integer
 *               example: 20
 *             offset:
 *               type: integer
 *               example: 0
 *             hasNext:
 *               type: boolean
 *               example: false
 *             hasPrev:
 *               type: boolean
 *               example: false
 *             showing:
 *               type: integer
 *               example: 15
 *         filters:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "all"
 *             orderBy:
 *               type: string
 *               example: "desc"
 */

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags: [📝 Reserva de Livros]
 *     summary: Listar minhas reservas
 *     description: |
 *       **Lista todas as reservas do usuário autenticado com estatísticas**
 *
 *       ### 🎯 Cenários para testar:
 *       - ✅ Listar todas as reservas (sem filtros)
 *       - 🔍 Filtrar por status específico
 *       - 📄 Paginação com diferentes limites
 *       - 📊 Verificar estatísticas incluídas
 *       - ⏰ Status calculado (overdue, expired)
 *       - 🕐 Horas restantes para vencimentos
 *
 *       ### 📋 Informações incluídas:
 *       - Detalhes completos da reserva
 *       - Informações do livro (título, autor, capa)
 *       - Status calculado considerando prazos
 *       - Tempo restante para vencimentos
 *       - Estatísticas por status
 *
 *       ### ⚠️ Regras de negócio:
 *       - Usuário só vê próprias reservas
 *       - Status 'overdue' é calculado automaticamente
 *       - Status 'expired' para reservas não retiradas
 *       - Ordenação padrão: mais recentes primeiro
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         description: Filtrar por status específico
 *         schema:
 *           type: string
 *           enum: [active, picked-up, returned, cancelled, expired, overdue]
 *           example: "active"
 *       - name: limit
 *         in: query
 *         description: Número de reservas por página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           example: 20
 *       - name: offset
 *         in: query
 *         description: Número de reservas para pular (paginação)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *       - name: orderBy
 *         in: query
 *         description: Ordem das reservas
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: "desc"
 *     responses:
 *       200:
 *         description: ✅ Lista de reservas carregada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationsListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags: [📝 Reserva de Livros]
 *     summary: Criar nova reserva
 *     description: |
 *       **Cria uma nova reserva de livro para o usuário autenticado**
 *
 *       ### 🎯 Cenários para testar:
 *       - ✅ Reservar livro disponível (sucesso)
 *       - ❌ Reservar livro esgotado (400)
 *       - ❌ Reservar livro inexistente (404)
 *       - ❌ Reservar mesmo livro duas vezes (400)
 *       - ❌ Exceder limite de 5 reservas simultâneas (400)
 *       - ✅ Reserva com observações
 *       - ✅ Reserva sem observações
 *
 *       ### 🔄 Fluxo da reserva:
 *       1. **Criada** - Status 'active', prazo 48h para retirada
 *       2. **Retirada** - Admin marca como 'picked-up', prazo 14 dias
 *       3. **Devolução** - Admin marca como 'returned'
 *       4. **Cancelamento** - Usuário pode cancelar se 'active'
 *
 *       ### ⚠️ Regras de negócio:
 *       - Livro deve estar disponível (available_copies > 0)
 *       - Usuário não pode ter reserva ativa do mesmo livro
 *       - Máximo 5 reservas simultâneas por usuário
 *       - Prazo automático: 48h para retirada
 *       - Decrementa automaticamente available_copies
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationCreateRequest'
 *           examples:
 *             reserva_simples:
 *               summary: Reserva sem observações
 *               value:
 *                 bookId: 1
 *             reserva_com_notes:
 *               summary: Reserva com observações
 *               value:
 *                 bookId: 2
 *                 notes: "Livro necessário para trabalho de conclusão de curso"
 *             reserva_invalida:
 *               summary: Livro inexistente (teste de erro)
 *               value:
 *                 bookId: 9999
 *     responses:
 *       201:
 *         description: ✅ Reserva criada com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", authenticateToken, ReservationsController.getUserReservations);
router.post("/", authenticateToken, ReservationsController.createReservation);

/**
 * @swagger
 * /api/reservations/from-basket:
 *   post:
 *     tags: [📝 Reserva de Livros]
 *     summary: Criar reservas a partir do carrinho
 *     description: |
 *       **Converte todos os itens do carrinho em reservas ativas**
 *       
 *       ### 🎯 Cenários para testar:
 *       - ✅ Carrinho com livros disponíveis (sucesso)
 *       - ❌ Carrinho vazio (400)
 *       - ❌ Alguns livros ficaram indisponíveis (400)
 *       - ❌ Exceder limite de reservas simultâneas (400)
 *       - ✅ Limpeza automática do carrinho
 *       - ✅ Manter itens no carrinho (clearBasket=false)
 *       
 *       ### 🔄 Processo:
 *       1. Verifica disponibilidade de todos os itens
 *       2. Valida limite de reservas simultâneas
 *       3. Cria reservas para todos os itens válidos
 *       4. Limpa carrinho (se solicitado)
 *       5. Retorna resumo das reservas criadas
 *       
 *       ### ⚠️ Regras de negócio:
 *       - Todos os livros devem estar disponíveis
 *       - Respeitado limite de 5 reservas simultâneas
 *       - Operação é atômica (tudo ou nada)
 *       - Prazo padrão: 48h para cada retirada
 *       - Carrinho é limpo por padrão após sucesso
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BasketToReservationsRequest'
 *           examples:
 *             carrinho_completo:
 *               summary: Criar reservas e limpar carrinho
 *               value:
 *                 notes: "Livros para estudo do semestre"
 *                 clearBasket: true
 *             manter_carrinho:
 *               summary: Criar reservas mantendo carrinho
 *               value:
 *                 notes: "Reservas temporárias"
 *                 clearBasket: false
 *     responses:
 *       201:
 *         description: ✅ Reservas criadas com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/from-basket", authenticateToken, ReservationsController.createReservationsFromBasket);

/**
 * @swagger
 * /api/reservations/statistics:
 *   get:
 *     tags: [📝 Reserva de Livros]
 *     summary: Estatísticas das reservas do usuário
 *     description: |
 *       **Retorna estatísticas detalhadas das reservas do usuário**
 *       
 *       ### 📊 Informações incluídas:
 *       - Contadores por status
 *       - Métricas de performance
 *       - Histórico mensal
 *       - Categorias favoritas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Estatísticas carregadas com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/statistics", authenticateToken, ReservationsController.getUserReservationStats);

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     tags: [📝 Reserva de Livros]
 *     summary: Atualizar reserva
 *     description: |
 *       **Permite diferentes ações na reserva (cancelar, atualizar observações)**
 *
 *       ### 🔄 Ações disponíveis:
 *       - **cancel** - Cancela reserva ativa (libera o livro)
 *       - **update_notes** - Atualiza apenas as observações
 *
 *       ### ⚠️ Regras de negócio:
 *       - Usuário só pode modificar próprias reservas
 *       - Cancelamento só é permitido para reservas 'active'
 *       - Cancelar libera automaticamente o livro (available_copies++)
 *       - Observações têm limite de 500 caracteres
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da reserva a ser atualizada
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationUpdateRequest'
 *           examples:
 *             cancelar_reserva:
 *               summary: Cancelar reserva ativa
 *               value:
 *                 action: "cancel"
 *             atualizar_observacoes:
 *               summary: Atualizar observações
 *               value:
 *                 action: "update_notes"
 *                 notes: "Observações atualizadas sobre a reserva"
 *     responses:
 *       200:
 *         description: ✅ Reserva atualizada com sucesso
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags: [📝 Reserva de Livros]
 *     summary: Cancelar reserva (método alternativo)
 *     description: |
 *       **Cancela uma reserva ativa do usuário (alternativa ao PUT com action=cancel)**
 *
 *       ### ⚠️ Regras de negócio:
 *       - Apenas reservas com status 'active' podem ser canceladas
 *       - Libera automaticamente o livro para outros usuários
 *       - Operação é irreversível
 *       - Usuário só pode cancelar próprias reservas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da reserva a ser cancelada
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 8
 *     responses:
 *       200:
 *         description: ✅ Reserva cancelada com sucesso
 *       400:
 *         description: ❌ Reserva não pode ser cancelada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put("/:id", authenticateToken, ReservationsController.updateReservation);
router.delete("/:id", authenticateToken, ReservationsController.cancelReservation);

module.exports = router;