import { Router } from 'express'
import { getProducts, getProductForm, saveProduct, deleteProduct } from '../controllers/productController'

const router = Router()

router.get('/', getProducts)
router.get('/new', getProductForm)
router.post('/new', saveProduct)
router.get('/edit/:id', getProductForm)
router.post('/edit/:id', saveProduct)
router.post('/delete/:id', deleteProduct)

export default router