import express from "express"
import { getCartItems,removeFromCart,addToCart } from "../controllers/cartController.js"
import protectUser from "../middlewares/userMiddleware.js"

const cartRouter = express.Router()

cartRouter.post('/add',protectUser,addToCart)
cartRouter.post('/remove',protectUser,removeFromCart)
cartRouter.post('/get',protectUser,getCartItems)

export default cartRouter