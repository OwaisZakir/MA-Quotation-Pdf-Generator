'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type RowData = {
  item: string;
  quantity: number;
  price: number;
};

export default function Home() {
  const [rows, setRows] = useState<RowData[]>([
    { item: '', quantity: 1, price: 0 },
  ]);

  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddRow = () => {
    setRows([...rows, { item: '', quantity: 1, price: 0 }]);
  };

  const handleChangeRow = (
    index: number,
    field: keyof RowData,
    value: string | number
  ) => {
    const updated = [...rows];
    if (field === 'item') {
      updated[index][field] = value as string;
    } else {
      updated[index][field] = value as number;
    }
    setRows(updated);
  };

  const getTotal = () =>
    rows.reduce((total, row) => total + row.quantity * row.price, 0);

  const handleGeneratePDF = async () => {
    const element = document.getElementById('quotation');
    if (!element) {
      alert('Quotation element not found');
      return;
    }

    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Render element to canvas with higher scale for better quality
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Maintain aspect ratio for image height
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    pdf.save('quotation.pdf');
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">MA Solar Energy Quotation</h1>

      <div className="space-y-2 mb-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Customer Name"
          value={customer.name}
          onChange={(e) =>
            setCustomer({ ...customer, name: e.target.value })
          }
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Customer Address"
          value={customer.address}
          onChange={(e) =>
            setCustomer({ ...customer, address: e.target.value })
          }
        />
        <input
          className="w-full border p-2 rounded"
          type="date"
          value={customer.date}
          onChange={(e) => setCustomer({ ...customer, date: e.target.value })}
        />
      </div>

      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-3 gap-2 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Item"
            value={row.item}
            onChange={(e) => handleChangeRow(index, 'item', e.target.value)}
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Qty"
            value={row.quantity}
            onChange={(e) =>
              handleChangeRow(index, 'quantity', +e.target.value)
            }
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Price"
            value={row.price}
            onChange={(e) => handleChangeRow(index, 'price', +e.target.value)}
          />
        </div>
      ))}

      <Button onClick={handleAddRow} className="mb-4 w-full">
        + Add Item
      </Button>

      <div
        id="quotation"
        className="p-4 bg-white rounded shadow print:bg-white print:shadow-none"
      >
        <h2 className="font-semibold text-lg mb-2">Quotation</h2>
        <p>
          <strong>MA Solar Energy</strong>
        </p>
        <p>Zakir Aleem | Call: 03132532601 | WhatsApp: 03462505849</p>
        <p>Date: {customer.date}</p>
        <p>Customer: {customer.name}</p>
        <p>Address: {customer.address}</p>

        <table className="w-full mt-4 border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-1 text-left">Item</th>
              <th className="border p-1">Qty</th>
              <th className="border p-1">Price</th>
              <th className="border p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="border p-1">{row.item}</td>
                <td className="border p-1 text-center">{row.quantity}</td>
                <td className="border p-1 text-right">Rs {row.price}</td>
                <td className="border p-1 text-right">
                  Rs {row.quantity * row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 font-semibold text-right">
          Grand Total: Rs {getTotal()}
        </p>
      </div>

      <Button
        onClick={handleGeneratePDF}
        className="mt-4 w-full bg-green-600 text-white"
      >
        Download PDF
      </Button>
    </main>
  );
}
