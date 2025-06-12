import dotenv from 'dotenv'
dotenv.config()

import app from './app'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📱 Management Interface: http://localhost:${PORT}`)
    console.log(`🔌 API Endpoints: http://localhost:${PORT}/api`)
})