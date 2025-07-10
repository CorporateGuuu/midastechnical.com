"use strict";exports.id=8074,exports.ids=[8074],exports.modules={56249:(e,r)=>{Object.defineProperty(r,"l",{enumerable:!0,get:function(){return function e(r,t){return t in r?r[t]:"then"in r&&"function"==typeof r.then?r.then(r=>e(r,t)):"function"==typeof r&&"default"===t?r:void 0}}})},33739:(e,r,t)=>{t.a(e,async(e,a)=>{try{t.r(r),t.d(r,{generateBackupCodes:()=>S,generateDuoRequest:()=>f,generateVerificationCode:()=>p,getUserTwoFactorSettings:()=>w,sendEmailVerification:()=>m,sendSmsVerification:()=>E,storeVerificationCode:()=>_,updateUserTwoFactorSettings:()=>h,verifyBackupCode:()=>T,verifyCode:()=>g,verifyDuoResponse:()=>y});var s=t(84770),o=t.n(s),i=t(8678),n=t(45184),c=t.n(n),u=t(37202),l=t.n(u),d=e([i]);let A=new(i=(d.then?(await d)():d)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}}),O=c().createTransport({host:process.env.EMAIL_HOST,port:parseInt(process.env.EMAIL_PORT||"587"),secure:"true"===process.env.EMAIL_SECURE,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASSWORD}}),$=process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN?l()(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN):null,R={ikey:process.env.DUO_INTEGRATION_KEY,skey:process.env.DUO_SECRET_KEY,akey:process.env.DUO_APPLICATION_KEY,host:process.env.DUO_API_HOSTNAME};function p(e=6){return o().randomInt(1e5,999999).toString().padStart(e,"0")}async function _(e,r,t,a=600){try{let s=new Date(Date.now()+1e3*a),o=`
      SELECT id FROM two_factor_codes
      WHERE user_id = $1 AND method = $2
    `;if((await A.query(o,[e,r])).rows.length>0){let a=`
        UPDATE two_factor_codes
        SET code = $1, expires_at = $2, updated_at = NOW()
        WHERE user_id = $3 AND method = $4
      `;await A.query(a,[t,s,e,r])}else{let a=`
        INSERT INTO two_factor_codes (user_id, method, code, expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `;await A.query(a,[e,r,t,s])}return!0}catch(e){return console.error("Error storing verification code:",e),!1}}async function g(e,r,t){try{let a=`
      SELECT * FROM two_factor_codes
      WHERE user_id = $1 AND method = $2 AND code = $3 AND expires_at > NOW()
    `;if((await A.query(a,[e,r,t])).rows.length>0){let t=`
        DELETE FROM two_factor_codes
        WHERE user_id = $1 AND method = $2
      `;return await A.query(t,[e,r]),!0}return!1}catch(e){return console.error("Error verifying code:",e),!1}}async function m(e,r){try{let t=p();if(!await _(e,"email",t))return!1;let a={from:process.env.EMAIL_FROM,to:r,subject:"Your MDTS Verification Code",text:`Your verification code is: ${t}. It will expire in 10 minutes.`,html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003087;">MDTS Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
            ${t}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from MDTS. Please do not reply to this email.
          </p>
        </div>
      `};return await O.sendMail(a),!0}catch(e){return console.error("Error sending email verification:",e),!1}}async function E(e,r){try{if(!$)return console.error("Twilio client not configured"),!1;let t=p();if(!await _(e,"sms",t))return!1;return await $.messages.create({body:`Your MDTS verification code is: ${t}. It will expire in 10 minutes.`,from:process.env.TWILIO_PHONE_NUMBER,to:r}),!0}catch(e){return console.error("Error sending SMS verification:",e),!1}}function f(e,r){try{return{host:R.host,sigRequest:"mock_sig_request",userId:e}}catch(e){return console.error("Error generating DUO request:",e),null}}function y(e){try{return"verified_user"}catch(e){return console.error("Error verifying DUO response:",e),null}}async function w(e){try{let r=`
      SELECT * FROM two_factor_settings
      WHERE user_id = $1
    `,t=await A.query(r,[e]);if(t.rows.length>0)return t.rows[0];return{user_id:e,enabled:!1,preferred_method:null,email_enabled:!1,sms_enabled:!1,duo_enabled:!1,backup_codes:[]}}catch(e){return console.error("Error getting 2FA settings:",e),null}}async function h(e,r){try{let{enabled:t,preferred_method:a,email_enabled:s,sms_enabled:o,duo_enabled:i}=r,n=`
      SELECT id FROM two_factor_settings
      WHERE user_id = $1
    `;if((await A.query(n,[e])).rows.length>0){let r=`
        UPDATE two_factor_settings
        SET
          enabled = $1,
          preferred_method = $2,
          email_enabled = $3,
          sms_enabled = $4,
          duo_enabled = $5,
          updated_at = NOW()
        WHERE user_id = $6
      `;await A.query(r,[t,a,s,o,i,e])}else{let r=`
        INSERT INTO two_factor_settings (
          user_id,
          enabled,
          preferred_method,
          email_enabled,
          sms_enabled,
          duo_enabled,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `;await A.query(r,[e,t,a,s,o,i])}return!0}catch(e){return console.error("Error updating 2FA settings:",e),!1}}async function S(e,r=10){try{let t=[];for(let e=0;e<r;e++){let e=o().randomBytes(5).toString("hex").toUpperCase();t.push(e)}let a=t.map(e=>o().createHash("sha256").update(e).digest("hex")),s=`
      UPDATE two_factor_settings
      SET backup_codes = $1, updated_at = NOW()
      WHERE user_id = $2
    `;return await A.query(s,[JSON.stringify(a),e]),t}catch(e){return console.error("Error generating backup codes:",e),[]}}async function T(e,r){try{let t=`
      SELECT backup_codes FROM two_factor_settings
      WHERE user_id = $1
    `,a=await A.query(t,[e]);if(0===a.rows.length||!a.rows[0].backup_codes)return!1;let s=JSON.parse(a.rows[0].backup_codes),i=o().createHash("sha256").update(r).digest("hex"),n=s.indexOf(i);if(-1===n)return!1;s.splice(n,1);let c=`
      UPDATE two_factor_settings
      SET backup_codes = $1, updated_at = NOW()
      WHERE user_id = $2
    `;return await A.query(c,[JSON.stringify(s),e]),!0}catch(e){return console.error("Error verifying backup code:",e),!1}}a()}catch(e){a(e)}})},51004:(e,r,t)=>{t.a(e,async(e,a)=>{try{let _;t.r(r),t.d(r,{default:()=>g,getCategories:()=>l,getCategoryBySlug:()=>d,getFeaturedProducts:()=>p,getProductBySlug:()=>u,getProducts:()=>c,pool:()=>_,query:()=>n});var s=t(8678),o=t(98456),i=e([s]);s=(i.then?(await i)():i)[0];try{let e=process.env.SUPABASE_DATABASE_URL||process.env.DATABASE_URL;if(!e)throw Error("No database connection string provided");(_=new s.Pool({connectionString:e,ssl:{rejectUnauthorized:!1}})).on("error",e=>{console.error("Unexpected error on idle client",e),process.exit(-1)}),console.log("Database connection pool created successfully")}catch(e){console.error("Failed to create database connection pool:",e),_={query:async()=>(console.warn("Using mock database response"),{rows:[],rowCount:0}),on:()=>{}}}async function n(e,r){let t;Date.now();try{return t=await _.connect(),await t.query(e,r)}catch(a){console.error("Error executing query",{text:e.substring(0,100)+(e.length>100?"...":""),error:a.message});let t=Error(`Database query failed: ${a.message}`);throw t.originalError=a,t.query=e,t.params=r,t}finally{t&&t.release()}}async function c(e=1,r=20,t){try{if(o.Z){let a=o.Z.from("products").select(`
          *,
          categories:category_id (name)
        `).order("created_at",{ascending:!1}).range((e-1)*r,e*r-1);t&&(a=a.eq("categories.slug",t));let{data:s,error:i}=await a;if(i)throw i;return s.map(e=>({...e,category_name:e.categories?.name,price:parseFloat(e.price),discount_percentage:parseFloat(e.discount_percentage||0),discounted_price:e.discount_percentage?parseFloat((e.price*(1-e.discount_percentage/100)).toFixed(2)):parseFloat(e.price)}))}let a=`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `,s=[];return t&&(a+=`
        WHERE c.slug = $1
      `,s.push(t)),a+=`
      ORDER BY p.created_at DESC
      LIMIT $${s.length+1} OFFSET $${s.length+2}
    `,s.push(r,(e-1)*r),(await n(a,s)).rows.map(e=>({...e,price:parseFloat(e.price),discount_percentage:parseFloat(e.discount_percentage||0),discounted_price:e.discount_percentage?parseFloat((e.price*(1-e.discount_percentage/100)).toFixed(2)):parseFloat(e.price)}))}catch(e){return console.error("Error fetching products:",e),Array(r).fill(0).map((e,r)=>({id:r+1,name:`Sample Product ${r+1}`,slug:`sample-product-${r+1}`,description:"This is a sample product description.",price:99.99,discount_percentage:r%3==0?10:0,stock_quantity:100,category_id:1,category_name:t?t.replace(/-/g," ").replace(/\b\w/g,e=>e.toUpperCase()):"Sample Category",image_url:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}))}}async function u(e){try{if(o.Z){let{data:r,error:t}=await o.Z.from("products").select(`
          *,
          categories:category_id (name)
        `).eq("slug",e).single();if(t)throw t;if(!r)return null;let{data:a,error:s}=await o.Z.from("product_specifications").select("*").eq("product_id",r.id).single();if(s&&"PGRST116"!==s.code)throw s;return{...r,category_name:r.categories?.name,price:parseFloat(r.price),discount_percentage:parseFloat(r.discount_percentage||0),discounted_price:r.discount_percentage?parseFloat((r.price*(1-r.discount_percentage/100)).toFixed(2)):parseFloat(r.price),specifications:a||{}}}let r=`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1
    `,t=await n(r,[e]);if(0===t.rows.length)return null;let a=t.rows[0],s=`
      SELECT * FROM product_specifications
      WHERE product_id = $1
    `,i=await n(s,[a.id]);return{...a,price:parseFloat(a.price),discount_percentage:parseFloat(a.discount_percentage||0),discounted_price:a.discount_percentage?parseFloat((a.price*(1-a.discount_percentage/100)).toFixed(2)):parseFloat(a.price),specifications:i.rows[0]||{}}}catch(r){return console.error(`Error fetching product with slug ${e}:`,r),{id:1,name:`Sample Product (${e})`,slug:e,description:"This is a sample product description. The actual product could not be loaded.",price:99.99,discount_percentage:0,stock_quantity:100,category_id:1,category_name:"Sample Category",image_url:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),specifications:{}}}}async function l(){try{if(o.Z){let{data:e,error:r}=await o.Z.from("categories").select(`
          *,
          products:products(count)
        `).order("name");if(r)throw r;return e.map(e=>({...e,product_count:e.products?.count||0}))}let e=`
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name
    `;return(await n(e)).rows}catch(e){return console.error("Failed to fetch categories:",e),[{id:1,name:"iPhone Parts",slug:"iphone-parts",product_count:0},{id:2,name:"Samsung Parts",slug:"samsung-parts",product_count:0},{id:3,name:"iPad Parts",slug:"ipad-parts",product_count:0},{id:4,name:"MacBook Parts",slug:"macbook-parts",product_count:0},{id:5,name:"Repair Tools",slug:"repair-tools",product_count:0}]}}async function d(e){try{if(o.Z){let{data:r,error:t}=await o.Z.from("categories").select(`
          *,
          products:products(count)
        `).eq("slug",e).single();if(t&&"PGRST116"!==t.code)throw t;if(!r)return null;return{...r,product_count:r.products?.count||0}}let r=`
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      WHERE c.slug = $1
    `;return(await n(r,[e])).rows[0]||null}catch(r){return console.error(`Failed to fetch category with slug ${e}:`,r),({"iphone-parts":{id:1,name:"iPhone Parts",slug:"iphone-parts",product_count:0},"samsung-parts":{id:2,name:"Samsung Parts",slug:"samsung-parts",product_count:0},"ipad-parts":{id:3,name:"iPad Parts",slug:"ipad-parts",product_count:0},"macbook-parts":{id:4,name:"MacBook Parts",slug:"macbook-parts",product_count:0},"repair-tools":{id:5,name:"Repair Tools",slug:"repair-tools",product_count:0}})[e]||null}}async function p(e=8){try{if(o.Z){let{data:r,error:t}=await o.Z.from("products").select(`
          *,
          categories:category_id (name)
        `).eq("is_featured",!0).order("created_at",{ascending:!1}).limit(e);if(t)throw t;return r.map(e=>({...e,category_name:e.categories?.name,price:parseFloat(e.price),discount_percentage:parseFloat(e.discount_percentage||0),discounted_price:e.discount_percentage?parseFloat((e.price*(1-e.discount_percentage/100)).toFixed(2)):parseFloat(e.price)}))}let r=`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT $1
    `;return(await n(r,[e])).rows.map(e=>({...e,price:parseFloat(e.price),discount_percentage:parseFloat(e.discount_percentage||0),discounted_price:e.discount_percentage?parseFloat((e.price*(1-e.discount_percentage/100)).toFixed(2)):parseFloat(e.price)}))}catch(r){return console.error("Error fetching featured products:",r),Array(e).fill(0).map((e,r)=>({id:r+1,name:`Featured Product ${r+1}`,slug:`featured-product-${r+1}`,description:"This is a featured product description.",price:149.99,discount_percentage:r%2==0?15:0,stock_quantity:50,category_id:r%5+1,category_name:["iPhone Parts","Samsung Parts","iPad Parts","MacBook Parts","Repair Tools"][r%5],image_url:null,is_featured:!0,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}))}}let g={pool:_,query:n,getProducts:c,getProductBySlug:u,getCategories:l,getCategoryBySlug:d,getFeaturedProducts:p};a()}catch(e){a(e)}})},98456:(e,r,t)=>{t.d(r,{Z:()=>i,f:()=>n});var a=t(92885);let s=process.env.SUPABASE_DATABASE_URL||"https://PROD_PROJECT_ID.supabase.co",o=process.env.PUBLIC_SUPABASE_ANON_KEY||"PROD_SUPABASE_ANON_KEY_HERE";s&&o||console.warn("Supabase URL or key is missing. Make sure to set SUPABASE_DATABASE_URL and PUBLIC_SUPABASE_ANON_KEY environment variables.");let i=(0,a.createClient)(s,o,{auth:{persistSession:!0,autoRefreshToken:!0}}),n=()=>{let e=process.env.SUPABASE_DATABASE_URL||"https://PROD_PROJECT_ID.supabase.co",r=process.env.SUPABASE_ANON_KEY||process.env.PUBLIC_SUPABASE_ANON_KEY||"PROD_SUPABASE_ANON_KEY_HERE";if(!e||!r)throw console.error("Server-side Supabase URL or key is missing"),Error("Server-side Supabase configuration is missing");return(0,a.createClient)(e,r)}},45884:(e,r,t)=>{let a,s;t.r(r),t.d(r,{authOptions:()=>m,default:()=>E});var o=t(73227),i=t.n(o),n=t(47449),c=t.n(n),u=t(93598),l=t.n(u),d=t(67096),p=t.n(d);try{a=t(51004)}catch(e){a={query:async()=>({rows:[]}),getUser:async()=>null,getUserByEmail:async()=>null,createUser:async()=>({id:1}),updateUser:async()=>({id:1}),getOrder:async()=>null}}try{s=t(33739)}catch(e){s={verify2FA:async()=>!0,generate2FASecret:async()=>({secret:"placeholder-secret",qrCode:"placeholder-qrcode"}),enable2FA:async()=>!0,disable2FA:async()=>!0,getUserTwoFactorSettings:async()=>({enabled:!1,email_enabled:!1,sms_enabled:!1,duo_enabled:!1,preferred_method:"email"})}}let{query:_}=a,{getUserTwoFactorSettings:g}=s,m={providers:[c()({name:"Credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){try{let r=(await _("SELECT * FROM users WHERE email = $1",[e.email])).rows[0];if(!r||!await p().compare(e.password,r.password_hash))return null;let t=await g(r.id);if(t?.enabled)return{id:r.id,name:`${r.first_name||""} ${r.last_name||""}`.trim()||r.email.split("@")[0],email:r.email,image:r.image,requiresTwoFactor:!0,twoFactorMethods:{email_enabled:t.email_enabled,sms_enabled:t.sms_enabled,duo_enabled:t.duo_enabled,preferred_method:t.preferred_method}};return{id:r.id,name:`${r.first_name||""} ${r.last_name||""}`.trim()||r.email.split("@")[0],email:r.email,image:r.image}}catch(e){return console.error("Authentication error:",e),null}}}),c()({id:"2fa-completion",name:"2FA Completion",credentials:{userId:{label:"User ID",type:"text"},twoFactorVerified:{label:"2FA Verified",type:"text"}},async authorize(e){try{if(!e.userId||"true"!==e.twoFactorVerified)return null;let r=(await _("SELECT * FROM users WHERE id = $1",[e.userId])).rows[0];if(!r)return null;return{id:r.id,name:`${r.first_name||""} ${r.last_name||""}`.trim()||r.email.split("@")[0],email:r.email,image:r.image}}catch(e){return console.error("2FA completion error:",e),null}}}),l()({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET})],pages:{signIn:"/auth/signin",signOut:"/auth/signout",error:"/auth/error",verifyRequest:"/auth/verify-request",newUser:"/auth/new-user"},callbacks:{jwt:async({token:e,user:r,account:t})=>(r&&(e.id=r.id,r.requiresTwoFactor&&(e.requiresTwoFactor=!0,e.twoFactorMethods=r.twoFactorMethods),t?.provider==="2fa-completion"&&(e.requiresTwoFactor=!1,e.twoFactorMethods=void 0)),e),session:async({session:e,token:r})=>(e.user.id=r.id,r.requiresTwoFactor&&(e.requiresTwoFactor=!0,e.twoFactorMethods=r.twoFactorMethods),e),redirect:async({url:e,baseUrl:r})=>e.startsWith(`${r}/auth/2fa`)||e.startsWith(r)?e:r},adapter:{async createUser(e){let{name:r,email:t,image:a}=e,s="",o="";if(r){let e=r.trim().split(" ");s=e[0],o=e.length>1?e.slice(1).join(" "):""}try{let e=(await _("INSERT INTO users (first_name, last_name, email, image) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email, image",[s,o,t,a])).rows[0];return{...e,name:`${e.first_name||""} ${e.last_name||""}`.trim()||t.split("@")[0]}}catch(e){throw console.error("Error creating user:",e),e}},async getUser(e){try{let r=await _("SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE id = $1",[e]);if(!r.rows[0])return null;let t=r.rows[0];return{...t,name:`${t.first_name||""} ${t.last_name||""}`.trim()||t.email.split("@")[0]}}catch(e){return console.error("Error getting user:",e),null}},async getUserByEmail(e){try{let r=await _("SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE email = $1",[e]);if(!r.rows[0])return null;let t=r.rows[0];return{...t,name:`${t.first_name||""} ${t.last_name||""}`.trim()||t.email.split("@")[0]}}catch(e){return console.error("Error getting user by email:",e),null}},async getUserByAccount({provider:e,providerAccountId:r}){try{let t=await _(`SELECT u.id, u.first_name, u.last_name, u.email, u.email_verified, u.image
           FROM users u
           JOIN accounts a ON u.id = a.user_id
           WHERE a.provider_id = $1 AND a.provider_account_id = $2`,[e,r]);if(!t.rows[0])return null;let a=t.rows[0];return{...a,name:`${a.first_name||""} ${a.last_name||""}`.trim()||a.email.split("@")[0]}}catch(e){return console.error("Error getting user by account:",e),null}},async updateUser(e){let{id:r,name:t,email:a,image:s}=e,o="",i="";if(t){let e=t.trim().split(" ");o=e[0],i=e.length>1?e.slice(1).join(" "):""}try{let e=(await _("UPDATE users SET first_name = $1, last_name = $2, email = $3, image = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, first_name, last_name, email, image",[o,i,a,s,r])).rows[0];return{...e,name:`${e.first_name||""} ${e.last_name||""}`.trim()||a.split("@")[0]}}catch(e){throw console.error("Error updating user:",e),e}},async linkAccount(e){try{let{userId:r,provider:t,type:a,providerAccountId:s,access_token:o,refresh_token:i,expires_at:n}=e;return await _(`INSERT INTO accounts (user_id, provider_type, provider_id, provider_account_id, access_token, refresh_token, access_token_expires)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,[r,a,t,s,o,i,n?new Date(1e3*n):null]),e}catch(e){throw console.error("Error linking account:",e),e}},async createSession(e){try{return await _("INSERT INTO sessions (user_id, expires, session_token, access_token) VALUES ($1, $2, $3, $4)",[e.userId,e.expires,e.sessionToken,e.accessToken]),e}catch(e){throw console.error("Error creating session:",e),e}},async getSessionAndUser(e){try{let r=(await _("SELECT * FROM sessions WHERE session_token = $1",[e])).rows[0];if(!r)return null;let t=(await _("SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE id = $1",[r.user_id])).rows[0];if(!t)return null;let a={...t,name:`${t.first_name||""} ${t.last_name||""}`.trim()||t.email.split("@")[0]};return{session:r,user:a}}catch(e){return console.error("Error getting session and user:",e),null}},async updateSession(e){try{let{sessionToken:r,expires:t,userId:a}=e;return await _("UPDATE sessions SET expires = $1, user_id = $2 WHERE session_token = $3",[t,a,r]),e}catch(e){throw console.error("Error updating session:",e),e}},async deleteSession(e){try{await _("DELETE FROM sessions WHERE session_token = $1",[e])}catch(e){console.error("Error deleting session:",e)}}},session:{strategy:"jwt",maxAge:2592e3},secret:process.env.NEXTAUTH_SECRET,debug:!1},E=i()(m)},47153:(e,r)=>{var t;Object.defineProperty(r,"x",{enumerable:!0,get:function(){return t}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(t||(t={}))},71802:(e,r,t)=>{e.exports=t(20145)}};