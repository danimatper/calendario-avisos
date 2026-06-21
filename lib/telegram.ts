export async function sendTelegramMessage(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram credentials not configured')
    return
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Telegram error:', error)
    throw new Error(`Telegram API error: ${response.status}`)
  }
}
