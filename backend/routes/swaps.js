const express = require('express');
const SwapController = require('../controllers/swapController');

const router = express.Router();

// Swap management
router.post('/', SwapController.createSwap);
router.get('/', SwapController.getMySwaps);
router.get('/:id', SwapController.getSwapById);
router.put('/:id/status', SwapController.updateSwapStatus);
router.delete('/:id', SwapController.cancelSwap);

// Swap offers
router.post('/:id/offer', SwapController.makeOffer);
router.put('/:id/offer/:offerId', SwapController.updateOffer);
router.delete('/:id/offer/:offerId', SwapController.cancelOffer);
router.post('/:id/offer/:offerId/accept', SwapController.acceptOffer);
router.post('/:id/offer/:offerId/reject', SwapController.rejectOffer);

// Swap history
router.get('/history/completed', SwapController.getCompletedSwaps);
router.get('/history/pending', SwapController.getPendingSwaps);

module.exports = router; 