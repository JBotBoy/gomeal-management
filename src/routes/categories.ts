import { Router } from 'express'
import { getCategories, getCategoryForm, saveCategory, deleteCategory } from '../controllers/categoryController'

const router = Router()

router.get('/', getCategories)
router.get('/new', getCategoryForm)
router.post('/new', saveCategory)
router.get('/edit/:id', getCategoryForm)
router.post('/edit/:id', saveCategory)
router.post('/delete/:id', deleteCategory)

export default router