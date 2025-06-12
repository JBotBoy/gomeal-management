import { Request, Response } from 'express'
import { supabase } from '../config/database'

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        res.render('pages/orders/list', {
            title: 'Orders - GoMeal',
            orders: orders || []
        })
    } catch (error) {
        console.error('Orders list error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const getOrderDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

      
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single()

        if (orderError) throw orderError

    
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                *,
                products (
                    id,
                    name,
                    description,
                    image_url
                )
            `)
            .eq('order_id', id)

        if (itemsError) throw itemsError

        res.render('pages/orders/detail', {
            title: `Order #${order.id} - GoMeal`,
            order,
            orderItems: orderItems || []
        })
    } catch (error) {
        console.error('Order detail error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)

        if (error) throw error

        res.redirect(`/orders/detail/${id}`)
    } catch (error) {
        console.error('Update order status error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}