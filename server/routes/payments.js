const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const { auth, authorize } = require('../middleware/auth');

// Process payment
router.post('/:orderId', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const { paymentMethod, amountPaid } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const change = paymentMethod === 'cash' ? amountPaid - order.total : 0;

    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    res.json({
      message: 'Payment processed successfully',
      order,
      change: change > 0 ? change : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate receipt PDF
router.get('/:orderId/receipt', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('cashier', 'name')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const settings = await Settings.findOne();
    const restaurantName = settings?.restaurantName || 'Caisse Manager Pro';

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.orderNumber}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text(restaurantName, { align: 'center' });
    doc.fontSize(10).text(settings?.address || '', { align: 'center' });
    doc.text(settings?.phone || '', { align: 'center' });
    doc.moveDown();

    // Order info
    doc.fontSize(12).text(`Receipt #${order.orderNumber}`, { align: 'center' });
    doc.fontSize(10).text(`Date: ${order.createdAt.toLocaleString()}`, { align: 'center' });
    doc.text(`Type: ${order.type.toUpperCase()}`, { align: 'center' });
    if (order.tableNumber) {
      doc.text(`Table: ${order.tableNumber}`, { align: 'center' });
    }
    doc.text(`Cashier: ${order.cashier?.name || 'N/A'}`, { align: 'center' });
    doc.moveDown();

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Items
    doc.fontSize(10).text('Items:', { underline: true });
    doc.moveDown(0.5);

    order.items.forEach(item => {
      doc.text(`${item.quantity}x ${item.name}`, 50, doc.y, { continued: true });
      doc.text(`${(item.subtotal).toFixed(2)} ${settings?.currency || 'EUR'}`, { align: 'right' });
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Totals
    doc.text(`Subtotal:`, 50, doc.y, { continued: true });
    doc.text(`${order.subtotal.toFixed(2)} ${settings?.currency || 'EUR'}`, { align: 'right' });

    if (order.discount > 0) {
      doc.text(`Discount:`, 50, doc.y, { continued: true });
      doc.text(`-${order.discount.toFixed(2)} ${settings?.currency || 'EUR'}`, { align: 'right' });
    }

    doc.text(`Tax (${settings?.taxRate || 20}%):`, 50, doc.y, { continued: true });
    doc.text(`${order.tax.toFixed(2)} ${settings?.currency || 'EUR'}`, { align: 'right' });

    doc.fontSize(12).text(`TOTAL:`, 50, doc.y, { continued: true, bold: true });
    doc.text(`${order.total.toFixed(2)} ${settings?.currency || 'EUR'}`, { align: 'right' });

    doc.moveDown();
    doc.fontSize(10).text(`Payment Method: ${order.paymentMethod?.toUpperCase() || 'N/A'}`, { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for your visit!', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
