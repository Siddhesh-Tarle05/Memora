import express from 'express';
const fetchDataRouter=express.Router();
import { identifyUser } from '../middlewares/auth.middleware.js';
import fetchDataController from '../controllers/fetchData.controller.js';
import upload from '../middlewares/upload.middleware.js';
fetchDataRouter.post('/extract', identifyUser,fetchDataController.saveNoteController)
fetchDataRouter.post('/uploadpdf', identifyUser, upload.single('pdf'), fetchDataController.uploadPdfController)
fetchDataRouter.post('/search',identifyUser, fetchDataController.searchNotesController)
fetchDataRouter.get("/collections", identifyUser, fetchDataController.generateCollectionsController);
fetchDataRouter.get('/getnotes',identifyUser,fetchDataController.getAllNotesController)
fetchDataRouter.get('/getcollections',identifyUser,fetchDataController.getAllCollectionsController)
fetchDataRouter.get('/getgraph', identifyUser, fetchDataController.getGraphController)
fetchDataRouter.delete('/delete/:id',identifyUser,fetchDataController.deleteNoteController)

// Memory Resurfacing & Highlights
fetchDataRouter.patch('/notes/:id/highlight', identifyUser, fetchDataController.toggleHighlightController);
fetchDataRouter.get('/highlights', identifyUser, fetchDataController.getHighlightedNotesController);
fetchDataRouter.get('/resurface', identifyUser, fetchDataController.getResurfacedNotesController);

export default fetchDataRouter;