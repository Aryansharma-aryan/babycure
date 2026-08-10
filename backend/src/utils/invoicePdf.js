const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

const brand = {
  blue: '#4AA6D9',
  deepBlue: '#0867B2',
  green: '#7CC576',
  deepGreen: '#2F9E44',
  ink: '#17324D',
  muted: '#64748B',
  line: '#DCEFF8',
  mist: '#F3FBFF',
  leaf: '#F5FFF3',
  white: '#FFFFFF',
}

const formatPrice = (value = 0) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatStatus = (value = '') => String(value || 'not_available').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : 'Not available')

const logoPath = path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'assets', 'logoBaby.png')

const bufferFromStream = (doc) => new Promise((resolve, reject) => {
  const chunks = []
  doc.on('data', (chunk) => chunks.push(chunk))
  doc.on('end', () => resolve(Buffer.concat(chunks)))
  doc.on('error', reject)
})

const normalizeImageUrl = (url = '') => {
  if (!url) return ''
  const value = String(url).replace(/\\/g, '/')
  const uploadIndex = value.indexOf('/uploads/')
  if (uploadIndex >= 0) {
    return path.resolve(__dirname, '..', '..', value.slice(uploadIndex + 1))
  }
  return value
}

const getImageBuffer = async (url) => {
  const normalized = normalizeImageUrl(url)
  if (!normalized) return null

  try {
    if (/^https?:\/\//i.test(normalized)) {
      const response = await fetch(normalized)
      if (!response.ok) return null
      return Buffer.from(await response.arrayBuffer())
    }

    if (fs.existsSync(normalized)) {
      return fs.readFileSync(normalized)
    }
  } catch {
    return null
  }

  return null
}

const safeText = (value, fallback = 'Not available') => {
  const text = value === undefined || value === null || value === '' ? fallback : String(value)
  return text.replace(/[^\x20-\x7E]/g, ' ')
}

const drawPill = (doc, text, x, y, options = {}) => {
  const width = options.width || Math.max(doc.widthOfString(text) + 22, 78)
  doc
    .roundedRect(x, y, width, 24, 12)
    .fill(options.fill || brand.leaf)
    .fillColor(options.color || brand.green)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(text, x, y + 8, { width, align: 'center' })
}

const drawSoftCard = (doc, x, y, width, height, options = {}) => {
  doc
    .roundedRect(x, y, width, height, options.radius || 14)
    .fill(options.fill || brand.white)
    .strokeColor(options.stroke || brand.line)
    .lineWidth(options.lineWidth || 0.8)
    .stroke()
}

const drawLabelValue = (doc, label, value, x, y, width = 180) => {
  doc.fillColor(brand.muted).font('Helvetica-Bold').fontSize(7).text(label.toUpperCase(), x, y)
  doc.fillColor(brand.ink).font('Helvetica').fontSize(9).text(safeText(value), x, y + 12, { width })
}

const drawSectionTitle = (doc, title, x, y) => {
  doc.fillColor(brand.deepBlue).font('Helvetica-Bold').fontSize(8).text(title.toUpperCase(), x, y)
  doc.roundedRect(x, y + 15, 34, 4, 2).fill(brand.green)
  doc.moveTo(x + 42, y + 17).lineTo(545, y + 17).lineWidth(0.8).strokeColor(brand.line).stroke()
}

const drawMoneyRow = (doc, label, value, y, strong = false) => {
  doc.fillColor(strong ? brand.ink : brand.muted).font(strong ? 'Helvetica-Bold' : 'Helvetica').fontSize(strong ? 12 : 9)
  doc.text(label, 350, y, { width: 95 })
  doc.text(formatPrice(value), 442, y, { width: 92, align: 'right' })
}

const drawFallbackProductBox = (doc, x, y) => {
  doc.roundedRect(x, y, 46, 46, 8).fill(brand.mist)
  doc.fillColor(brand.blue).font('Helvetica-Bold').fontSize(14).text('BC', x, y + 16, { width: 46, align: 'center' })
}

