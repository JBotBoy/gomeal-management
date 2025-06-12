import { Request, Response } from 'express'
import { supabase } from '../config/database'
import path from 'path'

export const getCategories = async (req: Request, res: Response) => {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        res.render('pages/categories/list', {
            title: 'Categories - GoMeal',
            categories: categories || []
        })
    } catch (error) {
        console.error('Categories list error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const getCategoryForm = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        let category = null

        if (id && id !== 'new') {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            category = data
        }

        res.render('pages/categories/form', {
            title: category ? 'Edit Category - GoMeal' : 'Add Category - GoMeal',
            category
        })
    } catch (error) {
        console.error('Category form error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const saveCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, description } = req.body
        let image_url = req.body.existing_image_url

 
        if (req.files && req.files.image) {
            const imageFile = req.files.image as any
            const fileName = `category_${Date.now()}_${imageFile.name}`
            const uploadPath = path.join(__dirname, '../../public/uploads/', fileName)
            
            await imageFile.mv(uploadPath)
            image_url = `/uploads/${fileName}`
        }

        const categoryData = {
            name,
            description,
            image_url
        }

        if (id && id !== 'new') {
      
            const { error } = await supabase
                .from('categories')
                .update(categoryData)
                .eq('id', id)

            if (error) throw error
        } else {
      
            const { error } = await supabase
                .from('categories')
                .insert(categoryData)

            if (error) throw error
        }

        res.redirect('/categories')
    } catch (error) {
        console.error('Save category error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error

        res.redirect('/categories')
    } catch (error) {
        console.error('Delete category error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}