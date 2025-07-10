"use strict";exports.id=9428,exports.ids=[9428],exports.modules={39428:(e,r,t)=>{t.a(e,async(e,o)=>{try{t.d(r,{y:()=>i});var a=t(80544),n=e([a]);async function i(e,r,t){try{let o;let a=await s(r),n=await c(t),i=await u(e);switch(i){case"product_inquiry":o=await d(e,a);break;case"order_status":o=await m(e,n);break;case"return_request":o=await g(e,n);break;case"technical_support":o=await f(e,a);break;case"shipping_info":o=await b(e);break;case"pricing_info":o=await _(e);break;case"contact_human":o=await v();break;case"greeting":o=await $(n);break;case"thanks":o=await k();break;default:o=await E(e,a)}return await I(r,e,o,i),o}catch(e){return console.error("Error processing message:",e),"I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team at support@midastechnical.com if you need immediate assistance."}}async function s(e){try{let r=`
      SELECT role, content, created_at
      FROM chatbot_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT 20
    `,{rows:t}=await a.pool.query(r,[e]);return t}catch(e){return console.error("Error getting conversation history:",e),[]}}async function c(e){if("anonymous"===e)return null;try{let r=`
      SELECT u.name, u.email,
        (SELECT COUNT(*) FROM orders WHERE user_id = $1) as order_count,
        (SELECT MAX(created_at) FROM orders WHERE user_id = $1) as last_order_date
      FROM users u
      WHERE u.id = $1
    `,{rows:t}=await a.pool.query(r,[e]);return t[0]||null}catch(e){return console.error("Error getting user info:",e),null}}async function u(e){let r=e.toLowerCase();for(let[e,t]of Object.entries({product_inquiry:["product","item","device","phone","screen","battery","compatible","work with","specs","specifications","details","features"],order_status:["order","status","tracking","shipped","delivery","package","arrive","when will","my order"],return_request:["return","refund","exchange","broken","damaged","wrong","not working","defective","send back"],technical_support:["help","support","issue","problem","not working","how to","instructions","guide","fix","repair"],shipping_info:["shipping","delivery","ship to","shipping cost","shipping time","how long","international","domestic"],pricing_info:["price","cost","discount","coupon","promo","sale","offer","deal","how much"],contact_human:["human","agent","person","representative","real person","speak to someone","talk to someone","customer service"],greeting:["hello","hi","hey","good morning","good afternoon","good evening","howdy","greetings"],thanks:["thank","thanks","appreciate","grateful","awesome","great","excellent"]}))for(let o of t)if(r.includes(o))return e;return"general"}async function d(e,r){try{let r=l(e);if(0===r.length)return"I'd be happy to help you with product information. Could you please specify which product you're interested in?";let t=await p(r);if(0===t.length)return`I couldn't find any products matching "${r.join(", ")}". Could you please try different keywords or browse our product categories at midastechnical.com/products?`;let o="Here's what I found based on your inquiry:\n\n";return t.slice(0,3).forEach((e,r)=>{o+=`${r+1}. ${e.name}
   Price: $${e.price.toFixed(2)}
   Category: ${e.category_name}
   Description: ${e.description.substring(0,100)}...
   View details: midastechnical.com/products/${e.slug}

`}),t.length>3&&(o+=`I found ${t.length} products matching your search. View all results at midastechnical.com/search?q=${encodeURIComponent(r.join(" "))}`),o}catch(e){return console.error("Error handling product inquiry:",e),"I'm having trouble finding product information right now. Please try browsing our products directly at midastechnical.com/products or contact our support team for assistance."}}function l(e){let r=e.toLowerCase(),t=[];for(let e of["iphone","samsung","galaxy","ipad","macbook","screen","battery","repair","tool","kit","replacement","part","lcd","display","digitizer"])r.includes(e)&&t.push(e);return t}async function p(e){try{let r=`
      SELECT id, name, slug, price, description, category_name, image_url
      FROM products
      WHERE
        ${e.map((e,r)=>`name ILIKE $${r+1} OR description ILIKE $${r+1}`).join(" OR ")}
      LIMIT 10
    `,t=e.map(e=>`%${e}%`),{rows:o}=await a.pool.query(r,t);return o}catch(e){return console.error("Error searching products:",e),[{id:1,name:"iPhone 13 Pro OLED Screen",slug:"iphone-13-pro-oled-screen",price:129.99,description:"Original quality replacement OLED screen for iPhone 13 Pro. Includes digitizer and assembly.",category_name:"iPhone Parts",image_url:"/images/products/iphone-screen.jpg"},{id:5,name:"iPhone 12 Battery Replacement Kit",slug:"iphone-12-battery-replacement-kit",price:49.99,description:"Complete battery replacement kit for iPhone 12. Includes battery, tools, and adhesive strips.",category_name:"iPhone Parts",image_url:"/images/products/iphone-battery.jpg"},{id:3,name:"Professional Repair Tool Kit",slug:"professional-repair-tool-kit",price:89.99,description:"Professional-grade repair toolkit for mobile devices. Includes precision screwdrivers, pry tools, and more.",category_name:"Repair Tools",image_url:"/images/products/repair-tools.jpg"}]}}async function m(e,r){try{let t=function(e){let r=e.match(/order\s*#?(\d+)|order\s*number\s*(\d+)|#(\d+)/i);return r?r[1]||r[2]||r[3]:null}(e);if(r){if(t){let e=await h(t,r.id);if(e){let r;return r=`Order #${e.order_number} placed on ${new Date(e.created_at).toLocaleDateString()} is currently ${e.status.toUpperCase()}.

`,"shipped"===e.status&&e.tracking_number?r+=`Your order was shipped via ${e.shipping_method} with tracking number ${e.tracking_number}.
You can track your package at midastechnical.com/track?number=${e.tracking_number}

`:"processing"===e.status?r+="Your order is being processed and will ship soon. You'll receive an email with tracking information once it ships.\n\n":"delivered"===e.status&&(r+=`Your order was delivered on ${new Date(e.delivered_at||e.updated_at).toLocaleDateString()}.

`),r+="# Order Items\n",e.items.forEach(e=>{r+=`- ${e.quantity}x ${e.product_name} ($${e.price.toFixed(2)})
`}),r+=`
# Order Summary
- Total: $${e.total_amount.toFixed(2)}
- Status: ${e.status.toUpperCase()}
`,e.tracking_number&&(r+=`- Tracking: ${e.tracking_number}
`),r+="\nYou can view complete order details at midastechnical.com/account/orders"}return`I couldn't find order #${t} associated with your account. Please check the order number and try again, or contact our support team at support@midastechnical.com for assistance.`}{let e=await y(r.id);if(!(e.length>0))return"I don't see any recent orders associated with your account. If you've placed an order and believe this is an error, please contact our support team at support@midastechnical.com.";{let r="Here are your recent orders:\n\n";return e.forEach((e,t)=>{var o;r+=(o=t+1,`${o}. Order #${e.order_number} - ${new Date(e.created_at).toLocaleDateString()}
   Status: ${e.status.toUpperCase()}
   Total: $${e.total_amount.toFixed(2)}

`)}),r+="\nYou can view all your orders at midastechnical.com/account/orders"}}}if(t)return`To check the status of order #${t}, please visit midastechnical.com/order-lookup and enter your order number and email address. Alternatively, you can sign in to your account to view all your orders.`;return"To check your order status, please sign in to your account at midastechnical.com/account/orders. If you checked out as a guest, you can look up your order at midastechnical.com/order-lookup using your order number and email address."}catch(e){return console.error("Error handling order status:",e),"I'm having trouble retrieving order information right now. Please try checking your order status at midastechnical.com/account/orders or contact our support team for assistance."}}async function h(e,r){try{let t=`
      SELECT o.id, o.order_number, o.status, o.created_at, o.total_amount,
        o.shipping_address, o.shipping_method, o.tracking_number,
        json_agg(json_build_object(
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.price
        )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = $1 AND o.user_id = $2
      GROUP BY o.id
    `,{rows:o}=await a.pool.query(t,[e,r]);return o[0]||null}catch(r){return console.error("Error getting order details:",r),{id:1,order_number:e,status:"shipped",created_at:"2023-06-15T10:30:00Z",total_amount:169.98,shipping_address:"123 Main St, Vienna, VA 22182",shipping_method:"Standard Shipping",tracking_number:"USPS12345678901",items:[{product_id:1,product_name:"iPhone 13 Pro OLED Screen",quantity:1,price:129.99},{product_id:8,product_name:"Precision Screwdriver Set",quantity:1,price:29.99}]}}}async function y(e){try{let r=`
      SELECT o.id, o.order_number, o.status, o.created_at, o.total_amount
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT 3
    `,{rows:t}=await a.pool.query(r,[e]);return t}catch(e){return console.error("Error getting recent orders:",e),[{id:1,order_number:"10001",status:"shipped",created_at:"2023-06-15T10:30:00Z",total_amount:169.98},{id:2,order_number:"10002",status:"delivered",created_at:"2023-05-20T14:45:00Z",total_amount:89.99}]}}async function g(e,r){let t="Our return policy allows returns within 30 days of delivery for most items. Items must be in original condition with all packaging and accessories.";return r?`${t}

To initiate a return for an order, please visit midastechnical.com/account/orders and select the order you wish to return. Then click the "Return Items" button and follow the instructions.

If you have any issues with the return process, please contact our support team at support@midastechnical.com or call us at +1 (240) 351-0511.`:`${t}

To initiate a return, please sign in to your account at midastechnical.com/account/orders. If you checked out as a guest, you can start a return at midastechnical.com/returns using your order number and email address.

If you need further assistance, please contact our support team at support@midastechnical.com or call us at +1 (240) 351-0511.`}async function f(e,r){let t=function(e){let r=e.toLowerCase(),t=[];for(let e of["not working","broken","cracked","damaged","won't turn on","won't charge","battery","screen","display","touch","button","speaker","microphone","camera","wifi","bluetooth","signal","water","dropped","repair","replace"])r.includes(e)&&t.push(e);return t}(e);if(0===t.length)return"I'd be happy to help with technical support. Could you please provide more details about the issue you're experiencing?";let o=await w(t);if(0===o.length)return"I don't have specific information about that issue. For technical support, please visit our support center at midastechnical.com/support or contact our technical team at support@midastechnical.com.";let a="# Technical Support Resources\n\n";return o.forEach((e,r)=>{a+=`## ${r+1}. ${e.title}
${e.summary}

Read more: midastechnical.com/support/articles/${e.slug}

`}),a+="# Need More Help?\nIf these resources don't solve your issue, please contact our technical support team:\n- Email: support@midastechnical.com\n- Phone: +1 (240) 351-0511\n- Hours: Monday-Friday, 9AM-10PM EST"}async function w(e){try{let r=`
      SELECT id, title, slug, summary, content
      FROM support_articles
      WHERE
        ${e.map((e,r)=>`title ILIKE $${r+1} OR content ILIKE $${r+1}`).join(" OR ")}
      LIMIT 3
    `,t=e.map(e=>`%${e}%`),{rows:o}=await a.pool.query(r,t);return o}catch(e){return console.error("Error searching support articles:",e),[{id:1,title:"How to Replace an iPhone Screen",slug:"how-to-replace-iphone-screen",summary:"Step-by-step guide for replacing your iPhone screen at home.",content:"Detailed instructions for iPhone screen replacement..."},{id:2,title:"Troubleshooting iPhone Battery Issues",slug:"troubleshooting-iphone-battery-issues",summary:"Common battery problems and how to fix them.",content:"Detailed troubleshooting steps for iPhone battery issues..."},{id:3,title:"Water Damage Repair Guide",slug:"water-damage-repair-guide",summary:"What to do if your device has water damage.",content:"Detailed steps for handling water damaged devices..."}]}}async function b(e){let r=function(e){let r=e.toLowerCase(),t=[];for(let e of["shipping","delivery","ship","deliver","send","receive","international","domestic","express","expedited","standard","fast","quick","overnight","time","days","cost","free"])r.includes(e)&&t.push(e);return t}(e),t="Express Shipping (1-2 business days): $12.99",o="International Shipping (7-14 business days): Starting at $19.99, varies by country.";return r.includes("international")?`${o}

We ship to most countries worldwide. Delivery times may vary based on customs processing. Import duties and taxes may apply and are the responsibility of the recipient.

For specific international shipping rates to your country, please visit midastechnical.com/shipping or contact our support team.`:r.some(e=>["express","expedited","fast","quick","overnight"].includes(e))?`${t}

Express orders placed before 2 PM EST Monday-Friday will ship the same day. Orders placed after 2 PM EST or on weekends will ship the next business day.

For overnight or priority overnight options, please call our customer service at +1 (240) 351-0511.`:r.some(e=>["free"].includes(e))?"Yes, we offer free shipping on all orders over $1000. For orders under $1000, standard shipping costs $4.99.":`# Shipping Options

## Standard Shipping
Standard Shipping (3-5 business days): Free for orders over $1000, $4.99 for orders under $1000.

## Express Shipping
${t}

## International Shipping
${o}

# Additional Information
- All orders are processed within 1 business day
- Tracking information will be emailed once your order ships
- Free shipping on orders over $1000

For more details, please visit midastechnical.com/shipping.`}async function _(e){let r=l(e);if(0===r.length)return"I'd be happy to provide pricing information. Could you please specify which product you're interested in?";let t=await p(r);if(0===t.length)return`I couldn't find any products matching "${r.join(", ")}" to provide pricing for. Could you please try different keywords or browse our products at midastechnical.com/products?`;let o="# Pricing Information\n\n";return t.slice(0,5).forEach((e,r)=>{o+=`## ${e.name}
- Current price: $${e.price.toFixed(2)}
`,e.discount_percentage&&(o+=`- Original price: $${(e.price/(1-e.discount_percentage/100)).toFixed(2)}
- Discount: ${e.discount_percentage}% off
`),o+=`- Category: ${e.category_name}
- Link: midastechnical.com/products/${e.slug}

`}),o+="# Additional Information\n- All prices are in USD and subject to change\n- Shipping and taxes may apply\n- We offer volume discounts for bulk orders\n\nFor special pricing, please contact our sales team at sales@midastechnical.com."}async function v(){return"# Contact Customer Service\n\nI understand you'd like to speak with a human representative. Our customer service team is available Monday-Friday from 9 AM to 10 PM EST.\n\n## Contact Options\n\n- Phone: +1 (240) 351-0511\n- Email: support@midastechnical.com\n- Live Chat: Available on our website during business hours\n- Address: Vienna, VA 22182\n\n## Tips for Faster Service\n\n- Please have your order number ready if your inquiry is related to a specific order\n- For technical support, please describe your device and issue in detail\n- For returns, please have your order number and reason for return ready\n\nA customer service representative will assist you as soon as possible."}async function $(e){let r=function(){let e=new Date().getHours();return e<12?"morning":e<18?"afternoon":"evening"}();return e?`Good ${r}, ${e.name}! Welcome back to MDTS. How can I assist you today?`:`Good ${r}! Welcome to MDTS. I'm your virtual assistant. How can I help you today?`}async function k(){let e=["You're welcome! Is there anything else I can help you with?","Happy to help! Do you have any other questions?","My pleasure! Is there anything else you'd like to know?","Glad I could assist. Is there anything else you need help with?","You're very welcome! Feel free to ask if you need anything else."];return e[Math.floor(Math.random()*e.length)]}async function E(e,r){let t=e.toLowerCase();for(let[e,r]of Object.entries({warranty:"We offer a 90-day warranty on all parts and a 30-day warranty on accessories. For warranty claims, please email warranty@midastechnical.com with your order number and a description of the issue.","business hours":"Our customer service team is available Monday-Friday from 9 AM to 10 PM EST. Our physical location in Vienna, VA is open Monday-Friday from 10 AM to 7 PM EST.",contact:"You can reach our customer service team at +1 (240) 351-0511 or by email at support@midastechnical.com. Our address is Vienna, VA 22182.",payment:"We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. For business orders, we also accept purchase orders and bank transfers.","repair service":"Yes, we offer repair services for iPhones, iPads, Samsung devices, and MacBooks. You can schedule a repair at midastechnical.com/repair-services or call us at +1 (240) 351-0511.",cryptocurrency:"Yes, we accept Bitcoin and several other cryptocurrencies as payment methods.","apple parts":"Our Genuine Apple Parts Program (GAPP) provides access to authentic Apple parts for repairs. These parts are sourced directly from Apple and come with full warranty support. Visit midastechnical.com/gapp for more information.","lcd buyback":"Our LCD Buyback Program allows you to sell your old LCD screens to us for cash. We accept screens from iPhones, Samsung phones, iPads, and other devices in various conditions. Visit midastechnical.com/lcd-buyback for more information.","iphone parts":"Yes, we sell a wide range of iPhone parts including screens, batteries, cameras, and other components for all iPhone models.","samsung parts":"Yes, we carry Samsung parts including screens, batteries, and other components for Galaxy S and Note series phones.","repair tools":"Yes, we offer professional repair tools including precision screwdriver sets, pry tools, heat guns, and complete repair kits.","return policy":"Our return policy allows returns within 30 days of delivery for most items. Items must be in original condition with all packaging and accessories."}))if(t.includes(e))return r;return"I'm here to help with product information, order status, returns, technical support, and more. Could you please provide more details about what you're looking for?"}async function I(e,r,t,o){try{let n=`
      INSERT INTO chatbot_analytics (
        conversation_id,
        user_message,
        bot_response,
        intent,
        timestamp
      )
      VALUES ($1, $2, $3, $4, $5)
    `;await a.pool.query(n,[e,r,t,o,new Date])}catch(e){console.error("Error logging interaction:",e)}}a=(n.then?(await n)():n)[0],o()}catch(e){o(e)}})},80544:(e,r,t)=>{t.a(e,async(e,o)=>{try{t.r(r),t.d(r,{pool:()=>i});var a=t(8678),n=e([a]);let i=new(a=(n.then?(await n)():n)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});i.on("connect",()=>{}),i.on("error",e=>{console.error("Unexpected error on idle client",e),process.exit(-1)}),o()}catch(e){o(e)}})}};