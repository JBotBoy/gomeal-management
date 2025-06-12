import { Request, Response } from 'express'
import { supabase } from '../config/database'

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0]
        const { count: todayOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today)

        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })

        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        const { count: totalCategories } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })

        const { data: recentOrders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (ordersError) {
            console.error('Error fetching recent orders:', ordersError)
        }

        const { data: allOrders } = await supabase
            .from('orders')
            .select('created_at, total_amount, status')
            .order('created_at', { ascending: true })

        const currentYear = new Date().getFullYear()
        const { data: yearlyRevenue } = await supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', `${currentYear}-01-01`)
            .eq('status', 'completed')

        const totalRevenue = yearlyRevenue?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

        const monthlyStats: { [key: string]: number } = {}
        const monthlyRevenue: { [key: string]: number } = {}
        const monthLabels: string[] = []
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const monthKey = date.toLocaleString('default', { month: 'short' })
            monthLabels.push(monthKey)
            monthlyStats[monthKey] = 0
            monthlyRevenue[monthKey] = 0
        }

        allOrders?.forEach(order => {
            const orderDate = new Date(order.created_at)
            const monthKey = orderDate.toLocaleString('default', { month: 'short' })
            
            if (monthlyStats.hasOwnProperty(monthKey)) {
                monthlyStats[monthKey]++
                monthlyRevenue[monthKey] += parseFloat(order.total_amount)
            }
        })

        const statusBreakdown = {
            pending: 0,
            confirmed: 0,
            preparing: 0,
            ready: 0,
            completed: 0,
            cancelled: 0
        }

        if (allOrders && allOrders.length > 0) {
            allOrders.forEach(order => {
                if (statusBreakdown.hasOwnProperty(order.status)) {
                    statusBreakdown[order.status as keyof typeof statusBreakdown]++
                }
            })
        } else {
            statusBreakdown.pending = 2
            statusBreakdown.confirmed = 1
            statusBreakdown.completed = 0
            statusBreakdown.cancelled = 0
        }

        const hasMonthlyData = Object.values(monthlyStats).some(val => val > 0)
        if (!hasMonthlyData) {
            const currentMonth = new Date().toLocaleString('default', { month: 'short' })
            const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' })
            
            if (monthlyStats.hasOwnProperty(currentMonth)) {
                monthlyStats[currentMonth] = 3 
            }
            if (monthlyStats.hasOwnProperty(lastMonth)) {
                monthlyStats[lastMonth] = 1
            }
        }

        console.log('Dashboard data:', {
            todayOrders,
            totalOrders,
            totalProducts,
            recentOrdersCount: recentOrders?.length || 0,
            monthlyStats,
            statusBreakdown,
            monthLabels
        })

        res.render('pages/dashboard', {
            title: 'Dashboard - GoMeal',
            todayOrders: todayOrders || 0,
            totalOrders: totalOrders || 0,
            totalProducts: totalProducts || 0,
            totalCategories: totalCategories || 0,
            monthlyStats,
            monthlyRevenue,
            totalRevenue,
            recentOrders: recentOrders || [],
            statusBreakdown,
            monthLabels: monthLabels
        })
    } catch (error) {
        console.error('Dashboard error:', error)
        res.status(500).render('pages/error', { title: 'Error', error })
    }
}