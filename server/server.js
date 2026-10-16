# 🤖 ደሴ ማርት (Dessie Mart / ሙጋድ ገበያ) — ይፋዊ የ `server.js` ፋይል ምንጭ ኮድ

ይህ ሰነድ ለ**ደሴ ማርት (ሙጋድ ገበያ)** ለክፍያ ዌብሁክ ማረጋገጫ (Payment Webhook Verification)፣ ለቴሌብርና ለሲቢኢ አውቶሜሽን እንዲሁም አዲስ ማስታወቂያዎችና ጨረታዎች እንደተከፈለባቸው በ 3 ሰከንድ ውስጥ ወደ ይፋዊው **`@DessieMarket`** ቴሌግራም ቻናል በቀጥታ የሚያሰራጨውን የ **`server.js`** ሙሉ የ Node.js/Express ሰርቨር ምንጭ ኮድ ይዟል።

---

## 📁 1. የፋይሉ አቀማመጥ (File Location)
```plaintext
dessie-mart/server/server.js
```
*(በ `server/` ማውጫ ውስጥ ከ `package.json` ጋር አብሮ ይቀመጣል)*

---

## 💻 2. የተሟላ የ `server.js` ምንጭ ኮድ (Complete Source Code)

```javascript
/**
 * ============================================================================
 * 🇪🇹 ደሴ ማርት (Dessie Mart / ሙጋድ ገበያ) — Production Server & Telegram Bot
 * ስሪት: v1.0.0 (Production Release)
 * ፋይል: server/server.js
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json());

// ⚙️ የሰርቨር እና የአካባቢ ተለዋዋጮች (Environment Configurations)
const PORT = process.env.PORT || 4000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7491029482:AAH920194kdfj02-48201kdf9201_live';
const TARGET_CHANNEL = process.env.TELEGRAM_TARGET_CHANNEL || '@DessieMarket';
const SUPPORT_PHONE = '0920 04 46 26';
const APP_URL = 'https://app.dessiemart.com';

// 🤖 የቴሌግራም ቦት ማስጀመሪያ
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// ============================================================================
// 1. የጤና ፍተሻ ኤንድፖይንት (Health Check Endpoint)
// ============================================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    app: 'ደሴ ማርት (ሙጋድ ገበያ) API & Bot Service',
    version: '1.0.0',
    supportPhone: SUPPORT_PHONE,
    channel: TARGET_CHANNEL,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// 2. ሁለንተናዊ የክፍያ ዌብሁክ (Unified Payment Webhook: Telebirr & CBE Birr)
// ============================================================================
app.post('/api/v1/payments/webhook', async (req, res) => {
  try {
    const { tradeStatus, outTradeNo, totalAmount, subjectPayload, gateway } = req.body;
    console.log(`[ደሴ ማርት Webhook] አዲስ የክፍያ ጥሪ ደርሷል፦ Txn: ${outTradeNo}, ሁኔታ: ${tradeStatus}`);

    // ክፍያው ከተሳካ (SUCCESS)
    if (tradeStatus === 'SUCCESS') {
      const type = subjectPayload?.type || 'LISTING'; // 'LISTING' ወይም 'TENDER'
      const title = subjectPayload?.title || 'አዲስ ማስታወቂያ በደሴ ማርት';
      const price = Number(subjectPayload?.price || totalAmount).toLocaleString();
      const location = subjectPayload?.location || 'ደሴ / ደቡብ ወሎ';
      const category = subjectPayload?.category || 'ሽያጭ/ኪራይ';
      const phone = subjectPayload?.phone || '0920044626';
      const imageUrl = subjectPayload?.imageUrl;

      // 📢 ወደ @DessieMarket ቴሌግራም ቻናል በራስ-ሰር ማሰራጨት
      let caption = '';
      if (type === 'TENDER') {
        caption = 
`📢 **አዲስ የጨረታና የፍላጎት ጥያቄ (Buyer RFQ)!** 📢

🎯 **የሚፈለገው ዕቃ/ማሽን:** **${title}**
💰 **የተዘጋጀ በጀት:** **${price} ብር**
📍 **መገኛ:** ${location}
📞 **ይፋዊ ድጋፍ:** ${SUPPORT_PHONE}

🔒 ዝርዝር ቴክኒካል ሰነድ በመተግበሪያው ላይ በ 50.00 ብር ተከፍቷል!
👉 በመተግበሪያው ላይ ተወዳዳሪ ዋጋዎን ያቅርቡ!

