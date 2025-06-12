import { Router } from 'express'
import { getOrders, getOrderDetail, updateOrderStatus } from '../controllers/orderController'

const router = Router()

router.get('/', getOrders)
router.get('/detail/:id', getOrderDetail)
router.post('/status/:id', updateOrderStatus)

export default router