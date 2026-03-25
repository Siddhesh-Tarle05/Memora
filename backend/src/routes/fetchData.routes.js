import express from 'express';
const fetchDataRouter=express.Router();
import { identifyUser } from '../middlewares/auth.middleware.js';
import fetchDataController from '../controllers/fetchData.controller.js';
fetchDataRouter.post('/extract', identifyUser,fetchDataController.saveNoteController)
fetchDataRouter.post('/search',identifyUser, fetchDataController.searchNotesController)
fetchDataRouter.get("/collections", identifyUser, fetchDataController.generateCollectionsController);
fetchDataRouter.get('/getnotes',identifyUser,fetchDataController.getAllNotesController)
fetchDataRouter.get('/getcollections',identifyUser,fetchDataController.getAllCollectionsController)
fetchDataRouter.get('/getgraph', identifyUser, fetchDataController.getGraphController)
fetchDataRouter.delete('/delete/:id',identifyUser,fetchDataController.deleteNoteController)
export default fetchDataRouter;