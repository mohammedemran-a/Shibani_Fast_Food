/**
 * خدمة الطباعة
 * 
 * توفر وظائف طباعة الفواتير والتقارير
 * مع دعم تنسيقات مختلفة وإعدادات قابلة للتخصيص
 */

/**
 * واجهة بيانات الفاتورة للطباعة
 */
export interface InvoicePrintData {
  invoice_number: string;
  invoice_date: string;
  customer_name?: string;
  cashier_name?: string;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  notes?: string;
}

/**
 * إعدادات الطباعة
 */
export interface PrintSettings {
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeTaxNumber?: string;
  logoUrl?: string;
  showLogo?: boolean;
  paperSize?: 'A4' | '80mm' | '58mm';
  fontSize?: 'small' | 'medium' | 'large';
  language?: 'ar' | 'en';
}

/**
 * الإعدادات الافتراضية للطباعة
 */
const defaultSettings: PrintSettings = {
  storeName: 'متجر نقطة البيع',
  storeAddress: 'العنوان',
  storePhone: '0123456789',
  paperSize: '80mm',
  fontSize: 'medium',
  language: 'ar',
  showLogo: false,
};

/**
 * طباعة فاتورة البيع
 * 
 * @param invoiceData - بيانات الفاتورة
 * @param settings - إعدادات الطباعة (اختياري)
 */
