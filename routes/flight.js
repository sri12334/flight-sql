import express from 'express';

import flightControllers from '../controllers/flight.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

const {getAllFlights, getFlightById, getAddFlightForm, addFlight, updateFlight, deleteFlight} = flightControllers;

// routes
router.get('/flights', getAllFlights);
router.get('/flights/:id', getFlightById);
router.get('/add-flight', verifyToken, getAddFlightForm);
router.post('/add-flight', addFlight);
router.put('/flights/:id', verifyToken, updateFlight);
router.delete('/flights/:id', verifyToken, deleteFlight)


export default router;