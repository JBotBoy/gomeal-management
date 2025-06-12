import { Request, Response } from 'express'
import { supabase } from '../config/database'
import path from 'path'

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        res.render('pages/products/list', {
            title: 'Products - GoMeal',
            products: products || []
        })
    } catch (error) {
        console.error('Products list error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const getProductForm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        let product = null

     
        const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (id && id !== 'new') {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            product = data
        }

        res.render('pages/products/form', {
            title: product ? 'Edit Product - GoMeal' : 'Add Product - GoMeal',
            product,
            categories: categories || []
        })
    } catch (error) {
        console.error('Product form error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const saveProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, description, price, category_id, is_available } = req.body
        let image_url = req.body.existing_image_url

        
        if (req.files && req.files.image) {
            const imageFile = req.files.image as any
            const fileName = `product_${Date.now()}_${imageFile.name}`
            const uploadPath = path.join(__dirname, '../../public/uploads/', fileName)
            
            await imageFile.mv(uploadPath)
            image_url = `/uploads/${fileName}`
        }

        const productData = {
            name,
            description,
            price: parseFloat(price),
            category_id: parseInt(category_id),
            is_available: is_available === 'on',
            image_url
        }

        if (id && id !== 'new') {
    
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', id)

            if (error) throw error
        } else {
       
            const { error } = await supabase
                .from('products')
                .insert(productData)

            if (error) throw error
        }

        res.redirect('/products')
    } catch (error) {
        console.error('Save product error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) throw error

        res.redirect('/products')
    } catch (error) {
        console.error('Delete product error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}