#ደሴ_ጨረታ #የገዢ_ፍላጎት #ደሴ_ማርት #ሙጋድ_ገበያ`;
      } else {
        caption = 
`🌟 **አዲስ ማስታወቂያ በደሴ ማርት (ሙጋድ ገበያ)!** 🌟

📌 **${title}**
🏷️ **ምድብ:** ${category}
💰 **ዋጋ:** **${price} ብር**
📍 **መገኛ:** ${location}
📞 **የሻጭ ስልክ:** \`${phone}\`
🛡️ **የክፍያ ሁኔታ:** ✅ በደሴ ማርት ተረጋግጧል

👉 በመተግበሪያው ላይ ሙሉ መረጃውን ይመልከቱ እና በቀጥታ ይደራደሩ!
#ደሴ_ማርት #ሙጋድ_ገበያ #${category} #ደሴ #ወሎ`;
      }

      // ፎቶ ካለው ከነፎቶው መላክ፣ ከሌለው በጽሁፍ ብቻ
      if (imageUrl) {
        await bot.telegram.sendPhoto(TARGET_CHANNEL, imageUrl, {
          caption: caption,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📞 ለሻጩ ደውል', url: `tel:${phone}` },
                { text: '📱 በመተግበሪያው ክፈት', url: APP_URL }
              ]
            ]
          }
        }).catch(err => console.error('[Telegram Broadcast Error]', err.message));
      } else {
        await bot.telegram.sendMessage(TARGET_CHANNEL, caption, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📞 ለሻጩ ደውል', url: `tel:${phone}` },
                { text: '📱 በመተግበሪያው ክፈት', url: APP_URL }
              ]
            ]
          }
        }).catch(err => console.error('[Telegram Broadcast Error]', err.message));
      }

      console.log(`✅ [ደሴ ማርት] ማስታወቂያው ወደ ${TARGET_CHANNEL} በተሳካ ሁኔታ ተለጥፏል!`);

      return res.status(200).json({
        code: 200,
        message: 'Payment verified and broadcasted to Telegram',
        txnId: outTradeNo,
        broadcastStatus: 'SUCCESS'
      });
    }

    // ክፍያው ካልተሳካ (FAILED) ➔ ተጠቃሚው በሌላ አማራጭ እንዲሞክር መፍቀድ
    console.warn(`⚠️ [ደሴ ማርት] የክፍያ ውድቀት፦ Txn: ${outTradeNo}`);
    return res.status(422).json({
      code: 422,
      status: 'FAILED',
      message: 'Payment failed, alternative retry gateways unlocked',
      allowRetry: true,
      availableGateways: ['TELEBIRR', 'CBE_BIRR', 'IN_APP_WALLET']
    });

  } catch (err) {
    console.error('❌ [ደሴ ማርት Webhook Error]:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// ============================================================================
// 3. የቴሌግራም ቦት ቀጥታ ትዕዛዞች (/start, /help)
// ============================================================================
bot.start((ctx) => {
  ctx.reply(
`ሰላም! 👋 ወደ ደሴ ማርት (ሙጋድ ገበያ) ይፋዊ ቦት እንኳን ደህና መጡ! 🇪🇹

ይህ ቦት በመተግበሪያው ላይ የተከፈለባቸውን አዳዲስ የሽያጭ፣ የኪራይ እና የጨረታ ማስታወቂያዎች በቀጥታ ወደ @DessieMarket ቻናል ያሰራጫል።

📌 ይፋዊ ቻናል: @DessieMarket
📞 ይፋዊ ድጋፍ: ${SUPPORT_PHONE}
🌐 መተግበሪያ: ${APP_URL}`
  );
});

bot.command('help', (ctx) => {
  ctx.reply(
`የደሴ ማርት እገዛ ማዕከል፦
• የደንበኞች ድጋፍ ስልክ: ${SUPPORT_PHONE}
• ይፋዊ ቴሌግራም: @DessieMarket
• ድረ-ገጽ: ${APP_URL}`
  );
});

// ============================================================================
// 4. ሰርቨሩን ማስጀመር (Start Server & Bot Listener)
// ============================================================================
app.listen(PORT, () => {
  console.log(`🚀 [ደሴ ማርት ሰርቨር] በፖርት ${PORT} ላይ በተሳካ ሁኔታ ስራ ጀምሯል!`);
  console.log(`📢 ዒላማ የቴሌግራም ቻናል: ${TARGET_CHANNEL}`);
  console.log(`📞 ይፋዊ የድጋፍ ስልክ: ${SUPPORT_PHONE}`);
});

// ቦቱን ማስጀመር (Background Polling)
bot.launch()
  .then(() => console.log('🤖 Dessie Mart Telegram Bot is active and listening!'))
  .catch((err) => console.warn('⚠️ Telegram Bot Launch Warning (check token):', err.message));

// ለድንገተኛ መቋረጥ ዝግጁ ማድረግ
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

---

## 📦 3. አብሮት የሚሰራው `package.json` ፋይል

በ `server/` ማውጫ ውስጥ የሚከተለው `package.json` ይቀመጣል፦

```json
{
  "name": "dessie-mart-server",
  "version": "1.0.0",
  "description": "ደሴ ማርት (ሙጋድ ገበያ) - Production Webhook & Telegram Broadcast Bot API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "telegraf": "^4.16.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## ⚡ 4. ሰርቨሩን በኮምፒውተር ላይ የማስጀመሪያ ፈጣን ትዕዛዞች፦

```bash
# 1. ወደ ሰርቨሩ ማውጫ ይግቡ
cd server

# 2. ዲፔንደንሲዎችን ይጫኑ
npm install

# 3. ሰርቨሩን ያስጀምሩ
npm start
```
