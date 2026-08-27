import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Receipt,
  FileCheck,
  ShieldCheck,
  Building,
  UserCheck,
  Clock,
  Printer,
  DollarSign,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';
import { useFHIR } from '../../context/FHIRContext';
import { useAuth } from '../../context/AuthContext';

export const FrontDeskView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activePatient,
    erpClaim,
    encounters,
    processCheckoutPayment,
    verifyInsuranceEligibility
  } = useFHIR();

  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Debit Card' | 'Cash' | 'HSA / FSA' | 'Apple Pay'>('Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ receiptNumber: string } | null>(null);
  const [eligibilityData, setEligibilityData] = useState<any | null>(null);
  const [isVerifyingEligibility, setIsVerifyingEligibility] = useState(false);

  // Handle Checkout Copay Payment
  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await processCheckoutPayment(erpClaim.claimId, paymentMethod, erpClaim.patientCopayDue);
      if (res.success) {
        setPaymentSuccessData({ receiptNumber: res.receiptNumber });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Real-time Insurance Eligibility Check
  const handleVerifyInsurance = async () => {
    setIsVerifyingEligibility(true);
    try {
      const data = await verifyInsuranceEligibility();
      setEligibilityData(data);
    } finally {
      setIsVerifyingEligibility(false);
    }
  };

  const activeEncounter = encounters.find((e) => e.subject.reference.includes(activePatient.id)) || encounters[0];

  return (
    <div className="space-y-6">
      {/* Front Desk & Arrival Queue Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <h2 className="text-lg font-semibold text-slate-900">Patient Access, Registration & ERP Billing Checkout</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Registrar: {currentUser.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current Patient: <strong className="text-slate-700">{activePatient.name[0].text}</strong> ({activePatient.identifier[0].value}) • Encounter: {activeEncounter?.class?.display || 'Ambulatory Care'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-verify-insurance-270"
            onClick={handleVerifyInsurance}
            disabled={isVerifyingEligibility}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all shadow-2xs cursor-pointer"
          >
            <ShieldCheck className={`w-3.5 h-3.5 text-indigo-600 ${isVerifyingEligibility ? 'animate-spin' : ''}`} />
            <span>{isVerifyingEligibility ? 'Verifying 270/271...' : 'Run Insurance Eligibility (270)'}</span>
          </button>
        </div>
      </div>

      {/* Signature Dark ERP Connector Card (Design HTML Geometric Balance Match) */}
      <section className="bg-slate-900 rounded-xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex-none">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            ERP Connector: Billing & Reimbursement
          </h2>
          <div className="text-2xl lg:text-3xl font-mono text-indigo-400 font-bold">
            ${erpClaim.totalBilledAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
            Estimated Reimbursement Amount
          </div>
        </div>

        <div className="hidden md:block h-12 w-px bg-slate-700"></div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8 w-full md:w-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Payer Status</span>
            <span className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Verified ({erpClaim.payerName.split(' ')[0]})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">DRG / Claim ID</span>
            <span className="text-sm font-mono text-slate-200">{erpClaim.claimId}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Checkout Queue</span>
            <span className="text-sm font-medium text-amber-400">
              {erpClaim.isPaidAtFrontDesk ? 'Copay Collected ($40.00)' : 'Pending Copay Collection'}
            </span>
          </div>
        </div>

        {!erpClaim.isPaidAtFrontDesk && (
          <button
            onClick={handleProcessPayment}
            disabled={isProcessing}
            className="bg-white text-slate-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {isProcessing ? 'Processing...' : 'Process Checkout'}
          </button>
        )}
      </section>

      {/* Insurance Eligibility Real-time Status Card */}
      {eligibilityData && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start justify-between flex-wrap gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-emerald-900">Real-Time 270/271 Payer Eligibility: ACTIVE</h4>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-emerald-800 rounded border border-emerald-300">
                Payer: {erpClaim.payerName}
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Policy #{erpClaim.policyNumber} • Group #{erpClaim.groupNumber} • Plan: {eligibilityData.planType}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-center">
              <p className="text-[10px] font-semibold text-slate-500">Copay (Primary/Spec)</p>
              <p className="font-bold text-slate-900">${eligibilityData.copaySummary.primaryCare} / ${eligibilityData.copaySummary.specialistConsult}</p>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-center">
              <p className="text-[10px] font-semibold text-slate-500">Deductible Remaining</p>
              <p className="font-bold text-emerald-700">${eligibilityData.deductible.remaining.toFixed(2)} (Met)</p>
            </div>
          </div>
        </div>
      )}

      {/* Main ERP Connector Billing & Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Itemized CPT Coding & Claim Adjudication */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                ERP Itemized Services & Claim Statement
              </h3>
              <p className="text-xs text-slate-500 font-mono">Claim ID: {erpClaim.claimId} • Date: {erpClaim.dateOfService}</p>
            </div>

            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              erpClaim.claimStatus === 'Approved'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}>
              Claim Status: {erpClaim.claimStatus}
            </span>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">CPT Code</th>
                  <th className="pb-2">Service Description</th>
                  <th className="pb-2 text-right">Billed</th>
                  <th className="pb-2 text-right">Ins. Allowed</th>
                  <th className="pb-2 text-right">Copay / Pt. Resp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {erpClaim.items.map((item, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{item.cptCode}</td>
                    <td className="py-2.5 text-slate-700 max-w-xs">{item.description}</td>
                    <td className="py-2.5 text-right font-mono">${item.totalPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono text-slate-600">${item.insuranceAllowed.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">${item.copayApplicable.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Breakdown */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-slate-500 font-semibold">Total Billed</p>
              <p className="text-base font-bold text-slate-900 font-mono">${erpClaim.totalBilledAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Insurance Covered</p>
              <p className="text-base font-bold text-emerald-600 font-mono">${erpClaim.insurancePaidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Patient Copay</p>
              <p className="text-base font-bold text-amber-600 font-mono">${erpClaim.patientCopayDue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Balance Status</p>
              <p className={`text-base font-bold font-mono ${erpClaim.isPaidAtFrontDesk ? 'text-emerald-600' : 'text-rose-600'}`}>
                {erpClaim.isPaidAtFrontDesk ? '$0.00 (PAID)' : `$${erpClaim.patientTotalBalance.toFixed(2)} (DUE)`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Point of Sale Checkout & Receipt Generation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Front-Desk Copay Collection
            </h3>
            <span className="text-[11px] font-bold text-slate-500">POS Terminal #2</span>
          </div>

          {!erpClaim.isPaidAtFrontDesk ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
                <p className="text-xs font-semibold text-indigo-900">Copay Amount Due Today:</p>
                <div className="text-3xl font-black text-slate-900 mt-1 font-mono">${erpClaim.patientCopayDue.toFixed(2)}</div>
                <p className="text-[11px] text-indigo-700 mt-1">Under {erpClaim.payerName}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Credit Card', 'Debit Card', 'Cash', 'HSA / FSA', 'Apple Pay'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-process-copay-payment"
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Payment Authorization...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Authorize ${erpClaim.patientCopayDue.toFixed(2)} ({paymentMethod})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">Checkout Complete & Paid!</h4>
                <p className="text-xs text-emerald-800">
                  Payment of <strong>${erpClaim.patientCopayDue.toFixed(2)}</strong> received via {erpClaim.paymentMethod || paymentMethod}.
                </p>
                <p className="text-[11px] font-mono text-emerald-700">
                  Receipt: {erpClaim.receiptNumber || paymentSuccessData?.receiptNumber}
                </p>
              </div>

              {/* Printable Official Receipt Preview */}
              <div className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl space-y-2 border border-slate-800">
                <div className="text-center font-bold text-white pb-1 border-b border-slate-800">
                  CONNECTED CARE CLINICAL NETWORK
                  <div className="text-[9px] text-slate-400 font-normal">Official ERP Copay Receipt</div>
                </div>
                <div className="flex justify-between">
                  <span>Patient:</span>
                  <span className="text-white">{activePatient.name[0].text}</span>
                </div>
                <div className="flex justify-between">
                  <span>MRN:</span>
                  <span className="text-white">{activePatient.identifier[0].value}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payer:</span>
                  <span className="text-white">{erpClaim.payerName.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-emerald-400">
                  <span>AMOUNT PAID:</span>
                  <span>${erpClaim.patientCopayDue.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-center pt-1">
                  Auth: {erpClaim.priorAuthCode || 'AUTH-882910'} • Receipt #{erpClaim.receiptNumber || 'RCPT-2026-0827'}
                </div>
              </div>

              <button
                onClick={() => alert(`Printing official receipt for ${activePatient.name[0].text}...`)}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
