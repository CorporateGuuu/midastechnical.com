import crypto from 'crypto';
import { query } from '../db';

// Supported cryptocurrencies
export const SUPPORTED_CRYPTOS = {
  bitcoin: {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'mainnet',
    confirmations: 3,
    apiUrl: 'https://api.blockchain.info/v1/receive',
    explorerUrl: 'https://blockchain.info/tx/'
  },
  ethereum: {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'mainnet',
    confirmations: 12,
    apiUrl: 'https://api.etherscan.io/api',
    explorerUrl: 'https://etherscan.io/tx/'
  },
  usdt: {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'ethereum',
    confirmations: 12,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    explorerUrl: 'https://etherscan.io/tx/'
  },
  usdc: {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'ethereum',
    confirmations: 12,
    contractAddress: '0xA0b86a33E6441b8435b662c8b8b8b8b8b8b8b8b8',
    explorerUrl: 'https://etherscan.io/tx/'
  }
};

// Create crypto payment request
export async function createCryptoPayment(orderData) {
  try {
    const {
      amount,
      currency = 'USD',
      cryptoType,
      customerEmail,
      orderId,
      metadata
    } = orderData;

    if (!SUPPORTED_CRYPTOS[cryptoType]) {
      throw new Error(`Unsupported cryptocurrency: ${cryptoType}`);
    }

    const crypto = SUPPORTED_CRYPTOS[cryptoType];

    // Get current exchange rate
    const exchangeRate = await getCryptoExchangeRate(cryptoType, currency);
    const cryptoAmount = (amount / exchangeRate).toFixed(8);

    // Generate unique payment address
    const paymentAddress = await generatePaymentAddress(cryptoType, orderId);

    // Create payment record
    const paymentId = await createCryptoPaymentRecord({
      orderId,
      cryptoType,
      cryptoAmount,
      usdAmount: amount,
      exchangeRate,
      paymentAddress,
      customerEmail,
      metadata
    });

    // Set up payment monitoring
    await setupPaymentMonitoring(paymentId, paymentAddress, cryptoType);

    return {
      success: true,
      paymentId,
      paymentAddress,
      cryptoAmount,
      cryptoType: crypto.symbol,
      exchangeRate,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      qrCode: generateQRCode(paymentAddress, cryptoAmount, crypto.symbol),
      explorerUrl: crypto.explorerUrl
    };

  } catch (error) {
    console.error('Crypto payment creation failed:', error);

    await logPaymentError({
      provider: 'crypto',
      operation: 'create_payment',
      error: error.message,
      metadata: orderData.metadata
    });

    throw new Error(`Failed to create crypto payment: ${error.message}`);
  }
}

// Monitor crypto payment status
export async function checkCryptoPaymentStatus(paymentId) {
  try {
    const payment = await getCryptoPaymentRecord(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    const crypto = SUPPORTED_CRYPTOS[payment.crypto_type];
    let confirmations = 0;
    let transactionHash = null;

    // Check blockchain for payment
    switch (payment.crypto_type) {
      case 'bitcoin':
        ({ confirmations, transactionHash } = await checkBitcoinPayment(payment.payment_address, payment.crypto_amount));
        break;

      case 'ethereum':
      case 'usdt':
      case 'usdc':
        ({ confirmations, transactionHash } = await checkEthereumPayment(payment.payment_address, payment.crypto_amount, payment.crypto_type));
        break;

      default:
        throw new Error(`Unsupported crypto type: ${payment.crypto_type}`);
    }

    // Update payment status based on confirmations
    let status = 'pending';
    if (confirmations >= crypto.confirmations) {
      status = 'confirmed';
    } else if (confirmations > 0) {
      status = 'unconfirmed';
    }

    // Update payment record
    await updateCryptoPaymentStatus(paymentId, {
      status,
      confirmations,
      transactionHash,
      lastChecked: new Date()
    });

    return {
      success: true,
      status,
      confirmations,
      requiredConfirmations: crypto.confirmations,
      transactionHash,
      explorerUrl: transactionHash ? `${crypto.explorerUrl}${transactionHash}` : null
    };

  } catch (error) {
    console.error('Crypto payment status check failed:', error);

    await logPaymentError({
      provider: 'crypto',
      operation: 'check_status',
      paymentId: paymentId,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
}

// Get real-time crypto exchange rates
async function getCryptoExchangeRate(cryptoType, fiatCurrency = 'USD') {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(cryptoType)}&vs_currencies=${fiatCurrency.toLowerCase()}`);
    const data = await response.json();

    const coinId = getCoinGeckoId(cryptoType);
    return data[coinId][fiatCurrency.toLowerCase()];

  } catch (error) {
    console.error('Failed to get exchange rate:', error);

    // Fallback to cached rates
    return getCachedExchangeRate(cryptoType, fiatCurrency);
  }
}

// Generate unique payment address
async function generatePaymentAddress(cryptoType, orderId) {
  // In production, this would integrate with a wallet service or HD wallet
  // For now, we'll generate a deterministic address based on order ID

  const seed = `${process.env.CRYPTO_WALLET_SEED}${orderId}${cryptoType}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');

  switch (cryptoType) {
    case 'bitcoin':
      return generateBitcoinAddress(hash);
    case 'ethereum':
    case 'usdt':
    case 'usdc':
      return generateEthereumAddress(hash);
    default:
      throw new Error(`Unsupported crypto type: ${cryptoType}`);
  }
}

// Database helper functions
async function createCryptoPaymentRecord(data) {
  try {
    const result = await query(`
      INSERT INTO crypto_payments (
        order_id, crypto_type, crypto_amount, usd_amount, exchange_rate,
        payment_address, customer_email, status, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, NOW())
      RETURNING id
    `, [
      data.orderId, data.cryptoType, data.cryptoAmount, data.usdAmount,
      data.exchangeRate, data.paymentAddress, data.customerEmail,
      JSON.stringify(data.metadata)
    ]);

    return result.rows[0].id;
  } catch (error) {
    console.error('Failed to create crypto payment record:', error);
    throw error;
  }
}

async function getCryptoPaymentRecord(paymentId) {
  try {
    const result = await query(`
      SELECT * FROM crypto_payments WHERE id = $1
    `, [paymentId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to get crypto payment record:', error);
    throw error;
  }
}

async function updateCryptoPaymentStatus(paymentId, data) {
  try {
    await query(`
      UPDATE crypto_payments
      SET status = $1, confirmations = $2, transaction_hash = $3,
          last_checked = $4, updated_at = NOW()
      WHERE id = $5
    `, [data.status, data.confirmations, data.transactionHash, data.lastChecked, paymentId]);
  } catch (error) {
    console.error('Failed to update crypto payment status:', error);
    throw error;
  }
}

// Utility functions
function getCoinGeckoId(cryptoType) {
  const mapping = {
    bitcoin: 'bitcoin',
    ethereum: 'ethereum',
    usdt: 'tether',
    usdc: 'usd-coin'
  };
  return mapping[cryptoType] || cryptoType;
}

function generateQRCode(address, amount, symbol) {
  // Generate QR code data for payment
  return `${symbol.toLowerCase()}:${address}?amount=${amount}`;
}

export { SUPPORTED_CRYPTOS };
