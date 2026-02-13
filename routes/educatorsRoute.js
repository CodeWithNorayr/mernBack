import express from "express";
import { totalEducatorsList } from "../controllers/educatorsController.js";

const educatorsRouter = express.Router();

educatorsRouter.get( "/educators-list" , totalEducatorsList );

educatorsRouter.get( "/count-educators" , educatorsRouter );

export default educatorsRouter;