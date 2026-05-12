
import React, { useState, useEffect } from 'react';
import { CheckCircle, Search, ArrowRight, Smartphone, CreditCard, User as UserIcon, FileSignature, QrCode, Wifi, Briefcase, PlusCircle, Users, MapPin, Mail, Phone, Globe, Database, ShieldCheck, AlertCircle, XCircle, Printer, Truck, Server, Loader2, RefreshCw, X, Building2, Store, Tent, Landmark, Lock, Ban, FileWarning, CreditCard as CardIcon, ArrowDownCircle, Check, Send, AlertTriangle, Box, Signal, Calculator, Percent, ShieldPlus, Info, Banknote, ScanLine, FileCheck, Laptop, ShoppingCart, Cpu, BellRing, MessageSquare, FileText, ExternalLink, PackageCheck, Archive, Receipt } from 'lucide-react';

const plans = [
  { id: 1, name: 'Básico', price: '15.00$', fee: '0.70$', details: 'Ideal para comercios pequeños', color: 'bg-blue-500' },
  { id: 2, name: 'Emprendedor', price: '21.00$', fee: '1.50$', details: 'Para negocios en crecimiento', color: 'bg-indigo-500' },
  { id: 3, name: 'Pyme', price: '24.00$', fee: '1.50$', details: 'Facturación media mensual', color: 'bg-purple-500' },
  { id: 4, name: 'Corporativo', price: '32.00$', fee: '0.50$', details: 'Alto volumen de transacciones', color: 'bg-slate-800' },
];

const modalitiesOptions = [
  { id: 'Contado', name: 'Contado', description: 'Pago único del equipo', defaultPlanId: 1 },
  { id: 'Financiado', name: 'Financiado', description: 'Pago en cuotas mensuales', defaultPlanId: 2 },
  { id: 'Comodato', name: 'Comodato', description: 'Préstamo de uso bajo contrato (Sin facturación)', defaultPlanId: 1 },
  { id: 'Contado con garantía extendida', name: 'Contado + G.E.', description: 'Incluye protección total', defaultPlanId: 3 },
  { id: 'Contado sin garantía extendida', name: 'Contado s/G.E.', description: 'Garantía estándar', defaultPlanId: 1 }
];

const equipments = [
  { id: 'pos-1', name: 'Newland N910', type: 'Inalámbrico', connection: '4G/Wifi', image: 'bg-blue-600', stock: 12, entryDate: '2024-01-15', assignedTo: 'Banco Exterior', region: 'Metropolitana' },
  { id: 'pos-2', name: 'Ingenico Lane 3000', type: 'Cableado', connection: 'Ethernet', image: 'bg-slate-600', stock: 5, entryDate: '2023-11-20', assignedTo: 'Banco Exterior', region: 'Metropolitana' },
  { id: 'pos-3', name: 'SZZT KS8223', type: 'Inalámbrico', connection: '4G/Wifi', image: 'bg-indigo-600', stock: 8, entryDate: '2024-02-10', assignedTo: 'Banco de Venezuela', region: 'Zulia' },
  { id: 'pos-4', name: 'PAX S920', type: 'Inalámbrico', connection: '4G', image: 'bg-emerald-600', stock: 15, entryDate: '2023-12-05', assignedTo: 'General', region: 'Todo' }
];

import { ViewState, User } from '../types';

interface SalesWizardProps {
  user?: User;
}

