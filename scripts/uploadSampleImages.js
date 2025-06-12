require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY 
)


async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('URL:', process.env.SUPABASE_URL)
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}


async function checkBuckets() {
  console.log('🪣 Checking storage buckets...')
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Failed to list buckets:', error)
      return false
    }
    
    console.log('📋 Available buckets:', buckets.map(b => b.name))
    
    const requiredBuckets = ['category-images', 'product-images']
    const missingBuckets = requiredBuckets.filter(name => 
      !buckets.find(bucket => bucket.name === name)
    )
    
    if (missingBuckets.length > 0) {
      console.error('❌ Missing buckets:', missingBuckets)
      console.log('\n📝 Create these buckets in Supabase Dashboard:')
      missingBuckets.forEach(bucket => {
        console.log(`   - ${bucket} (make it public)`)
      })
      return false
    }
    
    console.log('✅ All required buckets exist')
    return true
  } catch (error) {
    console.error('❌ Error checking buckets:', error)
    return false
  }
}


const sampleImages = {
  categories: {
    'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    'Pizza': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
    'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500',
    'Salads': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    'Sides': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'
  },
  products: {

    'Classic Fish Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    'Beef Deluxe Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    'Double Cheese Burger': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
    'Chicken Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    'Veggie Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    

    'Margherita Pizza': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    'Pepperoni Pizza': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    'Hawaiian Pizza': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
    'Meat Lovers Pizza': 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500',
    'Vegetarian Pizza': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500',
    

    'Coca Cola': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
    'Orange Juice': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500',
    'Water': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500',
    'Coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500',
    'Milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
    

    'Chocolate Cake': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500',
    'Ice Cream': 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=500',
    'Apple Pie': 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?w=500',
    

    'Caesar Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    'Greek Salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
    

    'French Fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
    'Onion Rings': 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500'
  }
}

async function downloadAndUploadImage(imageUrl, bucket, filePath) {
  try {
    console.log(`📥 Downloading: ${filePath}`)
    

    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) throw error
    

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    console.log(`✅ Uploaded: ${filePath}`)
    console.log(`🔗 Public URL: ${publicUrlData.publicUrl}`)
    return publicUrlData.publicUrl
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error)
    return null
  }
}

async function uploadAllImages() {
  console.log('🚀 Starting image upload process...')
  

  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.log('❌ Aborting due to connection issues')
    return
  }
  

  const bucketsOk = await checkBuckets()
  if (!bucketsOk) {
    console.log('❌ Aborting due to missing buckets')
    console.log('\n🔧 Fix: Go to Supabase Dashboard > Storage and create the missing buckets')
    return
  }
  

  console.log('\n📁 Uploading category images...')
  for (const [categoryName, imageUrl] of Object.entries(sampleImages.categories)) {
    const fileName = `${categoryName.toLowerCase().replace(/\s+/g, '-')}.jpg`
    const publicUrl = await downloadAndUploadImage(imageUrl, 'category-images', `categories/${fileName}`)
    
    if (publicUrl) {

      const { error } = await supabase
        .from('categories')
        .update({ image_url: publicUrl })
        .eq('name', categoryName)
      
      if (error) {
        console.error(`❌ Error updating category ${categoryName}:`, error)
      } else {
        console.log(`✅ Updated category: ${categoryName}`)
      }
    }
  }
  

  console.log('\n🍔 Uploading product images...')
  for (const [productName, imageUrl] of Object.entries(sampleImages.products)) {
    const fileName = `${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`
    const publicUrl = await downloadAndUploadImage(imageUrl, 'product-images', `products/${fileName}`)
    
    if (publicUrl) {

      const { error } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('name', productName)
      
      if (error) {
        console.error(`❌ Error updating product ${productName}:`, error)
      } else {
        console.log(`✅ Updated product: ${productName}`)
      }
    }
  }
  
  console.log('\n🎉 Image upload process completed!')
  console.log('🔥 Your GoMeal project now has beautiful images!')
}

uploadAllImages().catch(console.error)