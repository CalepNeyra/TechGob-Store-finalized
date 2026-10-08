import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/product.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getProducts);
router.post('/', verifyToken, isAdmin, createProduct);

export default router;