const SalesWizard: React.FC<SalesWizardProps> = ({ user }) => {
  // Step 1: Channel -> Step 2: Method -> Step 3: Search/Select -> Step 4: Mora -> Step 5: Terminal -> Step 6: Data -> Step 7: OTP -> Step 8: Eq/Op -> Step 9: Serials -> Step 10: Modality -> Step 11: Pay -> Step 12: Success
  const [step, setStep] = useState(1); 
  const totalSteps = 13;
  
  // Step 1 Data
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Step 2 Data (New Selection Step)
  const [idMethod, setIdMethod] = useState<'rif' | 'affiliate' | null>(null);

  // Step 3 Data (Refactored from Step 2)
  const [managementType, setManagementType] = useState<'lead' | 'portfolio' | null>(null);
  const [rif, setRif] = useState('J-12345678-9');
  const [affiliateNumber, setAffiliateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [sapStatus, setSapStatus] = useState<'found' | 'not_found' | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Step 3 Extended Data
  const [affiliateError, setAffiliateError] = useState<string | null>(null);
  const [debtDetails, setDebtDetails] = useState<{bank: string, product: string}[] | null>(null);
  const [associatedAffiliates, setAssociatedAffiliates] = useState<any[] | null>(null);
  const [selectedAfilFromRif, setSelectedAfilFromRif] = useState<any | null>(null);
  
  // Step 4 Data (OTP)
  const [otpInputSms, setOtpInputSms] = useState(''); // MOCK: OTP recibido por SMS (gateway AS/400)
  const [otpInputEmail, setOtpInputEmail] = useState(''); // MOCK: OTP recibido por Email (gateway SAP HANA)
  const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'sent' | 'validating' | 'valid' | 'invalid' | 'expired'>('idle');
  const [otpError, setOtpError] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);

  // Step 6 Data (Affiliation)
  const [selectedAffiliation, setSelectedAffiliation] = useState<string | null>(null);
  const [affiliationMode, setAffiliationMode] = useState<'existing' | 'new' | 'presale'>('existing');
  const [newAffiliationBank, setNewAffiliationBank] = useState('');
  const [creationStage, setCreationStage] = useState<'idle' | 'notifying' | 'smi' | 'as400' | 'loading_sale' | 'success'>('idle');
  const [newAffiliationResult, setNewAffiliationResult] = useState<string | null>(null);

  // Step 7 Data (Terminal Check)
  const [terminalStatus, setTerminalStatus] = useState<'idle' | 'checking' | 'available' | 'pending' | 'blocked' | 'unauthorized'>('idle');
  const [terminalErrorMessage, setTerminalErrorMessage] = useState<string | null>(null);
  const [assignedTID, setAssignedTID] = useState<string | null>(null);
  const [additionalTerminals, setAdditionalTerminals] = useState<number>(0);

  // Step 8 Data (Config & Locking)
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [inventoryLockStatus, setInventoryLockStatus] = useState<'idle' | 'locking' | 'locked'>('idle');

  // Step 9 Data (Serials)
  const [serialMode, setSerialMode] = useState<'register' | 'skip' | null>(null);
  const [posSerial, setPosSerial] = useState('');
  const [simSerial, setSimSerial] = useState('');
  const [serialStatus, setSerialStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  
  // Step 10 Data (Modality/Plan/CCO)
  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [ccoType, setCcoType] = useState<string>('');
  const [warranty, setWarranty] = useState(false);

  // Step 11 Data (Payment)
  const [paymentMethod, setPaymentMethod] = useState('Transferencia'); 
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('USD');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [posVoucher, setPosVoucher] = useState('');
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '', email: '', idDoc: '' });
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [isTokenized, setIsTokenized] = useState(false);

  // Step 13 Data (SAP Sync)
  const [sapSyncStatus, setSapSyncStatus] = useState<'idle' | 'creating_debtor' | 'creating_order' | 'success' | 'error'>('idle');
  const [sapDebtorId, setSapDebtorId] = useState<string | null>(null);
  const [sapOrderId, setSapOrderId] = useState<string | null>(null);
  const [sapError, setSapError] = useState<string | null>(null);
  
  // Comodato Context
  const [comodatoHandover, setComodatoHandover] = useState(false);
  const [comodatoWarehouseMove, setComodatoWarehouseMove] = useState<'idle' | 'moving' | 'success'>('idle');

  // Step 14 Data (Programming AS/400)
  const [progStatus, setProgStatus] = useState<'idle' | 'creating_ticket' | 'pending_ops' | 'configuring' | 'success' | 'failure'>('idle');
  const [progTicketId, setProgTicketId] = useState<string | null>(null);
  const [notifiedSeller, setNotifiedSeller] = useState(false);
  const [isOperational, setIsOperational] = useState<boolean | null>(null);
  const [failureReason, setFailureReason] = useState<string>('');
  const [opsProgStep, setOpsProgStep] = useState<'selection' | 'execution' | 'test' | 'closure'>('selection');
  const [opsEquipment, setOpsEquipment] = useState('');
  const [opsSim, setOpsSim] = useState('');

  // Step 15 Data (Sign & Delivery)
  const [isSigned, setIsSigned] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [inventoryReleased, setInventoryReleased] = useState(false);
  const [isBilling, setIsBilling] = useState(false);

  // Print Status
  const [isPrinting, setIsPrinting] = useState(false);

  // Contact Form State
  const [contactInfo, setContactInfo] = useState({
    businessName: { value: '', source: 'SAP HANA' },
    address: { value: '', source: 'SAP HANA' },
    phone1: { value: '', source: 'AS/400' },
    phone2: { value: '', source: 'AS/400' },
    email: { value: '', source: 'SAP HANA' },
    email2: { value: '', source: 'AS/400' },
    social1: { value: '', source: 'CRM' },
    social2: { value: '', source: 'CRM' },
    rif: { value: '', source: 'SENIAT' },
    fiscalAddress: { value: '', source: 'SAP HANA' }
  });
  const [isCertified, setIsCertified] = useState(false);

  // Effects
  useEffect(() => {
    if (step === 5 && terminalStatus === 'idle') {
        checkTerminalAvailability();
    }
  }, [step]);

  useEffect(() => {
    if (step === 9 && selectedEquipment && selectedOperator && inventoryLockStatus === 'idle') {
        setInventoryLockStatus('locking');
        setTimeout(() => {
            setInventoryLockStatus('locked');
        }, 1500);
    }
  }, [step, selectedEquipment, selectedOperator]);

  // SAP Sync Effect (Step 13)
  useEffect(() => {
      if (step === 13 && sapSyncStatus === 'idle') {
          // Check if we already have IDs to avoid duplication if returning to step
          if (sapDebtorId && sapOrderId) {
              setSapSyncStatus('success');
              if (serialMode === 'register') {
                  setTimeout(() => setStep(14), 1000);
              } else {
                  setTimeout(() => setStep(15), 1000);
              }
              return;
          }

          setSapError(null);
          setSapSyncStatus('creating_debtor');
          
          setTimeout(() => {
              // Simulate debtor generation
              const newDebtorId = 'DEB-' + rif.replace(/\D/g, '') + '-' + Math.floor(Math.random() * 1000);
              setSapDebtorId(newDebtorId);
              
              setSapSyncStatus('creating_order');
              
              setTimeout(() => {
                  // Simulate order generation
                  const newOrderId = selectedModality === 'Comodato' ? 'COM-' + Math.floor(Math.random() * 1000000) : 'ORD-' + Math.floor(Math.random() * 1000000);
                  setSapOrderId(newOrderId);
                  
                  if (selectedModality === 'Comodato') {
                      setComodatoWarehouseMove('moving');
                      setTimeout(() => {
                          setComodatoWarehouseMove('success');
                          setSapSyncStatus('success');
                          if (serialMode === 'register') {
                              setTimeout(() => setStep(14), 1000);
                          } else {
                              setTimeout(() => setStep(15), 1000);
                          }
                      }, 1500);
                  } else {
                      setSapSyncStatus('success');
                      // Logic Fork
                      if (serialMode === 'register') {
                          setTimeout(() => setStep(14), 1500);
                      } else {
                          setTimeout(() => setStep(15), 1500);
                      }
                  }
              }, 2000);
          }, 2000);
      }
  }, [step, sapSyncStatus, serialMode, rif, sapDebtorId, sapOrderId]);

  // Programming Effect (Step 14)
  useEffect(() => {
      if (step === 14 && progStatus === 'idle') {
          setProgStatus('creating_ticket');
          
          setTimeout(() => {
              const ticketNum = 'TK-' + Math.floor(Math.random() * 90000 + 10000);
              setProgTicketId(ticketNum);
              
              if (serialMode === 'register') {
                  // Ruta corta: El serial ya viene registrado por el vendedor
                  setProgStatus('pending_ops');
                  
                  setTimeout(() => {
                      setProgStatus('configuring');
                      setTimeout(() => {
                          setProgStatus('success');
                          setNotifiedSeller(true);
                      }, 2500);
                  }, 3000);
              } else {
                  // Ruta larga: Operaciones debe asignar y probar
                  setProgStatus('pending_ops');
                  setOpsProgStep('selection');
              }
          }, 1500);
      }
  }, [step, progStatus, serialMode]);


  const checkTerminalAvailability = () => {
      const effectiveBank = clientData?.bank || (selectedAfilFromRif?.bank) || 'Venezuela';
      
      setTerminalStatus('checking');
      setTerminalErrorMessage(null);

      const rules: Record<string, { maxAuth: number }> = {
        'Bancaribe': { maxAuth: 0 },
        'Banfanb': { maxAuth: 0 },
        'BDT': { maxAuth: 0 },
        'Banco del Tesoro': { maxAuth: 0 },
        'Banco Exterior': { maxAuth: 0 },
        'BFC': { maxAuth: 0 },
        'Banco del Sur': { maxAuth: 0 },
        'Banplus': { maxAuth: 0 },
        '100% Banco': { maxAuth: 0 },
        'BNC': { maxAuth: 0 },
        'R4': { maxAuth: 0 },
        'Banco Caroní': { maxAuth: 999 },
        'Bancrecer': { maxAuth: 3 },
        'Banco Plaza': { maxAuth: 6 },
        'Banco Activo': { maxAuth: 2 },
        'Banco Agrícola': { maxAuth: 1 },
        'Banco de Venezuela': { maxAuth: 5 },
      };

      const bankRules = rules[effectiveBank] || { maxAuth: 0 };
      const currentTerminals = clientData?.terminalsCount || 0;
      const targetTerminalNumber = currentTerminals + 1;

      setTimeout(() => {
          // Blocking conditions (AS/400 Simulation)
          if (rif.includes('666')) {
              setTerminalStatus('blocked');
              setTerminalErrorMessage('ALERTA DE FRAUDE: Afiliado bajo investigación (AS/400)');
              return;
          }
          if (affiliateNumber === '998877') {
              setTerminalStatus('blocked');
              setTerminalErrorMessage('AFILIADO DESAFILIADO/DESINSTALADO en sistemas centrales');
              return;
          }

          // Rule Evaluation
          if (targetTerminalNumber > bankRules.maxAuth && effectiveBank !== 'Banco Caroní') {
              setTerminalStatus('unauthorized');
              setTerminalErrorMessage(`El banco ${effectiveBank} requiere autorización para el terminal ${targetTerminalNumber}`);
              return;
          }

          // Availability check
          const isTerminalOccupied = rif.includes('OCC');
          if (isTerminalOccupied) {
              setTerminalStatus('blocked');
              setTerminalErrorMessage('TERMINAL OCUPADO: El TID generado ya está asignado a otro comercio');
              return;
          }

          const hasAvailableTerminal = !rif.startsWith('J-EMPTY'); 
          if (hasAvailableTerminal) {
              setTerminalStatus('available');
              setAssignedTID(effectiveBank.substring(0,2).toUpperCase() + Math.floor(Math.random() * 9000 + 1000));
          } else {
              setTerminalStatus('pending');
              setAssignedTID(null);
              setTerminalErrorMessage('No hay terminales libres disponibles para este afiliado (Pendiente Creación)');
          }
      }, 1800);
  };

  const handleScanQR = () => {
      setIsScanning(true);
      setTimeout(() => {
          setRif('J-12345678-9'); 
          setIsScanning(false);
      }, 2000);
  };

  const handleSearchRif = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rif) return;
    setLoading(true);
    setClientData(null);
    setSapStatus(null);
    setManagementType(null);
    setAffiliateError(null);
    setAssociatedAffiliates(null);
    setSelectedAfilFromRif(null);
    setDebtDetails(null);
    setOtpStatus('idle');
    setOtpInputSms(''); setOtpInputEmail('');

    setTimeout(() => {
      // Simulation of AS/400 Multiple Affiliates Search
      let mockAffiliates = [
        { id: 'AFIL-8821', name: 'PANADERIA EL SOL', bank: 'Banco Exterior', mid: '882199320', status: 'Activo', region: 'Metropolitana', mora: false },
        { id: 'AFIL-1120', name: 'SUPERMERCADO CENTRAL', bank: 'Banco de Venezuela', mid: '112099441', status: 'Activo', region: 'Zulia', mora: true },
        { id: 'AFIL-0105', name: 'FARMACIA LAS LLAVES', bank: 'Banco Banesco', mid: '010588229', status: 'Activo', region: 'Occidente', mora: false },
        { id: 'AFIL-EXT-M', name: 'TALLER MECANICO RF', bank: 'Banco Exterior', mid: '882144556', status: 'Activo', region: 'Metropolitana', mora: false }
      ];

      // Rule: User Bank only sees their bank
      if (user?.role === 'Banco' && user.institution) {
          mockAffiliates = mockAffiliates.filter(a => a.bank === user.institution);
      }
      
      // Rule: Region visibility
      if (user?.role === 'Regional' && user.region) {
          mockAffiliates = mockAffiliates.filter(a => a.region === user.region);
      }

      // Filter only Active for the primary list
      const activeAffiliates = mockAffiliates.filter(a => a.status === 'Activo');

      if (rif.endsWith('00')) {
          setAffiliateError('No existe afiliado o no está activo en AS/400 (Filtro Seguridad)');
          setLoading(false);
          return;
      }

      if (activeAffiliates.length === 0) {
          setAffiliateError('No existe afiliado o no está activo');
          setLoading(false);
          return;
      }

      setAssociatedAffiliates(activeAffiliates);
      setLoading(false);
    }, 1500);
  };

  const handleSelectAffiliate = (afil: any) => {
    setSelectedAfilFromRif(afil);
    const hasMora = afil.mora;

    setSapStatus('found');
    setManagementType('portfolio');
    setClientData({
      name: afil.name || "COMERCIAL ASOCIADO RIF",
      seniatStatus: "Contribuyente Ordinario",
      solvency: hasMora ? "Mora Activa (AS/400)" : "Solvente (AS/400)",
      sapCode: "C-" + afil.id,
      bank: afil.bank,
      debt: hasMora,
      source: 'AS/400',
      terminalsCount: Math.floor(Math.random() * 4) // Mock terminals
    });

    if (hasMora) {
        setDebtDetails([
            { bank: afil.bank, product: 'Comisiones Pendientes' },
            { bank: 'Banco Credicard', product: 'Recobro de Chip' }
        ]);
    }

    setContactInfo({
      businessName: { value: afil.name || "COMERCIAL ASOCIADO RIF", source: 'SENIAT' },
      address: { value: "Dirección Fiscal Asociada", source: 'SAP HANA' },
      phone1: { value: "0412-1112233", source: 'AS/400' },
      phone2: { value: "0212-3334455", source: 'AS/400' },
      email: { value: "contacto_rif@comercio.com", source: 'SAP HANA' },
      email2: { value: "auxiliar_rif@comercio.com", source: 'AS/400' },
      social1: { value: "@comercio_rif", source: 'CRM' },
      social2: { value: "#comercio_rif_oficial", source: 'CRM' },
      rif: { value: rif, source: 'SENIAT' }
    });
    setAffiliationMode('existing');
    setIsCertified(false);
  };

  const handleSearchAffiliate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!affiliateNumber) return;
    setLoading(true);
    setClientData(null);
    setSapStatus(null);
    setManagementType(null);
    setAffiliateError(null);
    setDebtDetails(null);
    setOtpStatus('idle');
    setOtpInputSms(''); setOtpInputEmail('');

    setTimeout(() => {
      // Simulation of AS/400 Search
      if (affiliateNumber.endsWith('00')) {
          setAffiliateError('No existe afiliado o no está activo en AS/400');
          setLoading(false);
          return;
      }

      const hasMora = affiliateNumber.endsWith('99');
      
      setSapStatus('found');
      setManagementType('portfolio');
      setClientData({
        name: "CLIENTE AFILIADO " + affiliateNumber,
        seniatStatus: "Contribuyente Ordinario",
        solvency: hasMora ? "Mora Activa (AS/400)" : "Solvente (AS/400)",
        sapCode: "C-AFIL-" + affiliateNumber,
        bank: "Banco Mercantil",
        debt: hasMora,
        source: 'AS/400',
        terminalsCount: 1 // Default mock
      });

      if (hasMora) {
          setDebtDetails([
              { bank: 'Banco Mercantil', product: 'Mantenimiento POS' },
              { bank: 'Banco de Venezuela', product: 'Recobro de Equipos' }
          ]);
      }

      setContactInfo({
        businessName: { value: "AFILIADO " + affiliateNumber, source: 'SENIAT' },
        address: { value: "CALLE PRINCIPAL, EDF. LOS ALPES, LOCAL 1", source: 'SAP HANA' },
        phone1: { value: "0424-7778899", source: 'AS/400' },
        phone2: { value: "0212-4445566", source: 'AS/400' },
        email: { value: "afiliado_" + affiliateNumber + "@servicios.com", source: 'SAP HANA' },
        email2: { value: "soporte_" + affiliateNumber + "@servicios.com", source: 'AS/400' },
        social1: { value: "@red_" + affiliateNumber, source: 'CRM' },
        social2: { value: "@ventas_" + affiliateNumber, source: 'CRM' },
        rif: { value: "J-00" + Math.floor(Math.random() * 9000000) + "-0", source: 'SENIAT' },
        fiscalAddress: { value: "CALLE PRINCIPAL, EDF. LOS ALPES, LOCAL 1", source: 'SAP HANA' }
      });
      setAffiliationMode('existing');
      setIsCertified(false);
      setLoading(false);
    }, 1200);
  };

  const sendOtp = () => {
    setOtpStatus('sending');
    setTimeout(() => {
        setOtpStatus('sent');
        setOtpSentAt(Date.now());
    }, 1500);
  };

  const validateOtp = () => {
      setOtpStatus('validating');
      setTimeout(() => {
          if (otpInputSms === '123456' && otpInputEmail === '654321') { // MOCK: OTP SMS = 123456, OTP Email = 654321
              setOtpStatus('valid');
              setIsOtpVerified(true);
              setTimeout(() => {
                setStep(8); // Equipment Selection
              }, 1000);
          } else {
              setOtpStatus('invalid');
              setOtpError(true);
              setTimeout(() => {
                setOtpError(false);
                setOtpStatus('sent');
              }, 2000);
          }
      }, 1500);
  };

  const handleCreateAffiliation = () => {
      if (!newAffiliationBank) return;
      setCreationStage('notifying');
      setTimeout(() => {
          setCreationStage('smi');
          setTimeout(() => {
              setCreationStage('as400');
              setTimeout(() => {
                  setCreationStage('loading_sale');
                  setTimeout(() => {
                      setCreationStage('success');
                      setNewAffiliationResult('AFIL-NEW-9922');
                      setSelectedAffiliation('AFIL-NEW-9922');
                  }, 1500);
              }, 1500);
          }, 1500);
      }, 1500);
  };

  const simulateScanSerials = () => {
      setPosSerial('POS-001');
      setSimSerial('SIM-001');
  };

  const validateSerials = () => {
      setSerialStatus('validating');
      setTimeout(() => {
          // Simulation of inventory check
          const isValidPOS = posSerial.length > 5 && posSerial.includes('2024'); 
          const isValidSIM = simSerial.length > 5;

          if (isValidPOS && isValidSIM) {
              setSerialStatus('success');
          } else {
              setSerialStatus('error');
          }
      }, 1500);
  };

  const handlePrint = () => {
      setIsPrinting(true);
      setTimeout(() => {
          setIsPrinting(false);
          alert('Impresión enviada a la impresora Bluetooth.');
      }, 2000);
  };

  const resetFlow = () => {
      setStep(1);
      setSelectedChannel(null);
      setIdMethod(null);
      setRif('');
      setAffiliateNumber('');
      setAffiliateError(null);
      setAssociatedAffiliates(null);
      setSelectedAfilFromRif(null);
      setDebtDetails(null);
      setClientData(null);
      setOtpStatus('idle');
      setOtpInputSms(''); setOtpInputEmail('');
      setIsOtpVerified(false);
      setIsSigned(false);
      setSelectedPlan(null);
      setSelectedModality(null);
      setCcoType(null);
      setWarranty(false);
      setSelectedEquipment(null);
      setSelectedOperator(null);
      setInventoryLockStatus('idle');
      setPaymentMethod('Transferencia');
      setPaymentRef('');
      setPaymentCurrency('USD');
      setPaymentAmount('');
      setPosVoucher('');
      setCashConfirmed(false);
      setCardData({number:'', name: '', expiry:'', cvv:'', email: '', idDoc: ''});
      setIsTokenized(false);
      setIsTokenizing(false);
      setSelectedAffiliation(null);
      setNewAffiliationResult(null);
      setCreationStage('idle');
      setTerminalStatus('idle');
      setAssignedTID(null);
      setAdditionalTerminals(0);
      setSerialMode(null);
      setPosSerial('');
      setSimSerial('');
      setSerialStatus('idle');
      setSapSyncStatus('idle');
      setSapDebtorId(null);
      setSapOrderId(null);
      setSapError(null);
      setProgStatus('idle');
      setProgTicketId(null);
      setNotifiedSeller(false);
      setIsOperational(null);
      setFailureReason('');
      setOpsProgStep('selection');
      setOpsEquipment('');
      setOpsSim('');
      setContactInfo({
        businessName: { value: '', source: 'SAP HANA' },
        address: { value: '', source: 'SAP HANA' },
        phone1: { value: '', source: 'AS/400' },
        phone2: { value: '', source: 'AS/400' },
        email: { value: '', source: 'SAP HANA' },
        email2: { value: '', source: 'AS/400' },
        social1: { value: '', source: 'CRM' },
        social2: { value: '', source: 'CRM' },
        rif: { value: '', source: 'SENIAT' }
      });
      setIsCertified(false);
  }

  const renderHeader = () => (
    <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 pt-4 pb-4 px-6 border-b border-slate-100 flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-slate-800">
                {step === 1 ? 'Selección de Canal' : 
                 step === 2 ? 'Método de Inicio' :
                 step === 3 ? 'Búsqueda de Comercio' : 
                 step === 4 ? 'Solvencia Administrativa' :
                 step === 5 ? 'Reglas de Terminal' :
                 step === 6 ? 'Datos del Cliente' :
                 step === 7 ? 'Validación de Identidad' :
                 step === 8 ? 'Selección de Equipo' :
                 step === 9 ? 'Asignación de Seriales' :
                 step === 10 ? 'Modalidad de Venta' :
                 step === 11 ? 'Registro de Pago' :
                 'Gestión Finalizada'}
             </h2>
             {step < totalSteps && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">Paso {step}/{totalSteps-1}</span>}
        </div>
        {step < totalSteps && (
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{width: `${((step)/(totalSteps-1))*100}%`}}
                ></div>
            </div>
        )}
    </div>
  );

  const renderChannelStep = () => (
      <div className="space-y-6 animate-fade-in-up">
          <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg shadow-slate-200">
              <h3 className="font-bold text-lg">Canal de Venta</h3>
              <p className="text-slate-300 text-xs mt-1">Selecciona el origen de la gestión para configurar las reglas de negocio correspondientes.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
              {[{ id: 'Venta Ordinaria', icon: ShoppingCart, desc: 'Gestión de venta estándar' }, { id: 'Jornada', icon: Tent, desc: 'Operativo especial de calle' }].map((channel) => (
                  <button key={channel.id} onClick={() => { setSelectedChannel(channel.id); setStep(2); }} className={`p-5 rounded-[24px] border-2 text-left transition-all relative overflow-hidden active:scale-[0.98] ${selectedChannel === channel.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                      <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedChannel === channel.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`}><channel.icon size={24} /></div>
                          <div><h4 className={`font-bold text-lg ${selectedChannel === channel.id ? 'text-blue-800' : 'text-slate-800'}`}>{channel.id}</h4><p className="text-xs text-slate-500">{channel.desc}</p></div>
                      </div>
                      {selectedChannel === channel.id && (<div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full"><CheckCircle size={16} /></div>)}
                  </button>
              ))}
          </div>
      </div>
  );

  const renderIdMethodStep = () => (
      <div className="space-y-6 animate-fade-in-up">
          <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg shadow-slate-200">
              <h3 className="font-bold text-lg">Método de Inicio</h3>
              <p className="text-slate-300 text-xs mt-1">Selecciona cómo deseas identificar al cliente para iniciar la gestión.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
              <button onClick={() => { setIdMethod('affiliate'); setStep(3); }} className={`p-5 rounded-[24px] border-2 text-left transition-all relative overflow-hidden active:scale-[0.98] ${idMethod === 'affiliate' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                  <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${idMethod === 'affiliate' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`}><Users size={24} /></div>
                      <div><h4 className={`font-bold text-lg ${idMethod === 'affiliate' ? 'text-blue-800' : 'text-slate-800'}`}>Registrar número de afiliado</h4><p className="text-xs text-slate-500">Ingresar código de comercio existente</p></div>
                  </div>
                  {idMethod === 'affiliate' && (<div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full"><CheckCircle size={16} /></div>)}
              </button>
              <button onClick={() => { setIdMethod('rif'); setStep(3); }} className={`p-5 rounded-[24px] border-2 text-left transition-all relative overflow-hidden active:scale-[0.98] ${idMethod === 'rif' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                  <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${idMethod === 'rif' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`}><QrCode size={24} /></div>
                      <div><h4 className={`font-bold text-lg ${idMethod === 'rif' ? 'text-blue-800' : 'text-slate-800'}`}>Registrar número de RIF</h4><p className="text-xs text-slate-500">Identificación por documento fiscal o escaneo</p></div>
                  </div>
                  {idMethod === 'rif' && (<div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full"><CheckCircle size={16} /></div>)}
              </button>
          </div>
      </div>
  );

  const renderIdentificationStep = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-[24px] text-white shadow-lg shadow-slate-200">
        <div className="flex gap-3 items-start">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm text-blue-400">{idMethod === 'rif' ? <Search size={24} /> : <Users size={24} />}</div>
            <div>
              <h3 className="font-bold text-lg">{idMethod === 'rif' ? 'Identificación por RIF' : 'Identificación por Afiliado'}</h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {idMethod === 'rif' 
                  ? 'Ingresa el RIF. El sistema validará SENIAT y SAP HANA para determinar el flujo.' 
                  : 'Ingresa el número de afiliado para recuperar los datos del comercio.'}
              </p>
            </div>
        </div>
      </div>
      
      {idMethod === 'rif' ? (
        <form onSubmit={handleSearchRif} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden">
            {isScanning && (
                <div className="absolute inset-0 bg-slate-900 z-20 flex flex-col items-center justify-center text-white">
                    <div className="w-48 h-48 border-2 border-blue-500 rounded-2xl relative mb-4"><div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div></div>
                    <p className="text-sm font-bold animate-pulse">Escaneando código...</p>
                </div>
            )}
            <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">RIF del Comercio</label><button type="button" onClick={handleScanQR} className="text-blue-600 flex items-center gap-1 text-xs font-bold bg-blue-50 px-2 py-1 rounded-lg active:scale-95 transition-transform"><QrCode size={14} /> Escanear</button></div>
            <div className="flex gap-2"><input type="text" value={rif} onChange={(e) => setRif(e.target.value)} placeholder="J-00000000-0" className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg text-slate-800 placeholder:text-slate-300 uppercase" /><button type="submit" disabled={loading} className="bg-blue-600 text-white w-14 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform" onClick={() => alert('Buscando (mock)')}>{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Search size={20} />}</button></div>
        </form>
      ) : (
        <form onSubmit={handleSearchAffiliate} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Número de Afiliado</label></div>
            <div className="flex gap-2"><input type="text" value={affiliateNumber} onChange={(e) => setAffiliateNumber(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg text-slate-800 placeholder:text-slate-300 uppercase" /><button type="submit" disabled={loading} className="bg-blue-600 text-white w-14 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform" onClick={() => alert('Buscando (mock)')}>{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Search size={20} />}</button></div>
        </form>
      )}

      {affiliateError && (
        <div className="bg-red-50 p-4 rounded-[24px] border border-red-100 animate-fade-in flex items-center gap-3">
            <Ban className="text-red-600 shrink-0" size={24} />
            <div>
                <p className="text-red-800 font-bold text-sm">Error de Validación AS/400</p>
                <p className="text-red-600 text-[11px] font-medium">{affiliateError}</p>
            </div>
        </div>
      )}

      {idMethod === 'rif' && associatedAffiliates && !selectedAfilFromRif && (
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 animate-fade-in space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Afiliados Encontrados en AS/400</h4>
            {associatedAffiliates.map((afil) => (
                <button 
                  key={afil.id} 
                  onClick={() => handleSelectAffiliate(afil)}
                  className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all text-left group"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{afil.bank}</p>
                                <p className="text-[10px] text-slate-500 font-mono">MID: {afil.mid}</p>
                            </div>
                        </div>
                        <CheckCircle size={16} className="text-slate-200 group-hover:text-blue-500" />
                    </div>
                </button>
            ))}
        </div>
      )}

      {clientData && (
        <div className="animate-fade-in space-y-4">
            <div className={`rounded-[24px] p-5 shadow-sm border relative overflow-hidden transition-colors ${clientData.debt ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-3 border-b border-black/5 pb-3"><Database size={18} className={clientData.debt ? "text-red-600" : "text-blue-600"} /><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estatus AS/400 - Consulta de Mora</span></div>
                
                <div className="mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Afiliado consultado</p>
                    <p className="font-bold text-slate-800">{clientData.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{clientData.bank}</p>
                </div>

                {clientData.debt ? (
                    <div className="space-y-3">
                        <div className="bg-red-100 p-3 rounded-xl flex items-start gap-3 border border-red-200">
                            <AlertCircle className="text-red-600 shrink-0" size={20} />
                            <div>
                                <p className="text-red-800 font-bold text-sm">Bloqueo por Mora Activa</p>
                                <p className="text-red-600 text-[11px] font-medium leading-relaxed">El comercio presenta deudas pendientes que impiden continuar con el proceso de venta.</p>
                            </div>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3 border border-red-100">
                             <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Detalle de Deuda</p>
                             {debtDetails?.map((d, i) => (
                                 <div key={i} className="flex justify-between items-center py-1 border-b border-red-50 last:border-0">
                                     <span className="text-[11px] font-bold text-slate-600">{d.bank}</span>
                                     <span className="text-[11px] font-medium text-red-500">{d.product}</span>
                                 </div>
                             ))}
                        </div>
                        <button onClick={resetFlow} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all outline-none">Finalizar Gestión</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-green-100 p-3 rounded-xl flex items-center gap-3 border border-green-200">
                            <CheckCircle className="text-green-600 shrink-0" size={20} />
                            <div>
                                <p className="text-green-800 font-bold text-sm">Validación Exitosa</p>
                                <p className="text-green-600 text-[11px] font-medium uppercase tracking-wider">Cliente Solvente en AS/400</p>
                            </div>
                        </div>
                        <button onClick={() => setStep(4)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">Continuar Validación <ArrowRight size={18} /></button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg">
            <h3 className="font-bold text-lg">Información del Cliente</h3>
            <p className="text-slate-300 text-xs mt-1">Datos recuperados de SENIAT, SAP HANA y AS/400.</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
            {/* RIF (Read Onlyish) */}
            <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">RIF del Comercio</label>
                <div className="flex items-center gap-2">
                    <input type="text" readOnly value={contactInfo.rif.value} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-mono font-bold text-slate-800 text-sm" />
                    <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">{contactInfo.rif.source}</span>
                </div>
            </div>

            {/* Razón Social */}
            <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Razón Social</label>
                <div className="flex items-center gap-2">
                    <input type="text" value={contactInfo.businessName.value} onChange={(e) => setContactInfo({...contactInfo, businessName: { ...contactInfo.businessName, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-800 text-sm" />
                    <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">{contactInfo.businessName.source}</span>
                </div>
            </div>

            {/* Dirección */}
            <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dirección Fiscal</label>
                <div className="flex items-center gap-2">
                    <textarea rows={2} value={contactInfo.address.value} onChange={(e) => setContactInfo({...contactInfo, address: { ...contactInfo.address, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-medium text-slate-800 text-xs leading-relaxed" />
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md uppercase self-start mt-1 whitespace-nowrap">{contactInfo.address.source}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teléfono 1 */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Teléfono Principal</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={contactInfo.phone1.value} onChange={(e) => setContactInfo({...contactInfo, phone1: { ...contactInfo.phone1, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-medium text-slate-800 text-sm" placeholder="04xx-xxxxxxx" />
                        <span className="text-[9px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">AS/400</span>
                    </div>
                </div>

                {/* Teléfono 2 */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Teléfono Secundario</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={contactInfo.phone2.value} onChange={(e) => setContactInfo({...contactInfo, phone2: { ...contactInfo.phone2, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-medium text-slate-800 text-sm" placeholder="02xx-xxxxxxx" />
                        <span className="text-[9px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">AS/400</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Correo 1 */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Correo Electrónico</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={contactInfo.email.value} onChange={(e) => setContactInfo({...contactInfo, email: { ...contactInfo.email, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-medium text-slate-800 text-xs" />
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">SAP</span>
                    </div>
                </div>

                {/* Correo 2 */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Correo Adicional</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={contactInfo.email2.value} onChange={(e) => setContactInfo({...contactInfo, email2: { ...contactInfo.email2, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-medium text-slate-800 text-xs" />
                        <span className="text-[9px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">AS/400</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Social 1 */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Red Social 1</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={contactInfo.social1.value} onChange={(e) => setContactInfo({...contactInfo, social1: { ...contactInfo.social1, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-medium text-slate-800 text-sm" placeholder="@usuario" />
                        <span className="text-[9px] font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">CRM</span>
                    </div>
                </div>

                {/* Social 2 */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Red Social 2</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={contactInfo.social2.value} onChange={(e) => setContactInfo({...contactInfo, social2: { ...contactInfo.social2, value: e.target.value }})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 font-medium text-slate-800 text-sm" placeholder="@canal" />
                        <span className="text-[9px] font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-md uppercase whitespace-nowrap">CRM</span>
                    </div>
                </div>
            </div>
        </div>

        <div onClick={() => setIsCertified(!isCertified)} className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all flex items-center gap-4 ${isCertified ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCertified ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {isCertified ? <Check size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm">Certifico que estos datos están actualizados</p>
                <p className="text-[10px] text-slate-500 font-medium">Esta acción marcará los datos para actualización en SAP HANA.</p>
            </div>
        </div>
    </div>
  );

  const renderStep4 = () => (
      <div className="flex flex-col items-center py-4 animate-fade-in-up">
        {otpStatus === 'idle' ? (
            <div className="w-full bg-white p-8 rounded-[30px] shadow-xl border border-slate-100 text-center animate-fade-in">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <Send size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Validación de Identidad</h3>
                <p className="text-sm text-slate-500 mb-6">Para continuar, enviaremos códigos de seguridad (OTP) al correo y SMS del representante legal.</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Phone size={14} className="text-blue-500 mb-1 mx-auto" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">SMS</p>
                        <p className="text-xs font-bold text-slate-700">{contactInfo.phone1.value || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Mail size={14} className="text-blue-500 mb-1 mx-auto" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Correo</p>
                        <p className="text-[10px] font-bold text-slate-700 truncate">{contactInfo.email.value || 'N/A'}</p>
                    </div>
                </div>
                <button onClick={sendOtp} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all">Enviar Códigos</button>
            </div>
        ) : otpStatus === 'sending' ? (
            <div className="w-full bg-white p-10 rounded-[30px] shadow-xl border border-slate-100 text-center animate-fade-in">
                <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Enviando códigos de seguridad...</h3>
                <p className="text-xs text-slate-500 mt-2">Estamos procesando el envío a SMS y Email simultáneamente.</p>
            </div>
        ) : (
            <div className={`w-full bg-white p-6 rounded-[30px] shadow-xl border relative overflow-hidden mb-6 transition-all ${otpStatus === 'valid' ? 'border-green-500' : 'border-slate-100'}`}>
                <div className="flex flex-col items-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                        otpStatus === 'valid' ? 'bg-green-100 text-green-600' : 
                        otpStatus === 'validating' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                        {otpStatus === 'valid' ? <CheckCircle size={28} /> : 
                         otpStatus === 'validating' ? <Loader2 size={28} className="animate-spin" /> : <Lock size={28} />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                        {otpStatus === 'valid' ? 'Identidad Verificada' : 'Autenticación de Cliente'}
                    </h3>
                    <p className="text-xs text-slate-500 text-center px-4 mt-2 leading-relaxed">
                        {otpStatus === 'valid' ? 'Código correcto. Sincronización exitosa.' : (
                            <>Solicita al cliente los <strong>2 códigos diferentes</strong> de 6 dígitos: uno enviado por <strong>SMS</strong> y otro distinto por <strong>Email</strong>. Esto valida que el teléfono y correo registrados son correctos.<br/><span className="text-[10px] text-amber-600 italic">[MOCK DEV] SMS: 123456 — Email: 654321</span></>
                        )}
                    </p>
                </div>
                
                {otpStatus !== 'valid' && (
                    <>
                        <div className="flex justify-center mb-6 relative">
                            <div className="w-full space-y-4">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 text-center">Código SMS (al teléfono)</label>
                                <input
                                  type="text"
                                  value={otpInputSms}
                                  onChange={(e) => setOtpInputSms(e.target.value.replace(/\D/g,'').slice(0,6))}
                                  placeholder="000000"
                                  disabled={otpStatus === 'validating'}
                                  className={`w-full text-center text-3xl font-mono tracking-[0.3em] py-2 border-b-2 outline-none bg-transparent font-bold transition-colors ${otpError ? 'border-red-500 text-red-500' : 'border-slate-200 focus:border-blue-600 text-slate-800'}`}
                                  maxLength={6}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 text-center">Código Email (al correo)</label>
                                <input
                                  type="text"
                                  value={otpInputEmail}
                                  onChange={(e) => setOtpInputEmail(e.target.value.replace(/\D/g,'').slice(0,6))}
                                  placeholder="000000"
                                  disabled={otpStatus === 'validating'}
                                  className={`w-full text-center text-3xl font-mono tracking-[0.3em] py-2 border-b-2 outline-none bg-transparent font-bold transition-colors ${otpError ? 'border-red-500 text-red-500' : 'border-slate-200 focus:border-blue-600 text-slate-800'}`}
                                  maxLength={6}
                                />
                              </div>
                            </div>
                        </div>

                        {(otpStatus === 'invalid' || otpStatus === 'expired') && (
                            <div className="bg-red-50 p-3 rounded-xl flex items-center gap-2 mb-6 border border-red-100 animate-shake">
                                <AlertCircle size={16} className="text-red-500" />
                                <p className="text-xs font-bold text-red-600">
                                    {otpStatus === 'expired' ? 'El código ha expirado. Solicite uno nuevo.' : 'Código inválido. Intente nuevamente.'}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <button 
                                    onClick={sendOtp} 
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={12} /> Solicitar nuevos códigos
                                </button>
                                <button 
                                    onClick={resetFlow} 
                                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={12} /> Salir del proceso
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
    </div>
  );

  const renderStep5 = () => (
      <div className="flex flex-col items-center py-4 animate-fade-in-up">
        <div className={`w-full p-6 rounded-[30px] shadow-xl border relative overflow-hidden mb-6 ${clientData?.debt ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <div className="flex flex-col items-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${clientData?.debt ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {clientData?.debt ? <FileWarning size={28} /> : <ShieldCheck size={28} />}
                </div>
                <h3 className={`text-xl font-bold ${clientData?.debt ? 'text-red-800' : 'text-green-800'}`}>
                    {clientData?.debt ? (clientData.source === 'AS/400' ? 'Mora en AS/400' : 'Deuda Activa SAP') : 'Cliente Solvente'}
                </h3>
                <p className={`text-xs text-center px-4 mt-2 leading-relaxed font-medium ${clientData?.debt ? 'text-red-600' : 'text-green-700'}`}>
                    {clientData?.debt 
                        ? 'El cliente mantiene compromisos administrativos o recobros pendientes.' 
                        : 'Verificación de solvencia exitosa en sistemas centrales.'}
                </p>
                {clientData?.source && <span className="mt-2 text-[10px] font-bold bg-slate-900/5 px-2 py-0.5 rounded uppercase tracking-wider text-slate-500">Origen: {clientData.source}</span>}
            </div>

            {clientData?.debt && debtDetails && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-red-200 mt-2">
                    <h4 className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-3 opacity-70">Detalle de Mora por Banco y Producto</h4>
                    <div className="space-y-3 mb-6">
                        {debtDetails.map((debt, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-red-100 pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-xs font-bold text-red-900">{debt.bank}</p>
                                    <p className="text-[10px] text-red-600">{debt.product}</p>
                                </div>
                                <AlertTriangle size={14} className="text-red-500" />
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={resetFlow}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <XCircle size={18} /> Terminar Proceso por Mora
                    </button>
                    <p className="text-[9px] text-red-500 text-center mt-2 font-bold uppercase tracking-tighter">No se puede continuar con deudas pendientes</p>
                </div>
            )}
        </div>
      </div>
  );

  const renderStep6 = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h3 className="font-bold text-slate-800 text-lg">Gestión de Afiliación</h3>
            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 animate-fade-in">
                {!newAffiliationResult && creationStage !== 'success' && affiliationMode === 'new' ? (
                        <>
                            <h4 className="font-bold text-slate-800 mb-4">Solicitar Nuevo Afiliado</h4>
                            <div className="space-y-4">
                                {creationStage === 'idle' ? (
                                    <>
                                        <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Banco</label><select value={newAffiliationBank} onChange={(e) => setNewAffiliationBank(e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-medium text-slate-800 outline-none border border-slate-200"><option value="">Seleccione Banco...</option><option value="Banco Exterior">Banco Exterior</option><option value="Banco Plaza">Banco Plaza</option></select></div>
                                        <button onClick={handleCreateAffiliation} disabled={!newAffiliationBank} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Iniciar Solicitud</button>
                                    </>
                                ) : (
                                    <div className="py-6 space-y-6">{['notifying','smi','as400','loading_sale'].map((st, i) => (<div key={st} className={`flex items-center gap-3 transition-opacity duration-500 ${['idle', ...['notifying','smi','as400'].slice(0,i)].includes(creationStage) ? 'opacity-30' : 'opacity-100'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center ${creationStage === st ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>{creationStage === st ? <RefreshCw size={16} className="animate-spin"/> : <Check size={16}/>}</div><span className="text-xs font-bold text-slate-500">Procesando {st}...</span></div>))}</div>
                                )}
                            </div>
                        </>
                    ) : (
                         newAffiliationResult ? (
                            <div className="text-center py-6 animate-fade-in-up"><h3 className="font-bold text-slate-800">Afiliado Creado</h3><div className="bg-slate-50 py-3 rounded-xl border border-slate-200 font-mono font-bold text-slate-700 text-lg mb-4 mt-2">{newAffiliationResult}</div></div>
                         ) : (
                             <div className="space-y-4">
                                <button onClick={() => setAffiliationMode('new')} className="w-full py-3 mb-2 bg-slate-100 text-blue-600 font-bold rounded-xl border border-blue-100 flex items-center justify-center gap-2 hover:bg-blue-50">Solicitar Nueva Afiliación</button>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Afiliaciones Existentes</h4>
                                {[
                                    { id: 'AFIL-EXT-8821', bank: 'Banco Exterior', mid: '882199320', status: 'Activo' },
                                    { id: 'AFIL-VNZ-1120', bank: 'Banco de Venezuela', mid: '112099441', status: 'Activo' }
                                ].map((afil) => (
                                    <div key={afil.id} onClick={() => setSelectedAffiliation(afil.id)} className={`p-4 rounded-[20px] border-2 transition-all cursor-pointer ${selectedAffiliation === afil.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}><div className="flex justify-between items-start mb-1"><h4 className="font-bold text-slate-800">{afil.bank}</h4><span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{afil.status}</span></div><p className="text-xs text-slate-500 font-mono">MID: {afil.mid}</p></div>
                                ))}
                            </div>
                         )
                    )}
            </div>
        </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6 animate-fade-in-up">
       <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Validación AS/400</h3>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Reglas de Terminal</span>
       </div>
       <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
           {terminalStatus === 'checking' && (
               <div className="flex flex-col items-center justify-center py-10">
                   <Loader2 size={32} className="text-blue-600 animate-spin mb-3" />
                   <p className="font-bold text-slate-600 text-sm">Validando reglas de negocio...</p>
                   <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Banco: {clientData?.bank}</p>
               </div>
           )}
           {(terminalStatus === 'blocked' || terminalStatus === 'unauthorized') && (
               <div className="text-center animate-fade-in">
                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                       <Ban size={32} />
                   </div>
                   <h3 className="font-bold text-red-800 text-lg mb-2">Venta Bloqueada</h3>
                   <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                        <p className="text-xs text-red-700 font-bold leading-relaxed">{terminalErrorMessage}</p>
                   </div>
                   <button onClick={resetFlow} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Regresar al Inicio</button>
               </div>
           )}
           {terminalStatus === 'pending' && (
                <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-4"><AlertTriangle size={32} /></div>
                    <h3 className="font-bold text-yellow-800 text-lg mb-2">Pendiente por Creación de Terminal</h3>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
                         <p className="text-xs text-yellow-700 font-bold leading-relaxed">{terminalErrorMessage}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-6">El flujo se encuentra bloqueado hasta que el banco genere los terminales correspondientes.</p>
                    <button onClick={resetFlow} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Finalizar por ahora</button>
                </div>
            )}
           {terminalStatus === 'available' && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4"><CheckCircle size={32} /></div>
                    <h3 className="font-bold text-green-800 text-lg mb-2">Terminal Asignado</h3>
                    <div className="bg-green-50 px-6 py-3 rounded-2xl inline-block mb-4 border border-green-100 shadow-sm">
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">TID AS/400</p>
                        <p className="text-xl text-green-800 font-mono font-black">{assignedTID}</p>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">Validación de reglas exitosa para {clientData?.bank}. El terminal ha sido cargado automáticamente.</p>
                    <button onClick={() => setStep(6)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2">Completar Datos del Cliente <ArrowRight size={18} /></button>
                </div>
           )}
       </div>
    </div>
  );

  const handleSelectEquipment = (id: string) => {
    setSelectedEquipment(id);
    setInventoryLockStatus('locking');
    // Simulate AS/400 block
    setTimeout(() => {
        setInventoryLockStatus('locked');
    }, 1200);
  };

  const handleSelectOperator = (op: string) => {
    setSelectedOperator(op);
    setInventoryLockStatus('locking');
    // Simulate SIM block
    setTimeout(() => {
        setInventoryLockStatus('locked');
    }, 1000);
  };

  const renderStep8 = () => {
    const filteredInventory = equipments
        .filter(eq => {
            if (user?.role === 'Banco') return eq.assignedTo === user.institution || eq.assignedTo === 'General';
            if (user?.role === 'Regional') return eq.region === user.region || eq.assignedTo === 'General';
            return true;
        })
        .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    return (
     <div className="space-y-6 animate-fade-in-up">
         <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Selección de Equipo</h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100 italic">
                <Box size={10} /> PEPS / FIFO
            </div>
         </div>

         <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-200/60 font-mono text-[10px]">
            <div className="flex items-center gap-2">
                <Box size={14} className="text-slate-400" />
                <span className="text-slate-500">ALMACÉN:</span>
                <span className="text-slate-800 font-bold">{user?.institution || user?.region || 'CENTRAL'}</span>
            </div>
            <div className="text-slate-400">|</div>
            <div className="flex items-center gap-2">
                <span className="text-slate-500">STOCK DISP:</span>
                <span className="text-blue-600 font-bold text-xs">{filteredInventory.reduce((acc, curr) => acc + curr.stock, 0)}</span>
            </div>
         </div>

         <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
             <div>
                 <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase text-slate-400 tracking-wider">Catálogo Disponible</h3>
                 <div className="grid grid-cols-1 gap-3">
                     {filteredInventory.map(eq => (
                         <div key={eq.id} onClick={() => handleSelectEquipment(eq.id)} className={`p-4 rounded-[20px] border-2 transition-all flex items-center justify-between cursor-pointer group ${selectedEquipment === eq.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                             <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl ${eq.image} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}><Smartphone size={24}/></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{eq.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">{eq.type}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">Ingreso: {eq.entryDate}</span>
                                    </div>
                                </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Disp.</p>
                                 <p className="text-sm font-bold text-slate-700">{eq.stock}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             {selectedEquipment && (
                 <div className="animate-fade-in">
                     <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase text-slate-400 tracking-wider">Operadora (Sim Card)</h3>
                     <div className="flex gap-3">
                         {['Movistar', 'Digitel'].map(op => (
                             <button key={op} onClick={() => handleSelectOperator(op)} className={`flex-1 py-4 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-2 ${selectedOperator === op ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOperator === op ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                     <Signal size={16} />
                                 </div>
                                 {op}
                             </button>
                         ))}
                     </div>
                 </div>
             )}
             {inventoryLockStatus !== 'idle' && (
                 <div className={`mt-4 p-4 rounded-2xl flex items-center gap-4 transition-all animate-fade-in ${inventoryLockStatus === 'locked' ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${inventoryLockStatus === 'locked' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {inventoryLockStatus === 'locking' ? <Loader2 size={20} className="animate-spin"/> : <Lock size={20} />}
                     </div>
                     <div>
                        <span className="text-xs font-black uppercase tracking-widest block mb-0.5">{inventoryLockStatus === 'locking' ? 'Sincronizando AS/400...' : 'Estado: Reservado'}</span>
                        <span className="text-[11px] font-medium leading-none">{inventoryLockStatus === 'locking' ? 'Buscando seriales disponibles en inventario...' : 'Equipo y SIM Card bloqueados temporalmente para esta venta.'}</span>
                     </div>
                 </div>
             )}
         </div>
     </div>
    );
  };

  const renderStep9 = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg">
          <h3 className="font-bold text-lg">Asignación de Dispositivo</h3>
          <p className="text-slate-300 text-xs mt-1">Selecciona si realizarás el despacho inmediato o post-asignación.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setSerialMode('register')} 
            className={`p-5 rounded-[24px] border-2 text-left transition-all relative overflow-hidden active:scale-[0.98] ${serialMode === 'register' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-white hover:border-blue-200'}`}
          >
              <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${serialMode === 'register' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`}><QrCode size={24} /></div>
                  <div>
                      <h4 className={`font-bold text-lg ${serialMode === 'register' ? 'text-blue-800' : 'text-slate-800'}`}>Registro de Seriales</h4>
                      <p className="text-xs text-slate-500">Escaneo de equipo y SIM para entrega inmediata</p>
                  </div>
              </div>
              {serialMode === 'register' && <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full"><Check size={16} /></div>}
          </button>

          <button 
            onClick={() => { setSerialMode('skip'); setSerialStatus('idle'); }} 
            className={`p-5 rounded-[24px] border-2 text-left transition-all relative overflow-hidden active:scale-[0.98] ${serialMode === 'skip' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-100 bg-white hover:border-orange-100'}`}
          >
              <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${serialMode === 'skip' ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-500'}`}><ArrowRight size={24} /></div>
                  <div>
                      <h4 className={`font-bold text-lg ${serialMode === 'skip' ? 'text-orange-800' : 'text-slate-800'}`}>Sin Registro</h4>
                      <p className="text-xs text-slate-500">Asignación posterior por Almacén / Operaciones</p>
                  </div>
              </div>
              {serialMode === 'skip' && <div className="absolute top-4 right-4 bg-orange-500 text-white p-1 rounded-full"><Check size={16} /></div>}
          </button>
      </div>

      {serialMode === 'register' && (
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 animate-fade-in space-y-5">
              <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-widest">Validación de Inventario</h4>
                  <button onClick={simulateScanSerials} className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1 active:scale-95 transition-transform"><ScanLine size={12}/> Simular Escáner</button>
              </div>
              
              <div className="space-y-4">
                  <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Serial del Equipo (S/N)</label>
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            disabled={serialStatus === 'success'}
                            value={posSerial} 
                            onChange={(e) => setPosSerial(e.target.value.toUpperCase())} 
                            className={`flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 transition-all ${serialStatus === 'success' ? 'opacity-60' : 'focus:ring-2 focus:ring-blue-500'}`} 
                            placeholder="Ej: N910-2024-XXXX" 
                          />
                          {serialStatus === 'success' && <div className="bg-green-100 text-green-600 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 animate-fade-in"><Check size={20}/></div>}
                      </div>
                  </div>

                  <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Serial SIM Card (ICCID)</label>
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            disabled={serialStatus === 'success'}
                            value={simSerial} 
                            onChange={(e) => setSimSerial(e.target.value.toUpperCase())} 
                            className={`flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 transition-all ${serialStatus === 'success' ? 'opacity-60' : 'focus:ring-2 focus:ring-blue-500'}`} 
                            placeholder="Ej: 8958XXXXXXXXXX" 
                          />
                          {serialStatus === 'success' && <div className="bg-green-100 text-green-600 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 animate-fade-in"><Check size={20}/></div>}
                      </div>
                  </div>
              </div>

              {serialStatus === 'idle' && (
                  <button 
                    onClick={validateSerials} 
                    disabled={!posSerial || !simSerial} 
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                      Validar Pertenencia en Almacén
                  </button>
              )}

              {serialStatus === 'validating' && (
                  <div className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-3">
                      <Loader2 className="animate-spin" size={20}/>
                      Consultando Inventario AS/400...
                  </div>
              )}

              {serialStatus === 'error' && (
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3 animate-shake">
                      <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                          <p className="text-xs font-bold text-red-800">Serial no encontrado o no asignado</p>
                          <p className="text-[10px] text-red-600 mt-0.5 font-medium leading-relaxed">El equipo o SIM especificados no han sido cargados a su inventario regional o de aliado comercial.</p>
                      </div>
                  </div>
              )}

              {serialStatus === 'success' && (
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3 animate-scale-in">
                      <CheckCircle size={24} className="text-green-600 shrink-0" />
                      <div>
                          <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Reserva Exitosa</p>
                          <p className="text-[10px] text-green-600 font-medium">Seriales bloqueados para esta gestión. Se liberarán si la venta es cancelada.</p>
                      </div>
                  </div>
              )}
          </div>
      )}

      {serialMode === 'skip' && (
          <div className="bg-orange-50 p-5 rounded-[24px] border border-orange-200 animate-fade-in">
              <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                    <Truck size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-orange-800 text-sm uppercase tracking-widest">Modalidad de Pre-Venta</h4>
                      <p className="text-xs text-orange-700 mt-1 leading-relaxed font-medium">
                          Usted está tramitando una <span className="font-black text-orange-900">Venta sin Equipo Físico</span>. El proceso de programación y entrega será gestionado posteriormente por el equipo de Operaciones de Eureka.
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );

  const handleModalitySelect = (modId: string) => {
    setSelectedModality(modId);
    const mod = modalitiesOptions.find(m => m.id === modId);
    if (mod) {
        setSelectedPlan(mod.defaultPlanId);
    }
  };

  const renderStep10 = () => {
    const selectedModalityData = modalitiesOptions.find(m => m.id === selectedModality);
    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg">
                <h3 className="font-bold text-lg">Modalidad de Adquisición</h3>
                <p className="text-slate-300 text-xs mt-1">Selecciona la forma en que el cliente adquirirá el equipo.</p>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Opciones de Modalidad</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {modalitiesOptions.map(mod => (
                            <button 
                                key={mod.id} 
                                onClick={() => handleModalitySelect(mod.id)} 
                                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${selectedModality === mod.id ? 'border-blue-600 bg-blue-50' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                            >
                                <div>
                                    <h5 className={`font-bold text-sm ${selectedModality === mod.id ? 'text-blue-700' : 'text-slate-700'}`}>{mod.name}</h5>
                                    <p className="text-[10px] text-slate-500">{mod.description}</p>
                                </div>
                                {selectedModality === mod.id && <CheckCircle size={16} className="text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedModality && (
                    <div className="animate-fade-in pt-4 border-t border-slate-50">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan Asignado (Referencial AS/400)</h4>
                            <span className="text-[9px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase">Válido</span>
                        </div>
                        
                        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><Calculator size={64} /></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Plan {selectedPlanData?.name}</span>
                                        <h4 className="text-xl font-black">{selectedModality === 'Comodato' ? 'Uso Bajo Contrato' : 'Venta de Equipo'}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Monto Base</p>
                                        <p className="text-2xl font-black text-white">{selectedModality === 'Comodato' ? '0.00$' : selectedPlanData?.price}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Fee de Mantenimiento</p>
                                        <p className="font-bold text-sm">{selectedPlanData?.fee} <span className="text-[10px] font-normal text-slate-400">/ trans</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">CCO</p>
                                        <select 
                                            value={ccoType} 
                                            onChange={(e) => setCcoType(e.target.value)}
                                            className="bg-white/10 border-none rounded-lg px-2 py-1 text-xs font-bold text-white w-full outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="" className="text-slate-800">Seleccionar</option>
                                            <option value="Al Banco" className="text-slate-800">Al Banco</option>
                                            <option value="Al Cliente" className="text-slate-800">Al Cliente</option>
                                            <option value="Exonerada" className="text-slate-800">Exonerada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-700 leading-tight">
                                Este plan ha sido asignado automáticamente según la modalidad y el tipo de equipo seleccionado. Los montos están sincronizados con la maestra de AS/400.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const handleTokenize = () => {
    setIsTokenizing(true);
    setTimeout(() => {
        setIsTokenizing(false);
        setIsTokenized(true);
        setPaymentRef('TOK-' + Math.random().toString(36).substring(7).toUpperCase());
    }, 2000);
  };

  const renderStep11 = () => {
    const totalAmount = selectedPlan ? plans.find(p => p.id === selectedPlan)?.price : '$0.00';
    const isCCR = user?.role === 'CCR';

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg">
                <h3 className="font-bold text-lg">Cierre Administrativo y Pago</h3>
                <p className="text-slate-300 text-xs mt-1">Selecciona la forma de pago y registra la referencia de conciliación.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {['Transferencia', 'Punto de Venta', 'Efectivo', 'Botón de Pago'].map((method) => {
                    const isDisabled = method === 'Efectivo' && !isCCR;
                    return (
                        <button 
                            key={method} 
                            disabled={isDisabled}
                            onClick={() => { 
                                setPaymentMethod(method); 
                                setPaymentRef(''); 
                                setPosVoucher(''); 
                                setCashConfirmed(false); 
                                setCardData({number:'', name:'', expiry:'', cvv:'', email: '', idDoc: ''}); 
                                setIsTokenized(false);
                            }} 
                            className={`p-4 rounded-[24px] border-2 flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${paymentMethod === method ? 'border-blue-600 bg-blue-50 text-blue-800' : isDisabled ? 'opacity-40 grayscale cursor-not-allowed border-slate-100 bg-slate-50' : 'border-slate-100 bg-white text-slate-500 hover:border-blue-100'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === method ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                {method === 'Transferencia' && <Landmark size={18}/>}
                                {method === 'Punto de Venta' && <CreditCard size={18}/>}
                                {method === 'Efectivo' && <Banknote size={18}/>}
                                {method === 'Botón de Pago' && <Globe size={18}/>}
                            </div>
                            <span className="text-[11px] font-bold text-center leading-tight">{method}</span>
                            {method === 'Efectivo' && (
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${isCCR ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {isCCR ? 'Hab. CCR' : 'Solo Tienda'}
                                </span>
                            )}
                            {paymentMethod === method && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,1)]"></div>}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-6">
                <div className="flex justify-between items-end pb-4 border-b border-slate-50">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monto a Conciliar</p>
                        <h2 className="text-3xl font-black text-slate-900">{totalAmount}</h2>
                    </div>
                    {paymentMethod === 'Transferencia' && (
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['USD', 'VES'].map(curr => (
                                <button key={curr} onClick={() => setPaymentCurrency(curr)} className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${paymentCurrency === curr ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>{curr}</button>
                            ))}
                        </div>
                    )}
                </div>

                {paymentMethod === 'Transferencia' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <p className="text-[10px] text-blue-600 font-bold uppercase mb-2">Cuentas Corrientes Eureka</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold">BE</div><p className="font-mono text-[11px] font-bold text-slate-700">0105-0010-...-2299</p></div><button className="text-[9px] font-bold text-blue-600" onClick={() => alert('Copiar')}>Copiar</button></div>
                                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-[8px] font-bold">BP</div><p className="font-mono text-[11px] font-bold text-slate-700">0120-0010-...-4410</p></div><button className="text-[9px] font-bold text-blue-600" onClick={() => alert('Copiar')}>Copiar</button></div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Número de Referencia (Obligatorio)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={paymentRef} 
                                        onChange={(e) => setPaymentRef(e.target.value.replace(/\D/g,''))} 
                                        placeholder="Ej: 12345678" 
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                                    />
                                    {paymentRef.length >= 6 && <div className="absolute right-3 top-3.5 text-green-600 flex items-center gap-1 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full animate-fade-in"><Check size={10}/> Válido</div>}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Monto Aplicado</label>
                                <input type="text" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={totalAmount} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Moneda</label>
                                <div className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm">{paymentCurrency}</div>
                            </div>
                        </div>
                    </div>
                )}

                {paymentMethod === 'Punto de Venta' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-6 bg-slate-50 rounded-[20px] border border-slate-200 text-center">
                            <Smartphone className="mx-auto text-blue-600 mb-2" size={32} />
                            <p className="text-sm font-bold text-slate-700">Procesamiento en Terminal</p>
                            <p className="text-[10px] text-slate-500 mt-1 mb-4">Inicie la transacción en el POS físico</p>
                            <button className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2 mx-auto" onClick={() => alert('Acción de botón en SalesWizard')}>
                                <RefreshCw size={14} /> Sincronizar con POS
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Número de Referencia (Voucher)</label>
                            <input 
                                type="text" 
                                value={paymentRef} 
                                onChange={(e) => setPaymentRef(e.target.value.replace(/\D/g,''))} 
                                placeholder="Referencia de 6-8 dígitos" 
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                            
                            <button onClick={() => setPosVoucher(prev => prev ? '' : 'VOUCHER-OK')} className={`w-full py-4 border-2 border-dashed rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${posVoucher ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                                {posVoucher ? <><Check size={18}/> Soporte Visual Capturado</> : <><ScanLine size={18}/> Capturar Recibo / Voucher</>}
                            </button>
                        </div>
                    </div>
                )}

                {paymentMethod === 'Efectivo' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                                <Tent size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-800 text-xs uppercase tracking-widest">Control de Caja - Tienda CCR</h4>
                                <p className="text-[10px] text-orange-700 mt-1 leading-relaxed font-medium">
                                    Al procesar en efectivo, usted declara haber recibido el monto exacto: <span className="font-black">{totalAmount}</span> y haberlo ingresado a la caja física.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nro de Recibo / Control Interno</label>
                            <input 
                                type="text" 
                                value={paymentRef} 
                                onChange={(e) => setPaymentRef(e.target.value)} 
                                placeholder="REC-XXXXXX" 
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>

                        <button 
                            onClick={() => setCashConfirmed(!cashConfirmed)} 
                            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all ${cashConfirmed ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {cashConfirmed ? <><CheckCircle size={20}/> Efectivo en Custodia</> : 'Confirmar Ingreso a Caja'}
                        </button>
                    </div>
                )}

                {paymentMethod === 'Botón de Pago' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-50">
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Email del Pagador</label>
                                <input type="email" value={cardData.email} onChange={(e) => setCardData({...cardData, email: e.target.value})} placeholder="ejemplo@correo.com" className="w-full bg-slate-50 rounded-xl px-4 py-2.5 font-medium text-slate-800 text-xs" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">ID / Pasaporte</label>
                                <input type="text" value={cardData.idDoc} onChange={(e) => setCardData({...cardData, idDoc: e.target.value})} placeholder="V-12345678" className="w-full bg-slate-50 rounded-xl px-4 py-2.5 font-bold text-slate-800 text-xs" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nombre en Tarjeta</label>
                                <input type="text" value={cardData.name} onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})} placeholder="TITULAR" className="w-full bg-slate-50 rounded-xl px-4 py-2.5 font-bold text-slate-800 text-xs uppercase" />
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border-2 transition-all ${isTokenized ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                            {isTokenized ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-green-700">
                                        <Lock size={18} />
                                        <h4 className="font-bold text-sm">Pago Tokenizado Exitosamente</h4>
                                    </div>
                                    <p className="text-[10px] text-green-600 font-medium">La transacción ha sido aprobada por la pasarela segura. Referencia generada.</p>
                                    <div className="bg-white p-3 rounded-xl border border-green-100 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400">REFERENCIA</span>
                                        <span className="text-xs font-mono font-black text-slate-800">{paymentRef}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard size={16} className="text-blue-600" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información de Tarjeta (Seguro)</span>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            disabled={isTokenizing}
                                            value={cardData.number} 
                                            onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\D/g,'').slice(0,16)})} 
                                            placeholder="4444 **** **** 1111" 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-800" 
                                        />
                                        <div className="absolute right-3 top-3 flex gap-1 opacity-40 grayscale"><CreditCard size={16}/><Landmark size={16}/></div>
                                    </div>
                                    <div className="flex gap-4">
                                        <input disabled={isTokenizing} type="text" value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value})} placeholder="MM/YY" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-mono text-center text-sm" />
                                        <input disabled={isTokenizing} type="password" value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value.slice(0,3)})} placeholder="***" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-mono text-center text-sm" />
                                    </div>
                                    <button 
                                        disabled={!cardData.number || !cardData.name || isTokenizing}
                                        onClick={handleTokenize}
                                        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                                    >
                                        {isTokenizing ? <><Loader2 size={18} className="animate-spin"/> Tokenizando...</> : <><ShieldCheck size={18}/> Pagar con Seguridad</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-tight">
                    Una vez validado el pago y registrada la referencia, el sistema procederá a la generación automática de la factura en SAP HANA y la actualización del inventario en AS/400.
                </p>
            </div>
        </div>
    );
  };

  const renderStep12 = () => (
      <div className="space-y-6 animate-fade-in-up">
          <h3 className="font-bold text-slate-800 text-lg">Creación del Pedido y Deudor</h3>
          <div className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-100 flex flex-col items-center text-center min-h-[300px] justify-center">
              
              {sapSyncStatus === 'error' ? (
                  <div className="space-y-6">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
                          <XCircle size={40} />
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-slate-800">Error de Conexión SAP</h3>
                          <p className="text-slate-500 text-sm mt-2">{sapError || 'No se pudo establecer comunicación con el servidor de SAP HANA.'}</p>
                      </div>
                      <button onClick={() => setSapSyncStatus('idle')} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Reintentar Sincronización</button>
                  </div>
              ) : sapSyncStatus !== 'success' ? (
                  <div className="space-y-6">
                      <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                          <Database className="absolute inset-0 m-auto text-blue-600" size={32} />
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-slate-800">Conectando SAP HANA...</h3>
                          <p className="text-slate-500 text-sm font-medium mt-2">
                              {sapSyncStatus === 'creating_debtor' ? 'Generando Maestro de Clientes' : 'Creando Pedido de Venta'}
                          </p>
                      </div>
                  </div>
              ) : (
                  // Success State
                  <div className="space-y-6 animate-fade-in w-full">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto shadow-sm">
                          <CheckCircle size={40} />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-slate-800">Sincronización Exitosa</h3>
                          <p className="text-slate-500 text-sm mt-2 px-4 mb-4">
                              El Deudor y el Pedido han sido creados correctamente en el sistema central.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 w-full max-w-sm mx-auto">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left flex justify-between items-center group hover:border-blue-200 transition-colors">
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Deudor SAP</p>
                                  <p className="text-sm font-mono font-black text-slate-800">{sapDebtorId}</p>
                              </div>
                              <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm"><Database size={16}/></div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left flex justify-between items-center group hover:border-blue-200 transition-colors">
                              <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Pedido SAP</p>
                                  <p className="text-sm font-mono font-black text-slate-800">{sapOrderId}</p>
                              </div>
                              <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm"><ShoppingCart size={16}/></div>
                          </div>
                      </div>

                      {selectedModality === 'Comodato' && (
                          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-left mt-2 max-w-sm mx-auto flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0">
                                  <Box size={20} />
                              </div>
                              <div>
                                  <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Movimiento de Almacén</p>
                                  <p className="text-[11px] text-indigo-600 font-medium">Equipo trasladado contablemente al Almacén de Comodato (Inventario SAP HANA + Odoo).</p>
                              </div>
                          </div>
                      )}
                      
                      {serialMode === 'skip' ? (
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-left mt-4 max-w-sm mx-auto">
                              <div className="flex items-start gap-3">
                                  <Info className="text-orange-600 shrink-0" size={20}/>
                                  <div>
                                      <p className="text-sm font-bold text-orange-800">Pre-Venta Finalizada</p>
                                      <p className="text-xs text-orange-700 mt-1">La gestión se ha guardado. No se requiere programación de equipo.</p>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-blue-50 p-3 rounded-xl text-blue-700 text-xs font-bold animate-pulse max-w-xs mx-auto">
                              Redirigiendo a Programación...
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
  );

  const renderStep13 = () => {
    const isShortPath = serialMode === 'register';
    const failureCauses = ["Falla de Comunicación TMS", "SIM sin señal", "Batería no carga", "Parámetros inválidos", "Error en Maestra AS/400"];

    const handleOpsAction = (nextStep: typeof opsProgStep) => {
        setProgStatus('configuring');
        setTimeout(() => {
            setProgStatus('pending_ops');
            setOpsProgStep(nextStep);
            if (nextStep === 'execution') {
                setTimeout(() => handleOpsAction('test'), 3000);
            }
        }, 1500);
    };

    const handleFinalClosure = (operational: boolean) => {
        setIsOperational(operational);
        if (operational) {
            setProgStatus('configuring');
            setTimeout(() => {
                setProgStatus('success');
                setNotifiedSeller(true);
            }, 2500);
        } else {
            setProgStatus('failure');
        }
    };

    return (
      <div className="space-y-6 animate-fade-in-up">
          <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Programación AS/400</h3>
                <p className="text-slate-300 text-[10px] mt-1">
                    {isShortPath ? 'Ruta Express: Despacho Inmediato' : 'Ruta Operaciones: Asignación y Prueba'}
                </p>
              </div>
              <div className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">IBM Power Systems</span>
              </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-100">
              {/* Common Header for pending states */}
              {(progStatus !== 'success' && progStatus !== 'failure') && (
                <div className="flex flex-col items-center text-center space-y-6 pb-6 border-b border-slate-50 mb-6">
                    <div className="w-24 h-24 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0 bg-blue-600/10 z-0"></div>
                        <Cpu className={`text-blue-500 relative z-20 ${progStatus === 'configuring' ? 'animate-pulse' : ''}`} size={40} />
                        <div className="absolute inset-0 opacity-10 font-mono text-[6px] text-green-500 p-2 overflow-hidden pointer-events-none">
                            <div>{">"} CALL PGM(PROG_TID)</div>
                            <div>{">"} SET PARAM({assignedTID})</div>
                            <div>{">"} LOADING KEYS...</div>
                            <div>{">"} SYNC ODOO...</div>
                            <div>{">"} SYNC SAP...</div>
                        </div>
                    </div>
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                {progStatus === 'creating_ticket' && 'Generando Ticket...'}
                                {progStatus === 'pending_ops' && (isShortPath ? 'Pendiente por Operaciones' : 'Panel de Operaciones')}
                                {progStatus === 'configuring' && 'Procesando en TMS...'}
                            </h3>
                            {progTicketId && <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{progTicketId}</span>}
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full bg-blue-600 transition-all duration-1000 ${progStatus === 'creating_ticket' ? 'w-1/4' : progStatus === 'pending_ops' ? 'w-1/2' : 'w-3/4'}`}></div>
                        </div>
                    </div>
                </div>
              )}

              {/* ROUTE 1: REGISTERED SERIAL (SELLER) */}
              {isShortPath && progStatus !== 'success' && (
                <div className="animate-fade-in text-center space-y-6">
                   {progStatus === 'pending_ops' ? (
                       <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4 animate-pulse">
                            <BellRing className="text-amber-500 shrink-0" size={24} />
                            <div className="text-left">
                                <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Esperando Confirmación de TMS</p>
                                <p className="text-[11px] text-amber-700 font-medium leading-relaxed mt-1">
                                    Ticket <span className="font-bold">{progTicketId}</span> enviado a operaciones. 
                                    El técnico está cargando los parámetros en el sistema central para el terminal {assignedTID}.
                                </p>
                            </div>
                       </div>
                   ) : (
                       <div className="py-10">
                           <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                           <p className="text-slate-500 text-xs mt-4">Actualizando registro de parámetros...</p>
                       </div>
                   )}
                </div>
              )}

              {/* ROUTE 2: NO SERIAL (OPERATIONS DASHBOARD) */}
              {!isShortPath && progStatus !== 'success' && progStatus !== 'failure' && (
                <div className="animate-fade-in space-y-6">
                    {/* Stepper for Operations */}
                    <div className="flex justify-between px-2">
                        {['selection', 'execution', 'test', 'closure'].map((s, idx) => (
                            <div key={s} className="flex flex-col items-center gap-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${opsProgStep === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-[8px] font-bold uppercase ${opsProgStep === s ? 'text-blue-600' : 'text-slate-400'}`}>{s}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {opsProgStep === 'selection' && (
                            <div className="space-y-4 animate-fade-in">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Selección de Lote</h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Equipo Disponible</label>
                                        <select 
                                            value={opsEquipment}
                                            onChange={(e) => setOpsEquipment(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                                        >
                                            <option value="">Seleccionar S/N...</option>
                                            <option value="SN-2024-001">SN-2024-001 (Newland N910)</option>
                                            <option value="SN-2024-002">SN-2024-002 (PAX S920)</option>
                                            <option value="SN-2024-003">SN-2024-003 (Nexgo N5)</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">SIM Card Asignada</label>
                                        <select 
                                            value={opsSim}
                                            onChange={(e) => setOpsSim(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                                        >
                                            <option value="">Seleccionar ICCID...</option>
                                            <option value="ICC-8958-01">Digitel M2M (8958-01)</option>
                                            <option value="ICC-8958-02">Movistar M2M (8958-02)</option>
                                        </select>
                                    </div>
                                    <button 
                                        disabled={!opsEquipment || !opsSim}
                                        onClick={() => handleOpsAction('execution')}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg disabled:opacity-50"
                                    >
                                        Iniciar Carga de Parámetros
                                    </button>
                                </div>
                            </div>
                        )}

                        {opsProgStep === 'execution' && (
                            <div className="py-8 text-center animate-fade-in space-y-4">
                                <div className="relative w-16 h-16 mx-auto">
                                    <div className="absolute inset-0 border-2 border-blue-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <Database className="absolute inset-0 m-auto text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Sincronizando con AS/400 TMS</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Cargando perfil del comercio {assignedTID}...</p>
                                </div>
                            </div>
                        )}

                        {opsProgStep === 'test' && (
                            <div className="animate-fade-in space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Prueba de Transaccionalidad</h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="text-slate-400" size={20} />
                                        <p className="text-xs font-bold text-slate-700">{opsEquipment}</p>
                                    </div>
                                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">En Línea</span>
                                </div>
                                <button 
                                    onClick={() => handleOpsAction('closure')}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={14} /> Ejecutar Transacción de Prueba
                                </button>
                                <p className="text-[9px] text-slate-400 text-center italic">Esto verificará la conexión 4G, los bines y la llave maestra.</p>
                            </div>
                        )}

                        {opsProgStep === 'closure' && (
                            <div className="animate-fade-in space-y-5">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3. Cierre de Lote y Validación</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => handleFinalClosure(true)}
                                        className="py-6 rounded-2xl border-2 border-green-500 bg-green-50 text-green-700 flex flex-col items-center gap-2 group transition-all"
                                    >
                                        <CheckCircle size={24} />
                                        <span className="text-[10px] font-black uppercase">Operativo (F10)</span>
                                    </button>
                                    <button 
                                        onClick={() => handleFinalClosure(false)}
                                        className="py-6 rounded-2xl border-2 border-red-500 bg-red-50 text-red-700 flex flex-col items-center gap-2 group transition-all"
                                    >
                                        <XCircle size={24} />
                                        <span className="text-[10px] font-black uppercase">No Operativo</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              )}

              {/* SUCCESS STATE */}
              {progStatus === 'success' && (
                <div className="animate-fade-in space-y-6 w-full text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto border-4 border-green-100 shadow-sm relative">
                        <CheckCircle size={32} />
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase animate-bounce">F10 OK</div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">¡Gestión Finalizada!</h3>
                        <p className="text-slate-500 text-xs mt-2">
                            {isShortPath 
                                ? 'El equipo ha sido programado y notificado para descarga final por el vendedor.'
                                : 'El equipo ha sido probado y cerrado satisfactoriamente en AS/400.'}
                        </p>
                    </div>

                    <div className="bg-slate-900 rounded-[24px] p-5 text-left border border-slate-800 shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Database size={80} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <MessageSquare size={16} />
                            </div>
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Notificación de AS/400</h4>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-3">
                        <p className="text-xs font-mono text-cyan-400 leading-relaxed italic">
                            {isShortPath 
                                ? `"Puede realizar la descarga del equipo s/n ${posSerial || 'XXXX-XXXX'}. Gestión F10 Finalizada."`
                                : `"Equipo operativo s/n ${opsEquipment || 'XXXX-XXXX'} listo para retiro por vendedor. Lote Cerrado."`}
                        </p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                            <span>Ticket: {progTicketId}</span>
                            <span>{isShortPath ? 'Estado: Descarga Lista' : 'Estado: Listo para Retiro'}</span>
                        </div>
                    </div>
                </div>
              )}

              {/* FAILURE STATE */}
              {progStatus === 'failure' && (
                <div className="animate-fade-in space-y-6 w-full py-4 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto border-4 border-red-100">
                        <XCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Equipo No Operativo</h3>
                        <p className="text-slate-500 text-[11px] mt-2 font-medium">No se puede avanzar con este serial. Seleccione la causa técnica detectada.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-left space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Causa del Fallo</label>
                            <select 
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-red-700"
                            >
                                <option value="">Seleccione una causa...</option>
                                {failureCauses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-2">
                            <button 
                                onClick={() => { setOpsProgStep('execution'); setProgStatus('pending_ops'); }}
                                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                            >
                                Reintentar Carga de Parámetros
                            </button>
                            <button 
                                onClick={() => { setOpsProgStep('selection'); setProgStatus('pending_ops'); setOpsEquipment(''); setOpsSim(''); }}
                                className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100"
                            >
                                Cambiar de Equipo
                            </button>
                        </div>
                    </div>
                </div>
              )}
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                  {isShortPath 
                    ? "El vendedor debe realizar la descarga final de parámetros en el terminal una vez recibida la notificación."
                    : "Operaciones asegura la transaccionalidad total del equipo antes de liberarlo para la firma del contrato."}
              </p>
          </div>
      </div>
    );
  };

  const renderStep14 = () => {
    const isComodato = selectedModality === 'Comodato';
    const isShortPath = serialMode === 'register';
    
    const handleFinalClosure = () => {
        setIsBilling(true);
        // Simulate processes
        setTimeout(() => {
            setInventoryReleased(true); // SAP HANA Inventory Exit
            
            setTimeout(() => {
                if (selectedModality !== 'Comodato') {
                    setInvoiceId('FAC-' + Math.floor(Math.random() * 900000 + 100000)); // SAP HANA Invoice
                }
                
                setTimeout(() => {
                    setIsBilling(false);
                    setStep(16);
                }, 1000);
            }, 1200);
        }, 1800);
    };

    return (
      <div className="space-y-6 animate-fade-in-up">
          <div className="bg-slate-900 p-5 rounded-[24px] text-white shadow-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Cierre Administrativo</h3>
                <p className="text-slate-300 text-[10px] mt-1">Contrato digital y salida de inventario SAP HANA.</p>
              </div>
              <div className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full">
                <span className="text-[10px] font-black text-green-400 uppercase tracking-tighter">SAP Certified</span>
              </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100">
              {isBilling ? (
                  <div className="py-12 text-center space-y-6 animate-pulse">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border-4 border-blue-100 shadow-sm">
                          <Database className="animate-bounce" size={32} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Sincronizando SAP HANA</h4>
                        <p className="text-[11px] text-slate-500 font-medium max-w-[200px] mx-auto leading-relaxed">
                            {inventoryReleased ? 'Generando factura fiscal y contrato...' : 'Registrando salida física de inventario...'}
                        </p>
                      </div>
                      <div className="w-40 bg-slate-100 h-2 rounded-full mx-auto overflow-hidden">
                          <div className={`h-full bg-blue-600 transition-all duration-1000 ${inventoryReleased ? 'w-full' : 'w-1/2'}`}></div>
                      </div>
                  </div>
              ) : (
                  <div className="space-y-6">
                    {/* Contract Details */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Contrato Definitivo</p>
                                <p className="text-[10px] text-slate-500 font-bold">{selectedModality} • Pospago</p>
                            </div>
                        </div>
                        <button className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-blue-600 hover:text-blue-700 transition-colors" onClick={() => alert('Acción de botón en SalesWizard')}>
                            <ExternalLink size={16} />
                        </button>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                        <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                            <span className="font-bold">Protocolo de Cierre:</span> Al confirmar la firma y entrega, se liberarán los folios fiscales y se descontará el serial del stock disponible.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => setIsSigned(!isSigned)}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isSigned ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSigned ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                                    {isSigned && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className={`text-xs font-bold block ${isSigned ? 'text-blue-800' : 'text-slate-700'}`}>Firma y Aceptación de Términos</span>
                                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Auth Digital Validada</span>
                                </div>
                            </div>
                            <FileSignature className={isSigned ? 'text-blue-600' : 'text-slate-400'} size={20} />
                        </button>

                        <button 
                            onClick={() => setIsDelivered(!isDelivered)}
                            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isDelivered ? 'border-green-600 bg-green-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isDelivered ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300'}`}>
                                    {isDelivered && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className={`text-xs font-bold block ${isDelivered ? 'text-green-800' : 'text-slate-700'}`}>Confirmación de Entrega Física</span>
                                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Equipo Entregado en Mano</span>
                                </div>
                            </div>
                            <PackageCheck className={isDelivered ? 'text-green-600' : 'text-slate-400'} size={20} />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => {
                                // Simulate releasing serials back to inventory
                                setStep(1);
                            }}
                            className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                        >
                            <span className="flex items-center justify-center gap-2"><X size={14} /> Cancelar</span>
                        </button>
                        <button 
                            disabled={!isSigned || !isDelivered}
                            onClick={handleFinalClosure}
                            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 group"
                        >
                            <CheckCircle size={14} /> Finalizar Operación
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                  </div>
              )}
          </div>
      </div>
    );
  };

  const renderStep15 = () => {
      const isComodato = selectedModality === 'Comodato';
      return (
          <div className="flex flex-col items-center justify-center h-full pt-6 animate-fade-in-up text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-lg shadow-green-100 relative">
                  <CheckCircle size={48} strokeWidth={3} />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white px-2 py-0.5 rounded text-[8px] font-black animate-bounce">OK</div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">¡Venta Completada!</h2>
              <p className="text-slate-500 text-[11px] font-medium max-w-[280px] mb-8 leading-relaxed">
                  {isComodato 
                    ? 'Equipo entregado en Comodato. El contrato y cargo han sido registrados en SAP HANA.' 
                    : 'La factura fiscal ha sido enviada al correo del cliente y el inventario actualizado.'}
              </p>
              
              <div className="w-full bg-white rounded-[32px] shadow-lg border border-slate-100 overflow-hidden text-left mb-8">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Resumen Administrativo</h3>
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">SAP HANA CLOUD</span>
                  </div>
                  <div className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                              <Archive size={16} />
                          </div>
                          <div className="flex-1">
                              <p className="text-xs font-bold text-slate-800">Inventario SAP HANA</p>
                              <p className="text-[10px] text-green-600 font-bold">Salida Exitosa de Almacén</p>
                          </div>
                          <CheckCircle size={14} className="text-green-500"/>
                      </div>

                      {invoiceId && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <Receipt size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">Factura Fiscal</p>
                                <p className="text-[10px] font-mono text-slate-500 uppercase">{invoiceId}</p>
                            </div>
                            <CheckCircle size={14} className="text-green-500"/>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                              <Cpu size={16} />
                          </div>
                          <div className="flex-1">
                              <p className="text-xs font-bold text-slate-800">Programación AS/400</p>
                              <p className="text-[10px] text-slate-400">TID: {assignedTID} (F10 OK)</p>
                          </div>
                          <CheckCircle size={14} className="text-green-500"/>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                              <Mail size={16} />
                          </div>
                          <div className="flex-1">
                              <p className="text-[10px] font-black text-blue-900 uppercase tracking-tighter">Bienvenida Enviada</p>
                              <p className="text-[9px] text-blue-700">Contrato y guía de usuario en destino.</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                  <button onClick={() => window.print()} className="py-4 bg-slate-100 text-slate-700 rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-slate-200 active:scale-95">
                      <Printer size={16} /> Imprimir
                  </button>
                  <button onClick={() => setStep(1)} className="py-4 bg-blue-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">
                      Nueva Venta
                  </button>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-full flex flex-col">
      {renderHeader()}
      <div className="flex-1 pb-32">
        {step === 1 && renderChannelStep()}
        {step === 2 && renderIdMethodStep()}
        {step === 3 && renderIdentificationStep()}
        {step === 4 && renderStep5()}
        {step === 5 && renderStep7()}
        {step === 6 && renderStep3()}
        {step === 7 && renderStep4()}
        {step === 8 && renderStep6()}
        {step === 10 && renderStep9()}
        {step === 9 && renderStep8()}
        {step === 11 && renderStep10()}
        {step === 12 && renderStep11()}
        {step === 13 && renderStep12()}
        {step === 14 && renderStep13()}
        {step === 15 && renderStep14()}
        {step === 16 && renderStep15()}
      </div>

      {step < 16 && (
        <div className="fixed bottom-[100px] left-0 w-full px-6 z-40 animate-fade-in">
            <div className="flex gap-4">
                {step > 1 && (terminalStatus !== 'blocked' && terminalStatus !== 'unauthorized') && step !== 4 && (
                    <button 
                        onClick={() => {
                            if (step === 8 && managementType === 'lead') setStep(6);
                            else if (step === 14) setStep(12);
                            else setStep(step - 1);
                        }}
                        className={`w-14 h-14 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-lg active:scale-90 transition-transform ${step === 13 && sapSyncStatus !== 'success' ? 'opacity-0 pointer-events-none' : ''} ${step === 14 && progStatus !== 'success' ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ArrowRight className="rotate-180" size={20} />
                    </button>
                )}
                
                <button 
                    onClick={() => {
                        if (step === 4) {
                            if (clientData?.debt) resetFlow();
                            else setStep(5);
                        }
                        else if (step === 7) {
                            if (otpStatus === 'idle') sendOtp();
                            else validateOtp();
                        }
                        else if (step === 11 && selectedModality === 'Comodato') setStep(13);
                        else if (step === 12 && (
                            (paymentMethod === 'Transferencia' && paymentRef.length < 6) ||
                            (paymentMethod === 'Punto de Venta' && (paymentRef.length < 4 || !posVoucher)) ||
                            (paymentMethod === 'Efectivo' && (paymentRef.length < 4 || !cashConfirmed)) ||
                            (paymentMethod === 'Botón de Pago' && (!isTokenized || !paymentRef))
                        )) return;
                        else if (step === 13 && selectedModality === 'Comodato' && comodatoWarehouseMove !== 'success') return;
                        else if (step < 16) setStep(step + 1);
                    }}
                    disabled={
                        (step === 1 && !selectedChannel) ||
                        (step === 2 && !idMethod) ||
                        (step === 3 && !clientData && idMethod === 'rif') ||
                        (step === 6 && !isCertified) ||
                        (step === 7 && (otpStatus === 'sending' || otpStatus === 'validating' || (otpStatus !== 'idle' && (otpInputSms.length !== 6 || otpInputEmail.length !== 6)))) ||
                        (step === 4 && loading) ||
                        (step === 8 && !selectedAffiliation && affiliationMode === 'existing') ||
                        (step === 5 && (terminalStatus === 'checking' || terminalStatus === 'blocked' || terminalStatus === 'unauthorized' || (terminalStatus === 'pending' && additionalTerminals === 0))) ||
                        (step === 9 && (!selectedEquipment || !selectedOperator)) ||
                        (step === 10 && (!serialMode || (serialMode === 'register' && serialStatus !== 'success'))) ||
                        (step === 11 && (!selectedModality || !selectedPlan || !ccoType)) ||
                        (step === 12 && (
                            (paymentMethod === 'Transferencia' && paymentRef.length < 6) ||
                            (paymentMethod === 'Punto de Venta' && (paymentRef.length < 4 || !posVoucher)) ||
                            (paymentMethod === 'Efectivo' && (paymentRef.length < 4 || !cashConfirmed)) ||
                            (paymentMethod === 'Botón de Pago' && (!isTokenized || !paymentRef))
                        )) ||
                        (step === 13 && sapSyncStatus !== 'success') ||
                        (step === 14 && progStatus !== 'success') ||
                        (step === 15 && !isSigned)
                    }
                    className={`flex-1 h-14 rounded-full text-white font-bold shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                        step === 15 ? 'bg-green-600 shadow-green-200' : 'bg-slate-900 shadow-slate-300'
                    } disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 ${step === 13 && sapSyncStatus !== 'success' ? 'opacity-0 pointer-events-none' : ''} ${step === 14 && progStatus !== 'success' ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    {step === 4 ? (clientData?.debt ? 'Terminar Flujo (Mora)' : 'Validar Reglas de Terminal') : (step === 7 ? (otpStatus === 'idle' ? 'Enviar Códigos' : otpStatus === 'sending' ? 'Enviando...' : otpStatus === 'validating' ? 'Validando...' : 'Verificar') : (step === 12 && paymentMethod === 'Botón de Pago' && !isTokenized ? 'Debe Pagar Primero' : (step === 13 && serialMode === 'skip' ? 'Ir a Firma' : (step === 15 ? 'Firmar Contrato' : 'Continuar'))))} 
                    {step === 7 && (otpStatus === 'sending' || otpStatus === 'validating') ? <Loader2 size={20} className="animate-spin" /> : (step === 15 ? <FileSignature size={20} /> : <ArrowRight size={20} />)}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesWizard;
