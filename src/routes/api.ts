import { Router } from 'express'
import { supabase } from '../config/database'

const router = Router()


router.get('/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) throw error
        res.json({ success: true, data })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})


router.get('/products', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .eq('is_available', true)
            .order('name')
        
        if (error) throw error
        res.json({ success: true, data })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})


router.post('/orders', async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, items } = req.body

        
        let total_amount = 0
        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('price')
                .eq('id', item.product_id)
                .single()
            
            if (product) {
                total_amount += parseFloat(product.price) * item.quantity
            }
        }

      
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name,
                customer_email,
                customer_phone,
                total_amount,
                status: 'pending'
            })
            .select()
            .single()

        if (orderError) throw orderError

       
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) throw itemsError

        res.json({ success: true, data: order })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router