const drawHeader = (doc, order) => {
  doc.rect(0, 0, 595, 152).fill(brand.mist)
  doc.rect(0, 0, 595, 8).fill(brand.deepBlue)
  doc.rect(0, 8, 595, 5).fill(brand.green)
  doc.circle(560, 24, 68).fill('#E9F8FF')
  doc.circle(520, 142, 46).fill('#F0FFEC')

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 54, 34, { width: 92 })
  } else {
    doc.fillColor(brand.blue).font('Helvetica-Bold').fontSize(20).text('BabyCure', 50, 38)
  }

  doc.fillColor(brand.ink).font('Helvetica-Bold').fontSize(25).text('Tax Invoice', 345, 38, { width: 200, align: 'right' })
  doc.fillColor(brand.muted).font('Helvetica').fontSize(9).text('Gentle by nature, Pure by care', 345, 70, { width: 200, align: 'right' })
  doc.fillColor(brand.deepBlue).font('Helvetica-Bold').fontSize(8).text('BABYCURE INDIA', 345, 92, { width: 200, align: 'right' })

  drawPill(doc, formatStatus(order.paymentStatus), 439, 112, {
    width: 106,
    fill: order.paymentStatus === 'paid' ? brand.leaf : '#FFF7ED',
    color: order.paymentStatus === 'paid' ? brand.deepGreen : '#EA580C',
  })
}

const drawMetaCards = (doc, order) => {
  drawSoftCard(doc, 50, 176, 495, 88, { radius: 16 })
  doc.roundedRect(50, 176, 7, 88, 4).fill(brand.green)
  drawLabelValue(doc, 'Invoice / Order No.', order.orderNumber, 72, 195, 150)
  drawLabelValue(doc, 'Invoice Date & Time', formatDate(order.createdAt), 235, 195, 130)
  drawLabelValue(doc, 'Payment Method', order.paymentMethod || 'ONLINE', 390, 195, 120)
  drawLabelValue(doc, 'Order Status', formatStatus(order.orderStatus), 72, 229, 150)
  drawLabelValue(doc, 'Payment Status', formatStatus(order.paymentStatus), 235, 229, 130)
  drawLabelValue(doc, 'Grand Total', formatPrice(order.totalPrice), 390, 229, 120)
}

const drawAddressCards = (doc, order) => {
  const address = order.shippingAddress || {}

  drawSoftCard(doc, 50, 292, 238, 118, { fill: brand.leaf, stroke: '#D7F5D3', radius: 16 })
  doc.fillColor(brand.deepGreen).font('Helvetica-Bold').fontSize(8).text('BILLED TO', 68, 312)
  doc.fillColor(brand.ink).font('Helvetica-Bold').fontSize(12).text(safeText(address.fullName || order.user?.name || 'Customer'), 68, 332, { width: 195 })
  doc.fillColor(brand.muted).font('Helvetica').fontSize(9)
    .text(safeText(address.addressLine1, ''), 68, 355, { width: 195 })
    .text(`${safeText(address.city, '')}, ${safeText(address.state, '')} - ${safeText(address.postalCode, '')}`, 68, 371, { width: 195 })
    .text(`Phone: ${safeText(address.phone || order.user?.phone, '')}`, 68, 387, { width: 195 })

  drawSoftCard(doc, 307, 292, 238, 118, { fill: '#FFFFFF', radius: 16 })
  doc.fillColor(brand.deepBlue).font('Helvetica-Bold').fontSize(8).text('SOLD BY', 325, 312)
  doc.fillColor(brand.ink).font('Helvetica-Bold').fontSize(12).text('BabyCure India', 325, 332)
  doc.fillColor(brand.muted).font('Helvetica').fontSize(9)
    .text('Gentle baby-care essentials', 325, 355, { width: 190 })
    .text('Email: info@babycureindia.com', 325, 371, { width: 190 })
    .text('Website: babycureindia.com', 325, 387, { width: 190 })
}

