import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import fileUpload from 'express-fileupload'
import expressLayouts from 'express-ejs-layouts' 

import dashboardRoutes from './routes/dashboard'
import productRoutes from './routes/products'
import categoryRoutes from './routes/categories'
import orderRoutes from './routes/orders'
import apiRoutes from './routes/api'

const app = express()

// Configure helmet with proper CSP for your application
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            
            // Allow scripts from self, CDNs, and inline scripts
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Needed for inline scripts in your EJS templates
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            
            // Allow styles from self, CDNs, and inline styles
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Needed for inline styles in your EJS templates
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            
            // Allow images from self, Supabase, and other sources
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "https://ruzivcxvsnoxzdesqudd.supabase.co", // Your specific Supabase domain
                "https://*.supabase.co", // Allow any Supabase subdomain
                "https://images.unsplash.com" // For your sample images
            ],
            
            // Allow fonts from CDNs
            fontSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com",
                "https://cdn.jsdelivr.net"
            ],
            
            // Allow connections to your API and Supabase
            connectSrc: [
                "'self'",
                "https://ruzivcxvsnoxzdesqudd.supabase.co",
                "wss://ruzivcxvsnoxzdesqudd.supabase.co" // For Supabase realtime
            ]
        }
    }
}))

app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

app.use(express.static(path.join(__dirname, '../public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

app.use(expressLayouts)
app.set('layout', 'layouts/main') 
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)

app.use('/', dashboardRoutes)
app.use('/products', productRoutes)
app.use('/categories', categoryRoutes)
app.use('/orders', orderRoutes)
app.use('/api', apiRoutes)

app.use('*', (req, res) => {
    res.status(404).render('pages/404', { title: '404 - Page Not Found' })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack)
    res.status(500).render('pages/error', { 
        title: 'Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    })
})

export default app