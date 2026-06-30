import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { FaPrint, FaTimes } from 'react-icons/fa';
import { PHARMACY_NAME } from '../../utils/constants';

const BarcodePrinterModal = ({ isOpen, onClose, items }) => {
    const printRef = useRef();
    const [config, setConfig] = useState({
        pharmacyName: true,
        productName: true,
        price: true,
        expiryDate: true,
        barcode: true,
    });
    
    // For each item, create an array of its quantities to print multiple stickers
    const printItems = items.flatMap(item => 
        Array.from({ length: item.quantity || 1 }).fill(item)
    );

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Pharmacy_Barcodes'
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 m-0">Print Barcodes</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border-none cursor-pointer">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Sidebar Configuration */}
                    <div className="w-full md:w-72 bg-slate-50 p-5 border-r border-slate-100 overflow-y-auto">
                        <h3 className="font-bold text-slate-800 mb-4">Print Options</h3>
                        
                        <div className="space-y-3 mb-6">
                            {Object.entries({
                                pharmacyName: 'Pharmacy Name',
                                productName: 'Product Name',
                                price: 'Price',
                                expiryDate: 'Expiry Date',
                                barcode: 'Barcode',
                            }).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config[key]} 
                                        onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Total Labels</div>
                            <div className="text-2xl font-black text-slate-800">{printItems.length}</div>
                        </div>

                        <button onClick={() => handlePrint()} className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer border-none">
                            <FaPrint /> Print All Labels
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-200/50 flex flex-col items-center">
                        <h3 className="font-bold text-slate-600 mb-4 self-start">Live Preview</h3>
                        
                        {/* Hidden Printable Area */}
                        <div className="hidden">
                            <div ref={printRef} className="print-container">
                                <style type="text/css" media="print">
                                    {`
                                        @page { 
                                            size: 38mm 25mm; 
                                            margin: 0; 
                                        }
                                        body { 
                                            margin: 0; 
                                            padding: 0; 
                                            background: white; 
                                        }
                                        .label-page { 
                                            width: 38mm; 
                                            height: 25mm; 
                                            page-break-after: always;
                                            display: flex;
                                            flex-direction: column;
                                            justify-content: center;
                                            align-items: center;
                                            padding: 1mm;
                                            box-sizing: border-box;
                                            font-family: Arial, sans-serif;
                                            overflow: hidden;
                                            text-align: center;
                                        }
                                        /* For the last element, remove page break */
                                        .label-page:last-child {
                                            page-break-after: auto;
                                        }
                                        .barcode-wrapper svg {
                                            max-width: 100%;
                                            height: auto !important;
                                        }
                                    `}
                                </style>
                                {printItems.map((item, index) => (
                                    <div key={`${item.productId}-${index}`} className="label-page">
                                        {config.pharmacyName && <div style={{ fontSize: '7px', fontWeight: 'bold' }}>{PHARMACY_NAME}</div>}
                                        {config.productName && <div style={{ fontSize: '8px', fontWeight: 'bold', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.name}</div>}
                                        
                                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '4px', fontSize: '7px' }}>
                                            {config.price && <div>{item.sellingPrice} EGP</div>}
                                            {config.price && config.expiryDate && <span>|</span>}
                                            {config.expiryDate && <div>Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : 'N/A'}</div>}
                                        </div>

                                        {config.barcode && item.barcode && (
                                            <div className="barcode-wrapper" style={{ marginTop: '1px' }}>
                                                <Barcode 
                                                    value={item.barcode} 
                                                    format="CODE128" 
                                                    width={1} 
                                                    height={25} 
                                                    displayValue={true} 
                                                    fontSize={8} 
                                                    margin={0}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Preview for UI only */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            {/* We just show a few to avoid lag if there are hundreds */}
                            {printItems.slice(0, 12).map((item, index) => (
                                <div key={`preview-${index}`} className="bg-white shadow-sm border border-slate-300 rounded-md flex flex-col justify-center items-center p-2" style={{ width: '38mm', height: '25mm', transform: 'scale(1.5)', transformOrigin: 'top left', margin: '0 0 12mm 12mm' }}>
                                    {config.pharmacyName && <div style={{ fontSize: '7px', fontWeight: 'bold' }}>{PHARMACY_NAME}</div>}
                                    {config.productName && <div style={{ fontSize: '8px', fontWeight: 'bold', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.name}</div>}
                                    
                                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '4px', fontSize: '7px' }}>
                                        {config.price && <div>{item.sellingPrice || '0.00'} EGP</div>}
                                        {config.price && config.expiryDate && <span>|</span>}
                                        {config.expiryDate && <div>Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : 'N/A'}</div>}
                                    </div>

                                    {config.barcode && item.barcode && (
                                        <div style={{ marginTop: '1px', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                                            <Barcode 
                                                value={item.barcode} 
                                                format="CODE128" 
                                                width={1.2} 
                                                height={30} 
                                                displayValue={true} 
                                                fontSize={10} 
                                                margin={0}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {printItems.length > 12 && (
                                <div className="text-slate-400 font-medium col-span-full mt-4 flex items-center justify-center">
                                    + {printItems.length - 12} more labels...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodePrinterModal;
