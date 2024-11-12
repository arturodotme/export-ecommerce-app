import { useState } from "react";
import { ScaleLoader } from "react-spinners";
import axios from "axios";
import WooCommerceRestApi from "woocommerce-rest-ts-api";


export default function ShopifyWooCommerceForm() {
  const [error, setError] = useState(false)
  const [loading,setLoading] = useState(false)
  const [shopify, setShopify] = useState({
    store: "",
    accessToken: "",
    testProduct: undefined
  });
  const [woocommerce, setWoocommerce] = useState({
    store: "",
    key: "",
    secret: "",
    testProduct: undefined
  });

  async function testKeys(e){
    e.preventDefault();

    setShopify({...shopify, testProduct: undefined})
    setWoocommerce({...woocommerce, testProduct: undefined})

    setLoading(!loading)

    // Shopify
    const shopifyResponse = await fetch('https://f5d2-187-188-40-89.ngrok-free.app/api/export/test/shopify',{
      method: 'post',
      body: JSON.stringify({ shopify }),
      headers: { "Content-Type": "application/json" },
    })
    .catch(err => console.error(err))

    if(!shopifyResponse.ok){
      setError(true)
      setLoading(false)
      return
    }

    const shopifyProduct = await shopifyResponse.json()
    
    setShopify({...shopify,testProduct: {
      id: shopifyProduct.id,
      name: shopifyProduct.title,
      sku: shopifyProduct.variants[0].sku, 
      regular_price: shopifyProduct.variants[0].price,
      stock_quantity: shopifyProduct.variants[0].inventory_quantity,
      stock_status: shopifyProduct.variants[0].inventory_quantity>0?"instock":"outofstock",
      description: shopifyProduct.body_html,
      images: shopifyProduct.images
    }})

    // Woocommerce
    const woocommerceResponse = await fetch('https://f5d2-187-188-40-89.ngrok-free.app/api/export/test/woocommerce',{
      method: 'post',
      body: JSON.stringify({ woocommerce }),
      headers: { "Content-Type": "application/json" },
    })
    .catch(err => console.error(err))

    if(!woocommerceResponse.ok){
      setError(true)
      setLoading(false)
      return
    }

    const woocommerceProduct = await woocommerceResponse.json()

    const { id, name, sku, regular_price, stock_quantity, stock_status, description, images } = woocommerceProduct;
    setWoocommerce({...woocommerce, testProduct: {
      id,name,sku, regular_price,stock_quantity,stock_status,description,images
    }})

    setLoading(false)
  }

  async function createSingleProduct(destination){
    console.log(destination)
    const data = {
      shopify,
      woocommerce,
      destination
    }
    const apiResponse = await fetch('https://f5d2-187-188-40-89.ngrok-free.app/api/export/single',{
      method: 'post',
      body: JSON.stringify({ data }),
      headers: { "Content-Type": "application/json" },
    })
    .then(response => response.json())

    console.log(apiResponse)
  }

  return (
    <div className="flex justify-evenly items-center min-h-screen p-6">
      {(shopify.testProduct && !loading) && 
      <div className="w-full max-w-md bg-stone-800 p-8 space-y-6 rounded-lg shadow-lg">
        {(() => {
          const { name, description, images, sku, regular_price, stock_quantity } = shopify.testProduct;

          return (
            <div>
              <img src="/ShopifyLogo.png"  className="m-auto" width={120} height={120}  alt="WooCommerce Logo" />
              <table className="w-full border-collapse">
                <tbody className="text-white">
                <tr className="">
                  <td className="p-2 font-medium ">Name</td>
                  <td className="p-2 ">{name}</td>
                </tr>
                <tr className="">
                  <td className="p-2 font-medium ">SKU</td>
                  <td className="p-2 ">{sku}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium ">Regular Price</td>
                  <td className="p-2 ">{regular_price}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium ">Stock Status</td>
                  <td className="p-2 ">{stock_quantity>0?"instock":"outofstock"}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium ">Stock Quantity</td>
                  <td className="p-2 ">{stock_quantity}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium ">Description</td>
                  <td className="p-2 ">{description.length > 0 ? description : "No cuenta con descripcion"}</td>
                </tr>
                <tr className="min-h-96">
                  <td className="p-2 font-medium ">Imagenes</td>
                  <td className="p-2">
                    <img className="my-4" src={images[0]?.src ? images[0].src : "https://justhydroponics.com.au/wp-content/uploads/2022/06/woocommerce-placeholder-300x300-1.png" } alt="wc-test-product-img" height={200} width={200}/>
                    <p className="p-2 ">Cantidad de imagenes: {images.length}</p>
                  </td>
                </tr>
                </tbody>
              </table>
              <button
                type="submit"
                onClick={async () => await createSingleProduct("woocommerce")}
                className="flex items-center justify-center w-full py-2 mt-4 text-white bg-fuchsia-700 rounded-md hover:bg-fuchsia-800 focus:ring-2 transition-colors"
              >
                Crear en Woocommerce
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 ml-2"  
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"  
                  />
                </svg>
              </button>
            </div>
          );
        })()}  
      </div>
      }

      <div className="w-full max-w-lg bg-stone-900 py-8 px-10 space-y-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-200 text-center">API Credentials</h1>

        {/* Images and flow animation */}
        <h2 className="text-xl font-semibold text-gray-400 text-center">Selecciona el origen de los</h2>
        <div className="flex justify-around items-center text-center">
          <div>
            <img src="/ShopifyLogo.png" className="cursor-pointer" width={100} height={100} alt="Shopify Logo"/>
           
          </div>
          <div>
            <img src="/WooCommerceLogo.png"  className="cursor-pointer" width={100} height={100} alt="WooCommerce Logo" />
            
          </div>
         
        </div>
        <form className="space-y-4" onSubmit={async e => await testKeys(e)}>
          {/* Shopify URL */}
          <div className="flex flex-col">
          <div className="flex justify-between">
              <label htmlFor="shopify-url" className="text-gray-400 font-medium">Shopify URL </label>
              {shopify.testProduct && <p className="bg-green-500 text-right px-2 text-white rounded-md">Pass</p>}
            </div>
            <input
              type="url"
              id="shopify-url"
              className="mt-1 p-2 border border-gray-600 dark-placeholder text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://yourstore.myshopify.com"
              onChange={e => setShopify({...shopify, store: e.target.value})}
              required
            />
          </div>

          {/* Shopify Key */}
          <div className="flex flex-col">
            <div className="flex justify-between">
              <label htmlFor="shopify-key" className="text-gray-400 font-medium">Shopify Access Token</label>
              <div className="relative ml-2 group">
                <a href="https://www.youtube.com/watch?v=FQacvKAOWtc" target="_blank"className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full cursor-pointer">
                  ?
                </a>
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden w-max p-2 text-xs text-white bg-black rounded-md shadow-md group-hover:block">
                 Como generar tu Access Token con permisos para leer y escribir productos
                </div>
              </div>
            </div>
            
            <input
              type="text"
              id="shopify-key"
              className="mt-1 p-2 border border-gray-600 dark-placeholder text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              onChange={e => setShopify({...shopify, accessToken: e.target.value})}
            />
          </div>

          {/* WooCommerce URL */}
          <div className="flex flex-col">
            <div className="flex justify-between">
              <label htmlFor="woocommerce-url" className="text-gray-400 font-medium">WooCommerce URL</label>
             {woocommerce.testProduct &&  <p className="bg-green-500 text-right px-2 text-white rounded-md">Pass</p>}
            </div>
            <input
              type="url"
              id="woocommerce-url"
              className="mt-1 p-2 border border-gray-600 dark-placeholder text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://yourstore.com"
              required
              onChange={e => setWoocommerce({...woocommerce, store: e.target.value})}
            />
          </div>

          {/* WooCommerce Customer Key */}
          <div className="flex flex-col">
            <div className="flex justify-between">
              <label htmlFor="woocommerce-customer-key" className="text-gray-400 font-medium">WooCommerce Customer Key</label>
              <div className="relative ml-2 group">
                  <a href="https://woocommerce.com/document/woocommerce-rest-api/" target="_blank"className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full cursor-pointer">
                    ?
                  </a>
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden w-max p-2 text-xs text-white bg-black rounded-md shadow-md group-hover:block">
                    Como generar tu consumer y secret keys con permisos de lectura y escritura
                  </div>
                </div>
            </div>
            <input
              type="text"
              id="woocommerce-customer-key"
              className="mt-1 p-2 border border-gray-600 dark-placeholder text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              onChange={e => setWoocommerce({...woocommerce, key: e.target.value})}

            />
          </div>

          {/* WooCommerce Customer Secret */}
          <div className="flex flex-col">
            <label htmlFor="woocommerce-customer-secret" className="text-gray-400 font-medium">WooCommerce Customer Secret</label>
            <input
              type="text"
              id="woocommerce-customer-secret"
              className="mt-1 p-2 border border-gray-600 dark-placeholder text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              onChange={e => setWoocommerce({...woocommerce, secret: e.target.value})}

            />
          </div>
          <div>
          <div className="relative group w-full">
            <button
              type="submit"
              className="w-full py-2 mt-4 text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              {loading ? <ScaleLoader /> : "Test keys"}
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden w-max px-3 py-1 text-xs text-white bg-gray-800 rounded-md shadow-md group-hover:block">
              Trata de obtener los productos mas recientes de cada ecommerce
            </span>
          </div>
           {/* <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Submit
          </button> */}
          </div>
        </form>
      </div>

      {(woocommerce.testProduct && !loading) && 
      <div className="w-full max-w-md bg-stone-800 p-8 space-y-6 rounded-lg shadow-lg">
         {(() => {
          const { name, sku, regular_price, stock_quantity, stock_status, description, images } = woocommerce.testProduct;
          return (
            <div>
              <img src="/WooCommerceLogo.png"  className="m-auto" width={150} height={150}  alt="WooCommerce Logo" />
              <table className="w-full border-collapse">
                <tbody className="text-white">
                  <tr className="">
                    <td className="p-2 font-medium ">Name</td>
                    <td className="p-2 ">{name}</td>
                  </tr>
                  <tr className="">
                    <td className="p-2 font-medium ">SKU</td>
                    <td className="p-2 ">{sku}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium ">Regular Price</td>
                    <td className="p-2 ">{regular_price}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium ">Stock Status</td>
                    <td className="p-2 ">{stock_status}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium ">Stock Quantity</td>
                    <td className="p-2 ">{stock_quantity}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium ">Description</td>
                    <td className="p-2 ">{description.length > 0 ? description : "No cuenta con descripcion"}</td>
                  </tr>
                  <tr className="min-h-96">
                    <td className="p-2 font-medium ">Imagenes</td>
                    <td className="p-2">
                      <img className="my-4" src={images[0]?.src ? images[0].src : "https://justhydroponics.com.au/wp-content/uploads/2022/06/woocommerce-placeholder-300x300-1.png" } alt="wc-test-product-img" height={200} width={200}/>
                      <p className="p-2 ">Cantidad de imagenes: {images.length}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                type="submit"
                onClick={async() => await createSingleProduct("shopify")}
                className="flex items-center justify-center w-full py-2 mt-4 text-white bg-lime-600 rounded-md hover:bg-lime-700 focus:ring-2 transition-colors"
                // TODO: add vendor and category to both, as tags and categories in WC
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-2"  
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Crear en Shopify
              </button>
            </div>
          );
        })()}
      </div>
      }
    </div>
  );
}
