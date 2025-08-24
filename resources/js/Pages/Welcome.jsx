import { useState } from 'react'

export default function Welcome({ products }) {
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  const addToCart = (product) => {
    setCart([...cart, product])
    
    // Meta Pixel AddToCart event with COST PRICE
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.sku],
        content_type: 'product',
        currency: 'MYR',
        value: product.cost_price, // Send COST price, not retail
        contents: [{
          id: product.sku,
          quantity: 1
        }]
      })
    }
    
    alert(`${product.name} added to cart!`)
  }

  const viewProduct = (product) => {
    setSelectedProduct(product)
    
    // Meta Pixel ViewContent event with COST PRICE
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product.sku],
        content_type: 'product',
        currency: 'MYR',
        value: product.cost_price // Send COST price, not retail
      })
    }
  }

  const initiateCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!')
      return
    }

    const totalCostPrice = cart.reduce((sum, item) => sum + parseFloat(item.cost_price), 0)
    
    // Meta Pixel InitiateCheckout event with COST PRICE
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cart.map(item => item.sku),
        currency: 'MYR',
        value: totalCostPrice, // Send COST price, not retail
        num_items: cart.length,
        contents: cart.map(item => ({
          id: item.sku,
          quantity: 1
        }))
      })
    }

    // Simulate purchase
    setTimeout(() => {
      // Meta Pixel Purchase event with COST PRICE
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          currency: 'MYR',
          value: totalCostPrice, // REQUIRED - Send COST price, not retail
          content_ids: cart.map(item => item.sku), // REQUIRED
          content_type: 'product',
          num_items: cart.length,
          contents: cart.map(item => ({
            id: item.sku,
            quantity: 1,
            price: item.cost_price // COST price
          }))
        })
      }
      
      alert(`Purchase complete! Total: RM${totalCostPrice.toFixed(2)} (cost price sent to Meta Pixel)`)
      setCart([])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Sales Page MVP</h1>
        <p className="text-center text-gray-600 mb-8">Meta Pixel tracking COST prices (not retail prices)</p>
        
        {/* Products Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-600">RM{product.retail_price}</div>
                <div className="text-sm text-gray-500">Cost Price: RM{product.cost_price} (sent to Meta Pixel)</div>
                <div className="text-sm text-blue-500">{product.product_count} product(s)</div>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => viewProduct(product)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  View Product
                </button>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Shopping Cart ({cart.length} items)</h2>
          
          {cart.length > 0 ? (
            <div>
              <div className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <span>{item.name}</span>
                    <div>
                      <span className="text-green-600">RM{item.retail_price}</span>
                      <span className="text-xs text-gray-500 ml-2">(Cost: RM{item.cost_price})</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-right mb-4">
                <div className="text-xl font-bold">
                  Retail Total: RM{cart.reduce((sum, item) => sum + parseFloat(item.retail_price), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  Cost Total: RM{cart.reduce((sum, item) => sum + parseFloat(item.cost_price), 0).toFixed(2)} (sent to Meta Pixel)
                </div>
              </div>
              
              <button 
                onClick={initiateCheckout}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded text-lg font-semibold hover:bg-orange-600"
              >
                Checkout & Purchase
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Cart is empty</p>
          )}
        </div>

        {/* Selected Product Details */}
        {selectedProduct && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold mb-2">Product Details</h3>
            <p><strong>Name:</strong> {selectedProduct.name}</p>
            <p><strong>SKU:</strong> {selectedProduct.sku}</p>
            <p><strong>Description:</strong> {selectedProduct.description}</p>
            <p><strong>Retail Price:</strong> RM{selectedProduct.retail_price}</p>
            <p><strong>Cost Price (sent to Meta Pixel):</strong> RM{selectedProduct.cost_price}</p>
            <p><strong>Product Count:</strong> {selectedProduct.product_count}</p>
          </div>
        )}
      </div>
    </div>
  )
}