export function printInvoice(
  invoiceData: InvoicePrintData,
  settings: Partial<PrintSettings> = {}
): void {
  // دمج الإعدادات مع الإعدادات الافتراضية
  const config = { ...defaultSettings, ...settings };

  // إنشاء نافذة الطباعة
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة للطباعة');
    return;
  }

  // تحديد عرض الورقة
  const paperWidth = config.paperSize === 'A4' ? '210mm' : config.paperSize;

  // بناء محتوى HTML للطباعة
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="${config.language === 'ar' ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة ${invoiceData.invoice_number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Tahoma', sans-serif;
          font-size: ${config.fontSize === 'small' ? '10px' : config.fontSize === 'large' ? '14px' : '12px'};
          padding: 10mm;
          width: ${paperWidth};
          direction: ${config.language === 'ar' ? 'rtl' : 'ltr'};
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .header p {
          margin: 3px 0;
          color: #555;
        }
        
        .invoice-info {
          margin: 15px 0;
          display: flex;
          justify-content: space-between;
        }
        
        .invoice-info div {
          flex: 1;
        }
        
        .invoice-info strong {
          display: inline-block;
          min-width: 100px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        table thead {
          background-color: #f0f0f0;
        }
        
        table th,
        table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: ${config.language === 'ar' ? 'right' : 'left'};
        }
        
        table th {
          font-weight: bold;
        }
        
        .totals {
          margin-top: 20px;
          text-align: ${config.language === 'ar' ? 'left' : 'right'};
        }
        
        .totals div {
          margin: 5px 0;
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        
        .totals .total-row {
          font-size: 16px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          border-top: 1px dashed #000;
          padding-top: 10px;
          font-size: 10px;
          color: #666;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <!-- رأس الفاتورة -->
      <div class="header">
        ${config.showLogo && config.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">` : ''}
        <h1>${config.storeName}</h1>
        <p>${config.storeAddress}</p>
        <p>هاتف: ${config.storePhone}</p>
        ${config.storeTaxNumber ? `<p>الرقم الضريبي: ${config.storeTaxNumber}</p>` : ''}
      </div>
      
      <!-- معلومات الفاتورة -->
      <div class="invoice-info">
        <div>
          <p><strong>رقم الفاتورة:</strong> ${invoiceData.invoice_number}</p>
          <p><strong>التاريخ:</strong> ${new Date(invoiceData.invoice_date).toLocaleDateString('ar-SA')}</p>
        </div>
        <div>
          ${invoiceData.customer_name ? `<p><strong>العميل:</strong> ${invoiceData.customer_name}</p>` : ''}
          ${invoiceData.cashier_name ? `<p><strong>الكاشير:</strong> ${invoiceData.cashier_name}</p>` : ''}
        </div>
      </div>
      
      <!-- جدول المنتجات -->
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.product_name}</td>
              <td>${item.quantity}</td>
              <td>${item.unit_price.toFixed(2)}</td>
              <td>${item.total_price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- الإجماليات -->
      <div class="totals">
        <div>
          <span>المجموع الفرعي:</span>
          <span>${invoiceData.subtotal.toFixed(2)} ريال</span>
        </div>
        ${invoiceData.discount_amount > 0 ? `
          <div>
            <span>الخصم:</span>
            <span>- ${invoiceData.discount_amount.toFixed(2)} ريال</span>
          </div>
        ` : ''}
        ${invoiceData.tax_amount > 0 ? `
          <div>
            <span>الضريبة (${((invoiceData.tax_amount / invoiceData.subtotal) * 100).toFixed(0)}%):</span>
            <span>${invoiceData.tax_amount.toFixed(2)} ريال</span>
          </div>
        ` : ''}
        <div class="total-row">
          <span>الإجمالي النهائي:</span>
          <span>${invoiceData.total_amount.toFixed(2)} ريال</span>
        </div>
        <div style="margin-top: 10px;">
          <span>طريقة الدفع:</span>
          <span>${getPaymentMethodLabel(invoiceData.payment_method)}</span>
        </div>
      </div>
      
      ${invoiceData.notes ? `
        <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd;">
          <strong>ملاحظات:</strong>
          <p>${invoiceData.notes}</p>
        </div>
      ` : ''}
      
      <!-- تذييل الفاتورة -->
      <div class="footer">
        <p>شكراً لتعاملكم معنا</p>
        <p>تم الطباعة في: ${new Date().toLocaleString('ar-SA')}</p>
      </div>
      
      <script>
        // طباعة تلقائية عند تحميل الصفحة
        window.onload = function() {
          window.print();
          // إغلاق النافذة بعد الطباعة (اختياري)
          // window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `;

  // كتابة المحتوى في نافذة الطباعة
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * الحصول على تسمية طريقة الدفع بالعربية
 * 
 * @param method - طريقة الدفع
 * @returns التسمية بالعربية
 */
function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'نقدي',
    card: 'بطاقة',
    transfer: 'تحويل بنكي',
    wallet: 'محفظة إلكترونية',
    debt: 'آجل',
  };
  return labels[method] || method;
}

/**
 * طباعة تقرير المبيعات اليومي
 * 
 * @param salesData - بيانات المبيعات
 * @param date - التاريخ
 */
export function printDailySalesReport(
  salesData: {
    invoices: InvoicePrintData[];
    totalSales: number;
    totalTax: number;
    totalDiscount: number;
    transactionsCount: number;
  },
  date: string
): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة للطباعة');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>تقرير المبيعات اليومي - ${date}</title>
      <style>
        body {
          font-family: 'Arial', 'Tahoma', sans-serif;
          padding: 20mm;
          direction: rtl;
        }
        h1 {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .summary {
          margin: 20px 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .summary-item {
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
        }
        th {
          background-color: #f0f0f0;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>تقرير المبيعات اليومي</h1>
      <p style="text-align: center;">التاريخ: ${new Date(date).toLocaleDateString('ar-SA')}</p>
      
      <div class="summary">
        <div class="summary-item">
          <h3>إجمالي المبيعات</h3>
          <p style="font-size: 24px; font-weight: bold;">${salesData.totalSales.toFixed(2)} ريال</p>
        </div>
        <div class="summary-item">
          <h3>عدد المعاملات</h3>
          <p style="font-size: 24px; font-weight: bold;">${salesData.transactionsCount}</p>
        </div>
        <div class="summary-item">
          <h3>إجمالي الضريبة</h3>
          <p style="font-size: 24px; font-weight: bold;">${salesData.totalTax.toFixed(2)} ريال</p>
        </div>
        <div class="summary-item">
          <h3>إجمالي الخصومات</h3>
          <p style="font-size: 24px; font-weight: bold;">${salesData.totalDiscount.toFixed(2)} ريال</p>
        </div>
      </div>
      
      <h2>تفاصيل الفواتير</h2>
      <table>
        <thead>
          <tr>
            <th>رقم الفاتورة</th>
            <th>الوقت</th>
            <th>العميل</th>
            <th>المبلغ</th>
            <th>طريقة الدفع</th>
          </tr>
        </thead>
        <tbody>
          ${salesData.invoices.map(invoice => `
            <tr>
              <td>${invoice.invoice_number}</td>
              <td>${new Date(invoice.invoice_date).toLocaleTimeString('ar-SA')}</td>
              <td>${invoice.customer_name || 'عميل عابر'}</td>
              <td>${invoice.total_amount.toFixed(2)}</td>
              <td>${getPaymentMethodLabel(invoice.payment_method)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * طباعة باركود المنتج
 * 
 * @param productName - اسم المنتج
 * @param barcode - الباركود
 * @param price - السعر
 * @param quantity - عدد النسخ للطباعة
 */
export function printProductBarcode(
  productName: string,
  barcode: string,
  price: number,
  quantity: number = 1
): void {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة للطباعة');
    return;
  }

  // إنشاء نسخ متعددة من الباركود
  const barcodes = Array(quantity).fill(null).map((_, index) => `
    <div class="barcode-item">
      <p class="product-name">${productName}</p>
      <svg class="barcode"></svg>
      <p class="barcode-text">${barcode}</p>
      <p class="price">${price.toFixed(2)} ريال</p>
    </div>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>طباعة باركود - ${productName}</title>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 10mm;
        }
        .barcode-item {
          page-break-inside: avoid;
          margin-bottom: 15mm;
          text-align: center;
          border: 1px dashed #ccc;
          padding: 5mm;
        }
        .product-name {
          font-size: 12px;
          font-weight: bold;
          margin: 5px 0;
        }
        .barcode {
          margin: 5px 0;
        }
        .barcode-text {
          font-size: 10px;
          margin: 5px 0;
        }
        .price {
          font-size: 14px;
          font-weight: bold;
          margin: 5px 0;
        }
        @media print {
          body { padding: 0; }
          .barcode-item { border: none; }
        }
      </style>
    </head>
    <body>
      ${barcodes}
      <script>
        window.onload = function() {
          // توليد الباركود لكل عنصر
          document.querySelectorAll('.barcode').forEach(function(svg) {
            JsBarcode(svg, '${barcode}', {
              format: 'CODE128',
              width: 2,
              height: 50,
              displayValue: false
            });
          });
          
          // طباعة بعد توليد الباركود
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export default {
  printInvoice,
  printDailySalesReport,
  printProductBarcode,
};
