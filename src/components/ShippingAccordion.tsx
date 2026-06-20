import React, { useState } from 'react';

interface ShippingAccordionProps {
  /**
   * Shopify product tags passed from the Storefront API
   */
  productTags?: string[];
}

export default function ShippingAccordion({ productTags = [] }: ShippingAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize tags for case-insensitive matching
  const normalizedTags = productTags.map(tag => tag.toLowerCase().trim());
  
  // Logic 1: Oversized Freight (Exhaust / Delete Pipe)
  const isOversized = normalizedTags.some(tag => 
    tag.includes('exhaust') || tag.includes('delete pipe')
  );
  
  // Logic 2: Regulatory Compliance Mandate (DPF/DEF/EGR hard requirement)
  const isEmissionsRestricted = normalizedTags.some(tag => 
    ['dpf', 'def', 'egr', 'delete pipe', 'exhaust', 'tune', 'tuner', 'tuning'].some(keyword => tag.includes(keyword))
  );

  return (
    <div className="border-b border-[#1E1E28]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group transition-all"
        aria-expanded={isOpen}
      >
        <span className={`text-lg font-heading font-extrabold uppercase tracking-wider transition-colors duration-300 ${isOpen ? 'text-[#0066FF]' : 'text-white group-hover:text-[#00E5FF]'}`}>
          Shipping & Returns
        </span>
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0066FF]' : 'text-zinc-500 group-hover:text-[#00E5FF]'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-6 font-body text-[#A0A0AB] space-y-6 text-sm leading-relaxed">
            
            {/* Shipping Rates Section */}
            <div className="space-y-2">
              <h4 className="text-[#FFFFFF] font-bold uppercase tracking-widest text-xs mb-3">Shipping Rates</h4>
              {isOversized ? (
                <div className="space-y-4">
                  <p className="text-[#FFFFFF] font-bold">Oversized Freight Rules Apply:</p>
                  <ul className="space-y-2 pl-5 list-disc marker:text-[#0066FF]">
                    <li>
                      <span className="text-[#FFFFFF] font-bold">Canada:</span> $80 CAD/Full System or $65 CAD/Delete Pipe <span className="italic text-xs text-[#A0A0AB]">(10+ pieces ship skid freight free)</span>.
                    </li>
                    <li>
                      <span className="text-[#FFFFFF] font-bold">US:</span> $111 USD/Full System or $74 USD/Delete Pipe <span className="italic text-xs text-[#A0A0AB]">(10+ pieces: $500 USD first skid, $250 USD additional)</span>.
                    </li>
                  </ul>
                  <p className="italic text-xs">Remote locations are subject to manual freight adjustments.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><span className="text-[#FFFFFF] font-bold">Canadian Orders:</span> $20 CAD flat rate (Free over $1000 CAD).</p>
                  <p><span className="text-[#FFFFFF] font-bold">North American Orders:</span> $37 USD flat rate.</p>
                  <p className="italic text-xs">Remote locations are subject to manual freight adjustments prior to fulfillment.</p>
                </div>
              )}
            </div>

            {/* International Duties Callout (Always Visible when expanded) */}
            <div className="bg-[#1E1E28] p-4 rounded-lg border border-[#1E1E28]/50 mt-6">
              <p className="text-[#FFFFFF] text-xs leading-relaxed">
                <span className="font-bold text-[#0066FF] uppercase tracking-wider block mb-1">International Duties</span>
                Shipments outside of Canada may incur <span className="text-[#FFFFFF] font-bold">TARIFFS</span> and <span className="text-[#FFFFFF] font-bold">TAXES</span>. THE LAB does not collect these prior to shipping. All cross-border import duties are strictly the responsibility of the consumer.
              </p>
            </div>

            {/* Regulatory Compliance Mandate */}
            {isEmissionsRestricted && (
              <div className="pt-4 border-t border-[#1E1E28]">
                <p className="italic text-[#A0A0AB] text-[11px] leading-relaxed">
                  NOTICE: These products are for Off-Road and Sanctioned Racing Use Only. They are not legal for use on pollution-controlled vehicles. The purchaser assumes all legal liability for Clean Air Act compliance. THE LAB does not advise on or authorize the illegal bypass of emissions testing.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
