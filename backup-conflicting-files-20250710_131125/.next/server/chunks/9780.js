"use strict";exports.id=9780,exports.ids=[9780],exports.modules={79587:(e,t,a)=>{async function n(e,t,a,n){try{if(!e)throw Error("No template provided for message generation");let s=r(e,t,a);return a.useAiEnhancement&&(s=await i(s,t,a,n)),s=function(e,t){switch(t.toLowerCase()){case"email":let a;return a=e.replace(/\n/g,"<br>"),a=`<div style="font-family: Arial, sans-serif; line-height: 1.6;">${a}</div>`;case"whatsapp":let n;return e.replace(/\n{3,}/g,"\n\n");case"linkedin":let r;return(r=e).length>1900&&(r=r.substring(0,1897)+"..."),r=r.replace(/\n{3,}/g,"\n\n");case"facebook":let i;return e.replace(/\n{3,}/g,"\n\n");case"instagram":let s;return(s=e).length>1e3&&(s=s.substring(0,997)+"..."),s=s.replace(/\n{3,}/g,"\n\n");case"telegram":let c;return e.replace(/\n{3,}/g,"\n\n");default:return e}}(s,n)}catch(n){return console.error("Error generating personalized message:",n),r(e,t,a)}}function r(e,t,a){var n;let r=e;if(t&&(r=(r=(r=(r=(r=(r=r.replace(/{{recipient\.name}}/g,t.name||"")).replace(/{{recipient\.firstName}}/g,((n=t.name)?n.split(" ")[0]:"")||"")).replace(/{{recipient\.email}}/g,t.email||"")).replace(/{{recipient\.phone}}/g,t.phone||"")).replace(/{{recipient\.company}}/g,t.metadata?.company||"")).replace(/{{recipient\.position}}/g,t.metadata?.position||""),t.metadata))for(let[e,a]of Object.entries(t.metadata))r=r.replace(RegExp(`{{recipient\\.metadata\\.${e}}}`,"g"),a||"");a&&(r=(r=(r=(r=(r=r.replace(/{{campaign\.name}}/g,a.name||"")).replace(/{{campaign\.company}}/g,a.company||"")).replace(/{{campaign\.website}}/g,a.website||"")).replace(/{{campaign\.phone}}/g,a.phone||"")).replace(/{{campaign\.email}}/g,a.email||""));let i=new Date;return(r=r.replace(/{{date}}/g,i.toLocaleDateString())).replace(/{{time}}/g,i.toLocaleTimeString())}async function i(e,t,a,n){try{let r={recipientName:t.name,recipientCompany:t.metadata?.company,recipientPosition:t.metadata?.position,recipientIndustry:t.metadata?.industry,campaignPurpose:a.purpose,campaignCompany:a.company,channel:n,originalMessage:e},i=await s(e,r,n);if(!i||!i.enhancedMessage)return console.warn("AI enhancement failed, using original message"),e;return i.enhancedMessage}catch(t){return console.error("Error enhancing message with AI:",t),e}}async function s(e,t,a){try{await new Promise(e=>setTimeout(e,500));let{tone:n,style:r}=function(e){switch(e.toLowerCase()){case"linkedin":return{tone:"professional",style:"concise"};case"email":return{tone:"professional",style:"detailed"};case"whatsapp":return{tone:"casual",style:"concise"};case"facebook":return{tone:"casual",style:"friendly"};case"instagram":return{tone:"casual",style:"visual"};case"telegram":return{tone:"casual",style:"direct"};default:return{tone:"neutral",style:"balanced"}}}(a),i=e;if(t.recipientName&&!e.includes(t.recipientName)&&(i=`Hi ${t.recipientName}, 

${i}`),"professional"===n?i=i.replace(/Hey/g,"Hello").replace(/Hi there/g,"Greetings").replace(/Thanks/g,"Thank you").replace(/Cheers/g,"Best regards"):"casual"===n&&(i=i.replace(/Dear/g,"Hi").replace(/Greetings/g,"Hey there").replace(/Best regards/g,"Cheers").replace(/Thank you/g,"Thanks")),t.recipientIndustry){let e={technology:"As someone working in technology, you'll appreciate how our solution leverages cutting-edge innovations.",healthcare:"In the healthcare sector, compliance and security are paramount, which is why our solution was designed with these priorities in mind.",finance:"For finance professionals like yourself, ROI and data security are critical factors that our solution addresses.",education:"Educators like you understand the importance of scalable and accessible solutions, which is exactly what we provide.",retail:"In the competitive retail space, customer engagement is key, and our solution helps you stand out."}[t.recipientIndustry.toLowerCase()]||`In the ${t.recipientIndustry} industry, staying ahead of trends is crucial.`;i.includes(t.recipientIndustry)||(i+=`

${e}`)}return i.match(/Regards|Sincerely|Cheers|Thanks|Thank you/i)||("professional"===n?i+=`

Best regards,
${t.campaignCompany} Team`:i+=`

Cheers,
${t.campaignCompany} Team`),{enhancedMessage:i,confidence:.92,tone:n,style:r}}catch(e){return console.error("Error calling AI service:",e),null}}a.d(t,{J:()=>n})},53063:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.d(t,{R:()=>s});var r=a(80544),i=e([r]);async function s(e){try{await c(e),await o(e),await d(e),await u(e)}catch(e){console.error("Error tracking outreach analytics:",e)}}async function c(e){try{let t=`
      INSERT INTO outreach_analytics (
        event_type,
        channel,
        campaign_id,
        recipient_id,
        sender_id,
        message_id,
        success,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,a=[e.eventType||"send",e.channel,e.campaignId,e.recipientData?.id,e.senderId,e.messageId,e.success,e.metadata?JSON.stringify(e.metadata):null,new Date];await r.pool.query(t,a)}catch(e){console.error("Error logging analytics event:",e)}}async function o(e){try{if(!e.campaignId)return;let t=`
      SELECT * FROM campaign_metrics
      WHERE campaign_id = $1
    `,a=await r.pool.query(t,[e.campaignId]);if(0===a.rows.length){let t=`
        INSERT INTO campaign_metrics (
          campaign_id,
          total_sent,
          total_delivered,
          total_failed,
          total_opened,
          total_clicked,
          total_replied,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      `,a=[e.campaignId,"send"===e.eventType&&e.success?1:0,"delivered"===e.eventType?1:0,"send"!==e.eventType||e.success?0:1,"open"===e.eventType?1:0,"click"===e.eventType?1:0,"reply"===e.eventType?1:0,new Date];await r.pool.query(t,a)}else{let t=a.rows[0],n=`
        UPDATE campaign_metrics
        SET
          total_sent = $1,
          total_delivered = $2,
          total_failed = $3,
          total_opened = $4,
          total_clicked = $5,
          total_replied = $6,
          updated_at = $7
        WHERE campaign_id = $8
      `,i=[t.total_sent+("send"===e.eventType&&e.success?1:0),t.total_delivered+("delivered"===e.eventType?1:0),t.total_failed+("send"!==e.eventType||e.success?0:1),t.total_opened+("open"===e.eventType?1:0),t.total_clicked+("click"===e.eventType?1:0),t.total_replied+("reply"===e.eventType?1:0),new Date,e.campaignId];await r.pool.query(n,i)}await l(e)}catch(e){console.error("Error updating campaign metrics:",e)}}async function l(e){try{if(!e.campaignId||!e.channel)return;let t=`
      SELECT * FROM campaign_channel_metrics
      WHERE campaign_id = $1 AND channel = $2
    `,a=await r.pool.query(t,[e.campaignId,e.channel]);if(0===a.rows.length){let t=`
        INSERT INTO campaign_channel_metrics (
          campaign_id,
          channel,
          total_sent,
          total_delivered,
          total_failed,
          total_opened,
          total_clicked,
          total_replied,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
      `,a=[e.campaignId,e.channel,"send"===e.eventType&&e.success?1:0,"delivered"===e.eventType?1:0,"send"!==e.eventType||e.success?0:1,"open"===e.eventType?1:0,"click"===e.eventType?1:0,"reply"===e.eventType?1:0,new Date];await r.pool.query(t,a)}else{let t=a.rows[0],n=`
        UPDATE campaign_channel_metrics
        SET
          total_sent = $1,
          total_delivered = $2,
          total_failed = $3,
          total_opened = $4,
          total_clicked = $5,
          total_replied = $6,
          updated_at = $7
        WHERE campaign_id = $8 AND channel = $9
      `,i=[t.total_sent+("send"===e.eventType&&e.success?1:0),t.total_delivered+("delivered"===e.eventType?1:0),t.total_failed+("send"!==e.eventType||e.success?0:1),t.total_opened+("open"===e.eventType?1:0),t.total_clicked+("click"===e.eventType?1:0),t.total_replied+("reply"===e.eventType?1:0),new Date,e.campaignId,e.channel];await r.pool.query(n,i)}}catch(e){console.error("Error updating campaign channel metrics:",e)}}async function d(e){try{if(!e.channel)return;let t=`
      SELECT * FROM channel_metrics
      WHERE channel = $1
    `,a=await r.pool.query(t,[e.channel]);if(0===a.rows.length){let t=`
        INSERT INTO channel_metrics (
          channel,
          total_sent,
          total_delivered,
          total_failed,
          total_opened,
          total_clicked,
          total_replied,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      `,a=[e.channel,"send"===e.eventType&&e.success?1:0,"delivered"===e.eventType?1:0,"send"!==e.eventType||e.success?0:1,"open"===e.eventType?1:0,"click"===e.eventType?1:0,"reply"===e.eventType?1:0,new Date];await r.pool.query(t,a)}else{let t=a.rows[0],n=`
        UPDATE channel_metrics
        SET
          total_sent = $1,
          total_delivered = $2,
          total_failed = $3,
          total_opened = $4,
          total_clicked = $5,
          total_replied = $6,
          updated_at = $7
        WHERE channel = $8
      `,i=[t.total_sent+("send"===e.eventType&&e.success?1:0),t.total_delivered+("delivered"===e.eventType?1:0),t.total_failed+("send"!==e.eventType||e.success?0:1),t.total_opened+("open"===e.eventType?1:0),t.total_clicked+("click"===e.eventType?1:0),t.total_replied+("reply"===e.eventType?1:0),new Date,e.channel];await r.pool.query(n,i)}}catch(e){console.error("Error updating channel metrics:",e)}}async function u(e){try{if(!e.recipientData||!e.recipientData.id)return;let t=`
      SELECT * FROM recipient_metrics
      WHERE recipient_id = $1
    `,a=await r.pool.query(t,[e.recipientData.id]);if(0===a.rows.length){let t=`
        INSERT INTO recipient_metrics (
          recipient_id,
          total_received,
          total_opened,
          total_clicked,
          total_replied,
          last_interaction,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      `,a=[e.recipientData.id,"send"===e.eventType&&e.success||"delivered"===e.eventType?1:0,"open"===e.eventType?1:0,"click"===e.eventType?1:0,"reply"===e.eventType?1:0,new Date,new Date];await r.pool.query(t,a)}else{let t=a.rows[0],n=`
        UPDATE recipient_metrics
        SET
          total_received = $1,
          total_opened = $2,
          total_clicked = $3,
          total_replied = $4,
          last_interaction = $5,
          updated_at = $6
        WHERE recipient_id = $7
      `,i=[t.total_received+("send"===e.eventType&&e.success||"delivered"===e.eventType?1:0),t.total_opened+("open"===e.eventType?1:0),t.total_clicked+("click"===e.eventType?1:0),t.total_replied+("reply"===e.eventType?1:0),new Date,new Date,e.recipientData.id];await r.pool.query(n,i)}}catch(e){console.error("Error updating recipient metrics:",e)}}r=(i.then?(await i)():i)[0],n()}catch(e){n(e)}})},19764:(e,t,a)=>{let n;let r=a(45184),{pool:i}=a(80544);async function s(){try{let e=`
      SELECT * FROM outreach_channel_config
      WHERE channel = 'email' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `,t=await i.query(e);if(0===t.rows.length)return console.error("No active email configuration found"),!1;let a=t.rows[0],s=JSON.parse(a.settings);return n=r.createTransport({host:s.host,port:s.port,secure:s.secure,auth:{user:s.username,pass:s.password}}),await n.verify(),!0}catch(e){return console.error("Error initializing email connector:",e),!1}}async function c(e,t,a={}){try{if(!n&&!await s())throw Error("Email connector not initialized");let r=await o(a.senderId);if(!t.email)throw Error("Recipient email is required");let i={from:r.email,to:t.email,subject:a.subject||"Important message from "+r.name,html:e,headers:{"X-Campaign-ID":a.campaignId||"unknown","X-Recipient-ID":t.id||"unknown"}};a.cc&&(i.cc=a.cc),a.bcc&&(i.bcc=a.bcc),a.attachments&&Array.isArray(a.attachments)&&(i.attachments=a.attachments);let c=await n.sendMail(i);return await l({recipientId:t.id,recipientEmail:t.email,senderId:r.id,senderEmail:r.email,subject:i.subject,messageId:c.messageId,campaignId:a.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:c.messageId,response:c.response}}catch(e){return console.error("Error sending email:",e),t&&t.email&&await l({recipientId:t.id,recipientEmail:t.email,senderId:a.senderId,subject:a.subject,campaignId:a.campaignId,status:"failed",errorDetails:e.message,sentAt:new Date}),{success:!1,error:"Failed to send email",details:e.message}}}async function o(e){try{if(e){let t=`
        SELECT * FROM outreach_senders
        WHERE id = $1 AND channel = 'email'
      `,a=await i.query(t,[e]);if(a.rows.length>0)return a.rows[0]}let t=`
      SELECT * FROM outreach_senders
      WHERE channel = 'email' AND is_default = true
      LIMIT 1
    `,a=await i.query(t);if(a.rows.length>0)return a.rows[0];let n=`
      SELECT * FROM outreach_channel_config
      WHERE channel = 'email' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `,r=await i.query(n);if(r.rows.length>0){let e=r.rows[0],t=JSON.parse(e.settings);return{id:null,name:t.senderName||"MDTS Outreach",email:t.username,channel:"email"}}return{id:null,name:"MDTS Outreach",email:"outreach@midastechnical.com",channel:"email"}}catch(e){return console.error("Error getting sender info:",e),{id:null,name:"MDTS Outreach",email:"outreach@midastechnical.com",channel:"email"}}}async function l(e){try{let t=`
      INSERT INTO email_logs (
        recipient_id,
        recipient_email,
        sender_id,
        sender_email,
        subject,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,a=[e.recipientId,e.recipientEmail,e.senderId,e.senderEmail,e.subject,e.messageId,e.campaignId,e.status,e.errorDetails,e.sentAt];await i.query(t,a)}catch(e){console.error("Error logging email send:",e)}}e.exports={initialize:s,sendMessage:c}},56549:(e,t,a)=>{let n=a(52167),{pool:r}=a(80544),i=null;async function s(){try{let e=`
      SELECT * FROM outreach_channel_config
      WHERE channel = 'facebook' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `,t=await r.query(e);if(0===t.rows.length)return console.error("No active Facebook configuration found"),!1;let a=t.rows[0];return i=JSON.parse(a.settings),!0}catch(e){return console.error("Error initializing Facebook connector:",e),!1}}async function c(e,t,a={}){try{if(!i&&!await s())throw Error("Facebook connector not initialized");if(!t.platform_id&&"facebook"!==t.platform)throw Error("Recipient Facebook ID is required");let n=await o(a.senderId);return await l(e,t.platform_id,n,a)}catch(e){return console.error("Error sending Facebook message:",e),await p({recipientId:t.id,recipientFacebookId:t.platform_id,senderId:a.senderId,campaignId:a.campaignId,status:"failed",errorDetails:e.message,sentAt:new Date}),{success:!1,error:"Failed to send Facebook message",details:e.message}}}async function o(e){try{if(e){let t=`
        SELECT * FROM outreach_senders
        WHERE id = $1 AND channel = 'facebook'
      `,a=await r.query(t,[e]);if(a.rows.length>0)return a.rows[0]}let t=`
      SELECT * FROM outreach_senders
      WHERE channel = 'facebook' AND is_default = true
      LIMIT 1
    `,a=await r.query(t);if(a.rows.length>0)return a.rows[0];return{id:null,name:i.pageName||"MDTS Outreach",facebookId:i.pageId,channel:"facebook"}}catch(e){return console.error("Error getting sender info:",e),{id:null,name:"MDTS Outreach",facebookId:i.pageId,channel:"facebook"}}}async function l(e,t,a,r={}){try{await d();let s=await n.post(`https://graph.facebook.com/v13.0/${i.pageId}/messages`,{recipient:{id:t},message:{text:e},messaging_type:"MESSAGE_TAG",tag:"ACCOUNT_UPDATE"},{headers:{Authorization:`Bearer ${i.pageAccessToken}`,"Content-Type":"application/json"}});return await p({recipientId:r.recipientId,recipientFacebookId:t,senderId:a.id,senderFacebookId:a.facebookId,messageId:s.data.message_id,campaignId:r.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:s.data.message_id,status:"sent"}}catch(e){throw console.error("Error sending Facebook message via Messenger API:",e),e.response&&401===e.response.status&&(i.tokenExpired=!0,await u()),e}}async function d(){try{let e=Date.now(),t=i.tokenExpiresAt||0;if(e>=t-3e5){let t=await n.get("https://graph.facebook.com/v13.0/oauth/access_token",{params:{grant_type:"fb_exchange_token",client_id:i.appId,client_secret:i.appSecret,fb_exchange_token:i.pageAccessToken}});i.pageAccessToken=t.data.access_token,i.tokenExpiresAt=e+1e3*t.data.expires_in,i.tokenExpired=!1,await u()}}catch(e){throw console.error("Error refreshing Facebook access token:",e),e}}async function u(){try{let e=`
      UPDATE outreach_channel_config
      SET settings = $1, updated_at = $2
      WHERE channel = 'facebook' AND is_active = true
    `;await r.query(e,[JSON.stringify(i),new Date])}catch(e){console.error("Error updating Facebook configuration in database:",e)}}async function p(e){try{let t=`
      INSERT INTO facebook_logs (
        recipient_id,
        recipient_facebook_id,
        sender_id,
        sender_facebook_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,a=[e.recipientId,e.recipientFacebookId,e.senderId,e.senderFacebookId,e.messageId,e.campaignId,e.status,e.errorDetails,e.sentAt];await r.query(t,a)}catch(e){console.error("Error logging Facebook send:",e)}}e.exports={initialize:s,sendMessage:c}},24925:(e,t,a)=>{let n=a(52167),{pool:r}=a(80544),i=null;async function s(){try{let e=`
      SELECT * FROM outreach_channel_config
      WHERE channel = 'instagram' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `,t=await r.query(e);if(0===t.rows.length)return console.error("No active Instagram configuration found"),!1;let a=t.rows[0];return i=JSON.parse(a.settings),!0}catch(e){return console.error("Error initializing Instagram connector:",e),!1}}async function c(e,t,a={}){try{if(!i&&!await s())throw Error("Instagram connector not initialized");if(!t.platform_id&&"instagram"!==t.platform)throw Error("Recipient Instagram ID is required");let n=await o(a.senderId);if(i.useOfficialApi)return await l(e,t.platform_id,n,a);return await d(e,t.platform_id,n,a)}catch(e){return console.error("Error sending Instagram message:",e),await g({recipientId:t.id,recipientInstagramId:t.platform_id,senderId:a.senderId,campaignId:a.campaignId,status:"failed",errorDetails:e.message,sentAt:new Date}),{success:!1,error:"Failed to send Instagram message",details:e.message}}}async function o(e){try{if(e){let t=`
        SELECT * FROM outreach_senders
        WHERE id = $1 AND channel = 'instagram'
      `,a=await r.query(t,[e]);if(a.rows.length>0)return a.rows[0]}let t=`
      SELECT * FROM outreach_senders
      WHERE channel = 'instagram' AND is_default = true
      LIMIT 1
    `,a=await r.query(t);if(a.rows.length>0)return a.rows[0];return{id:null,name:i.username||"MDTS Outreach",instagramId:i.businessAccountId,channel:"instagram"}}catch(e){return console.error("Error getting sender info:",e),{id:null,name:"MDTS Outreach",instagramId:i.businessAccountId,channel:"instagram"}}}async function l(e,t,a,r={}){try{await u();let s=await n.post(`https://graph.facebook.com/v13.0/${i.businessAccountId}/messages`,{recipient:{id:t},message:{text:e},messaging_type:"MESSAGE_TAG",tag:"ACCOUNT_UPDATE"},{headers:{Authorization:`Bearer ${i.accessToken}`,"Content-Type":"application/json"}});return await g({recipientId:r.recipientId,recipientInstagramId:t,senderId:a.id,senderInstagramId:a.instagramId,messageId:s.data.message_id,campaignId:r.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:s.data.message_id,status:"sent"}}catch(e){throw console.error("Error sending Instagram message via official API:",e),e.response&&401===e.response.status&&(i.tokenExpired=!0,await p()),e}}async function d(e,t,a,n={}){try{await new Promise(e=>setTimeout(e,1e3));let e=`ig_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;return await g({recipientId:n.recipientId,recipientInstagramId:t,senderId:a.id,senderInstagramId:a.instagramId,messageId:e,campaignId:n.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:e,status:"sent",note:"Sent via automation (simulated)"}}catch(e){throw console.error("Error sending Instagram message via automation:",e),e}}async function u(){try{let e=Date.now(),t=i.tokenExpiresAt||0;if(e>=t-3e5){let t=await n.get("https://graph.facebook.com/v13.0/oauth/access_token",{params:{grant_type:"fb_exchange_token",client_id:i.appId,client_secret:i.appSecret,fb_exchange_token:i.accessToken}});i.accessToken=t.data.access_token,i.tokenExpiresAt=e+1e3*t.data.expires_in,i.tokenExpired=!1,await p()}}catch(e){throw console.error("Error refreshing Instagram access token:",e),e}}async function p(){try{let e=`
      UPDATE outreach_channel_config
      SET settings = $1, updated_at = $2
      WHERE channel = 'instagram' AND is_active = true
    `;await r.query(e,[JSON.stringify(i),new Date])}catch(e){console.error("Error updating Instagram configuration in database:",e)}}async function g(e){try{let t=`
      INSERT INTO instagram_logs (
        recipient_id,
        recipient_instagram_id,
        sender_id,
        sender_instagram_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,a=[e.recipientId,e.recipientInstagramId,e.senderId,e.senderInstagramId,e.messageId,e.campaignId,e.status,e.errorDetails,e.sentAt];await r.query(t,a)}catch(e){console.error("Error logging Instagram send:",e)}}e.exports={initialize:s,sendMessage:c}},22115:(e,t,a)=>{let n=a(52167),{pool:r}=a(80544),i=null;async function s(){try{let e=`
      SELECT * FROM outreach_channel_config
      WHERE channel = 'linkedin' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `,t=await r.query(e);if(0===t.rows.length)return console.error("No active LinkedIn configuration found"),!1;let a=t.rows[0];return i=JSON.parse(a.settings),!0}catch(e){return console.error("Error initializing LinkedIn connector:",e),!1}}async function c(e,t,a={}){try{if(!i&&!await s())throw Error("LinkedIn connector not initialized");if(!t.platform_id&&"linkedin"!==t.platform)throw Error("Recipient LinkedIn ID is required");let n=await o(a.senderId);if(i.useOfficialApi)return await l(e,t.platform_id,n,a);return await d(e,t.platform_id,n,a)}catch(e){return console.error("Error sending LinkedIn message:",e),await g({recipientId:t.id,recipientLinkedInId:t.platform_id,senderId:a.senderId,campaignId:a.campaignId,status:"failed",errorDetails:e.message,sentAt:new Date}),{success:!1,error:"Failed to send LinkedIn message",details:e.message}}}async function o(e){try{if(e){let t=`
        SELECT * FROM outreach_senders
        WHERE id = $1 AND channel = 'linkedin'
      `,a=await r.query(t,[e]);if(a.rows.length>0)return a.rows[0]}let t=`
      SELECT * FROM outreach_senders
      WHERE channel = 'linkedin' AND is_default = true
      LIMIT 1
    `,a=await r.query(t);if(a.rows.length>0)return a.rows[0];return{id:null,name:i.profileName||"MDTS Outreach",linkedinId:i.profileId,channel:"linkedin"}}catch(e){return console.error("Error getting sender info:",e),{id:null,name:"MDTS Outreach",linkedinId:i.profileId,channel:"linkedin"}}}async function l(e,t,a,r={}){try{await u();let s=await n.post("https://api.linkedin.com/v2/messaging/conversations",{recipients:{values:[{person:{"urn:li:person":t}}]},body:{"com.linkedin.ugc.MemberShareMediaContent":{shareMediaCategory:"NONE",shareCommentary:{text:e}}}},{headers:{Authorization:`Bearer ${i.accessToken}`,"Content-Type":"application/json","X-Restli-Protocol-Version":"2.0.0"}});return await g({recipientId:r.recipientId,recipientLinkedInId:t,senderId:a.id,senderLinkedInId:a.linkedinId,messageId:s.data.id,campaignId:r.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:s.data.id,status:"sent"}}catch(e){throw console.error("Error sending LinkedIn message via official API:",e),e.response&&401===e.response.status&&(i.tokenExpired=!0,await p()),e}}async function d(e,t,a,n={}){try{await new Promise(e=>setTimeout(e,1e3));let e=`msg_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;return await g({recipientId:n.recipientId,recipientLinkedInId:t,senderId:a.id,senderLinkedInId:a.linkedinId,messageId:e,campaignId:n.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:e,status:"sent",note:"Sent via automation (simulated)"}}catch(e){throw console.error("Error sending LinkedIn message via automation:",e),e}}async function u(){try{let e=Date.now(),t=i.tokenExpiresAt||0;if(e>=t-3e5){let t=await n.post("https://www.linkedin.com/oauth/v2/accessToken",new URLSearchParams({grant_type:"refresh_token",refresh_token:i.refreshToken,client_id:i.clientId,client_secret:i.clientSecret}),{headers:{"Content-Type":"application/x-www-form-urlencoded"}});i.accessToken=t.data.access_token,i.refreshToken=t.data.refresh_token||i.refreshToken,i.tokenExpiresAt=e+1e3*t.data.expires_in,i.tokenExpired=!1,await p()}}catch(e){throw console.error("Error refreshing LinkedIn access token:",e),e}}async function p(){try{let e=`
      UPDATE outreach_channel_config
      SET settings = $1, updated_at = $2
      WHERE channel = 'linkedin' AND is_active = true
    `;await r.query(e,[JSON.stringify(i),new Date])}catch(e){console.error("Error updating LinkedIn configuration in database:",e)}}async function g(e){try{let t=`
      INSERT INTO linkedin_logs (
        recipient_id,
        recipient_linkedin_id,
        sender_id,
        sender_linkedin_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,a=[e.recipientId,e.recipientLinkedInId,e.senderId,e.senderLinkedInId,e.messageId,e.campaignId,e.status,e.errorDetails,e.sentAt];await r.query(t,a)}catch(e){console.error("Error logging LinkedIn send:",e)}}e.exports={initialize:s,sendMessage:c}},9593:(e,t,a)=>{let{Telegraf:n}=a(20832),{pool:r}=a(80544),i=null,s=null;async function c(){try{let e=`
      SELECT * FROM outreach_channel_config
      WHERE channel = 'telegram' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `,t=await r.query(e);if(0===t.rows.length)return console.error("No active Telegram configuration found"),!1;let a=t.rows[0];return i=JSON.parse(a.settings),s=new n(i.botToken),i.useWebhook?await s.telegram.setWebhook(`${i.webhookUrl}/telegram-webhook`):s.launch(),!0}catch(e){return console.error("Error initializing Telegram connector:",e),!1}}async function o(e,t,a={}){try{if(!s&&!await c())throw Error("Telegram connector not initialized");if(!t.platform_id&&"telegram"!==t.platform)throw Error("Recipient Telegram ID is required");let n=await l(a.senderId),r=await s.telegram.sendMessage(t.platform_id,e,{parse_mode:"Markdown",disable_web_page_preview:a.disablePreview||!1});return await d({recipientId:t.id,recipientTelegramId:t.platform_id,senderId:n.id,senderTelegramId:n.telegramId,messageId:r.message_id.toString(),campaignId:a.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:r.message_id.toString(),status:"sent"}}catch(e){return console.error("Error sending Telegram message:",e),await d({recipientId:t.id,recipientTelegramId:t.platform_id,senderId:a.senderId,campaignId:a.campaignId,status:"failed",errorDetails:e.message,sentAt:new Date}),{success:!1,error:"Failed to send Telegram message",details:e.message}}}async function l(e){try{if(e){let t=`
        SELECT * FROM outreach_senders
        WHERE id = $1 AND channel = 'telegram'
      `,a=await r.query(t,[e]);if(a.rows.length>0)return a.rows[0]}let t=`
      SELECT * FROM outreach_senders
      WHERE channel = 'telegram' AND is_default = true
      LIMIT 1
    `,a=await r.query(t);if(a.rows.length>0)return a.rows[0];return{id:null,name:i.botName||"MDTS Outreach Bot",telegramId:i.botUsername,channel:"telegram"}}catch(e){return console.error("Error getting sender info:",e),{id:null,name:"MDTS Outreach Bot",telegramId:i.botUsername,channel:"telegram"}}}async function d(e){try{let t=`
      INSERT INTO telegram_logs (
        recipient_id,
        recipient_telegram_id,
        sender_id,
        sender_telegram_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,a=[e.recipientId,e.recipientTelegramId,e.senderId,e.senderTelegramId,e.messageId,e.campaignId,e.status,e.errorDetails,e.sentAt];await r.query(t,a)}catch(e){console.error("Error logging Telegram send:",e)}}async function u(){s&&(i.useWebhook?await s.telegram.deleteWebhook():s.stop())}e.exports={initialize:c,sendMessage:o,stop:u}},5968:(e,t,a)=>{let n=a(52167),{pool:r}=a(80544),i=null;async function s(){try{let e=`
      SELECT * FROM outreach_channel_config
      WHERE channel = 'whatsapp' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `,t=await r.query(e);if(0===t.rows.length)return console.error("No active WhatsApp configuration found"),!1;let a=t.rows[0];return i=JSON.parse(a.settings),!0}catch(e){return console.error("Error initializing WhatsApp connector:",e),!1}}async function c(e,t,a={}){try{let n;if(!i&&!await s())throw Error("WhatsApp connector not initialized");if(!t.phone)throw Error("Recipient phone number is required");let r=((n=t.phone.replace(/\D/g,"")).startsWith("1")||n.startsWith("+1")||(n="1"+n),n.startsWith("+")||(n="+"+n),n);if("twilio"===i.provider)return await o(e,r,a);if("messagebird"===i.provider)return await l(e,r,a);if("whatsapp-business"===i.provider)return await d(e,r,a);throw Error(`Unsupported WhatsApp provider: ${i.provider}`)}catch(e){return console.error("Error sending WhatsApp message:",e),await u({recipientId:t.id,recipientPhone:t.phone,campaignId:a.campaignId,status:"failed",errorDetails:e.message,sentAt:new Date}),{success:!1,error:"Failed to send WhatsApp message",details:e.message}}}async function o(e,t,n={}){try{let r=a(37202)(i.accountSid,i.authToken),s=await r.messages.create({body:e,from:`whatsapp:${i.fromNumber}`,to:`whatsapp:${t}`});return await u({recipientId:n.recipientId,recipientPhone:t,messageId:s.sid,campaignId:n.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:s.sid,status:s.status}}catch(e){throw console.error("Error sending WhatsApp message via Twilio:",e),e}}async function l(e,t,n={}){try{let r=a(47751)(i.apiKey),s=await new Promise((a,n)=>{r.conversations.start({channelId:i.channelId,to:t,type:"text",content:{text:e}},(e,t)=>{e?n(e):a(t)})});return await u({recipientId:n.recipientId,recipientPhone:t,messageId:s.id,campaignId:n.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:s.id,status:s.status}}catch(e){throw console.error("Error sending WhatsApp message via MessageBird:",e),e}}async function d(e,t,a={}){try{let r=t.replace("+",""),s=await n.post(`https://graph.facebook.com/v13.0/${i.phoneNumberId}/messages`,{messaging_product:"whatsapp",recipient_type:"individual",to:r,type:"text",text:{preview_url:!1,body:e}},{headers:{Authorization:`Bearer ${i.accessToken}`,"Content-Type":"application/json"}});return await u({recipientId:a.recipientId,recipientPhone:t,messageId:s.data.messages[0].id,campaignId:a.campaignId,status:"sent",sentAt:new Date}),{success:!0,messageId:s.data.messages[0].id,status:"sent"}}catch(e){throw console.error("Error sending WhatsApp message via WhatsApp Business API:",e),e}}async function u(e){try{let t=`
      INSERT INTO whatsapp_logs (
        recipient_id,
        recipient_phone,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,a=[e.recipientId,e.recipientPhone,e.messageId,e.campaignId,e.status,e.errorDetails,e.sentAt];await r.query(t,a)}catch(e){console.error("Error logging WhatsApp send:",e)}}e.exports={initialize:s,sendMessage:c}},80544:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t),a.d(t,{pool:()=>s});var r=a(8678),i=e([r]);let s=new(r=(i.then?(await i)():i)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});s.on("connect",()=>{}),s.on("error",e=>{console.error("Unexpected error on idle client",e),process.exit(-1)}),n()}catch(e){n(e)}})},3337:(e,t,a)=>{function n(e,t){if(!e||""===e.trim())return{isValid:!1,validationErrors:["Message cannot be empty"]};switch(t.toLowerCase()){case"email":return function(e){let t=[];return(e.includes("FREE")||e.includes("GUARANTEED")||e.includes("ACT NOW")||e.includes("LIMITED TIME"))&&t.push("Message contains potential spam trigger words (all caps)"),(e.match(/!/g)||[]).length>3&&t.push("Message contains too many exclamation marks"),(e.match(/(https?:\/\/[^\s]+)/g)||[]).length>3&&t.push("Message contains too many links"),(e.includes("<html")||e.includes("<body"))&&(e.match(/<[^/][^>]*>/g)||[]).length!==(e.match(/<\/[^>]*>/g)||[]).length&&t.push("HTML in message has unclosed tags"),{isValid:0===t.length,validationErrors:t}}(e);case"whatsapp":return function(e){let t=[];return e.length>65e3&&t.push("Message exceeds WhatsApp character limit (65000)"),(e.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu)||[]).length>15&&t.push("Message contains too many emojis"),{isValid:0===t.length,validationErrors:t}}(e);case"linkedin":return function(e){let t=[];for(let a of(e.length>1900&&t.push(`Message exceeds LinkedIn character limit (1900). Current length: ${e.length}`),(e.match(/#[a-zA-Z0-9_]+/g)||[]).length>5&&t.push("Message contains too many hashtags for LinkedIn"),(e.match(/(https?:\/\/[^\s]+)/g)||[]).length>2&&t.push("Message contains too many links for LinkedIn"),["hey there","what's up","sup","yo","wanna"]))if(e.toLowerCase().includes(a)){t.push(`Message contains casual language ("${a}") which may be inappropriate for LinkedIn`);break}return{isValid:0===t.length,validationErrors:t}}(e);case"facebook":return function(e){let t=[];return e.length>2e4&&t.push("Message exceeds Facebook Messenger character limit (20000)"),(e.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu)||[]).length>20&&t.push("Message contains too many emojis"),{isValid:0===t.length,validationErrors:t}}(e);case"instagram":return function(e){let t=[];return e.length>1e3&&t.push(`Message exceeds Instagram DM character limit (1000). Current length: ${e.length}`),(e.match(/#[a-zA-Z0-9_]+/g)||[]).length>10&&t.push("Message contains too many hashtags"),{isValid:0===t.length,validationErrors:t}}(e);case"telegram":return function(e){let t=[];if(e.length>4096&&t.push(`Message exceeds Telegram character limit (4096). Current length: ${e.length}`),e.includes("*")||e.includes("_")||e.includes("`")||e.includes("```")){(e.match(/\*/g)||[]).length%2!=0&&t.push("Message has unclosed bold/italic Markdown (*)"),(e.match(/_/g)||[]).length%2!=0&&t.push("Message has unclosed italic Markdown (_)");let a=(e.match(/`/g)||[]).length;a%2!=0&&a%6!=0&&t.push("Message has unclosed code Markdown (`)")}return{isValid:0===t.length,validationErrors:t}}(e);default:return{isValid:!0,validationErrors:[]}}}a.d(t,{N:()=>n})},24634:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t),a.d(t,{addRecipientsToCampaign:()=>g,createCampaign:()=>u,executeCampaignNow:()=>h,getCampaign:()=>p,scheduleCampaign:()=>m,sendMessage:()=>l});var r=a(80544),i=a(79587),s=a(3337),c=a(53063),o=e([r,c]);async function l(e,t,n,r){try{let o=await (0,i.J)(e.template,n,r,t),{isValid:l,validationErrors:u}=(0,s.N)(o,t);if(!l)return console.error("Message validation failed:",u),{success:!1,error:"Message validation failed",details:u};let p=function(e){switch(e.toLowerCase()){case"email":return a(19764);case"whatsapp":return a(5968);case"linkedin":return a(22115);case"facebook":return a(56549);case"instagram":return a(24925);case"telegram":return a(9593);default:return console.error(`Unknown channel: ${e}`),null}}(t);if(!p)return{success:!1,error:`No connector available for channel: ${t}`};let g=await p.sendMessage(o,n);return await d({channel:t,recipientId:n.id,campaignId:r.id,messageId:e.id,status:g.success?"sent":"failed",errorDetails:g.success?null:g.error,sentAt:new Date,messageContent:o}),(0,c.R)({channel:t,campaignId:r.id,success:g.success,recipientData:n}),g}catch(e){return console.error("Error sending message:",e),{success:!1,error:"Failed to send message",details:e.message}}}async function d(e){try{let t=`
      INSERT INTO outreach_attempts (
        channel,
        recipient_id,
        campaign_id,
        message_id,
        status,
        error_details,
        sent_at,
        message_content
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,a=[e.channel,e.recipientId,e.campaignId,e.messageId,e.status,e.errorDetails,e.sentAt,e.messageContent];await r.pool.query(t,a)}catch(e){console.error("Error logging outreach attempt:",e)}}async function u(e){try{let t=`
      INSERT INTO outreach_campaigns (
        name,
        description,
        channels,
        start_date,
        end_date,
        status,
        created_by,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      RETURNING id
    `,a=[e.name,e.description,JSON.stringify(e.channels),e.startDate,e.endDate,e.status||"draft",e.createdBy,new Date],n=(await r.pool.query(t,a)).rows[0].id;return{success:!0,campaignId:n,message:"Campaign created successfully"}}catch(e){return console.error("Error creating campaign:",e),{success:!1,error:"Failed to create campaign",details:e.message}}}async function p(e){try{let t=`
      SELECT 
        c.*,
        COUNT(DISTINCT r.id) AS total_recipients,
        COUNT(DISTINCT CASE WHEN a.status = 'sent' THEN a.recipient_id END) AS reached_recipients,
        COUNT(DISTINCT CASE WHEN a.status = 'failed' THEN a.recipient_id END) AS failed_recipients
      FROM outreach_campaigns c
      LEFT JOIN campaign_recipients r ON c.id = r.campaign_id
      LEFT JOIN outreach_attempts a ON c.id = a.campaign_id
      WHERE c.id = $1
      GROUP BY c.id
    `,a=await r.pool.query(t,[e]);if(0===a.rows.length)return{success:!1,error:"Campaign not found"};return{success:!0,campaign:a.rows[0]}}catch(e){return console.error("Error getting campaign:",e),{success:!1,error:"Failed to get campaign",details:e.message}}}async function g(e,t){try{for(let a of(await r.pool.query("BEGIN"),t)){let t;let n=`
        SELECT id FROM recipients
        WHERE email = $1 OR phone = $2 OR (platform = $3 AND platform_id = $4)
      `,i=await r.pool.query(n,[a.email||null,a.phone||null,a.platform||null,a.platformId||null]);if(i.rows.length>0){t=i.rows[0].id;let e=`
          UPDATE recipients
          SET 
            name = COALESCE($1, name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone),
            platform = COALESCE($4, platform),
            platform_id = COALESCE($5, platform_id),
            metadata = COALESCE($6, metadata),
            updated_at = $7
          WHERE id = $8
        `;await r.pool.query(e,[a.name||null,a.email||null,a.phone||null,a.platform||null,a.platformId||null,a.metadata?JSON.stringify(a.metadata):null,new Date,t])}else{let e=`
          INSERT INTO recipients (
            name,
            email,
            phone,
            platform,
            platform_id,
            metadata,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
          RETURNING id
        `;t=(await r.pool.query(e,[a.name||null,a.email||null,a.phone||null,a.platform||null,a.platformId||null,a.metadata?JSON.stringify(a.metadata):null,new Date])).rows[0].id}let s=`
        INSERT INTO campaign_recipients (
          campaign_id,
          recipient_id,
          status,
          added_at
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (campaign_id, recipient_id) DO NOTHING
      `;await r.pool.query(s,[e,t,"pending",new Date])}return await r.pool.query("COMMIT"),{success:!0,message:`Added ${t.length} recipients to campaign`}}catch(e){return await r.pool.query("ROLLBACK"),console.error("Error adding recipients to campaign:",e),{success:!1,error:"Failed to add recipients to campaign",details:e.message}}}async function m(e,t){try{let n=`
      UPDATE outreach_campaigns
      SET 
        status = 'scheduled',
        start_date = $1,
        end_date = $2,
        schedule_options = $3,
        updated_at = $4
      WHERE id = $5
      RETURNING id
    `,i=[t.startDate,t.endDate,JSON.stringify(t),new Date,e],s=await r.pool.query(n,i);if(0===s.rows.length)return{success:!1,error:"Campaign not found"};let c=a(99780);return await c.scheduleCampaign(e,t),{success:!0,message:"Campaign scheduled successfully"}}catch(e){return console.error("Error scheduling campaign:",e),{success:!1,error:"Failed to schedule campaign",details:e.message}}}async function h(e){try{let t=await p(e);if(!t.success)return t;let a=t.campaign,n=`
      SELECT r.*
      FROM recipients r
      JOIN campaign_recipients cr ON r.id = cr.recipient_id
      WHERE cr.campaign_id = $1 AND cr.status = 'pending'
    `,i=(await r.pool.query(n,[e])).rows,s=`
      SELECT m.*
      FROM outreach_messages m
      WHERE m.campaign_id = $1
    `,c=(await r.pool.query(s,[e])).rows;if(0===c.length)return{success:!1,error:"No messages found for campaign"};await r.pool.query(`
      UPDATE outreach_campaigns
      SET status = 'in_progress', updated_at = $1
      WHERE id = $2
    `,[new Date,e]);let o={total:i.length,successful:0,failed:0,details:[]};for(let t of i){let n=function(e,t){let a=[];return e.email&&t.includes("email")&&a.push("email"),e.phone&&t.includes("whatsapp")&&a.push("whatsapp"),"linkedin"===e.platform&&e.platform_id&&t.includes("linkedin")&&a.push("linkedin"),"facebook"===e.platform&&e.platform_id&&t.includes("facebook")&&a.push("facebook"),"instagram"===e.platform&&e.platform_id&&t.includes("instagram")&&a.push("instagram"),"telegram"===e.platform&&e.platform_id&&t.includes("telegram")&&a.push("telegram"),a}(t,JSON.parse(a.channels));if(0===n.length){o.failed++,o.details.push({recipientId:t.id,success:!1,error:"No suitable channels available for recipient"});continue}let i=!1;for(let s of n){let n=c.find(e=>e.channel===s);if(n&&(await l(n,s,t,a)).success){i=!0,await r.pool.query(`
            UPDATE campaign_recipients
            SET status = 'sent', updated_at = $1
            WHERE campaign_id = $2 AND recipient_id = $3
          `,[new Date,e,t.id]);break}}i?o.successful++:(o.failed++,await r.pool.query(`
          UPDATE campaign_recipients
          SET status = 'failed', updated_at = $1
          WHERE campaign_id = $2 AND recipient_id = $3
        `,[new Date,e,t.id])),await new Promise(e=>setTimeout(e,100))}return o.total===o.successful+o.failed&&await r.pool.query(`
        UPDATE outreach_campaigns
        SET status = 'completed', updated_at = $1
        WHERE id = $2
      `,[new Date,e]),{success:!0,results:o}}catch(e){return console.error("Error executing campaign:",e),{success:!1,error:"Failed to execute campaign",details:e.message}}}[r,c]=o.then?(await o)():o,n()}catch(e){n(e)}})},99780:(e,t,a)=>{let n=a(78311),{pool:r}=a(80544),{executeCampaignNow:i}=a(24634),s=new Map;async function c(){try{let e=`
      SELECT * FROM outreach_campaigns
      WHERE status = 'scheduled'
      AND start_date <= NOW()
      AND (end_date IS NULL OR end_date >= NOW())
    `;for(let t of(await r.query(e)).rows)await o(t.id,JSON.parse(t.schedule_options));return n.schedule("0 0 * * *",async()=>{await d()}),!0}catch(e){return console.error("Error initializing scheduler:",e),!1}}async function o(e,t){try{s.has(e)&&(s.get(e).stop(),s.delete(e));let a=function(e){try{if(!e)return null;if(e.cronExpression)return e.cronExpression;switch(e.frequency){case"once":let t=new Date(e.startDate);return`${t.getMinutes()} ${t.getHours()} ${t.getDate()} ${t.getMonth()+1} *`;case"hourly":return`${e.minute||0} * * * *`;case"daily":return`${e.minute||0} ${e.hour||9} * * *`;case"weekly":return`${e.minute||0} ${e.hour||9} * * ${e.dayOfWeek||1}`;case"monthly":return`${e.minute||0} ${e.hour||9} ${e.dayOfMonth||1} * *`;default:return"0 9 * * *"}}catch(e){return console.error("Error creating cron expression:",e),null}}(t);if(!a)return console.error(`Invalid scheduling options for campaign ${e}`),!1;let r=n.schedule(a,async()=>{await l(e,t)});return s.set(e,r),!0}catch(t){return console.error(`Error scheduling campaign ${e}:`,t),!1}}async function l(e,t){try{let a=`
      SELECT * FROM outreach_campaigns
      WHERE id = $1
    `,n=await r.query(a,[e]);if(0===n.rows.length){console.error(`Campaign ${e} not found`);return}let c=n.rows[0];if("scheduled"!==c.status&&"in_progress"!==c.status){s.has(e)&&(s.get(e).stop(),s.delete(e));return}if(c.end_date&&new Date(c.end_date)<new Date){await r.query(`
        UPDATE outreach_campaigns
        SET status = 'completed', updated_at = $1
        WHERE id = $2
      `,[new Date,e]),s.has(e)&&(s.get(e).stop(),s.delete(e));return}let o=t.batchSize||50,l=`
      SELECT r.*
      FROM recipients r
      JOIN campaign_recipients cr ON r.id = cr.recipient_id
      WHERE cr.campaign_id = $1 AND cr.status = 'pending'
      ORDER BY cr.added_at ASC
      LIMIT $2
    `,d=(await r.query(l,[e,o])).rows;if(0===d.length){let t=`
        SELECT COUNT(*) as count
        FROM campaign_recipients
        WHERE campaign_id = $1 AND status = 'pending'
      `,a=await r.query(t,[e]);0===a.rows[0].count&&(await r.query(`
          UPDATE outreach_campaigns
          SET status = 'completed', updated_at = $1
          WHERE id = $2
        `,[new Date,e]),s.has(e)&&(s.get(e).stop(),s.delete(e)));return}"in_progress"!==c.status&&await r.query(`
        UPDATE outreach_campaigns
        SET status = 'in_progress', updated_at = $1
        WHERE id = $2
      `,[new Date,e]),(await i(e)).success}catch(t){console.error(`Error executing campaign batch ${e}:`,t)}}async function d(){try{let e=`
      SELECT * FROM outreach_campaigns
      WHERE status = 'scheduled'
      AND start_date <= NOW()
      AND (end_date IS NULL OR end_date >= NOW())
      AND id NOT IN (${Array.from(s.keys()).join(",")||0})
    `;for(let t of(await r.query(e)).rows)await o(t.id,JSON.parse(t.schedule_options));let t=`
      SELECT id FROM outreach_campaigns
      WHERE id IN (${Array.from(s.keys()).join(",")||0})
      AND (
        status NOT IN ('scheduled', 'in_progress')
        OR (end_date IS NOT NULL AND end_date < NOW())
      )
    `;for(let e of(await r.query(t)).rows)s.has(e.id)&&(s.get(e.id).stop(),s.delete(e.id))}catch(e){console.error("Error performing scheduler maintenance:",e)}}e.exports={initialize:c,scheduleCampaign:o,stopAll:function(){for(let[e,t]of s.entries())t.stop();s.clear()}}}};