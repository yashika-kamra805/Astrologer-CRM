/**
 * Client route definitions.
 * All routes require authentication — clients are scoped to req.astrologer.id.
 */

const express = require('express');
const clientController = require('../controllers/client.controller');
const consultationController = require('../controllers/consultation.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createClientRules,
  updateClientRules,
  listClientsRules,
  clientIdRules,
} = require('../validators/client.validator');
const {
  clientConsultationHistoryRules,
} = require('../validators/consultation.validator');

const router = express.Router();

// Every client route requires a valid JWT
router.use(protect);

router.post('/', createClientRules, validate, clientController.createClient);
router.get('/', listClientsRules, validate, clientController.getClients);

// Nested route — must be registered before /:id
router.get(
  '/:clientId/consultations',
  clientConsultationHistoryRules,
  validate,
  consultationController.getClientConsultations
);

router.get('/:id', clientIdRules, validate, clientController.getClientById);
router.patch('/:id', updateClientRules, validate, clientController.updateClient);
router.delete('/:id', clientIdRules, validate, clientController.deleteClient);

module.exports = router;