const drawItemsTable = async (doc, order) => {
  const startY = 456
  drawSectionTitle(doc, 'Products Purchased', 50, 432)
  doc.roundedRect(50, startY, 495, 30, 10).fill(brand.deepBlue)
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8)
  doc.text('PRODUCT DETAILS', 68, startY + 10, { width: 230 })
  doc.text('QTY', 320, startY + 10, { width: 36, align: 'center' })
  doc.text('UNIT PRICE', 365, startY + 10, { width: 78, align: 'right' })
  doc.text('AMOUNT', 462, startY + 10, { width: 65, align: 'right' })

  let y = startY + 42
  for (const item of order.orderItems || []) {
    if (y > 665) {
      doc.addPage()
      y = 60
    }

    drawSoftCard(doc, 50, y - 8, 495, 68, { radius: 12 })
    const image = await getImageBuffer(item.image)
    if (image) {
      try {
        doc.image(image, 64, y, { fit: [50, 50], align: 'center', valign: 'center' })
      } catch {
        drawFallbackProductBox(doc, 64, y + 2)
      }
    } else {
      drawFallbackProductBox(doc, 64, y + 2)
    }

    const productSku = item.product?.sku || item.sku || ''
    doc.fillColor(brand.ink).font('Helvetica-Bold').fontSize(9).text(safeText(item.name), 128, y + 4, { width: 170 })
    doc.fillColor(brand.muted).font('Helvetica').fontSize(8)
      .text(productSku ? `SKU: ${productSku}` : 'BabyCure product', 128, y + 23, { width: 170 })
      .text('Final customer price', 128, y + 38, { width: 170 })
    doc.fillColor(brand.ink).font('Helvetica').fontSize(9)
    doc.text(item.quantity, 320, y + 20, { width: 36, align: 'center' })
    doc.text(formatPrice(item.price), 365, y + 20, { width: 78, align: 'right' })
    doc.font('Helvetica-Bold').text(formatPrice(Number(item.price || 0) * Number(item.quantity || 0)), 462, y + 20, { width: 65, align: 'right' })
    y += 78
  }

  return y
}

const drawTotalsAndPayment = (doc, order, y) => {
  const safeY = Math.max(y + 10, 610)
  if (safeY > 650) {
    doc.addPage()
    y = 60
  } else {
    y = safeY
  }

  drawSoftCard(doc, 50, y, 270, 118, { fill: brand.mist, radius: 16 })
  doc.fillColor(brand.deepBlue).font('Helvetica-Bold').fontSize(8).text('PAYMENT NOTE', 68, y + 18)
  doc.fillColor(brand.ink).font('Helvetica-Bold').fontSize(12).text(`${order.paymentMethod || 'ONLINE'} - ${formatStatus(order.paymentStatus)}`, 68, y + 39, { width: 220 })
  doc.fillColor(brand.muted).font('Helvetica').fontSize(9)
    .text('This invoice confirms the purchase details for your BabyCure order.', 68, y + 62, { width: 220, lineGap: 2 })
    .text('For delivery tracking, use the order tracking page or shipment email updates.', 68, y + 88, { width: 220, lineGap: 2 })

  drawSoftCard(doc, 340, y, 205, 136, { radius: 16 })
  drawMoneyRow(doc, 'Subtotal', order.itemsPrice, y + 18)
  drawMoneyRow(doc, 'Shipping', order.shippingPrice, y + 38)
  drawMoneyRow(doc, 'Discount', order.discountAmount, y + 58)
  doc.moveTo(360, y + 86).lineTo(525, y + 86).strokeColor(brand.line).stroke()
  drawMoneyRow(doc, 'Grand Total', order.totalPrice, y + 100, true)

  return y + 150
}

const drawFooter = (doc) => {
  const y = 770
  doc.moveTo(50, y - 18).lineTo(545, y - 18).strokeColor(brand.line).stroke()
  doc.fillColor(brand.ink).font('Helvetica-Bold').fontSize(10).text('Thank you for shopping with BabyCure.', 50, y)
  doc.fillColor(brand.muted).font('Helvetica').fontSize(8).text('This is a computer-generated invoice. For support, contact BabyCure customer care.', 50, y + 16, { width: 495 })
}

const buildInvoicePdf = async (order) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true })
  const done = bufferFromStream(doc)

  drawHeader(doc, order)
  drawMetaCards(doc, order)
  drawAddressCards(doc, order)
  const afterItemsY = await drawItemsTable(doc, order)
  drawTotalsAndPayment(doc, order, afterItemsY)

  const pages = doc.bufferedPageRange()
  for (let index = 0; index < pages.count; index += 1) {
    doc.switchToPage(index)
    drawFooter(doc)
    doc.fillColor(brand.muted).font('Helvetica').fontSize(8).text(`Page ${index + 1} of ${pages.count}`, 500, 786, { width: 45, align: 'right' })
  }

  doc.end()
  return done
}

module.exports = {
  buildInvoicePdf,
}
